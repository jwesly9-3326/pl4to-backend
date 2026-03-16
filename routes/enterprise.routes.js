// 🏢 ROUTES ENTERPRISE - PL4TO Entreprise
// Gestion: Organizations, Members, ClientProfiles
// Accès: Conseillers authentifiés avec membership actif

const express = require('express');
const router = express.Router();
const prisma = require('../prisma-client');

// ============================================
// MIDDLEWARE: Vérifier membership Organisation
// Ajoute req.organization et req.membership au request
// ============================================
const requireOrganizationMember = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Trouver le membership actif de cet utilisateur
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId,
        isActive: true,
        joinedAt: { not: null } // Seulement les membres qui ont accepté
      },
      include: {
        organization: true
      }
    });
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Aucune organisation active trouvée pour cet utilisateur'
      });
    }
    
    if (!membership.organization.isActive) {
      return res.status(403).json({
        success: false,
        error: 'L\'organisation est désactivée'
      });
    }
    
    req.organization = membership.organization;
    req.membership = membership;
    next();
  } catch (error) {
    console.error('[Enterprise] Erreur vérification membership:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

// ============================================
// MIDDLEWARE: Vérifier rôle admin dans l'organisation
// ============================================
const requireOrganizationAdmin = async (req, res, next) => {
  if (req.membership.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès réservé aux administrateurs de l\'organisation'
    });
  }
  next();
};

// ============================================
// 1. ORGANISATION - Info du cabinet
// ============================================

