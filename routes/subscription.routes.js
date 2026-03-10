// 💎 SUBSCRIPTION ROUTES - Gestion des abonnements et trials
// Stockage sécurisé dans Supabase (pas localStorage)

const express = require('express');
const router = express.Router();

// ============================================
// MIDDLEWARE: Vérifier l'authentification
// ============================================
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
};

// ============================================
// GET /api/subscription - Obtenir le statut subscription
// ============================================
router.get('/', requireAuth, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionPlan: true,
        trialStartDate: true,
        trialEndDate: true,
        trialActive: true,
        planChosen: true,
        isBetaFounder: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        unlimitedAccess: true,
        // onboardingCompleted est sur UserData, pas User
        userData: {
          select: { onboardingCompleted: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // 🔓 Accès illimité: bypass toute vérification — donne accès Pro+IA
    if (user.unlimitedAccess) {
      return res.json({
        success: true,
        subscription: {
          currentPlan: 'pro',
          trialActive: false,
          trialStartDate: null,
          trialEndDate: null,
          trialDaysRemaining: null,
          planChosen: true,
          isBetaFounder: true,
          unlimitedAccess: true,
          subscriptionStartDate: user.subscriptionStartDate,
          subscriptionEndDate: null
        }
      });
    }

    // Vérifier si le trial est expiré
    let trialActive = user.trialActive;
    let subscriptionPlan = user.subscriptionPlan;
    
    if (trialActive && user.trialEndDate && !user.planChosen) {
      const now = new Date();
      const endDate = new Date(user.trialEndDate);
      
      if (now > endDate) {
        // Trial expiré - mettre à jour en base
        await prisma.user.update({
          where: { id: userId },
          data: {
            trialActive: false,
            subscriptionPlan: 'discovery'
          }
        });
        trialActive = false;
        subscriptionPlan = 'discovery';
        console.log(`[Subscription] Trial expiré pour user ${userId}`);
      }
    }

    // Calculer les jours restants
    let trialDaysRemaining = null;
    if (trialActive && user.trialEndDate && !user.planChosen) {
      const now = new Date();
      const endDate = new Date(user.trialEndDate);
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      trialDaysRemaining = Math.max(0, diffDays);
    }

    res.json({
      success: true,
      subscription: {
        currentPlan: subscriptionPlan,
        trialActive: trialActive,
        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,
        trialDaysRemaining: trialDaysRemaining,
        planChosen: user.planChosen,
        isBetaFounder: user.isBetaFounder,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        onboardingCompleted: user.userData?.onboardingCompleted || false
      }
    });

  } catch (error) {
    console.error('[Subscription] Erreur GET:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// POST /api/subscription/start-trial - Démarrer le trial
// 🛡️ Protection anti-abus: Vérifie TrialHistory avant d'accorder
// 🏢 Referral courtier: 21 jours | Standard: 14 jours
// ============================================
router.post('/start-trial', requireAuth, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const userId = req.user.id;

    // Vérifier si le user a déjà eu un trial ou choisi un plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        referralOrganizationId: true,
        trialStartDate: true,
        trialEndDate: true,
        trialActive: true,
        planChosen: true,
        subscriptionPlan: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const normalizedEmail = user.email.toLowerCase().trim();
    const now = new Date();

    // CAS 1: Trial déjà configuré sur ce compte (réinscription avec TrialHistory)
    if (user.trialStartDate) {
      // Calculer les jours restants
      const endDate = new Date(user.trialEndDate);
      const trialDaysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      
      console.log(`[✅ Trial] Déjà configuré pour ${normalizedEmail} - ${trialDaysRemaining} jours restants`);
      
      // Retourner succès avec les infos actuelles (pas d'erreur)
      return res.json({
        success: true,
        message: user.trialActive ? 'Trial déjà actif!' : 'Trial expiré',
        subscription: {
          currentPlan: user.subscriptionPlan,
          trialActive: user.trialActive,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate,
          trialDaysRemaining: trialDaysRemaining,
          planChosen: user.planChosen
        }
      });
    }

    // CAS 2: Vérifier TrialHistory (anti-abus pour emails déjà utilisés)
    const existingTrial = await prisma.trialHistory.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingTrial) {
      // Cet email a déjà eu un trial - restaurer les dates originales
      const originalEndDate = new Date(existingTrial.trialEndDate);
      const isStillActive = originalEndDate > now;
      const daysRemaining = Math.max(0, Math.ceil((originalEndDate - now) / (1000 * 60 * 60 * 24)));
      
      console.log(`[🛡️ Anti-abus] Email ${normalizedEmail} - Restauration dates originales (${isStillActive ? daysRemaining + ' jours restants' : 'expiré'})`);
      
      // Mettre à jour le user avec les dates originales
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: isStillActive ? 'essential' : 'discovery',
          trialStartDate: existingTrial.trialStartDate,
          trialEndDate: existingTrial.trialEndDate,
          trialActive: isStillActive,
          planChosen: false
        }
      });
      
      return res.json({
        success: true,
        message: isStillActive ? `Trial restauré - ${daysRemaining} jours restants` : 'Trial expiré',
        subscription: {
          currentPlan: updatedUser.subscriptionPlan,
          trialActive: isStillActive,
          trialStartDate: existingTrial.trialStartDate,
          trialEndDate: existingTrial.trialEndDate,
          trialDaysRemaining: daysRemaining,
          planChosen: false
        }
      });
    }

    // CAS 3: Nouvel email - Créer un trial
    // 🏢 Utilisateurs référés par un courtier/cabinet: 21 jours
    // 👤 Utilisateurs standard: 14 jours
    const isReferral = !!user.referralOrganizationId;
    const trialDays = isReferral ? 21 : 14;
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + trialDays);

    // Récupérer l'IP si disponible (pour tracking supplémentaire)
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.headers['x-real-ip'] || 
                      req.connection?.remoteAddress || 
                      null;

    // Transaction: Mettre à jour le user ET enregistrer dans TrialHistory
    const [updatedUser, trialRecord] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: 'essential',
          trialStartDate: now,
          trialEndDate: endDate,
          trialActive: true,
          planChosen: false
        }
      }),
      prisma.trialHistory.create({
        data: {
          email: normalizedEmail,
          trialStartDate: now,
          trialEndDate: endDate,
          userId: userId,
          ipAddress: ipAddress
        }
      })
    ]);

    console.log(`[🎉 Trial] Nouveau trial ${trialDays} jours${isReferral ? ' (référé courtier)' : ''} pour ${normalizedEmail}, fin: ${endDate.toISOString().split('T')[0]}`);
    console.log(`[📝 TrialHistory] Enregistré pour ${normalizedEmail}`);

    res.json({
      success: true,
      message: `Trial de ${trialDays} jours activé!`,
      subscription: {
        currentPlan: 'essential',
        trialActive: true,
        trialStartDate: now,
        trialEndDate: endDate,
        trialDaysRemaining: trialDays,
        planChosen: false
      }
    });

  } catch (error) {
    console.error('[Subscription] Erreur start-trial:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// POST /api/subscription/choose-plan - Choisir un plan (fin du trial)
// ============================================
router.post('/choose-plan', requireAuth, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const userId = req.user.id;
    const { plan } = req.body;

    // Valider le plan
    const validPlans = ['discovery', 'essential', 'pro'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Plan invalide' });
    }

    // Mettre à jour le user
    const updateData = {
      subscriptionPlan: plan,
      planChosen: true,
      trialActive: false
    };

    // Si plan payant, définir la date de début
    if (plan !== 'discovery') {
      updateData.subscriptionStartDate = new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    console.log(`[Subscription] Plan ${plan} choisi par user ${userId}`);

    res.json({
      success: true,
      message: `Plan ${plan} activé!`,
      subscription: {
        currentPlan: plan,
        trialActive: false,
        planChosen: true,
        subscriptionStartDate: updateData.subscriptionStartDate
      }
    });

  } catch (error) {
    console.error('[Subscription] Erreur choose-plan:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// POST /api/subscription/activate-beta-founder - Activer Beta Founder
// ============================================
router.post('/activate-beta-founder', requireAuth, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const userId = req.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { isBetaFounder: true }
    });

    console.log(`[Subscription] Beta Founder activé pour user ${userId}`);

    res.json({
      success: true,
      message: 'Statut Beta Founder activé!',
      isBetaFounder: true
    });

  } catch (error) {
    console.error('[Subscription] Erreur activate-beta-founder:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// POST /api/subscription/sync - Synchroniser depuis localStorage (migration)
// ============================================
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const userId = req.user.id;
    const { localData } = req.body;

    // Vérifier si le user a déjà des données de subscription en base
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trialStartDate: true, planChosen: true }
    });

    // Si pas de données en base ET données locales valides, migrer
    if (!user.trialStartDate && localData && localData.trialInfo) {
      const trialInfo = localData.trialInfo;
      
      const updateData = {
        subscriptionPlan: localData.currentPlan || 'discovery',
        isBetaFounder: localData.isBetaFounder || false
      };

      // Migrer les infos de trial si présentes
      if (trialInfo.startDate) {
        updateData.trialStartDate = new Date(trialInfo.startDate);
      }
      if (trialInfo.endDate) {
        updateData.trialEndDate = new Date(trialInfo.endDate);
      }
      if (trialInfo.isActive !== undefined) {
        updateData.trialActive = trialInfo.isActive;
      }
      if (trialInfo.hasChosen !== undefined) {
        updateData.planChosen = trialInfo.hasChosen;
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      console.log(`[Subscription] Données migrées depuis localStorage pour user ${userId}`);

      return res.json({
        success: true,
        message: 'Données migrées avec succès',
        migrated: true
      });
    }

    res.json({
      success: true,
      message: 'Synchronisation vérifiée',
      migrated: false
    });

  } catch (error) {
    console.error('[Subscription] Erreur sync:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// ADMIN: GET /api/subscription/admin/stats - Stats pour admin
// ============================================
router.get('/admin/stats', requireAuth, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    
    // Vérifier si admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Compter les utilisateurs par plan
    const stats = await prisma.user.groupBy({
      by: ['subscriptionPlan'],
      _count: { id: true }
    });

    // Compter les trials actifs
    const activeTrials = await prisma.user.count({
      where: { trialActive: true }
    });

    // Compter les Beta Founders
    const betaFounders = await prisma.user.count({
      where: { isBetaFounder: true }
    });

    res.json({
      success: true,
      stats: {
        byPlan: stats.reduce((acc, s) => {
          acc[s.subscriptionPlan] = s._count.id;
          return acc;
        }, {}),
        activeTrials,
        betaFounders,
        totalUsers: stats.reduce((sum, s) => sum + s._count.id, 0)
      }
    });

  } catch (error) {
    console.error('[Subscription] Erreur admin/stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