// GET /api/enterprise/organization - Info de l'organisation du user connecté
router.get('/organization', requireOrganizationMember, async (req, res) => {
  try {
    const org = req.organization;
    
    // Compter les membres actifs et les clients
    const [memberCount, clientCount] = await Promise.all([
      prisma.organizationMember.count({
        where: { organizationId: org.id, isActive: true, joinedAt: { not: null } }
      }),
      prisma.clientProfile.count({
        where: { organizationId: org.id, status: 'active' }
      })
    ]);
    
    res.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl,
        brandColor: org.brandColor,
        contactEmail: org.contactEmail,
        phone: org.phone,
        address: org.address,
        website: org.website,
        plan: org.plan,
        maxSeats: org.maxSeats,
        subscriptionStatus: org.subscriptionStatus,
        memberCount,
        clientCount,
        createdAt: org.createdAt
      },
      membership: {
        role: req.membership.role,
        title: req.membership.title,
        joinedAt: req.membership.joinedAt
      }
    });
  } catch (error) {
    console.error('[Enterprise] Erreur GET organization:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/enterprise/organization - Mettre à jour l'organisation (admin only)
router.put('/organization', requireOrganizationMember, requireOrganizationAdmin, async (req, res) => {
  try {
    const { name, logoUrl, brandColor, contactEmail, phone, address, website } = req.body;
    
    const updated = await prisma.organization.update({
      where: { id: req.organization.id },
      data: {
        ...(name && { name }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(brandColor && { brandColor }),
        ...(contactEmail && { contactEmail }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(website !== undefined && { website })
      }
    });
    
    res.json({ success: true, organization: updated });
  } catch (error) {
    console.error('[Enterprise] Erreur PUT organization:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 2. MEMBRES - Gestion des conseillers du cabinet
// ============================================

// GET /api/enterprise/members - Liste des membres
router.get('/members', requireOrganizationMember, async (req, res) => {
  try {
    const members = await prisma.organizationMember.findMany({
      where: { 
        organizationId: req.organization.id,
        isActive: true
      },
      include: {
        user: {
          select: { id: true, nom: true, prenom: true, email: true, profilePicture: true }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });
    
    // Compter les clients par conseiller
    const membersWithCounts = await Promise.all(
      members.map(async (member) => {
        const clientCount = await prisma.clientProfile.count({
          where: { 
            organizationId: req.organization.id,
            advisorUserId: member.userId,
            status: 'active'
          }
        });
        
        return {
          id: member.id,
          role: member.role,
          title: member.title,
          joinedAt: member.joinedAt,
          invitedAt: member.invitedAt,
          user: member.user,
          clientCount
        };
      })
    );
    
    res.json({ success: true, members: membersWithCounts });
  } catch (error) {
    console.error('[Enterprise] Erreur GET members:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/enterprise/members/invite - Inviter un conseiller (admin only)
router.post('/members/invite', requireOrganizationMember, requireOrganizationAdmin, async (req, res) => {
  try {
    const { email, role, title } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Email invalide' });
    }
    
    // Vérifier le nombre de sièges
    const currentMembers = await prisma.organizationMember.count({
      where: { organizationId: req.organization.id, isActive: true }
    });
    
    if (currentMembers >= req.organization.maxSeats) {
      return res.status(400).json({
        success: false,
        error: `Limite de ${req.organization.maxSeats} sièges atteinte. Mettez à jour votre plan.`
      });
    }
    
    // Trouver ou informer que l'utilisateur doit créer un compte
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Cet utilisateur n\'a pas de compte PL4TO. Il doit d\'abord créer un compte sur pl4to.com'
      });
    }
    
    // Vérifier s'il est déjà membre
    const existingMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: req.organization.id, userId: user.id } }
    });
    
    if (existingMember) {
      return res.status(400).json({ success: false, error: 'Cet utilisateur est déjà membre de l\'organisation' });
    }
    
    // Créer le membership (joinedAt null = en attente d'acceptation)
    const member = await prisma.organizationMember.create({
      data: {
        organizationId: req.organization.id,
        userId: user.id,
        role: role || 'advisor',
        title: title || null,
        joinedAt: new Date() // Auto-accepté pour l'instant (TODO: flow d'invitation)
      }
    });
    
    console.log(`[Enterprise] ${email} ajouté à ${req.organization.name} comme ${role || 'advisor'}`);
    
    res.json({ success: true, member });
  } catch (error) {
    console.error('[Enterprise] Erreur POST members/invite:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// DELETE /api/enterprise/members/:memberId - Retirer un membre (admin only)
router.delete('/members/:memberId', requireOrganizationMember, requireOrganizationAdmin, async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId: req.organization.id }
    });
    
    if (!member) {
      return res.status(404).json({ success: false, error: 'Membre non trouvé' });
    }
    
    // Ne pas permettre de se retirer soi-même si seul admin
    if (member.userId === req.user.id && member.role === 'admin') {
      const adminCount = await prisma.organizationMember.count({
        where: { organizationId: req.organization.id, role: 'admin', isActive: true }
      });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, error: 'Impossible de retirer le dernier administrateur' });
      }
    }
    
    // Soft delete
    await prisma.organizationMember.update({
      where: { id: memberId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Membre retiré avec succès' });
  } catch (error) {
    console.error('[Enterprise] Erreur DELETE member:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 3. CLIENTS - Gestion des profils clients
// ============================================

// GET /api/enterprise/clients - Liste des clients du conseiller (ou tous si admin)
router.get('/clients', requireOrganizationMember, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const where = {
      organizationId: req.organization.id,
      isTemplate: false, // Exclure les templates de la liste clients
      ...(status && { status }),
    };

    // Si pas admin, voir seulement ses propres clients
    if (req.membership.role !== 'admin') {
      where.advisorUserId = req.user.id;
    }
    
    // Recherche par nom/prénom/email
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const clients = await prisma.clientProfile.findMany({
      where,
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        phone: true,
        notes: true,
        status: true,
        lastProjectionAt: true,
        trajectoryAlerts: true,
        invitedToB2C: true,
        b2cUserId: true,
        createdAt: true,
        updatedAt: true,
        advisorUserId: true,
        // Inclure un résumé des données financières (pas tout le snapshot)
        userDataSnapshot: false // On exclut le gros JSON de la liste
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Pour chaque client, extraire un résumé du snapshot si besoin
    const clientsWithSummary = await Promise.all(
      clients.map(async (client) => {
        // Récupérer juste le nombre de comptes et le total des soldes
        const fullClient = await prisma.clientProfile.findUnique({
          where: { id: client.id },
          select: { userDataSnapshot: true }
        });
        
        let financialSummary = null;
        if (fullClient?.userDataSnapshot) {
          const snapshot = fullClient.userDataSnapshot;
          const accounts = snapshot.accounts || [];
          const balances = snapshot.initialBalances?.soldes || [];
          const totalBalance = balances.reduce((sum, b) => sum + (parseFloat(b.solde) || 0), 0);
          
          financialSummary = {
            accountCount: accounts.length,
            totalBalance: totalBalance,
            hasGoals: (snapshot.financialGoals || []).length > 0,
            hasBudget: !!(snapshot.budgetPlanning?.entrees?.length || snapshot.budgetPlanning?.sorties?.length)
          };
        }
        
        return { ...client, financialSummary };
      })
    );
    
    res.json({ success: true, clients: clientsWithSummary });
  } catch (error) {
    console.error('[Enterprise] Erreur GET clients:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /api/enterprise/clients/:clientId - Détail complet d'un client (avec snapshot)
router.get('/clients/:clientId', requireOrganizationMember, async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const where = {
      id: clientId,
      organizationId: req.organization.id
    };
    
    // Si pas admin, vérifier que c'est bien son client
    if (req.membership.role !== 'admin') {
      where.advisorUserId = req.user.id;
    }
    
    const client = await prisma.clientProfile.findFirst({ where });
    
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client non trouvé' });
    }
    
    res.json({ success: true, client });
  } catch (error) {
    console.error('[Enterprise] Erreur GET client detail:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/enterprise/clients - Créer un nouveau profil client
router.post('/clients', requireOrganizationMember, async (req, res) => {
  try {
    const { prenom, nom, email, phone, notes, userDataSnapshot } = req.body;
    
    if (!prenom || !nom) {
      return res.status(400).json({ success: false, error: 'Le prénom et le nom sont requis' });
    }
    
    const client = await prisma.clientProfile.create({
      data: {
        organizationId: req.organization.id,
        advisorUserId: req.user.id,
        prenom,
        nom,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        userDataSnapshot: userDataSnapshot || null
      }
    });
    
    console.log(`[Enterprise] Client créé: ${prenom} ${nom} par ${req.user.email} dans ${req.organization.name}`);
    
    res.json({ success: true, client });
  } catch (error) {
    console.error('[Enterprise] Erreur POST client:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/enterprise/clients/:clientId - Mettre à jour un client
router.put('/clients/:clientId', requireOrganizationMember, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { prenom, nom, email, phone, notes, userDataSnapshot, status } = req.body;
    
    // Vérifier accès
    const existing = await prisma.clientProfile.findFirst({
      where: {
        id: clientId,
        organizationId: req.organization.id,
        ...(req.membership.role !== 'admin' && { advisorUserId: req.user.id })
      }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client non trouvé' });
    }
    
    const updated = await prisma.clientProfile.update({
      where: { id: clientId },
      data: {
        ...(prenom && { prenom }),
        ...(nom && { nom }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(notes !== undefined && { notes }),
        ...(userDataSnapshot !== undefined && { userDataSnapshot }),
        ...(status && { status })
      }
    });
    
    res.json({ success: true, client: updated });
  } catch (error) {
    console.error('[Enterprise] Erreur PUT client:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/enterprise/clients/:clientId/snapshot - Sauvegarder uniquement les données financières
// C'est la route que le frontend appelle quand le conseiller modifie le budget/comptes d'un client
router.put('/clients/:clientId/snapshot', requireOrganizationMember, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { userDataSnapshot } = req.body;
    
    if (!userDataSnapshot) {
      return res.status(400).json({ success: false, error: 'userDataSnapshot requis' });
    }
    
    // Vérifier accès
    const existing = await prisma.clientProfile.findFirst({
      where: {
        id: clientId,
        organizationId: req.organization.id,
        ...(req.membership.role !== 'admin' && { advisorUserId: req.user.id })
      }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client non trouvé' });
    }
    
    const updated = await prisma.clientProfile.update({
      where: { id: clientId },
      data: {
        userDataSnapshot,
        lastProjectionAt: new Date()
      }
    });
    
    res.json({ success: true, client: updated });
  } catch (error) {
    console.error('[Enterprise] Erreur PUT client snapshot:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// DELETE /api/enterprise/clients/:clientId - Archiver un client (soft delete)
router.delete('/clients/:clientId', requireOrganizationMember, async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const existing = await prisma.clientProfile.findFirst({
      where: {
        id: clientId,
        organizationId: req.organization.id,
        ...(req.membership.role !== 'admin' && { advisorUserId: req.user.id })
      }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client non trouvé' });
    }
    
    // Soft delete = archiver
    await prisma.clientProfile.update({
      where: { id: clientId },
      data: { status: 'archived' }
    });
    
    res.json({ success: true, message: 'Client archivé avec succès' });
  } catch (error) {
    console.error('[Enterprise] Erreur DELETE client:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 4. DASHBOARD STATS - KPIs du conseiller
// ============================================
router.get('/dashboard', requireOrganizationMember, async (req, res) => {
  try {
    const orgId = req.organization.id;
    const userId = req.user.id;
    const isAdmin = req.membership.role === 'admin';
    
    const clientWhere = {
      organizationId: orgId,
      status: 'active',
      isTemplate: false, // Exclure les templates des stats
      ...(! isAdmin && { advisorUserId: userId })
    };
    
    // Stats parallèles
    const [
      totalClients,
      archivedClients,
      recentClients,
      clientsWithAlerts
    ] = await Promise.all([
      // Total clients actifs
      prisma.clientProfile.count({ where: clientWhere }),
      
      // Clients archivés
      prisma.clientProfile.count({
        where: { ...clientWhere, status: 'archived' }
      }),
      
      // Clients créés cette semaine
      prisma.clientProfile.count({
        where: {
          ...clientWhere,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      
      // Clients avec alertes de trajectoire
      prisma.clientProfile.findMany({
        where: {
          ...clientWhere,
          trajectoryAlerts: { not: '[]' }
        },
        select: {
          id: true,
          prenom: true,
          nom: true,
          trajectoryAlerts: true
        }
      })
    ]);
    
    // Dernière activité (5 derniers clients modifiés)
    const recentActivity = await prisma.clientProfile.findMany({
      where: clientWhere,
      select: {
        id: true,
        prenom: true,
        nom: true,
        updatedAt: true,
        lastProjectionAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });
    
    // Stats organisation (admin only)
    let orgStats = null;
    if (isAdmin) {
      const [totalMembers, totalAllClients] = await Promise.all([
        prisma.organizationMember.count({
          where: { organizationId: orgId, isActive: true }
        }),
        prisma.clientProfile.count({
          where: { organizationId: orgId, status: 'active' }
        })
      ]);
      
      orgStats = {
        totalMembers,
        totalAllClients,
        seatsUsed: totalMembers,
        seatsMax: req.organization.maxSeats
      };
    }
    
    res.json({
      success: true,
      dashboard: {
        totalClients,
        archivedClients,
        recentClients,
        clientsWithAlerts: clientsWithAlerts.length,
        alerts: clientsWithAlerts,
        recentActivity,
        orgStats
      }
    });
  } catch (error) {
    console.error('[Enterprise] Erreur GET dashboard:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 5. CHECK - Vérifier si l'utilisateur a une organisation
// (Appelé par le frontend pour savoir s'il faut activer le mode Enterprise)
// ============================================
router.get('/check', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId,
        isActive: true,
        joinedAt: { not: null }
      },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logoUrl: true, brandColor: true, isActive: true }
        }
      }
    });
    
    if (!membership || !membership.organization.isActive) {
      return res.json({
        success: true,
        hasOrganization: false,
        organization: null,
        role: null
      });
    }
    
    res.json({
      success: true,
      hasOrganization: true,
      organization: membership.organization,
      role: membership.role
    });
  } catch (error) {
    console.error('[Enterprise] Erreur GET check:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 6. TEMPLATES - Modèles de démonstration
// ============================================

// GET /api/enterprise/templates - Liste des templates disponibles
router.get('/templates', requireOrganizationMember, async (req, res) => {
  try {
    const templates = await prisma.clientProfile.findMany({
      where: {
        organizationId: req.organization.id,
        isTemplate: true
      },
      select: {
        id: true,
        prenom: true,
        nom: true,
        templateName: true,
        notes: true,
        userDataSnapshot: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Ajouter un résumé pour chaque template
    const templatesWithSummary = templates.map(tpl => {
      const snap = tpl.userDataSnapshot;
      let summary = null;
      if (snap) {
        const accounts = snap.accounts || [];
        const balances = snap.initialBalances?.soldes || [];
        const totalBalance = balances.reduce((sum, b) => sum + (parseFloat(b.solde) || 0), 0);
        const entrees = snap.budgetPlanning?.entrees || [];
        const sorties = snap.budgetPlanning?.sorties || [];
        const goals = snap.financialGoals || [];

        summary = {
          accountCount: accounts.length,
          totalBalance,
          incomeItems: entrees.length,
          expenseItems: sorties.length,
          goalCount: goals.length,
          situation: snap.userInfo?.situationFamiliale || 'inconnu'
        };
      }
      return {
        id: tpl.id,
        prenom: tpl.prenom,
        nom: tpl.nom,
        templateName: tpl.templateName,
        notes: tpl.notes,
        summary,
        createdAt: tpl.createdAt
      };
    });

    res.json({ success: true, templates: templatesWithSummary });
  } catch (error) {
    console.error('[Enterprise] Erreur GET templates:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/enterprise/templates/:templateId/clone - Cloner un template en nouveau client
router.post('/templates/:templateId/clone', requireOrganizationMember, async (req, res) => {
  try {
    const { templateId } = req.params;
    const { prenom, nom, email, phone, notes } = req.body;

    // Trouver le template
    const template = await prisma.clientProfile.findFirst({
      where: {
        id: templateId,
        organizationId: req.organization.id,
        isTemplate: true
      }
    });

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template non trouvé' });
    }

    // Cloner les données financières et mettre à jour les noms dans userInfo
    let clonedSnapshot = template.userDataSnapshot ? JSON.parse(JSON.stringify(template.userDataSnapshot)) : null;
    if (clonedSnapshot?.userInfo && (prenom || nom)) {
      if (prenom) clonedSnapshot.userInfo.prenom = prenom;
      if (nom) clonedSnapshot.userInfo.nom = nom;
    }
    // Mettre la date de départ à aujourd'hui
    if (clonedSnapshot?.initialBalances) {
      clonedSnapshot.initialBalances.dateDepart = new Date().toISOString().split('T')[0];
    }

    // Créer le nouveau client (pas un template)
    const newClient = await prisma.clientProfile.create({
      data: {
        organizationId: req.organization.id,
        advisorUserId: req.user.id,
        prenom: prenom || template.prenom,
        nom: nom || template.nom,
        email: email || null,
        phone: phone || null,
        notes: notes || `Créé à partir du modèle "${template.templateName || 'Démo'}"`,
        userDataSnapshot: clonedSnapshot,
        isTemplate: false,
        status: 'active'
      }
    });

    console.log(`[Enterprise] Template "${template.templateName}" cloné → ${newClient.prenom} ${newClient.nom} par ${req.user.email}`);

    res.json({ success: true, client: newClient });
  } catch (error) {
    console.error('[Enterprise] Erreur POST clone template:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
