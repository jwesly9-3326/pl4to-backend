const path = require('path');
const dotenv = require('dotenv');
// v2.1 - demo/login endpoint added

// ⚠️ IMPORTANT: Charger .env EN PREMIER avant tout import
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('📂 Loading .env from:', path.resolve(__dirname, '.env'));
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);
console.log('📧 RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurée' : '❌ MANQUANTE');

const { OAuth2Client } = require('google-auth-library');

// Import des routes admin
const adminRoutes = require('./routes/admin.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const trialRoutes = require('./routes/trial.routes');
const stripeRoutes = require('./routes/stripe.routes');
const { handleWebhook } = require('./routes/stripe.webhook');
const zohoRoutes = require('./routes/zoho.routes');
const trialEmailRoutes = require('./routes/trialEmail.routes');
const enterpriseRoutes = require('./routes/enterprise.routes');
const enterprisePublicRoutes = require('./routes/enterprise.public.routes');
const enterpriseAdminRoutes = require('./routes/enterprise-admin.routes');
const enterprisePortalRoutes = require('./routes/enterprise.portal.routes');
const communicationRoutes = require('./routes/communication.routes');
const aiCoachRoutes = require('./routes/ai-coach.routes');
const cryptoRoutes = require('./routes/crypto.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const pushRoutes = require('./routes/push.routes');
const economicRoutes = require('./routes/economic.routes');
const { router: regionsRoutes } = require('./routes/regions.routes');

console.log('🏢 Enterprise routes chargées');
console.log('📧 Communication routes chargées');
console.log('🤖 AI Coach routes chargées');
console.log('🪙 Crypto routes chargées');
console.log('🔔 Notifications routes chargées');
console.log('📊 Economic routes chargées');

console.log('🔗 Zoho CRM routes chargées');
console.log('📧 Trial Email routes chargées');

// Import du service Zoho CRM
const zohoCRM = require('./services/zohoCRM.service');

// Import du service Trial Email + CRON
const { sendWelcomeEmail } = require('./services/email/trialEmailService');
const { startTrialEmailCron } = require('./jobs/trialEmailCron');

console.log('💳 Stripe routes chargées');

// Import du calculateur de segments budgétaires
const {
  calculateSegmentMaxDate,
  generateAllSegments,
  generateSegmentsBatch,
  formatDateStr,
  parseLocalDate
} = require('./utils/budgetSegmentCalculator');

// 📧 Service d'envoi d'emails (APRÈS dotenv.config!)
const emailService = require('./utils/emailService');
console.log('📂 Loading .env from:', path.resolve(__dirname, '.env'));
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// 🪡 HELMET - Security Headers
console.log('🪡 Helmet security headers activés');

// ============================================
// 🛡️ RATE LIMITING - Protection contre les abus
// ============================================

// Limite générale: 100 requêtes par minute par IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Trop de requêtes, réessayez dans 1 minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite stricte pour login: 5 tentatives par 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne compte pas les succès
});

// Limite stricte pour 2FA: 5 tentatives par 15 min
const twoFALimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Trop de tentatives 2FA. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Limite pour création de compte: 3 par heure
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: { error: 'Trop de créations de compte. Réessayez dans 1 heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite pour mot de passe oublié: 3 par heure
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: { error: 'Trop de demandes. Réessayez dans 1 heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite pour le coach IA: 10 par heure
const aiCoachLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: { error: 'Trop de demandes d\'analyse. Réessayez dans 1 heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

console.log('🛡️ Rate limiting configuré');
const prisma = require('./prisma-client'); // Import du client Prisma
const app = express();
const port = process.env.PORT || 3000;

// 🪡 Appliquer Helmet (Security Headers)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permettre chargement ressources cross-origin
  contentSecurityPolicy: false // Désactivé pour éviter conflits avec frontend
}));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);

// 🔐 Google OAuth Client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1053945134807-aqiv2cgc43iusra5gnrdtcvkck9hmoi1.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ============================================
// MIDDLEWARE D'AUTHENTIFICATION JWT
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔐 [AUTH] Token reçu:', token ? token.substring(0, 30) + '...' : 'AUCUN');
  console.log('🔐 [AUTH] JWT_SECRET utilisé:', process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024');

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token d\'authentification requis' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024', (err, user) => {
    if (err) {
      console.log('🔐 [AUTH] Erreur JWT:', err.message);
      return res.status(403).json({ 
        success: false, 
        error: 'Token invalide ou expiré' 
      });
    }
    console.log('🔐 [AUTH] Token valide pour:', user.email);
    req.user = { id: user.userId, email: user.email };
    next();
  });
};

// Configuration CORS pour permettre les requêtes depuis le frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://pl4to.com',
  'https://www.pl4to.com',
  'https://pl4to.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all for now during development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔔 WEBHOOK STRIPE - DOIT Être AVANT express.json() pour recevoir le raw body
app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }), 
  (req, res) => handleWebhook(req, res, prisma)
);

// Middleware pour lire JSON (APRÈS le webhook)
// Limite augmentée pour supporter allDayData (trajectoire 54 ans)
app.use(express.json({ limit: '50mb' }));

// 🛡️ Appliquer rate limit général à toutes les routes API
app.use('/api/', generalLimiter);

// ============================================
// 💳 ROUTES STRIPE (Paiements)
// ============================================
app.use('/api/stripe', stripeRoutes);

// ============================================
// 🔗 ROUTES ZOHO CRM
// ============================================
app.use('/api/zoho', zohoRoutes);

// ============================================
// 🏢 ROUTES ENTERPRISE PUBLIQUES (pas d'auth) + rate limit login
// ============================================
app.use('/api/enterprise/public/login', loginLimiter);
app.use('/api/enterprise/public', enterprisePublicRoutes);

// ============================================
// 🏢 ROUTES ENTERPRISE PROTÉGÉES (PL4TO Entreprise)
// ============================================
app.use('/api/enterprise', authenticateToken, enterpriseRoutes);

// ============================================
// 🏢 ROUTES PORTAIL ENTERPRISE (JWT Enterprise — courtier/firme)
// ============================================
app.use('/api/enterprise/portal', enterprisePortalRoutes);

// ============================================
// 🏢 ROUTES ADMIN ENTERPRISE (Gestion portails)
// ============================================
app.use('/api/admin/enterprise', authenticateToken, enterpriseAdminRoutes);

// ============================================
// 📧 ROUTES COMMUNICATIONS (Emails hebdo + calendrier)
// ============================================
app.use('/api/communications', communicationRoutes);

// ============================================
// 📧 WAITLIST - Inscription liste d'attente Pro + IA
// ============================================
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, plan, source } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email invalide' 
      });
    }
    
    // Envoyer notification à l'équipe PL4TO
    const result = await emailService.sendWaitlistNotification(
      email, 
      plan || 'pro_ia', 
      source || 'unknown'
    );
    
    if (!result.success) {
      console.error('[Waitlist] Erreur envoi:', result.error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de l\'envoi' 
      });
    }
    
    console.log(`[✅ Waitlist] Inscription: ${email} pour ${plan}`);
    
    res.json({ 
      success: true, 
      message: 'Inscription à la liste d\'attente réussie' 
    });
    
  } catch (error) {
    console.error('[Waitlist] Erreur:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur' 
    });
  }
});

// ============================================
// ROUTES ADMIN / OPTIMIZATION REQUESTS
// ============================================
app.use('/api/optimization-requests', authenticateToken, adminRoutes);

// ============================================
// ROUTES AI COACH (Recommandations IA - Pro uniquement)
// ============================================
app.use('/api/ai-coach', aiCoachLimiter, authenticateToken, aiCoachRoutes);

// ============================================
// ROUTES CRYPTO (Solde par adresse publique)
// ============================================
app.use('/api/crypto', cryptoRoutes);

// ============================================
// ROUTES NOTIFICATIONS (Push Web)
// ============================================
app.use('/api/notifications', authenticateToken, notificationsRoutes);
app.use('/api/push', authenticateToken, pushRoutes);

// ============================================
// ROUTES INTELLIGENCE ÉCONOMIQUE
// ============================================
app.use('/api/economic', economicRoutes);

// 🌍 Régions supportées (pays + provinces)
app.use('/api/regions', regionsRoutes);

// ============================================
// ROUTES SUBSCRIPTION (Trial, Plans)
// ============================================
app.locals.prisma = prisma;  // Rendre prisma accessible aux routes
app.use('/api/subscription', authenticateToken, subscriptionRoutes);

// ============================================
// ROUTES TRIAL REMINDERS
// ============================================
app.use('/api/trial', authenticateToken, trialRoutes(prisma));

// ============================================
// ROUTES TRIAL EMAILS (Preview + Test + Status)
// ============================================
app.use('/api/trial-emails', trialEmailRoutes(prisma, authenticateToken));

// 📧 Opt-out emails - Étape 1: Page de confirmation (SANS auth)
app.get('/api/trial-emails/opt-out/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).send('<html><body style="font-family:sans-serif;text-align:center;padding:60px;"><h2>Lien invalide</h2></body></html>');
    }
    
    // Si déjà désabonné
    if (user.emailOptOut) {
      const alreadyMsg = (user.language || 'fr') === 'en'
        ? { title: 'Already unsubscribed', text: 'You are already unsubscribed from PL4TO emails.', sub: 'You can close this page.' }
        : { title: 'Déjà désabonné', text: 'Tu es déjà désabonné des communications PL4TO.', sub: 'Tu peux fermer cette page.' };
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(`
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:60px 20px;font-family:'Segoe UI',sans-serif;background:#f4f4f7;text-align:center;">
          <div style="max-width:450px;margin:0 auto;background:white;border-radius:16px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="font-size:48px;margin-bottom:15px;">✅</div>
            <h2 style="color:#040449;margin:0 0 15px 0;">${alreadyMsg.title}</h2>
            <p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 10px 0;">${alreadyMsg.text}</p>
            <p style="color:#999;font-size:13px;margin:0;">${alreadyMsg.sub}</p>
          </div>
        </body></html>
      `);
    }
    
    const lang = user.language || 'fr';
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const confirmUrl = `${backendUrl}/api/trial-emails/opt-out/${userId}/confirm`;
    
    const msg = lang === 'en'
      ? {
          title: 'Unsubscribe from emails',
          text: 'You are about to stop receiving all communications from PL4TO (tips, reminders, offers).',
          warn: 'You will no longer receive any important updates about your account.',
          btn: 'Confirm — Stop all emails',
          cancel: 'Cancel',
          cancelUrl: 'https://pl4to.com'
        }
      : {
          title: 'Se désabonner des emails',
          text: 'Tu es sur le point de ne plus recevoir aucune communication de PL4TO (conseils, rappels, offres).',
          warn: 'Tu ne recevras plus aucune mise à jour importante concernant ton compte.',
          btn: 'Confirmer \u2014 Arr\u00eater tous les emails',
          cancel: 'Annuler',
          cancelUrl: 'https://pl4to.com'
        };
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>PL4TO - Désabonnement</title></head>
      <body style="margin:0;padding:60px 20px;font-family:'Segoe UI',sans-serif;background:#f4f4f7;text-align:center;">
        <div style="max-width:450px;margin:0 auto;">
          <!-- Logo -->
          <h1 style="color:#040449;font-size:28px;margin:0 0 30px 0;">PL4T<span style="color:#ff9800;">O</span></h1>
          
          <!-- Card -->
          <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="font-size:48px;margin-bottom:15px;">⚠️</div>
            <h2 style="color:#040449;font-size:22px;margin:0 0 20px 0;">${msg.title}</h2>
            <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 15px 0;">${msg.text}</p>
            <p style="color:#e74c3c;font-size:14px;font-weight:600;margin:0 0 30px 0;">${msg.warn}</p>
            
            <!-- Bouton Confirmer -->
            <a href="${confirmUrl}" style="display:inline-block;background:#e74c3c;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:bold;margin-bottom:15px;">${msg.btn}</a>
            <br>
            <!-- Bouton Annuler -->
            <a href="${msg.cancelUrl}" style="display:inline-block;color:#888;text-decoration:underline;font-size:14px;margin-top:10px;">${msg.cancel}</a>
          </div>
          
          <p style="color:#999;font-size:12px;margin-top:20px;">&copy; ${new Date().getFullYear()} PL4TO</p>
        </div>
      </body></html>
    `);
    
  } catch (error) {
    console.error('[❌ Opt-out] Erreur:', error);
    res.status(500).send('<html><body style="font-family:sans-serif;text-align:center;padding:60px;"><h2>Erreur</h2><p>Veuillez réessayer.</p></body></html>');
  }
});

// 📧 Opt-out emails - Étape 2: Confirmation effective
app.get('/api/trial-emails/opt-out/:userId/confirm', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).send('<html><body style="font-family:sans-serif;text-align:center;padding:60px;"><h2>Lien invalide</h2></body></html>');
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { emailOptOut: true }
    });
    
    const lang = user.language || 'fr';
    const msg = lang === 'en'
      ? { title: 'Done!', text: 'You will no longer receive any emails from PL4TO.', sub: 'You can close this page.' }
      : { title: 'C\'est fait!', text: 'Tu ne recevras plus aucun email de PL4TO.', sub: 'Tu peux fermer cette page.' };
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>PL4TO - Confirmé</title></head>
      <body style="margin:0;padding:60px 20px;font-family:'Segoe UI',sans-serif;background:#f4f4f7;text-align:center;">
        <div style="max-width:450px;margin:0 auto;">
          <h1 style="color:#040449;font-size:28px;margin:0 0 30px 0;">PL4T<span style="color:#ff9800;">O</span></h1>
          <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="font-size:48px;margin-bottom:15px;">✅</div>
            <h2 style="color:#040449;margin:0 0 15px 0;">${msg.title}</h2>
            <p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 10px 0;">${msg.text}</p>
            <p style="color:#999;font-size:13px;margin:0;">${msg.sub}</p>
          </div>
          <p style="color:#999;font-size:12px;margin-top:20px;">&copy; ${new Date().getFullYear()} PL4TO</p>
        </div>
      </body></html>
    `);
    
    console.log(`[📧 Opt-out] ${user.email} s'est désabonné des emails`);
  } catch (error) {
    console.error('[❌ Opt-out confirm] Erreur:', error);
    res.status(500).send('<html><body style="font-family:sans-serif;text-align:center;padding:60px;"><h2>Erreur</h2><p>Veuillez réessayer.</p></body></html>');
  }
});

// 📧 Preview accessible SANS auth (pour tester dans le navigateur)
app.get('/api/trial-emails/preview/:type', (req, res) => {
  const { previewEmail, TRIAL_EMAIL_CONFIG } = require('./services/email/trialEmailService');
  try {
    const { type } = req.params;
    const language = req.query.lang || 'fr';
    const { html } = previewEmail(type, language);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    res.status(400).json({ error: error.message, availableTypes: Object.keys(TRIAL_EMAIL_CONFIG) });
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Pl4to Backend est en ligne!',
    timestamp: new Date().toISOString()
  });
});

// Premier calcul simple - Solde Futur
app.post('/api/calculer-solde-futur', (req, res) => {
  const { soldeInitial, revenuMensuel, depenseMensuelle, nbMois } = req.body;
  
  let solde = soldeInitial;
  let historique = [];
  
  for (let mois = 1; mois <= nbMois; mois++) {
    solde = solde + revenuMensuel - depenseMensuelle;
    historique.push({
      mois: mois,
      solde: solde.toFixed(2)
    });
  }
  
  res.json({
    soldeInitial: soldeInitial,
    soldeFinal: solde.toFixed(2),
    nbMois: nbMois,
    historique: historique
  });
});

// MACRO 1: Collecter les données du formulaire + SAUVEGARDER DANS DB
app.post('/api/collecter-donnees-formulaire', async (req, res) => {
  try {
    const {
      renseignement,
      comptes,
      activites,
      planification,
      projectionsCalculs,
      objectifsFinanciers
    } = req.body;

    // Validation
    if (!renseignement || !renseignement.nom || !renseignement.email) {
      return res.status(400).json({ 
        erreur: "Le nom et l'email de l'utilisateur sont requis" 
      });
    }

    if (!comptes || comptes.length === 0) {
      return res.status(400).json({ 
        erreur: "Au moins un compte est requis" 
      });
    }

    // 1. Créer ou trouver l'utilisateur
    const user = await prisma.user.upsert({
      where: { email: renseignement.email },
      update: { nom: renseignement.nom },
      create: {
        nom: renseignement.nom,
        email: renseignement.email
      }
    });

    // 2. Créer une nouvelle session
    const sessionId = `GPS-${Date.now()}`;
    const session = await prisma.session.create({
      data: {
        sessionId: sessionId,
        userId: user.id,
        statut: 'en_cours'
      }
    });

    // 3. Créer les comptes
    const comptesCreated = await Promise.all(
      comptes.map((compte, index) => 
        prisma.compte.create({
          data: {
            sessionId: session.id,
            nom: compte.nom,
            soldeInitial: compte.soldeInitial || 0,
            ordre: index
          }
        })
      )
    );

    // 4. Créer les activités et planifications
    for (const act of activites) {
      const compte = comptesCreated.find(c => c.nom === act.compte);
      
      if (compte) {
        // Créer activités entrées
        if (act.entrees && act.entrees.length > 0) {
          for (const entree of act.entrees) {
            const activite = await prisma.activite.create({
              data: {
                compteId: compte.id,
                nom: entree.nom,
                type: 'entree',
                nomComplet: `${entree.nom}_${compte.nom}`
              }
            });

            // Créer planification si fournie
            if (entree.montant && entree.frequence) {
              await prisma.planification.create({
                data: {
                  activiteId: activite.id,
                  montant: entree.montant,
                  frequence: entree.frequence,
                  jourDuMois: entree.jourDuMois || 1,
                  type: 'entree'
                }
              });
            }
          }
        }

        // Créer activités sorties
        if (act.sorties && act.sorties.length > 0) {
          for (const sortie of act.sorties) {
            const activite = await prisma.activite.create({
              data: {
                compteId: compte.id,
                nom: sortie.nom,
                type: 'sortie',
                nomComplet: `${sortie.nom}_${compte.nom}`
              }
            });

            // Créer planification si fournie
            if (sortie.montant && sortie.frequence) {
              await prisma.planification.create({
                data: {
                  activiteId: activite.id,
                  montant: sortie.montant,
                  frequence: sortie.frequence,
                  jourDuMois: sortie.jourDuMois || 1,
                  type: 'sortie'
                }
              });
            }
          }
        }
      }
    }

    res.json({
      succes: true,
      message: "Données sauvegardées avec succès dans PostgreSQL!",
      sessionId: sessionId,
      userId: user.id
    });

  } catch (error) {
    console.error('Erreur MACRO 1:', error);
    res.status(500).json({ 
      erreur: "Erreur serveur",
      details: error.message 
    });
  }
});

// MACRO 2: Créer la liste des comptes
app.post('/api/creer-liste-comptes', (req, res) => {
  const { comptes } = req.body;

  if (!comptes || comptes.length === 0) {
    return res.status(400).json({ 
      erreur: "Aucun compte fourni" 
    });
  }

  // Créer la liste des comptes (pas besoin de nettoyer!)
  const listeComptes = {
    nom: "ListeComptes",
    comptes: comptes,
    nbComptes: comptes.length,
    dateCreation: new Date().toISOString()
  };

  res.json({
    succes: true,
    message: `Liste de ${comptes.length} comptes créée`,
    listeComptes: listeComptes
  });
});
// MACRO 3: Créer les listes Plus et Moins pour chaque compte
app.post('/api/creer-listes-plus-moins', (req, res) => {
  const { comptes } = req.body;

  if (!comptes || comptes.length === 0) {
    return res.status(400).json({ 
      erreur: "Aucun compte fourni" 
    });
  }

  // Pour chaque compte, créer les listes plus et moins
  const listesPlusEtMoins = comptes.map(compte => ({
    compte: compte,
    listePlus: `${compte}_plus`,
    listeMoins: `${compte}_moins`
  }));

  res.json({
    succes: true,
    message: `${listesPlusEtMoins.length} listes plus/moins créées`,
    listes: listesPlusEtMoins
  });
});

// MACRO 4: Créer les activités avec noms de comptes
app.post('/api/creer-activites-avec-comptes', (req, res) => {
  const { activites } = req.body;

  if (!activites || activites.length === 0) {
    return res.status(400).json({ 
      erreur: "Aucune activité fournie" 
    });
  }

  // Pour chaque activité, créer le nom combiné avec le compte
  const activitesAvecComptes = [];

  activites.forEach(act => {
    const compte = act.compte;
    
    // Traiter les entrées
    if (act.entrees && act.entrees.length > 0) {
      act.entrees.forEach(entree => {
        activitesAvecComptes.push({
          nomOriginal: entree,
          compte: compte,
          nomComplet: `${entree}_${compte}`,
          type: 'entree'
        });
      });
    }
    
    // Traiter les sorties
    if (act.sorties && act.sorties.length > 0) {
      act.sorties.forEach(sortie => {
        activitesAvecComptes.push({
          nomOriginal: sortie,
          compte: compte,
          nomComplet: `${sortie}_${compte}`,
          type: 'sortie'
        });
      });
    }
  });

  res.json({
    succes: true,
    message: `${activitesAvecComptes.length} activités créées`,
    activites: activitesAvecComptes
  });
});

// MACRO 5: Créer la liste de recherche des activités
app.post('/api/creer-liste-recherche-activite', (req, res) => {
  const { activitesAvecComptes } = req.body;

  if (!activitesAvecComptes || activitesAvecComptes.length === 0) {
    return res.status(400).json({ 
      erreur: "Aucune activité fournie" 
    });
  }

  // Créer la liste de recherche avec toutes les activités
  const listeRechercheActivite = {
    nom: "Liste_de_recherche_activité",
    activites: activitesAvecComptes.map((act, index) => ({
      index: index + 1,
      nomComplet: act.nomComplet,
      nomOriginal: act.nomOriginal,
      compte: act.compte,
      type: act.type
    })),
    nbActivites: activitesAvecComptes.length,
    dateCreation: new Date().toISOString()
  };

  res.json({
    succes: true,
    message: `Liste de recherche avec ${activitesAvecComptes.length} activités créée`,
    listeRecherche: listeRechercheActivite
  });
});

// MACRO 6: Créer l'architecture du portefeuille
app.post('/api/creer-architecture-portefeuille', (req, res) => {
  const { activitesAvecComptes } = req.body;

  if (!activitesAvecComptes || activitesAvecComptes.length === 0) {
    return res.status(400).json({ 
      erreur: "Aucune activité fournie" 
    });
  }

  // Fonction pour générer les colonnes Excel
  const genererColonnesExcel = (nombre) => {
    const colonnes = [];
    for (let i = 0; i < nombre; i++) {
      if (i < 26) {
        // A-Z
        colonnes.push(String.fromCharCode(65 + i));
      } else {
        // AA, AB, AC, ..., AZ, BA, BB, ...
        const premiere = Math.floor(i / 26) - 1;
        const deuxieme = i % 26;
        colonnes.push(
          String.fromCharCode(65 + premiere) + 
          String.fromCharCode(65 + deuxieme)
        );
      }
    }
    return colonnes;
  };

  // Générer suffisamment de colonnes Excel
  const toutesColonnes = genererColonnesExcel(300);

  // Créer l'architecture: chaque ligne a 17 lettres consécutives
  const architecture = activitesAvecComptes.map((activite, index) => {
    // Index de début: ligne 1 = B (1), ligne 2 = S (18), ligne 3 = AJ (35)
    const indexDebut = 1 + (index * 17);
    
    // Prendre 17 colonnes pour M à AB
    const titresMAB = toutesColonnes.slice(indexDebut, indexDebut + 17);

    return {
      ligne: index + 4, // Commence ligne 4
      colonneL: activite.nomComplet,
      colonneM_AB: titresMAB
    };
  });

  res.json({
    succes: true,
    message: `Architecture créée pour ${activitesAvecComptes.length} activités`,
    architecture: architecture
  });
});

// MACRO 7: Importer planification budgétaire avec validation
app.post('/api/importer-planification-budgetaire', (req, res) => {
  const { planificationBudgetaire } = req.body;

  if (!planificationBudgetaire) {
    return res.status(400).json({ 
      erreur: "Aucune planification fournie" 
    });
  }

  const { entrees, sorties } = planificationBudgetaire;

  // VALIDATION: Vérifier la cohérence des transferts
  const erreurs = [];
  const avertissements = [];

  // Vérifier les transferts
  const transferts = [...(entrees || []), ...(sorties || [])].filter(
    item => item.nom && (
      item.nom.toLowerCase().includes('transfert') ||
      item.nom.toLowerCase().includes('transfer')
    )
  );

  transferts.forEach(transfert => {
    const compteSource = transfert.compte;
    
    // Chercher si le transfert opposé existe
    const nomTransfert = transfert.nom.toLowerCase();
    
    if (transfert.type === 'sortie' || nomTransfert.includes('vers')) {
      // C'est une sortie, chercher l'entrée correspondante
      const entreeCorrespondante = entrees?.find(e => 
        e.nom.toLowerCase().includes('transfert') &&
        e.montant === transfert.montant
      );
      
      if (!entreeCorrespondante) {
        avertissements.push({
          type: 'transfert_incomplet',
          message: `Transfert sortie "${transfert.nom}" de ${transfert.montant}$ depuis ${compteSource} sans entrée correspondante`,
          suggestion: `Ajouter une entrée "Transfert depuis ${compteSource}" dans le compte de destination`
        });
      }
    }
  });

  // Créer la planification validée
  const planificationValidee = {
    dateImportation: new Date().toISOString(),
    entrees: entrees || [],
    sorties: sorties || [],
    nbEntrees: entrees?.length || 0,
    nbSorties: sorties?.length || 0,
    validation: {
      statut: erreurs.length > 0 ? 'erreur' : (avertissements.length > 0 ? 'avertissement' : 'valide'),
      erreurs: erreurs,
      avertissements: avertissements
    }
  };

  res.json({
    succes: true,
    message: `Planification importée: ${planificationValidee.nbEntrees} entrées, ${planificationValidee.nbSorties} sorties`,
    planification: planificationValidee
  });
});

// ============================================
// MACRO 8 - PARTIE 2: Moteur de Calcul Dates
// ============================================

// Fonction helper: Générer calendrier dynamique
function genererCalendrier(dateDebut, dateFin) {
  const dates = [];
  let current = new Date(dateDebut);
  
  while (current <= dateFin) {
    const joursDansMois = new Date(
      current.getFullYear(), 
      current.getMonth() + 1, 
      0
    ).getDate();
    
    dates.push({
      date: new Date(current),
      dateString: current.toISOString().split('T')[0],
      jour: current.getDate(),
      mois: current.getMonth() + 1,
      annee: current.getFullYear(),
      jourSemaine: current.getDay() + 1, // 1=Dimanche, 7=Samedi
      joursDansMois: joursDansMois
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Table Journeesemaine (statique)
const JOURS_SEMAINE = {
  1: 'Dimanche', 2: 'Lundi', 3: 'Mardi', 4: 'Mercredi',
  5: 'Jeudi', 6: 'Vendredi', 7: 'Samedi'
};

// CALCUL MENSUEL
function calculerDateMensuelle(dateReference, jourDuMois, calendrier) {
  // Extraire année et mois de la date de référence
  const refDate = new Date(dateReference);
  const annee = refDate.getFullYear();
  const mois = refDate.getMonth() + 1;
  
  // Construire date avec jour utilisateur
  let dateCalculee = new Date(annee, mois - 1, jourDuMois);
  
  // Gérer cas spéciaux (février, mois <31 jours)
  const joursDansMois = new Date(annee, mois, 0).getDate();
  
  if (mois === 2 && jourDuMois > 28) {
    // Février: ajuster
    dateCalculee = new Date(annee, mois - 1, joursDansMois);
  } else if (jourDuMois > joursDansMois) {
    // Mois court: prendre dernier jour
    dateCalculee = new Date(annee, mois - 1, joursDansMois);
  }
  
  // Si date calculée < aujourd'hui, prendre mois suivant
  if (dateCalculee < refDate) {
    const moisSuivant = mois === 12 ? 1 : mois + 1;
    const anneeSuivante = mois === 12 ? annee + 1 : annee;
    dateCalculee = new Date(anneeSuivante, moisSuivant - 1, jourDuMois);
    
    // Re-vérifier jours dans mois
    const joursNouveauMois = new Date(anneeSuivante, moisSuivant, 0).getDate();
    if (jourDuMois > joursNouveauMois) {
      dateCalculee = new Date(anneeSuivante, moisSuivant - 1, joursNouveauMois);
    }
  }
  
  return dateCalculee;
}

// CALCUL BIMENSUEL
function calculerDateBimensuelle(dateReference, jourDuMois) {
  const refDate = new Date(dateReference);
  const jourSemaineRef = refDate.getDay() + 1; // 1=Dimanche
  const jourSemaineVoulu = ((jourDuMois - 1) % 7) + 1;
  
  // Calculer différence de jours
  let diff = jourSemaineVoulu - jourSemaineRef;
  
  // Ajuster pour avoir la prochaine occurrence
  if (diff < 0) {
    diff += 7;
  }
  
  const dateCalculee = new Date(refDate);
  dateCalculee.setDate(refDate.getDate() + diff);
  
  // Si c'est aujourd'hui ou dans le passé, ajouter 7 jours
  if (dateCalculee <= refDate) {
    dateCalculee.setDate(dateCalculee.getDate() + 7);
  }
  
  return dateCalculee;
}

// CALCUL HEBDOMADAIRE
function calculerDateHebdomadaire(dateReference, jourDuMois) {
  const refDate = new Date(dateReference);
  const jourSemaineRef = refDate.getDay() + 1;
  const jourSemaineVoulu = ((jourDuMois - 1) % 7) + 1;
  
  let diff = jourSemaineVoulu - jourSemaineRef;
  
  if (diff <= 0) {
    diff += 7;
  }
  
  const dateCalculee = new Date(refDate);
  dateCalculee.setDate(refDate.getDate() + diff);
  
  return dateCalculee;
}

// CALCUL QUINZAINE
function calculerDateQuinzaine(dateReference, jourDuMois) {
  const refDate = new Date(dateReference);
  const annee = refDate.getFullYear();
  const mois = refDate.getMonth() + 1;
  
  // Date de base dans le mois
  let dateBase = new Date(annee, mois - 1, jourDuMois);
  
  // Si date de base < aujourd'hui, c'est celle-là
  if (dateBase >= refDate) {
    return dateBase;
  }
  
  // Sinon, ajouter 15 jours
  const dateCalculee = new Date(dateBase);
  dateCalculee.setDate(dateBase.getDate() + 15);
  
  return dateCalculee;
}

// ENDPOINT MACRO 8 - PARTIE 2
app.post('/api/calculer-dates-planification', (req, res) => {
  const { transaction, dateReference } = req.body;
  
  if (!transaction || !dateReference) {
    return res.status(400).json({ 
      erreur: "Transaction et date de référence requises" 
    });
  }
  
  const { frequence, jourDuMois } = transaction;
  
  // Générer calendrier (aujourd'hui + 10 ans pour test)
  const debut = new Date(dateReference);
  const fin = new Date(debut);
  fin.setFullYear(fin.getFullYear() + 10);
  const calendrier = genererCalendrier(debut, fin);
  
  // Calculer date selon fréquence
  let dateCalculee;
  
  switch(frequence) {
    case 'Mensuel':
      dateCalculee = calculerDateMensuelle(dateReference, jourDuMois, calendrier);
      break;
    case 'Bimensuel':
      dateCalculee = calculerDateBimensuelle(dateReference, jourDuMois);
      break;
    case 'Hebdomadaire':
      dateCalculee = calculerDateHebdomadaire(dateReference, jourDuMois);
      break;
    case 'Quinzaine':
      dateCalculee = calculerDateQuinzaine(dateReference, jourDuMois);
      break;
    default:
      return res.status(400).json({ 
        erreur: `Fréquence invalide: ${frequence}` 
      });
  }
  
  res.json({
    succes: true,
    transaction: transaction,
    dateReference: dateReference,
    dateCalculee: dateCalculee.toISOString().split('T')[0],
    jourSemaine: JOURS_SEMAINE[dateCalculee.getDay() + 1]
  });
});

// ============================================
// MACRO 8 - PARTIE 3: Mapping Architecture
// ============================================

// ENDPOINT COMPLET: Calculer planification + mapper architecture
app.post('/api/generer-planification-complete', (req, res) => {
  const { transactions, dateReference, architecture } = req.body;
  
  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ 
      erreur: "Liste de transactions requise" 
    });
  }
  
  if (!architecture || !Array.isArray(architecture)) {
    return res.status(400).json({ 
      erreur: "Architecture portefeuille requise" 
    });
  }
  
  const dateRef = dateReference || new Date().toISOString().split('T')[0];
  
  // Pour chaque transaction, calculer ses dates futures
  const planificationComplete = transactions.map(transaction => {
    const { nom, frequence, jourDuMois, montant, compte, type } = transaction;
    
    // Calculer première date
    let dateCalculee;
    
    switch(frequence) {
      case 'Mensuel':
        dateCalculee = calculerDateMensuelle(dateRef, jourDuMois, []);
        break;
      case 'Bimensuel':
        dateCalculee = calculerDateBimensuelle(dateRef, jourDuMois);
        break;
      case 'Hebdomadaire':
        dateCalculee = calculerDateHebdomadaire(dateRef, jourDuMois);
        break;
      case 'Quinzaine':
        dateCalculee = calculerDateQuinzaine(dateRef, jourDuMois);
        break;
      default:
        dateCalculee = new Date(dateRef);
    }
    
    const dateString = dateCalculee.toISOString().split('T')[0];
    
    // Créer clé activité_compte
    const nomActivite = `${nom}_${compte}`;
    
    // Trouver dans architecture
    const elementArchitecture = architecture.find(arch => 
      arch.colonneL === nomActivite
    );
    
    // Mapper à la lettre d'architecture
    const lettreArchitecture = elementArchitecture?.colonneM_AB?.[0] || 'N/A';
    
    return {
      transaction: {
        nom,
        compte,
        type,
        montant,
        frequence,
        jourDuMois
      },
      dateCalculee: dateString,
      jourSemaine: JOURS_SEMAINE[dateCalculee.getDay() + 1],
      nomActivite: nomActivite,
      lettreArchitecture: lettreArchitecture,
      ligneArchitecture: elementArchitecture?.ligne || null
    };
  });
  
  res.json({
    succes: true,
    dateReference: dateRef,
    nbTransactions: planificationComplete.length,
    planification: planificationComplete
  });
});

// ============================================
// MACRO 9: Créer Liste de Dates
// ============================================

// Fonction helper: Calculer N dates futures pour une transaction
function calculerDatesFutures(transaction, dateReference, nombreDates = 50) {
  const { frequence, jourDuMois } = transaction;
  const dates = [];
  let dateActuelle = new Date(dateReference);
  
  for (let i = 0; i < nombreDates; i++) {
    let dateCalculee;
    
    switch(frequence) {
      case 'Mensuel':
        // Calculer date mensuelle à partir de dateActuelle
        dateCalculee = calculerDateMensuelle(dateActuelle.toISOString().split('T')[0], jourDuMois, []);
        break;
      case 'Bimensuel':
        dateCalculee = calculerDateBimensuelle(dateActuelle.toISOString().split('T')[0], jourDuMois);
        break;
      case 'Hebdomadaire':
        dateCalculee = calculerDateHebdomadaire(dateActuelle.toISOString().split('T')[0], jourDuMois);
        break;
      case 'Quinzaine':
        dateCalculee = calculerDateQuinzaine(dateActuelle.toISOString().split('T')[0], jourDuMois);
        break;
      default:
        dateCalculee = new Date(dateActuelle);
    }
    
    dates.push(dateCalculee.toISOString().split('T')[0]);
    
    // Prochaine itération part de la date calculée + 1 jour
    dateActuelle = new Date(dateCalculee);
    dateActuelle.setDate(dateActuelle.getDate() + 1);
  }
  
  return dates;
}

// ENDPOINT MACRO 9
app.post('/api/creer-liste-dates', (req, res) => {
  const { transactions, dateReference, nombreDatesMax } = req.body;
  
  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ 
      erreur: "Liste de transactions requise" 
    });
  }
  
  const dateRef = dateReference || new Date().toISOString().split('T')[0];
  const nbDates = nombreDatesMax || 100; // Par défaut 100 dates
  
  // Collecter toutes les dates de toutes les transactions
  const toutesLesDates = new Set();
  
  // Ajouter date de référence (aujourd'hui)
  toutesLesDates.add(dateRef);
  
  transactions.forEach(transaction => {
    const datesFutures = calculerDatesFutures(transaction, dateRef, nbDates);
    datesFutures.forEach(date => toutesLesDates.add(date));
  });
  
  // Convertir Set en Array et trier
  const datesOrdonnees = Array.from(toutesLesDates).sort();
  
  // Créer objet avec métadonnées
  const resultat = {
    succes: true,
    dateReference: dateRef,
    nombreTransactions: transactions.length,
    nombreDatesGenerees: datesOrdonnees.length,
    dateDebut: datesOrdonnees[0],
    dateFin: datesOrdonnees[datesOrdonnees.length - 1],
    timeline: datesOrdonnees.map((date, index) => ({
      index: index,
      date: date,
      jourSemaine: JOURS_SEMAINE[new Date(date).getDay() + 1]
    }))
  };
  
  res.json(resultat);
});

// ============================================
// MACROS 10-14: Structures de Titres
// ============================================

// Fonction helper: Générer colonnes Excel (A, B, C...AA, AB...)
function genererColonnesExcel(debut, nombre) {
  const colonnes = [];
  let colonne = debut.charCodeAt(0) - 65; // A = 0
  
  for (let i = 0; i < nombre; i++) {
    if (colonne < 26) {
      colonnes.push(String.fromCharCode(65 + colonne));
    } else {
      const premiere = Math.floor(colonne / 26) - 1;
      const deuxieme = colonne % 26;
      colonnes.push(String.fromCharCode(65 + premiere) + String.fromCharCode(65 + deuxieme));
    }
    colonne++;
  }
  
  return colonnes;
}

// MACRO 10: Titres Données utilisateurs (avec lettres)
function creerTitresDonneesUtilisateurs(activitesAvecComptes) {
  const titres = activitesAvecComptes.map((activite, index) => {
    const ligne = index + 4; // Commence à ligne 4
    const colonneDebut = 'B'; // Toujours B
    const colonnesLettres = genererColonnesExcel(colonneDebut, 17);
    
    return {
      ligne: ligne,
      colonneL: activite.nomComplet,
      colonnesM_AB_lettres: colonnesLettres,
      type: 'lettres'
    };
  });
  
  return titres;
}

// MACRO 11: Titres Lecture - DU (avec chiffres)
function creerTitresLectureDU(activitesAvecComptes) {
  const titres = activitesAvecComptes.map((activite, index) => {
    const ligne = index + 4;
    const colonnesChiffres = Array.from({ length: 17 }, (_, i) => i + 1);
    
    return {
      ligne: ligne,
      colonneL: activite.nomComplet,
      colonnesM_AB_chiffres: colonnesChiffres,
      type: 'chiffres'
    };
  });
  
  return titres;
}

// MACRO 12: Titres Lecture - AP (structure calculs)
function creerTitresLectureAP(activitesAvecComptes) {
  // Séparer entrées et sorties
  const entrees = activitesAvecComptes.filter(a => a.type === 'plus');
  const sorties = activitesAvecComptes.filter(a => a.type === 'moins');
  
  const titres = {
    entrees: entrees.map((activite, index) => ({
      ligne: index + 4,
      colonneL: activite.nomComplet,
      compte: activite.compte,
      type: 'entree'
    })),
    sorties: sorties.map((activite, index) => ({
      ligne: entrees.length + index + 4,
      colonneL: activite.nomComplet,
      compte: activite.compte,
      type: 'sortie'
    }))
  };
  
  return titres;
}

// MACRO 13: Titres CycleO (structure cycle)
function creerTitresCycleO(activitesAvecComptes) {
  // Structure similaire à Lecture - AP mais pour cycle complet
  const comptes = [...new Set(activitesAvecComptes.map(a => a.compte))];
  
  const titres = comptes.map((compte, index) => ({
    ligne: index + 4,
    compte: compte,
    colonnesActivites: activitesAvecComptes
      .filter(a => a.compte === compte)
      .map(a => a.nomComplet)
  }));
  
  return titres;
}

// MACRO 14: Ajouter Dates devant Titres
function ajouterDatesTitres(titres, timeline) {
  return titres.map(titre => ({
    ...titre,
    dates: timeline.slice(0, 17).map(t => t.date) // 17 premières dates
  }));
}

// ENDPOINT GLOBAL: MACROS 10-14
app.post('/api/creer-structures-titres', (req, res) => {
  const { activitesAvecComptes, timeline } = req.body;
  
  if (!activitesAvecComptes || !Array.isArray(activitesAvecComptes)) {
    return res.status(400).json({ 
      erreur: "activitesAvecComptes requis (résultat MACRO 4)" 
    });
  }
  
  if (!timeline || !Array.isArray(timeline)) {
    return res.status(400).json({ 
      erreur: "timeline requise (résultat MACRO 9)" 
    });
  }
  
  // MACRO 10
  const titresDonneesUtilisateurs = creerTitresDonneesUtilisateurs(activitesAvecComptes);
  
  // MACRO 11
  const titresLectureDU = creerTitresLectureDU(activitesAvecComptes);
  
  // MACRO 12
  const titresLectureAP = creerTitresLectureAP(activitesAvecComptes);
  
  // MACRO 13
  const titresCycleO = creerTitresCycleO(activitesAvecComptes);
  
  // MACRO 14: Ajouter dates à tous
  const donneesUtilisateursAvecDates = ajouterDatesTitres(titresDonneesUtilisateurs, timeline);
  const lectureDUAvecDates = ajouterDatesTitres(titresLectureDU, timeline);
  
  res.json({
    succes: true,
    macro10_donneesUtilisateurs: {
      nombre: titresDonneesUtilisateurs.length,
      structures: donneesUtilisateursAvecDates
    },
    macro11_lectureDU: {
      nombre: titresLectureDU.length,
      structures: lectureDUAvecDates
    },
    macro12_lectureAP: {
      nombreEntrees: titresLectureAP.entrees.length,
      nombreSorties: titresLectureAP.sorties.length,
      structures: titresLectureAP
    },
    macro13_cycleO: {
      nombreComptes: titresCycleO.length,
      structures: titresCycleO
    }
  });
});

// ============================================
// MACRO 15: Formules Données Utilisateurs
// ============================================

app.post('/api/generer-donnees-utilisateurs', (req, res) => {
  const { architecture, planificationComplete, timeline } = req.body;
  
  if (!architecture || !planificationComplete || !timeline) {
    return res.status(400).json({ 
      erreur: "architecture, planificationComplete et timeline requis" 
    });
  }
  
  // Créer index de recherche depuis planificationComplete
  // Format: clé = "date_lettre" → montant
  const indexPlanification = {};
  
  planificationComplete.forEach(item => {
    const { dateCalculee, lettreArchitecture, transaction } = item;
    const cle = `${dateCalculee}_${lettreArchitecture}`;
    indexPlanification[cle] = transaction.montant;
  });
  
  // Générer matrice Données Utilisateurs
  const matriceDonneesUtilisateurs = timeline.map(dateItem => {
    const ligne = {
      date: dateItem.date,
      jourSemaine: dateItem.jourSemaine
    };
    
    // Pour chaque lettre d'architecture
    architecture.forEach(arch => {
      const lettreDebut = arch.colonneM_AB[0]; // Première lettre (ex: "B")
      
      // Pour chaque colonne (17 lettres)
      arch.colonneM_AB.forEach((lettre, index) => {
        const cle = `${dateItem.date}_${lettre}`;
        const montant = indexPlanification[cle] || 0;
        
        ligne[`col_${lettre}`] = montant;
      });
    });
    
    return ligne;
  });
  
  res.json({
    succes: true,
    nombreLignes: matriceDonneesUtilisateurs.length,
    nombreColonnes: architecture.length * 17,
    matriceDonneesUtilisateurs: matriceDonneesUtilisateurs.slice(0, 10), // Échantillon 10 lignes
    stats: {
      datesAnalysees: timeline.length,
      activites: architecture.length,
      transactionsTrouvees: Object.keys(indexPlanification).length
    }
  });
});

// ============================================
// MACROS 16-18: Formules Lecture-DU, AP, CycleO
// ============================================

// MACRO 16: Lecture - DU
app.post('/api/generer-lecture-du', (req, res) => {
  const { donneesUtilisateurs, architecture } = req.body;
  
  if (!donneesUtilisateurs || !architecture) {
    return res.status(400).json({ 
      erreur: "donneesUtilisateurs et architecture requis" 
    });
  }
  
  // Pour chaque date, extraire les valeurs par activité
  const lectureDU = donneesUtilisateurs.map(ligne => {
    const resultat = {
      date: ligne.date,
      jourSemaine: ligne.jourSemaine
    };
    
    // Pour chaque activité (ligne dans architecture)
    architecture.forEach((arch, index) => {
      const nomActivite = arch.colonneL;
      
      // Extraire les 17 colonnes pour cette activité
      const valeurs = arch.colonneM_AB.map(lettre => {
        return ligne[`col_${lettre}`] || 0;
      });
      
      resultat[`activite_${index}`] = {
        nom: nomActivite,
        valeurs: valeurs
      };
    });
    
    return resultat;
  });
  
  res.json({
    succes: true,
    nombreLignes: lectureDU.length,
    lectureDU: lectureDU.slice(0, 5) // Échantillon
  });
});

// MACRO 17: Lecture - AP (Agrégation Plus/Moins)
app.post('/api/generer-lecture-ap', (req, res) => {
  const { lectureDU, activitesAvecComptes } = req.body;
  
  if (!lectureDU || !activitesAvecComptes) {
    return res.status(400).json({ 
      erreur: "lectureDU et activitesAvecComptes requis" 
    });
  }
  
  // Séparer entrées et sorties
  const entrees = activitesAvecComptes.filter(a => a.type === 'plus');
  const sorties = activitesAvecComptes.filter(a => a.type === 'moins');
  
  // Agréger par date
  const lectureAP = lectureDU.map(ligne => {
    const resultat = {
      date: ligne.date,
      jourSemaine: ligne.jourSemaine,
      entreesParCompte: {},
      sortiesParCompte: {}
    };
    
    // Agréger entrées
    entrees.forEach(activite => {
      const compte = activite.compte;
      if (!resultat.entreesParCompte[compte]) {
        resultat.entreesParCompte[compte] = 0;
      }
      
      // Trouver l'activité dans ligne
      Object.keys(ligne).forEach(key => {
        if (key.startsWith('activite_')) {
          const act = ligne[key];
          if (act.nom === activite.nomComplet) {
            const total = act.valeurs.reduce((sum, val) => sum + val, 0);
            resultat.entreesParCompte[compte] += total;
          }
        }
      });
    });
    
    // Agréger sorties
    sorties.forEach(activite => {
      const compte = activite.compte;
      if (!resultat.sortiesParCompte[compte]) {
        resultat.sortiesParCompte[compte] = 0;
      }
      
      Object.keys(ligne).forEach(key => {
        if (key.startsWith('activite_')) {
          const act = ligne[key];
          if (act.nom === activite.nomComplet) {
            const total = act.valeurs.reduce((sum, val) => sum + val, 0);
            resultat.sortiesParCompte[compte] += total;
          }
        }
      });
    });
    
    return resultat;
  });
  
  res.json({
    succes: true,
    nombreLignes: lectureAP.length,
    lectureAP: lectureAP.slice(0, 5) // Échantillon
  });
});

// MACRO 18: CycleO (Calcul Soldes)
app.post('/api/generer-cycle-o', (req, res) => {
  const { lectureAP, soldesInitiaux } = req.body;
  
  if (!lectureAP || !soldesInitiaux) {
    return res.status(400).json({ 
      erreur: "lectureAP et soldesInitiaux requis" 
    });
  }
  
  // Calculer soldes cumulés pour chaque compte
  const cycleO = [];
  const soldesActuels = { ...soldesInitiaux };
  
  lectureAP.forEach(ligne => {
    const resultatLigne = {
      date: ligne.date,
      jourSemaine: ligne.jourSemaine,
      soldesParCompte: {}
    };
    
    // Pour chaque compte
    Object.keys(soldesInitiaux).forEach(compte => {
      const entrees = ligne.entreesParCompte[compte] || 0;
      const sorties = ligne.sortiesParCompte[compte] || 0;
      
      // Calcul: solde précédent + entrées + sorties (sorties sont négatives)
      soldesActuels[compte] = soldesActuels[compte] + entrees + sorties;
      
      resultatLigne.soldesParCompte[compte] = {
        solde: soldesActuels[compte],
        entrees: entrees,
        sorties: sorties,
        variation: entrees + sorties
      };
    });
    
    cycleO.push(resultatLigne);
  });
  
  res.json({
    succes: true,
    nombreLignes: cycleO.length,
    cycleO: cycleO.slice(0, 5), // Échantillon
    soldesFinaux: soldesActuels
  });
});

// ============================================
// MACROS 19-20: Synthèse & GPS Financier Final
// ============================================

// Helper: Extraire année-mois d'une date
function extraireMois(date) {
  return date.substring(0, 7); // "2025-11-04" → "2025-11"
}

// MACRO 19: Synthèse Tous Blocs
app.post('/api/generer-synthese-gps', (req, res) => {
  const { cycleO, comptes } = req.body;
  
  if (!cycleO || !comptes) {
    return res.status(400).json({ 
      erreur: "cycleO et comptes requis" 
    });
  }
  
  // Agréger par mois et par compte
  const syntheseParMois = {};
  
  cycleO.forEach(ligne => {
    const mois = extraireMois(ligne.date);
    
    if (!syntheseParMois[mois]) {
      syntheseParMois[mois] = {};
      comptes.forEach(compte => {
        syntheseParMois[mois][compte] = {
          mois: mois,
          soldeDebut: null,
          soldeFin: null,
          entrees: 0,
          sorties: 0,
          variation: 0
        };
      });
    }
    
    // Pour chaque compte
    Object.keys(ligne.soldesParCompte).forEach(compte => {
      const data = ligne.soldesParCompte[compte];
      
      // Premier jour du mois = solde début
      if (syntheseParMois[mois][compte].soldeDebut === null) {
        syntheseParMois[mois][compte].soldeDebut = data.solde - data.variation;
      }
      
      // Accumuler entrées/sorties
      syntheseParMois[mois][compte].entrees += data.entrees;
      syntheseParMois[mois][compte].sorties += data.sorties;
      syntheseParMois[mois][compte].variation += data.variation;
      
      // Dernier jour du mois = solde fin
      syntheseParMois[mois][compte].soldeFin = data.solde;
    });
  });
  
  // Convertir en array et ajouter alertes
  const syntheseArray = [];
  
  Object.keys(syntheseParMois).sort().forEach(mois => {
    const moisData = syntheseParMois[mois];
    
    Object.keys(moisData).forEach(compte => {
      const data = moisData[compte];
      
      syntheseArray.push({
        ...data,
        compte: compte,
        alerte: data.soldeFin < 0 ? '⚠️ Solde négatif' : '✅ OK'
      });
    });
  });
  
  res.json({
    succes: true,
    nombreMois: Object.keys(syntheseParMois).length,
    nombreComptes: comptes.length,
    syntheseGPS: syntheseArray.slice(0, 12) // 12 premiers mois
  });
});

// MACRO 20: GPS Financier Global
app.post('/api/generer-gps-financier-complet', (req, res) => {
  const { syntheseGPS, objectifsFinanciers } = req.body;
  
  if (!syntheseGPS) {
    return res.status(400).json({ 
      erreur: "syntheseGPS requis (résultat MACRO 19)" 
    });
  }
  
  // GPS Financier = Synthèse + Analyse objectifs
  const gpsFinancier = syntheseGPS.map(synthese => {
    const gps = {
      ...synthese,
      projections: {
        tendance: synthese.variation > 0 ? '📈 Croissance' : '📉 Décroissance',
        tauxVariation: synthese.soldeDebut !== 0 
          ? ((synthese.variation / synthese.soldeDebut) * 100).toFixed(2) + '%'
          : 'N/A'
      }
    };
    
    // Vérifier objectifs si fournis
    if (objectifsFinanciers && objectifsFinanciers.length > 0) {
      gps.objectifs = objectifsFinanciers.map(obj => {
        const progression = (synthese.soldeFin / obj.montantCible) * 100;
        return {
          nom: obj.nom,
          cible: obj.montantCible,
          progression: progression.toFixed(2) + '%',
          atteint: progression >= 100
        };
      });
    }
    
    return gps;
  });
  
  // Statistiques globales
  const stats = {
    moisTotal: gpsFinancier.length,
    soldeInitial: gpsFinancier[0]?.soldeDebut || 0,
    soldeFinal: gpsFinancier[gpsFinancier.length - 1]?.soldeFin || 0,
    variationTotale: (gpsFinancier[gpsFinancier.length - 1]?.soldeFin || 0) - (gpsFinancier[0]?.soldeDebut || 0),
    moisPositifs: gpsFinancier.filter(g => g.variation > 0).length,
    moisNegatifs: gpsFinancier.filter(g => g.variation < 0).length,
    alertes: gpsFinancier.filter(g => g.alerte.includes('⚠️')).length
  };
  
  res.json({
    succes: true,
    message: '🎉 GPS FINANCIER COMPLET GÉNÉRÉ!',
    stats: stats,
    gpsFinancier: gpsFinancier,
    dateGeneration: new Date().toISOString()
  });
});

// ==================== ROUTES D'AUTHENTIFICATION ====================

// Register (Inscription) - 🛡️ Rate limit: 3/heure
app.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { nom, prenom, email, password, ref, country, region, currency, timezone } = req.body;

    // Validation
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        error: 'Tous les champs sont requis'
      });
    }

    // Normaliser l'email en minuscules
    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      // Si l'utilisateur existe mais n'est pas vérifié, renvoyer le code
      if (!existingUser.emailVerified) {
        const code = emailService.generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verificationCode: code,
            verificationCodeExpires: expiresAt
          }
        });
        
        await emailService.sendVerificationCode(normalizedEmail, existingUser.prenom, code);
        
        return res.status(200).json({
          message: 'Un nouveau code a été envoyé',
          requiresVerification: true,
          email: normalizedEmail
        });
      }
      
      return res.status(400).json({
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe avec bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📧 Générer le code de vérification
    const verificationCode = emailService.generateCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // ============================================
    // 🎉 TRIAL - Vérifier historique anti-abus
    // ============================================
    const now = new Date();
    let trialStartDate = null;  // NULL par défaut - trial démarre après onboarding
    let trialEndDate = null;
    let trialActive = false;    // FALSE par défaut - pas encore actif
    let subscriptionPlan = 'discovery';  // Plan gratuit en attendant le trial
    let trialWelcomeShown = false; // Par défaut, montrer le welcome
    
    // Vérifier si cet email a déjà eu un trial (anti-abus)
    const existingTrialHistory = await prisma.trialHistory.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (existingTrialHistory) {
      // Cet email a déjà eu un trial - CONSERVER les dates originales
      const originalStartDate = new Date(existingTrialHistory.trialStartDate);
      const originalEndDate = new Date(existingTrialHistory.trialEndDate);
      
      // TOUJOURS utiliser les dates originales du premier trial
      trialStartDate = originalStartDate;
      trialEndDate = originalEndDate;
      
      // RÉINSCRIPTION: Ne pas remontrer le popup de bienvenue
      trialWelcomeShown = true;
      
      if (originalEndDate > now) {
        // Il reste des jours de trial
        trialActive = true;
        subscriptionPlan = 'essential';
        const daysRemaining = Math.ceil((originalEndDate - now) / (1000 * 60 * 60 * 24));
        console.log(`[🔄 Trial] Email ${normalizedEmail} - Trial existant, ${daysRemaining} jours restants (fin: ${originalEndDate.toISOString().split('T')[0]})`);
      } else {
        // Trial expiré - pas de nouveau trial
        trialActive = false;
        subscriptionPlan = 'discovery'; // Plan gratuit
        console.log(`[⏰ Trial] Email ${normalizedEmail} - Trial déjà expiré le ${originalEndDate.toISOString().split('T')[0]}`);
      }
    } else {
      // Nouvel email - Trial démarrera APRÈS l'onboarding (via /api/subscription/start-trial)
      // trialStartDate et trialEndDate restent NULL
      console.log(`[📝 Trial] Nouvel email ${normalizedEmail} - Trial démarrera après onboarding`);
    }

    // Créer l'utilisateur avec le mot de passe hashé ET le trial
    const user = await prisma.user.create({
      data: {
        nom,
        prenom,
        email: normalizedEmail,
        password: hashedPassword,
        // 📧 Vérification email
        emailVerified: false,
        verificationCode: verificationCode,
        verificationCodeExpires: verificationCodeExpires,
        // 🌍 Régionalisation
        country: country?.trim().toUpperCase() || 'CA',
        region: region?.trim().toUpperCase() || 'QC',
        currency: currency?.trim().toUpperCase() || 'CAD',
        timezone: timezone?.trim() || 'America/Toronto',
        // Trial (peut être partiel si réinscription)
        subscriptionPlan: subscriptionPlan,
        trialStartDate: trialStartDate,
        trialEndDate: trialEndDate,
        trialActive: trialActive,
        planChosen: false,
        // Réinscription: ne pas remontrer le welcome
        trialWelcomeShown: trialWelcomeShown
      }
    });
    
    // Pour les réinscriptions: Mettre à jour le userId dans l'historique
    // Pour les nouveaux emails: TrialHistory sera créé dans /api/subscription/start-trial
    if (existingTrialHistory) {
      await prisma.trialHistory.update({
        where: { email: normalizedEmail },
        data: { userId: user.id }
      });
      console.log(`[📝 TrialHistory] userId mis à jour pour ${normalizedEmail}`);
    }

    console.log(`[📧 Auth] Nouvel utilisateur créé: ${normalizedEmail}, code: ${verificationCode}`);
    console.log(`[📧 Auth] Trial: ${trialActive ? 'Actif' : 'En attente onboarding'}, fin: ${trialEndDate ? trialEndDate.toISOString().split('T')[0] : 'Après onboarding'}`);

    // ============================================
    // 🤝 RÉFÉRENCEMENT COURTIER — Lier au client invité
    // Si l'inscription contient un token ref (invitation courtier)
    // ============================================
    if (ref) {
      try {
        const invitation = await prisma.clientInvitation.findUnique({
          where: { token: ref },
          include: { clientProfile: true, organization: true }
        });

        if (invitation && !invitation.acceptedAt && invitation.expiresAt > new Date()) {
          // Lier l'invitation au nouveau User
          await prisma.clientInvitation.update({
            where: { id: invitation.id },
            data: { acceptedAt: new Date(), acceptedUserId: user.id }
          });

          // Mettre à jour le ClientProfile → statut actif + lien B2C
          await prisma.clientProfile.update({
            where: { id: invitation.clientProfileId },
            data: {
              b2cUserId: user.id,
              status: 'active',
              invitedToB2C: true,
              prenom: user.prenom,
              nom: user.nom
            }
          });

          // Marquer l'utilisateur pour le rabais courtier
          await prisma.user.update({
            where: { id: user.id },
            data: { referralOrganizationId: invitation.organizationId }
          });

          console.log(`[🤝 Referral] Client ${normalizedEmail} lié à ${invitation.organization.name}`);
        } else {
          console.log(`[🤝 Referral] Token ref invalide ou expiré pour ${normalizedEmail}`);
        }
      } catch (refError) {
        // Ne pas bloquer l'inscription si le referral échoue
        console.error('[🤝 Referral] Erreur:', refError.message);
      }
    }

    // 📧 Envoyer le code par email
    const emailResult = await emailService.sendVerificationCode(email, prenom, verificationCode);
    
    if (!emailResult.success) {
      console.error('[❌ Email] Erreur envoi:', emailResult.error);
      // On continue quand même - l'utilisateur pourra demander un renvoi
    }

    // ⚠️ NE PAS retourner de token - l'utilisateur doit vérifier son email d'abord
    res.status(201).json({
      message: 'Compte créé! Vérifie ton email pour activer ton compte.',
      requiresVerification: true,
      email: email
    });

  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du compte'
    });
  }
});

// 📧 Vérifier le code email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Email et code requis'
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Déjà vérifié?
    if (user.emailVerified) {
      return res.status(400).json({
        error: 'Email déjà vérifié'
      });
    }

    // Vérifier le code
    if (user.verificationCode !== code) {
      return res.status(400).json({
        error: 'Code incorrect'
      });
    }

    // Vérifier l'expiration
    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return res.status(400).json({
        error: 'Code expiré. Demande un nouveau code.',
        codeExpired: true
      });
    }

    // ✅ Valider l'email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      }
    });

    console.log(`[✅ Auth] Email vérifié: ${email}`);

    // 🔗 ZOHO CRM - Créer le contact après confirmation email
    try {
      await zohoCRM.onUserRegistered({
        email: updatedUser.email,
        prenom: updatedUser.prenom,
        nom: updatedUser.nom
      });
      console.log(`[🔗 Zoho] Contact créé pour: ${email}`);
    } catch (zohoErr) {
      // Ne pas bloquer l'inscription si Zoho échoue
      console.error(`[⚠️ Zoho] Erreur création contact:`, zohoErr.message);
    }

    // 📧 TRIAL EMAIL - Envoyer email de bienvenue
    try {
      await sendWelcomeEmail(updatedUser.id);
      console.log(`[📧 Trial] Email bienvenue envoyé à: ${email}`);
    } catch (emailErr) {
      console.error(`[⚠️ Trial Email] Erreur:`, emailErr.message);
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024',
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur sans le mot de passe - avec mapping frontend
    const { password: _, verificationCode: __, verificationCodeExpires: ___, ...userWithoutSensitive } = updatedUser;

    res.json({
      message: 'Email vérifié avec succès!',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.prenom,
        lastName: updatedUser.nom,
        isAdmin: updatedUser.isAdmin,
        profilePicture: updatedUser.profilePicture,
        subscriptionPlan: updatedUser.subscriptionPlan,
        trialActive: updatedUser.trialActive,
        trialEndDate: updatedUser.trialEndDate,
        onboardingCompleted: updatedUser.onboardingCompleted,
        guideCompleted: updatedUser.guideCompleted,
        country: updatedUser.country,
        region: updatedUser.region,
        currency: updatedUser.currency,
        timezone: updatedUser.timezone
      },
      subscription: {
        currentPlan: updatedUser.subscriptionPlan,
        trialActive: updatedUser.trialActive,
        trialStartDate: updatedUser.trialStartDate,
        trialEndDate: updatedUser.trialEndDate,
        trialDaysRemaining: updatedUser.trialEndDate 
          ? Math.max(0, Math.ceil((new Date(updatedUser.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
          : 0,
        planChosen: updatedUser.planChosen
      }
    });

  } catch (error) {
    console.error('Erreur verify-email:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification'
    });
  }
});

// 🔄 Renvoyer le code de vérification
app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email requis'
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Déjà vérifié?
    if (user.emailVerified) {
      return res.status(400).json({
        error: 'Email déjà vérifié'
      });
    }

    // Générer un nouveau code
    const newCode = emailService.generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: newCode,
        verificationCodeExpires: expiresAt
      }
    });

    // Envoyer le nouveau code
    const emailResult = await emailService.sendVerificationCode(email, user.prenom, newCode);

    if (!emailResult.success) {
      return res.status(500).json({
        error: 'Erreur lors de l\'envoi de l\'email'
      });
    }

    console.log(`[🔄 Auth] Code renvoyé à: ${email}`);

    res.json({
      message: 'Nouveau code envoyé!'
    });

  } catch (error) {
    console.error('Erreur resend-code:', error);
    res.status(500).json({
      error: 'Erreur lors du renvoi du code'
    });
  }
});

// 📧 Demande de changement d'email - Envoie un code au nouvel email
app.post('/api/auth/change-email/request', authenticateToken, async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id;
    
    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({
        error: 'Adresse email invalide'
      });
    }
    
    // Vérifier que le nouvel email n'est pas déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() }
    });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Cette adresse email est déjà utilisée'
      });
    }
    
    // Générer un code de vérification
    const verificationCode = emailService.generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Sauvegarder temporairement le code et le nouvel email
    // On utilise les champs existants verificationCode et verificationCodeExpires
    // Et on ajoute le nouvel email dans un champ JSON temporaire
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: verificationCode,
        verificationCodeExpires: expiresAt,
        // Stocker le nouvel email dans resetToken temporairement (sera effacé après vérification)
        resetToken: `EMAIL_CHANGE:${newEmail.toLowerCase()}`
      }
    });
    
    // Récupérer les infos utilisateur pour l'email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { prenom: true, email: true }
    });
    
    // Envoyer le code au NOUVEL email
    const emailResult = await emailService.sendVerificationCode(
      newEmail, 
      user.prenom, 
      verificationCode,
      `📧 Changement d'adresse email PL4TO: ${verificationCode}`,
      'email_change'
    );
    
    if (!emailResult.success) {
      // Nettoyer en cas d'échec
      await prisma.user.update({
        where: { id: userId },
        data: {
          verificationCode: null,
          verificationCodeExpires: null,
          resetToken: null
        }
      });
      
      return res.status(500).json({
        error: 'Erreur lors de l\'envoi de l\'email de vérification'
      });
    }
    
    console.log(`[📧 Email Change] Code envoyé à: ${newEmail} pour user: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Code de vérification envoyé'
    });
    
  } catch (error) {
    console.error('[❌ Email Change Request Error]', error);
    res.status(500).json({
      error: 'Erreur lors de la demande de changement d\'email'
    });
  }
});

// 📧 Vérifier le code et changer l'email
app.post('/api/auth/change-email/verify', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    
    if (!code || code.length !== 6) {
      return res.status(400).json({
        error: 'Code de vérification invalide'
      });
    }
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier qu'une demande de changement est en cours
    if (!user.resetToken || !user.resetToken.startsWith('EMAIL_CHANGE:')) {
      return res.status(400).json({
        error: 'Aucune demande de changement d\'email en cours'
      });
    }
    
    // Vérifier le code
    if (user.verificationCode !== code) {
      return res.status(400).json({
        error: 'Code de vérification incorrect'
      });
    }
    
    // Vérifier l'expiration
    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return res.status(400).json({
        error: 'Code expiré, veuillez en demander un nouveau'
      });
    }
    
    // Extraire le nouvel email
    const newEmail = user.resetToken.replace('EMAIL_CHANGE:', '');
    
    // Vérifier une dernière fois que l'email n'est pas pris
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Cette adresse email est déjà utilisée'
      });
    }
    
    // Mettre à jour l'email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        verificationCode: null,
        verificationCodeExpires: null,
        resetToken: null
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        isAdmin: true,
        profilePicture: true,
        subscriptionPlan: true,
        trialActive: true,
        trialEndDate: true
      }
    });
    
    console.log(`[✅ Email Changed] ${user.email} -> ${newEmail}`);
    
    res.json({
      success: true,
      message: 'Email modifié avec succès',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.prenom,
        lastName: updatedUser.nom,
        isAdmin: updatedUser.isAdmin,
        profilePicture: updatedUser.profilePicture,
        subscriptionPlan: updatedUser.subscriptionPlan,
        trialActive: updatedUser.trialActive,
        trialEndDate: updatedUser.trialEndDate
      }
    });
    
  } catch (error) {
    console.error('[❌ Email Change Verify Error]', error);
    res.status(500).json({
      error: 'Erreur lors du changement d\'email'
    });
  }
});

// Login (Connexion) - 🛡️ Rate limit: 5/15min
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // 📧 Vérifier si l'email est confirmé
    if (!user.emailVerified && !user.googleId) {
      // Générer un nouveau code si pas de Google
      const code = emailService.generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: code,
          verificationCodeExpires: expiresAt
        }
      });
      
      await emailService.sendVerificationCode(email, user.prenom, code);
      
      return res.status(403).json({
        error: 'Vérifie ton email pour te connecter',
        requiresVerification: true,
        email: email
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }
    
    // ============================================
    // 🔄 Vérifier/créer TrialHistory pour utilisateur existant (legacy)
    // ============================================
    const normalizedEmail = email.toLowerCase().trim();
    const existingTrialHistory = await prisma.trialHistory.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (!existingTrialHistory && user.trialStartDate && user.trialEndDate) {
      // Utilisateur existant sans TrialHistory (legacy) - créer l'entrée
      try {
        await prisma.trialHistory.create({
          data: {
            email: normalizedEmail,
            trialStartDate: user.trialStartDate,
            trialEndDate: user.trialEndDate,
            userId: user.id
          }
        });
        console.log(`[📝 TrialHistory] Créé rétroactivement lors du login pour ${normalizedEmail}`);
      } catch (e) {
        // Ignorer si déjà existe (race condition)
        if (e.code !== 'P2002') console.error('Erreur création TrialHistory:', e.message);
      }
    }

    // 🔐 Vérifier si 2FA est activé
    if (user.twoFactorEnabled) {
      // Ne pas générer de token - demander le code 2FA
      return res.json({
        requires2FA: true,
        email: user.email,
        message: 'Code 2FA requis'
      });
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...userWithoutPassword } = user;

    // Générer le JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024',
      { expiresIn: '7d' }
    );

    // Mapper les champs pour le frontend
    res.json({
      message: 'Connexion réussie',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.prenom,
        lastName: user.nom,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        subscriptionPlan: user.subscriptionPlan,
        trialActive: user.trialActive,
        trialEndDate: user.trialEndDate,
        onboardingCompleted: user.onboardingCompleted,
        guideCompleted: user.guideCompleted,
        country: user.country,
        region: user.region,
        currency: user.currency,
        timezone: user.timezone
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      error: 'Erreur lors de la connexion'
    });
  }
});

// Logout (Déconnexion)
app.post('/api/auth/logout', (req, res) => {
  res.json({
    message: 'Déconnexion réussie'
  });
});

// 👤 Mise à jour du profil
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, country, region, currency, timezone } = req.body;
    const userId = req.user.id;

    // Valider les données
    if (!firstName && !lastName && !country && !region && !currency && !timezone) {
      return res.status(400).json({
        error: 'Au moins un champ est requis'
      });
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    if (firstName) updateData.prenom = firstName.trim();
    if (lastName) updateData.nom = lastName.trim();
    if (country) updateData.country = country.trim().toUpperCase();
    if (region) updateData.region = region.trim().toUpperCase();
    if (currency) updateData.currency = currency.trim().toUpperCase();
    if (timezone) updateData.timezone = timezone.trim();

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        isAdmin: true,
        profilePicture: true,
        subscriptionPlan: true,
        trialActive: true,
        trialEndDate: true,
        country: true,
        region: true,
        currency: true,
        timezone: true
      }
    });

    console.log(`[✅ Profile Updated] User: ${updatedUser.email}`);

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.prenom,
      lastName: updatedUser.nom,
      isAdmin: updatedUser.isAdmin,
      profilePicture: updatedUser.profilePicture,
      subscriptionPlan: updatedUser.subscriptionPlan,
      trialActive: updatedUser.trialActive,
      trialEndDate: updatedUser.trialEndDate,
      country: updatedUser.country,
      region: updatedUser.region,
      currency: updatedUser.currency,
      timezone: updatedUser.timezone
    });
    
  } catch (error) {
    console.error('[❌ Profile Update Error]', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil'
    });
  }
});

// 👤 Récupérer le profil
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        isAdmin: true,
        profilePicture: true,
        subscriptionPlan: true,
        trialActive: true,
        trialEndDate: true,
        country: true,
        region: true,
        currency: true,
        timezone: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.prenom,
      lastName: user.nom,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
      subscriptionPlan: user.subscriptionPlan,
      trialActive: user.trialActive,
      trialEndDate: user.trialEndDate,
      country: user.country,
      region: user.region,
      currency: user.currency,
      timezone: user.timezone
    });
    
  } catch (error) {
    console.error('[❌ Profile Fetch Error]', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil'
    });
  }
});

// 🔐 Google Sign-In
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        error: 'Token Google requis'
      });
    }

    // Vérifier le token Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub: googleId } = payload;
    
    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();

    console.log('🔐 [GOOGLE AUTH] Email:', normalizedEmail, 'Name:', given_name, family_name);

    // Chercher si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    let isNewUser = false;

    if (!user) {
      // Créer un nouvel utilisateur
      isNewUser = true;
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // ============================================
      // 🎉 TRIAL - Vérifier historique anti-abus (GOOGLE)
      // ============================================
      const now = new Date();
      let trialStartDate = null;  // NULL par défaut - trial démarre après onboarding
      let trialEndDate = null;
      let trialActive = false;    // FALSE par défaut - pas encore actif
      let subscriptionPlan = 'discovery';  // Plan gratuit en attendant le trial
      let trialWelcomeShown = false; // Par défaut, montrer le welcome
      
      // Vérifier si cet email a déjà eu un trial (anti-abus)
      const existingTrialHistory = await prisma.trialHistory.findUnique({
        where: { email: normalizedEmail }
      });
      
      if (existingTrialHistory) {
        // Cet email a déjà eu un trial - CONSERVER les dates originales
        const originalStartDate = new Date(existingTrialHistory.trialStartDate);
        const originalEndDate = new Date(existingTrialHistory.trialEndDate);
        
        trialStartDate = originalStartDate;
        trialEndDate = originalEndDate;
        
        // RÉINSCRIPTION: Ne pas remontrer le popup de bienvenue
        trialWelcomeShown = true;
        
        if (originalEndDate > now) {
          trialActive = true;
          subscriptionPlan = 'essential';
          const daysRemaining = Math.ceil((originalEndDate - now) / (1000 * 60 * 60 * 24));
          console.log(`[🔄 Trial Google] Email ${normalizedEmail} - Trial existant, ${daysRemaining} jours restants`);
        } else {
          trialActive = false;
          subscriptionPlan = 'discovery';
          console.log(`[⏰ Trial Google] Email ${normalizedEmail} - Trial déjà expiré`);
        }
      } else {
        // Nouvel email - Trial démarrera APRÈS l'onboarding (via /api/subscription/start-trial)
        console.log(`[📝 Trial Google] Nouvel email ${normalizedEmail} - Trial démarrera après onboarding`);
      }

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          prenom: given_name || '',
          nom: family_name || '',
          googleId: googleId,
          profilePicture: picture || null,
          emailVerified: true, // Google = email vérifié
          subscriptionPlan: subscriptionPlan,
          trialStartDate: trialStartDate,
          trialEndDate: trialEndDate,
          trialActive: trialActive,
          planChosen: false,
          // Réinscription: ne pas remontrer le welcome
          trialWelcomeShown: trialWelcomeShown
        }
      });
      
      // Pour les réinscriptions: Mettre à jour le userId dans l'historique
      // Pour les nouveaux emails: TrialHistory sera créé dans /api/subscription/start-trial
      if (existingTrialHistory) {
        await prisma.trialHistory.update({
          where: { email: normalizedEmail },
          data: { userId: user.id }
        });
        console.log(`[📝 TrialHistory Google] userId mis à jour pour ${normalizedEmail}`);
      }

      console.log('✅ [GOOGLE AUTH] Nouvel utilisateur créé:', user.id);

      // 🔗 ZOHO CRM - Créer le contact pour nouveau Google user
      try {
        await zohoCRM.onUserRegistered({
          email: user.email,
          prenom: user.prenom,
          nom: user.nom
        });
        console.log(`[🔗 Zoho] Contact Google créé pour: ${normalizedEmail}`);
      } catch (zohoErr) {
        console.error(`[⚠️ Zoho] Erreur création contact Google:`, zohoErr.message);
      }

      // 📧 TRIAL EMAIL - Envoyer email de bienvenue (Google)
      try {
        await sendWelcomeEmail(user.id);
        console.log(`[📧 Trial] Email bienvenue Google envoyé à: ${normalizedEmail}`);
      } catch (emailErr) {
        console.error(`[⚠️ Trial Email Google] Erreur:`, emailErr.message);
      }
    } else {
      // Mettre à jour le googleId si pas encore lié
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId: googleId,
            profilePicture: picture || user.profilePicture
          }
        });
      }
      
      // ============================================
      // 🔄 Vérifier/créer TrialHistory pour utilisateur existant
      // ============================================
      const existingTrialHistory = await prisma.trialHistory.findUnique({
        where: { email: normalizedEmail }
      });
      
      if (!existingTrialHistory && user.trialStartDate && user.trialEndDate) {
        // Utilisateur existant sans TrialHistory (legacy) - créer l'entrée
        await prisma.trialHistory.create({
          data: {
            email: normalizedEmail,
            trialStartDate: user.trialStartDate,
            trialEndDate: user.trialEndDate,
            userId: user.id
          }
        });
        console.log(`[📝 TrialHistory] Créé rétroactivement pour ${normalizedEmail}`);
      }
      
      console.log('✅ [GOOGLE AUTH] Utilisateur existant:', user.id);
    }

    // Générer le JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024',
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur sans le mot de passe - avec mapping frontend
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: isNewUser ? 'Inscription Google réussie' : 'Connexion Google réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.prenom,
        lastName: user.nom,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        subscriptionPlan: user.subscriptionPlan,
        trialActive: user.trialActive,
        trialEndDate: user.trialEndDate,
        onboardingCompleted: user.onboardingCompleted,
        guideCompleted: user.guideCompleted,
        country: user.country,
        region: user.region,
        currency: user.currency,
        timezone: user.timezone
      },
      isNewUser
    });

  } catch (error) {
    console.error('❌ [GOOGLE AUTH] Erreur:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'authentification Google'
    });
  }
});

// ============================================
// 🔑 MOT DE PASSE OUBLIÉ - Envoyer email de réinitialisation
// 🛡️ Rate limit: 3/heure
// ============================================
app.post('/api/auth/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email requis'
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Pour des raisons de sécurité, on retourne toujours succès
    // même si l'email n'existe pas (pour ne pas révéler les comptes existants)
    if (!user) {
      console.log(`[🔑 Forgot] Email non trouvé: ${email}`);
      return res.json({
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      });
    }

    // Générer un token de réinitialisation (UUID ou token aléatoire)
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpires: resetTokenExpires
      }
    });

    // Construire l'URL de réinitialisation
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Envoyer l'email
    const emailResult = await emailService.sendPasswordResetEmail(
      email,
      user.prenom || 'Utilisateur',
      resetToken,
      resetUrl
    );

    if (!emailResult.success) {
      console.error('[❌ Forgot] Erreur envoi email:', emailResult.error);
      // On ne révèle pas l'erreur à l'utilisateur
    }

    console.log(`[✅ Forgot] Email de réinitialisation envoyé à: ${email}`);

    res.json({
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
    });

  } catch (error) {
    console.error('Erreur forgot-password:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de l\'email'
    });
  }
});

// ============================================
// 🔐 RÉINITIALISER LE MOT DE PASSE
// ============================================
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Trouver l'utilisateur avec ce token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date() // Token non expiré
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Lien de réinitialisation invalide ou expiré',
        tokenExpired: true
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    console.log(`[✅ Reset] Mot de passe réinitialisé pour: ${user.email}`);

    res.json({
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur reset-password:', error);
    res.status(500).json({
      error: 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
});

// ============================================
// 🔑 CHANGER MOT DE PASSE (utilisateur connecté)
// ============================================
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    console.log(`[🔑 Change Password] Mot de passe changé pour: ${user.email}`);

    res.json({ success: true, message: 'Mot de passe changé avec succès' });

  } catch (error) {
    console.error('Erreur change-password:', error);
    res.status(500).json({ error: `Erreur serveur: ${error.message}` });
  }
});

// ============================================
// 🔐 AUTHENTIFICATION À DEUX FACTEURS (2FA)
// ============================================
// 🔐 OTPLIB - Import pour 2FA (v12)
const { authenticator } = require('otplib');
console.log('🔐 authenticator chargé:', typeof authenticator, authenticator ? '✅' : '❌');
const QRCode = require('qrcode');

// Note: otplib utilise déjà les bons defaults (6 digits, 30s, window 1)

// Générer des codes de backup
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Format: XXXX-XXXX (8 caractères)
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
                 Math.random().toString(36).substring(2, 6).toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Hasher les codes de backup
async function hashBackupCodes(codes) {
  const hashed = [];
  for (const code of codes) {
    const hash = await bcrypt.hash(code, 10);
    hashed.push(hash);
  }
  return hashed;
}

// Vérifier un code de backup
async function verifyBackupCode(code, hashedCodes) {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);
    if (isValid) {
      return { valid: true, index: i };
    }
  }
  return { valid: false, index: -1 };
}

/**
 * POST /api/auth/2fa/setup
 * Démarre la configuration 2FA - génère secret + QR code
 */
app.post('/api/auth/2fa/setup', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA déjà activé' });
    }
    
    // Générer le secret TOTP
    const secret = authenticator.generateSecret();
    
    // Créer l'URI pour le QR code
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'PL4TO',
      secret
    );
    
    // Générer le QR code en base64
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    
    // Sauvegarder temporairement le secret (non activé encore)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    });
    
    console.log(`[🔐 2FA] Setup initié pour ${user.email}`);
    
    res.json({
      success: true,
      secret: secret, // Pour saisie manuelle
      qrCode: qrCodeDataUrl
    });
    
  } catch (error) {
    console.error('[❌ 2FA Setup] Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la configuration 2FA' });
  }
});

/**
 * POST /api/auth/2fa/verify
 * Vérifie le code et active 2FA + génère codes backup
 */
app.post('/api/auth/2fa/verify', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code requis' });
    }
    
    // Récupérer l'utilisateur avec le secret
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: 'Configuration 2FA non initiée' });
    }
    
    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA déjà activé' });
    }
    
    // Vérifier le code TOTP
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });
    
    if (!isValid) {
      return res.status(400).json({ error: 'Code invalide' });
    }
    
    // Générer les codes de backup
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);
    
    // Activer 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: hashedBackupCodes
      }
    });
    
    console.log(`[✅ 2FA] Activé pour ${user.email}`);
    
    res.json({
      success: true,
      message: '2FA activé avec succès',
      backupCodes: backupCodes // Affichés UNE SEULE FOIS
    });
    
  } catch (error) {
    console.error('[❌ 2FA Verify] Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'activation 2FA' });
  }
});

/**
 * POST /api/auth/2fa/validate
 * Valide un code 2FA lors du login
 * 🛡️ Rate limit: 5/15min
 */
app.post('/api/auth/2fa/validate', twoFALimiter, async (req, res) => {
  try {
    const { email, code, isBackupCode } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA non activé pour cet utilisateur' });
    }
    
    let isValid = false;
    let backupCodeUsed = false;
    
    if (isBackupCode) {
      // Vérifier code de backup
      const result = await verifyBackupCode(code, user.twoFactorBackupCodes);
      isValid = result.valid;
      
      if (isValid) {
        // Supprimer le code utilisé
        const updatedCodes = [...user.twoFactorBackupCodes];
        updatedCodes.splice(result.index, 1);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorBackupCodes: updatedCodes }
        });
        
        backupCodeUsed = true;
        console.log(`[🔐 2FA] Code backup utilisé pour ${email}, ${updatedCodes.length} restants`);
      }
    } else {
      // Vérifier code TOTP
      isValid = authenticator.verify({
        token: code,
        secret: user.twoFactorSecret
      });
    }
    
    if (!isValid) {
      return res.status(400).json({ error: 'Code invalide' });
    }
    
    // Générer le JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024',
      { expiresIn: '7d' }
    );
    
    // Retourner l'utilisateur sans données sensibles - avec mapping frontend
    const { password: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...userSafe } = user;
    
    console.log(`[✅ 2FA] Validation réussie pour ${email}`);
    
    res.json({
      success: true,
      message: 'Authentification 2FA réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.prenom,
        lastName: user.nom,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        subscriptionPlan: user.subscriptionPlan,
        trialActive: user.trialActive,
        trialEndDate: user.trialEndDate,
        onboardingCompleted: user.onboardingCompleted,
        guideCompleted: user.guideCompleted,
        country: user.country,
        region: user.region,
        currency: user.currency,
        timezone: user.timezone
      },
      backupCodeUsed,
      backupCodesRemaining: backupCodeUsed ? user.twoFactorBackupCodes.length - 1 : undefined
    });
    
  } catch (error) {
    console.error('[❌ 2FA Validate] Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la validation 2FA' });
  }
});

/**
 * DELETE /api/auth/2fa/disable
 * Désactive 2FA (confirmation côté frontend par texte SUPPRIMER)
 */
app.delete('/api/auth/2fa/disable', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA n\'est pas activé' });
    }
    
    // Désactiver 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: []
      }
    });
    
    console.log(`[🔓 2FA] Désactivé pour ${user.email}`);
    
    res.json({
      success: true,
      message: '2FA désactivé avec succès'
    });
    
  } catch (error) {
    console.error('[❌ 2FA Disable] Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la désactivation 2FA' });
  }
});

/**
 * GET /api/auth/2fa/status
 * Vérifie le statut 2FA de l'utilisateur
 */
app.get('/api/auth/2fa/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({
      enabled: user.twoFactorEnabled,
      backupCodesRemaining: user.twoFactorBackupCodes?.length || 0
    });
    
  } catch (error) {
    console.error('[❌ 2FA Status] Erreur:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

/**
 * POST /api/auth/2fa/regenerate-backup
 * Regénère les codes de backup (requiert code 2FA valide)
 */
app.post('/api/auth/2fa/regenerate-backup', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code 2FA requis' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA non activé' });
    }
    
    // Vérifier le code TOTP
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });
    
    if (!isValid) {
      return res.status(400).json({ error: 'Code invalide' });
    }
    
    // Générer nouveaux codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);
    
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: hashedBackupCodes }
    });
    
    console.log(`[🔄 2FA] Codes backup regénérés pour ${user.email}`);
    
    res.json({
      success: true,
      backupCodes: backupCodes
    });
    
  } catch (error) {
    console.error('[❌ 2FA Regenerate] Erreur:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

// ============================================
// 🗑️ SUPPRIMER LE COMPTE UTILISATEUR
// ============================================
app.delete('/api/auth/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log(`[🗑️ DELETE ACCOUNT] Début suppression pour user ${userId} (${userEmail})`);
    
    // 1. Supprimer les données utilisateur (userData)
    try {
      await prisma.userData.delete({
        where: { userId }
      });
      console.log(`[🗑️ DELETE] userData supprimé`);
    } catch (e) {
      // Pas grave si n'existe pas
      if (e.code !== 'P2025') console.error('Erreur userData:', e.message);
    }
    
    // 2. Supprimer les segments budgétaires
    try {
      await prisma.budgetSegment.deleteMany({
        where: { userId }
      });
      console.log(`[🗑️ DELETE] budgetSegments supprimés`);
    } catch (e) {
      console.error('Erreur budgetSegments:', e.message);
    }
    
    // 3. Supprimer les modifications budgétaires
    try {
      await prisma.budgetModification.deleteMany({
        where: { userId }
      });
      console.log(`[🗑️ DELETE] budgetModifications supprimées`);
    } catch (e) {
      console.error('Erreur budgetModifications:', e.message);
    }
    
    // 4. Supprimer les sessions
    try {
      const sessions = await prisma.session.findMany({
        where: { userId },
        select: { id: true }
      });
      
      for (const session of sessions) {
        // Supprimer les planifications liées aux activités de cette session
        const comptes = await prisma.compte.findMany({
          where: { sessionId: session.id },
          select: { id: true }
        });
        
        for (const compte of comptes) {
          const activites = await prisma.activite.findMany({
            where: { compteId: compte.id },
            select: { id: true }
          });
          
          for (const activite of activites) {
            await prisma.planification.deleteMany({
              where: { activiteId: activite.id }
            });
          }
          
          await prisma.activite.deleteMany({
            where: { compteId: compte.id }
          });
        }
        
        await prisma.compte.deleteMany({
          where: { sessionId: session.id }
        });
      }
      
      await prisma.session.deleteMany({
        where: { userId }
      });
      console.log(`[🗑️ DELETE] sessions et données liées supprimées`);
    } catch (e) {
      console.error('Erreur sessions:', e.message);
    }
    
    // 5. Supprimer les demandes d'optimisation
    try {
      await prisma.optimizationRequest.deleteMany({
        where: { userId }
      });
      console.log(`[🗑️ DELETE] optimizationRequests supprimées`);
    } catch (e) {
      console.error('Erreur optimizationRequests:', e.message);
    }
    
    // 6. Délier le TrialHistory (CONSERVER l'historique anti-abus)
    try {
      await prisma.trialHistory.updateMany({
        where: { userId },
        data: { userId: null }
      });
      console.log(`[🗑️ DELETE] trialHistory délié (historique conservé pour anti-abus)`);
    } catch (e) {
      // Pas grave si n'existe pas
      if (e.code !== 'P2025') console.error('Erreur trialHistory:', e.message);
    }
    
    // 7. Annuler l'abonnement Stripe si existant
    try {
      const userWithStripe = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeSubscriptionId: true, stripeCustomerId: true, email: true }
      });
      
      if (userWithStripe?.stripeSubscriptionId) {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(userWithStripe.stripeSubscriptionId);
        console.log(`[🗑️ DELETE] Abonnement Stripe annulé: ${userWithStripe.stripeSubscriptionId}`);
      } else {
        console.log(`[🗑️ DELETE] Pas d'abonnement Stripe à annuler`);
      }
    } catch (stripeError) {
      console.error('[⚠️ DELETE] Erreur annulation Stripe (non bloquant):', stripeError.message);
      // On continue quand même la suppression du compte
    }
    
    // 8. Finalement, supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId }
    });
    
    console.log(`[✅ DELETE ACCOUNT] Compte ${userEmail} supprimé avec succès (TrialHistory conservé)`);
    console.log(`[🛡️ Anti-abus] L'email ${userEmail} ne pourra plus avoir de nouveau trial de 14 jours`);
    
    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
    
  } catch (error) {
    console.error('[❌ DELETE ACCOUNT] Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du compte',
      error: error.message
    });
  }
});

// ============================================
// ROUTES API - MULTI-BUDGET SEGMENTS
// GPS FINANCIER - Voyage dans le temps financier
// À AJOUTER dans server.js
// ============================================

// ============================================
// 1. INITIALISER LES SEGMENTS (Migration données existantes)
// POST /api/budget-segments/initialize
// ============================================
app.post('/api/budget-segments/initialize', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier si des segments existent déjà
    const existingSegments = await prisma.budgetSegment.findMany({
      where: { userId }
    });
    
    if (existingSegments.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Segments already initialized',
        segments: existingSegments 
      });
    }
    
    // Récupérer le budget existant
    const userData = await prisma.userData.findUnique({
      where: { id: userId }
    });
    
    if (!userData || !userData.budgetPlanning) {
      return res.status(400).json({ 
        success: false, 
        error: 'No existing budget to initialize from' 
      });
    }
    
    const budget = userData.budgetPlanning;
    
    // Calculer la date max des transactions existantes
    const maxDate = calculateMaxDate(budget.entrees || [], budget.sorties || []);
    
    // Créer le segment de base (index 0)
    const baseSegment = await prisma.budgetSegment.create({
      data: {
        userId,
        segmentIndex: 0,
        name: 'Budget Principal',
        startDate: new Date(),
        endDate: maxDate,
        entrees: budget.entrees || [],
        sorties: budget.sorties || [],
        isBase: true,
        copiedFrom: null
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Budget segments initialized',
      segment: baseSegment 
    });
    
  } catch (error) {
    console.error('Error initializing budget segments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 2. RÉCUPÉRER TOUS LES SEGMENTS
// GET /api/budget-segments
// ============================================
app.get('/api/budget-segments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const segments = await prisma.budgetSegment.findMany({
      where: { userId },
      orderBy: { segmentIndex: 'asc' }
    });
    
    res.json({ success: true, segments });
    
  } catch (error) {
    console.error('Error fetching budget segments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 3. RÉCUPÉRER LE SEGMENT POUR UNE DATE DONNÉE
// GET /api/budget-segments/for-date?date=2027-05-15
// ============================================
app.get('/api/budget-segments/for-date', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Date parameter required' 
      });
    }
    
    const targetDate = new Date(date);
    
    // Trouver le segment qui contient cette date
    const segment = await prisma.budgetSegment.findFirst({
      where: {
        userId,
        startDate: { lte: targetDate },
        OR: [
          { endDate: { gte: targetDate } },
          { endDate: null }
        ]
      },
      orderBy: { segmentIndex: 'desc' }
    });
    
    if (!segment) {
      // Si aucun segment ne couvre cette date, retourner le dernier segment
      const lastSegment = await prisma.budgetSegment.findFirst({
        where: { userId },
        orderBy: { segmentIndex: 'desc' }
      });
      
      return res.json({ 
        success: true, 
        segment: lastSegment,
        needsExtension: true,
        targetDate: date
      });
    }
    
    res.json({ success: true, segment });
    
  } catch (error) {
    console.error('Error fetching segment for date:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 4. CRÉER UN NOUVEAU SEGMENT (Copie intelligente)
// POST /api/budget-segments/extend
// ============================================
app.post('/api/budget-segments/extend', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    
    // Récupérer le dernier segment
    const lastSegment = await prisma.budgetSegment.findFirst({
      where: { userId },
      orderBy: { segmentIndex: 'desc' }
    });
    
    if (!lastSegment) {
      return res.status(400).json({ 
        success: false, 
        error: 'No existing segment to extend from. Initialize first.' 
      });
    }
    
    // La date de début du nouveau segment = date de fin du précédent
    const newStartDate = lastSegment.endDate || new Date();
    
    // Calculer la nouvelle date de fin (1 an plus tard par défaut)
    const newEndDate = new Date(newStartDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    
    // Créer le nouveau segment (copie intelligente)
    const newSegment = await prisma.budgetSegment.create({
      data: {
        userId,
        segmentIndex: lastSegment.segmentIndex + 1,
        name: name || `Budget ${newStartDate.getFullYear()}`,
        startDate: newStartDate,
        endDate: newEndDate,
        entrees: lastSegment.entrees, // Copie du segment précédent
        sorties: lastSegment.sorties, // Copie du segment précédent
        isBase: false,
        copiedFrom: lastSegment.segmentIndex
      }
    });
    
    // Mettre à jour la date de fin du segment précédent si elle était null
    if (!lastSegment.endDate) {
      await prisma.budgetSegment.update({
        where: { id: lastSegment.id },
        data: { endDate: newStartDate }
      });
    }
    
    res.json({ 
      success: true, 
      message: 'New budget segment created',
      segment: newSegment 
    });
    
  } catch (error) {
    console.error('Error extending budget segment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 5. MODIFIER UN SEGMENT EXISTANT
// PUT /api/budget-segments/:segmentIndex
// ============================================
app.put('/api/budget-segments/:segmentIndex', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const segmentIndex = parseInt(req.params.segmentIndex);
    const { entrees, sorties, name } = req.body;
    
    // Trouver le segment
    const segment = await prisma.budgetSegment.findUnique({
      where: {
        userId_segmentIndex: {
          userId,
          segmentIndex
        }
      }
    });
    
    if (!segment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Segment not found' 
      });
    }
    
    // Préparer les données de mise à jour
    const updateData = {};
    if (entrees !== undefined) updateData.entrees = entrees;
    if (sorties !== undefined) updateData.sorties = sorties;
    if (name !== undefined) updateData.name = name;
    
    // Si on modifie les transactions, recalculer la date de fin
    if (entrees !== undefined || sorties !== undefined) {
      const newEndDate = calculateMaxDate(
        entrees || segment.entrees,
        sorties || segment.sorties
      );
      updateData.endDate = newEndDate;
    }
    
    // Mettre à jour
    const updatedSegment = await prisma.budgetSegment.update({
      where: { id: segment.id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Budget segment updated',
      segment: updatedSegment 
    });
    
  } catch (error) {
    console.error('Error updating budget segment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 6. RÉCUPÉRER LE BUDGET COMBINÉ POUR CALCULS GPS
// GET /api/budget-segments/combined?fromDate=2025-12-16&toDate=2035-12-31
// ============================================
app.get('/api/budget-segments/combined', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate } = req.query;
    
    const startDate = fromDate ? new Date(fromDate) : new Date();
    const endDate = toDate ? new Date(toDate) : new Date(startDate.getFullYear() + 10, 11, 31);
    
    // Récupérer tous les segments qui chevauchent la période
    const segments = await prisma.budgetSegment.findMany({
      where: {
        userId,
        startDate: { lte: endDate },
        OR: [
          { endDate: { gte: startDate } },
          { endDate: null }
        ]
      },
      orderBy: { segmentIndex: 'asc' }
    });
    
    // Format pour le frontend
    const combinedBudget = {
      segments: segments.map(seg => ({
        index: seg.segmentIndex,
        name: seg.name,
        startDate: seg.startDate.toISOString().split('T')[0],
        endDate: seg.endDate ? seg.endDate.toISOString().split('T')[0] : null,
        entrees: seg.entrees,
        sorties: seg.sorties,
        isBase: seg.isBase
      })),
      // Pour compatibilité avec le système actuel
      entrees: segments.length > 0 ? segments[0].entrees : [],
      sorties: segments.length > 0 ? segments[0].sorties : []
    };
    
    res.json({ success: true, budget: combinedBudget });
    
  } catch (error) {
    console.error('Error fetching combined budget:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// FONCTION UTILITAIRE - Calculer la date max
// ============================================
function calculateMaxDate(entrees, sorties) {
  let maxDate = new Date();
  
  // Parcourir les entrées et sorties pour trouver la date max
  const allItems = [...(entrees || []), ...(sorties || [])];
  
  allItems.forEach(item => {
    // Si l'item a une date de fin explicite
    if (item.dateFin) {
      const endDate = new Date(item.dateFin);
      if (endDate > maxDate) maxDate = endDate;
    }
    // Sinon, calculer selon la fréquence (1 an par défaut pour récurrent)
    else if (item.frequence && item.frequence !== 'unique') {
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      if (oneYearLater > maxDate) maxDate = oneYearLater;
    }
  });
  
  return maxDate;
}

// ============================================
// ROUTES DE GÉNÉRATION AUTOMATIQUE DES SEGMENTS
// GPS FINANCIER - Logique DATE MAX d'Excel
// ============================================

/**
 * POST /api/budget-segments/generate
 * Génère automatiquement tous les segments budgétaires jusqu'à 2079
 * Le budget (entrees/sorties) doit être passé dans le body car stocké côté frontend
 */
app.post('/api/budget-segments/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // occurrencesPerSegment: 1 = mensuel (~1 mois), 3 = trimestriel, 6 = semestriel, 12 = annuel
    const { targetYear = 2079, batchSize, entrees, sorties, occurrencesPerSegment = 1 } = req.body;
    
    // Le budget vient du frontend (localStorage)
    const baseEntrees = entrees || [];
    const baseSorties = sorties || [];
    
    if (baseEntrees.length === 0 && baseSorties.length === 0) {
      return res.status(400).json({ 
        error: 'Votre budget est vide. Ajoutez des entrées et sorties avant de générer les segments.' 
      });
    }
    
    // 2. Supprimer les segments existants pour cet utilisateur
    await prisma.budgetSegment.deleteMany({
      where: { userId }
    });
    
    // 3. Générer les nouveaux segments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let segments;
    if (batchSize) {
      segments = generateSegmentsBatch(baseEntrees, baseSorties, today, batchSize, occurrencesPerSegment);
    } else {
      segments = generateAllSegments(baseEntrees, baseSorties, today, targetYear, occurrencesPerSegment);
    }
    
    // 4. Sauvegarder dans la base de données
    const createdSegments = [];
    
    for (const segment of segments) {
      const created = await prisma.budgetSegment.create({
        data: {
          userId,
          segmentIndex: segment.segmentIndex,
          name: `Segment ${segment.segmentIndex}`,
          startDate: new Date(segment.startDate),
          endDate: segment.endDate ? new Date(segment.endDate) : null,
          entrees: segment.entrees,
          sorties: segment.sorties,
          isBase: segment.isBase,
          copiedFrom: segment.copiedFrom
        }
      });
      createdSegments.push(created);
    }
    
    console.log(`[Budget Segments] Generated ${createdSegments.length} segments for user ${userId}`);
    
    res.json({
      success: true,
      message: `${createdSegments.length} segments générés avec succès`,
      segmentCount: createdSegments.length,
      firstSegment: createdSegments[0] ? {
        startDate: createdSegments[0].startDate,
        endDate: createdSegments[0].endDate
      } : null,
      lastSegment: createdSegments[createdSegments.length - 1] ? {
        startDate: createdSegments[createdSegments.length - 1].startDate,
        endDate: createdSegments[createdSegments.length - 1].endDate
      } : null
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error generating segments:', error);
    res.status(500).json({ error: 'Erreur lors de la génération des segments', details: error.message });
  }
});

/**
 * POST /api/budget-segments/calculate-preview
 * Prévisualise le calcul DATE MAX sans créer de segment
 * Le budget doit être passé dans le body
 */
app.post('/api/budget-segments/calculate-preview', authenticateToken, async (req, res) => {
  try {
    const { fromDate, entrees, sorties } = req.body;
    
    const baseEntrees = entrees || [];
    const baseSorties = sorties || [];
    const startDate = fromDate ? new Date(fromDate) : new Date();
    
    if (baseEntrees.length === 0 && baseSorties.length === 0) {
      return res.status(400).json({ error: 'Budget vide.' });
    }
    
    const result = calculateSegmentMaxDate(baseEntrees, baseSorties, startDate, 12);
    const previewSegments = generateSegmentsBatch(baseEntrees, baseSorties, startDate, 5);
    
    res.json({
      referenceDate: formatDateStr(startDate),
      calculatedMaxDate: result.maxDateStr,
      totalDatesCalculated: result.allDates.length,
      previewSegments: previewSegments.map(s => ({
        index: s.segmentIndex,
        startDate: s.startDate,
        endDate: s.endDate
      }))
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error calculating preview:', error);
    res.status(500).json({ error: 'Erreur lors du calcul', details: error.message });
  }
});

/**
 * GET /api/budget-segments/stats
 * Retourne des statistiques sur les segments générés
 */
app.get('/api/budget-segments/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const segments = await prisma.budgetSegment.findMany({
      where: { userId },
      orderBy: { segmentIndex: 'asc' }
    });
    
    if (segments.length === 0) {
      return res.json({
        hasSegments: false,
        count: 0,
        message: 'Aucun segment généré.'
      });
    }
    
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    
    res.json({
      hasSegments: true,
      count: segments.length,
      firstSegmentStart: firstSegment.startDate,
      lastSegmentEnd: lastSegment.endDate
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error getting stats:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

/**
 * DELETE /api/budget-segments/clear
 * Supprime tous les segments d'un utilisateur
 */
app.delete('/api/budget-segments/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const deleted = await prisma.budgetSegment.deleteMany({
      where: { userId }
    });
    
    res.json({
      success: true,
      message: `${deleted.count} segments supprimés`
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error clearing segments:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

/**
 * PUT /api/budget-segments/:segmentIndex/cascade
 * Modifie un segment ET réinitialise tous les segments suivants
 */
app.put('/api/budget-segments/:segmentIndex/cascade', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const segmentIndex = parseInt(req.params.segmentIndex);
    const { entrees, sorties } = req.body;
    
    // 1. Mettre à jour le segment modifié
    const updatedSegment = await prisma.budgetSegment.update({
      where: {
        userId_segmentIndex: { userId, segmentIndex }
      },
      data: {
        entrees: entrees,
        sorties: sorties,
        updatedAt: new Date()
      }
    });
    
    // 2. Supprimer tous les segments après celui-ci
    await prisma.budgetSegment.deleteMany({
      where: {
        userId,
        segmentIndex: { gt: segmentIndex }
      }
    });
    
    // 3. Régénérer les segments suivants
    const startDate = new Date(updatedSegment.endDate);
    startDate.setDate(startDate.getDate() + 1);
    
    const newSegments = generateAllSegments(entrees, sorties, startDate, 2079);
    
    const adjustedSegments = newSegments.map((seg, idx) => ({
      ...seg,
      segmentIndex: segmentIndex + idx + 1,
      copiedFrom: segmentIndex + idx
    }));
    
    for (const segment of adjustedSegments) {
      await prisma.budgetSegment.create({
        data: {
          userId,
          segmentIndex: segment.segmentIndex,
          name: `Segment ${segment.segmentIndex}`,
          startDate: new Date(segment.startDate),
          endDate: segment.endDate ? new Date(segment.endDate) : null,
          entrees: segment.entrees,
          sorties: segment.sorties,
          isBase: false,
          copiedFrom: segment.copiedFrom
        }
      });
    }
    
    res.json({
      success: true,
      message: `Segment ${segmentIndex} modifié et ${adjustedSegments.length} segments régénérés`
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error cascading update:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

// ============================================
// ROUTES API - BUDGET MODIFICATIONS (Modifications planifiées)
// ============================================

/**
 * GET /api/budget-modifications
 * Récupère toutes les modifications planifiées d'un utilisateur
 */
app.get('/api/budget-modifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // Optionnel: filtrer par status
    
    const where = { userId };
    if (status) where.status = status;
    
    const modifications = await prisma.budgetModification.findMany({
      where,
      orderBy: { effectiveDate: 'asc' }
    });
    
    res.json({ success: true, modifications });
    
  } catch (error) {
    console.error('[Budget Modifications] Error fetching:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

/**
 * GET /api/budget-modifications/pending-today
 * Vérifie s'il y a des modifications dont la date est aujourd'hui ou passée
 */
app.get('/api/budget-modifications/pending-today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pendingModifications = await prisma.budgetModification.findMany({
      where: {
        userId,
        status: 'pending',
        effectiveDate: { lte: today }
      },
      orderBy: { effectiveDate: 'asc' }
    });
    
    res.json({ 
      success: true, 
      hasPending: pendingModifications.length > 0,
      modifications: pendingModifications 
    });
    
  } catch (error) {
    console.error('[Budget Modifications] Error checking pending:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

/**
 * GET /api/budget-modifications/:date
 * Récupère la modification pour une date spécifique
 */
app.get('/api/budget-modifications/:date', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const effectiveDate = new Date(req.params.date);
    effectiveDate.setHours(0, 0, 0, 0);
    
    const modification = await prisma.budgetModification.findUnique({
      where: {
        userId_effectiveDate: { userId, effectiveDate }
      }
    });
    
    res.json({ success: true, modification });
    
  } catch (error) {
    console.error('[Budget Modifications] Error fetching by date:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

/**
 * POST /api/budget-modifications
 * Crée ou met à jour une modification planifiée
 */
app.post('/api/budget-modifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { effectiveDate, description, modifications } = req.body;
    
    const date = new Date(effectiveDate);
    date.setHours(0, 0, 0, 0);
    
    // Upsert: créer ou mettre à jour
    const modification = await prisma.budgetModification.upsert({
      where: {
        userId_effectiveDate: { userId, effectiveDate: date }
      },
      update: {
        description,
        modifications,
        status: 'pending'
      },
      create: {
        userId,
        effectiveDate: date,
        description,
        modifications,
        status: 'pending'
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Modification planifiée enregistrée',
      modification 
    });
    
  } catch (error) {
    console.error('[Budget Modifications] Error saving:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

/**
 * PUT /api/budget-modifications/:id/apply
 * Applique une modification au budget principal
 */
app.put('/api/budget-modifications/:id/apply', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const modificationId = req.params.id;
    
    // Marquer comme appliquée
    const modification = await prisma.budgetModification.update({
      where: { id: modificationId, userId },
      data: {
        status: 'applied',
        appliedAt: new Date()
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Modification appliquée',
      modification 
    });
    
  } catch (error) {
    console.error('[Budget Modifications] Error applying:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

/**
 * PUT /api/budget-modifications/:id/reject
 * Rejette une modification planifiée
 */
app.put('/api/budget-modifications/:id/reject', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const modificationId = req.params.id;
    
    const modification = await prisma.budgetModification.update({
      where: { id: modificationId, userId },
      data: { status: 'rejected' }
    });
    
    res.json({ 
      success: true, 
      message: 'Modification rejetée',
      modification 
    });
    
  } catch (error) {
    console.error('[Budget Modifications] Error rejecting:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

/**
 * DELETE /api/budget-modifications/:id
 * Supprime une modification planifiée
 */
app.delete('/api/budget-modifications/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const modificationId = req.params.id;
    
    await prisma.budgetModification.delete({
      where: { id: modificationId, userId }
    });
    
    res.json({ success: true, message: 'Modification supprimée' });
    
  } catch (error) {
    console.error('[Budget Modifications] Error deleting:', error);
    res.status(500).json({ error: 'Erreur', details: error.message });
  }
});

// ============================================
// ROUTES API - USER DATA (Données utilisateur)
// Sync avec frontend localStorage
// ============================================

/**
 * GET /api/user-data
 * Récupère toutes les données utilisateur
 */
app.get('/api/user-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userData = await prisma.userData.findUnique({
      where: { userId }
    });
    
    if (!userData) {
      return res.json({ 
        success: true, 
        data: null,
        message: 'Aucune donnée utilisateur trouvée'
      });
    }
    
    // Retourner dans le format attendu par le frontend
    res.json({
      success: true,
      data: {
        userInfo: userData.userInfo || {},
        accounts: userData.accounts || [],
        initialBalances: userData.initialBalances || { dateDepart: '', soldes: [] },
        financialGoals: userData.financialGoals || [],
        accountActivities: userData.accountActivities || {},
        budgetPlanning: userData.budgetPlanning || { entrees: [], sorties: [] },
        guideProgress: userData.guideProgress || null,
        engagementData: userData.engagementData || null,
        onboardingCompleted: userData.onboardingCompleted || false
      }
    });

  } catch (error) {
    console.error('[User Data] Error fetching:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/user-data
 * Crée ou met à jour toutes les données utilisateur (upsert)
 */
app.post('/api/user-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { userInfo, accounts, initialBalances, financialGoals, accountActivities, budgetPlanning, guideProgress, engagementData, onboardingCompleted } = req.body;
    
    const userData = await prisma.userData.upsert({
      where: { userId },
      update: {
        userInfo: userInfo || undefined,
        accounts: accounts || undefined,
        initialBalances: initialBalances || undefined,
        financialGoals: financialGoals || undefined,
        accountActivities: accountActivities || undefined,
        budgetPlanning: budgetPlanning || undefined,
        guideProgress: guideProgress || undefined,
        engagementData: engagementData || undefined,
        onboardingCompleted: onboardingCompleted !== undefined ? onboardingCompleted : undefined
      },
      create: {
        userId,
        userInfo: userInfo || {},
        accounts: accounts || [],
        initialBalances: initialBalances || { dateDepart: '', soldes: [] },
        financialGoals: financialGoals || [],
        accountActivities: accountActivities || {},
        budgetPlanning: budgetPlanning || { entrees: [], sorties: [] },
        guideProgress: guideProgress || null,
        engagementData: engagementData || null,
        onboardingCompleted: onboardingCompleted || false
      }
    });
    
    console.log(`[User Data] Saved for user ${userId}`);
    
    res.json({
      success: true,
      message: 'Données sauvegardées avec succès',
      data: {
        userInfo: userData.userInfo,
        accounts: userData.accounts,
        initialBalances: userData.initialBalances,
        financialGoals: userData.financialGoals,
        accountActivities: userData.accountActivities,
        budgetPlanning: userData.budgetPlanning,
        guideProgress: userData.guideProgress,
        engagementData: userData.engagementData,
        onboardingCompleted: userData.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('[User Data] Error saving:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/user-data/:section
 * Met à jour une section spécifique des données utilisateur
 * Sections: userInfo, accounts, initialBalances, financialGoals, accountActivities, budgetPlanning
 */
app.patch('/api/user-data/:section', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { section } = req.params;
    const { data } = req.body;
    
    const validSections = ['userInfo', 'accounts', 'initialBalances', 'financialGoals', 'accountActivities', 'budgetPlanning', 'guideProgress', 'engagementData', 'onboardingCompleted'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({ 
        success: false, 
        error: `Section invalide. Sections valides: ${validSections.join(', ')}` 
      });
    }
    
    // Vérifier si l'utilisateur a déjà des données
    const existingData = await prisma.userData.findUnique({
      where: { userId }
    });
    
    if (!existingData) {
      // Créer avec les données par défaut + la section
      const createData = {
        userId,
        userInfo: {},
        accounts: [],
        initialBalances: { dateDepart: '', soldes: [] },
        financialGoals: [],
        accountActivities: {},
        budgetPlanning: { entrees: [], sorties: [] },
        [section]: data
      };
      
      const userData = await prisma.userData.create({ data: createData });
      
      return res.json({
        success: true,
        message: `Section ${section} créée avec succès`,
        data: userData[section]
      });
    }
    
    // Mettre à jour la section spécifique
    const userData = await prisma.userData.update({
      where: { userId },
      data: { [section]: data }
    });
    
    console.log(`[User Data] Updated section ${section} for user ${userId}`);
    
    res.json({
      success: true,
      message: `Section ${section} mise à jour`,
      data: userData[section]
    });
    
  } catch (error) {
    console.error('[User Data] Error updating section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/user-data
 * Supprime toutes les données utilisateur
 */
app.delete('/api/user-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.userData.delete({
      where: { userId }
    });
    
    console.log(`[User Data] Deleted for user ${userId}`);
    
    res.json({
      success: true,
      message: 'Données utilisateur supprimées'
    });
    
  } catch (error) {
    // Si l'enregistrement n'existe pas, ce n'est pas une erreur
    if (error.code === 'P2025') {
      return res.json({
        success: true,
        message: 'Aucune donnée à supprimer'
      });
    }
    
    console.error('[User Data] Error deleting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 🔒 DÉCONNEXION DE TOUTES LES SESSIONS
// ============================================

/**
 * POST /api/auth/logout-all-sessions
 * Déconnecte toutes les autres sessions (incrémente tokenVersion)
 * La session actuelle reste valide jusqu'à expiration du token
 */
app.post('/api/auth/logout-all-sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Incrémenter tokenVersion pour invalider tous les tokens précédents
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 }
      },
      select: {
        id: true,
        email: true,
        tokenVersion: true
      }
    });
    
    console.log(`[🔒 Logout All] Sessions invalidées pour ${user.email} (tokenVersion: ${user.tokenVersion})`);
    
    // Générer un nouveau token avec la nouvelle version pour la session actuelle
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        tokenVersion: user.tokenVersion 
      },
      process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Toutes les autres sessions ont été déconnectées',
      newToken: newToken // Le frontend doit remplacer son token
    });
    
  } catch (error) {
    console.error('[❌ Logout All] Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion des sessions'
    });
  }
});

// ============================================
// 🔧 ADMIN: Migration TrialHistory pour comptes legacy
// ============================================

/**
 * POST /api/admin/migrate-trial-history
 * Crée des entrées TrialHistory pour tous les utilisateurs qui n'en ont pas
 * Réservé aux admins
 */
app.post('/api/admin/migrate-trial-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est admin
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, email: true }
    });
    
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux administrateurs' 
      });
    }
    
    console.log(`[🔧 Admin] Migration TrialHistory lancée par ${adminUser.email}`);
    
    // Récupérer tous les utilisateurs avec trial mais sans TrialHistory
    const usersWithTrial = await prisma.user.findMany({
      where: {
        trialStartDate: { not: null },
        trialEndDate: { not: null }
      },
      select: {
        id: true,
        email: true,
        trialStartDate: true,
        trialEndDate: true
      }
    });
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const user of usersWithTrial) {
      const normalizedEmail = user.email.toLowerCase().trim();
      
      // Vérifier si TrialHistory existe déjà
      const existingTrialHistory = await prisma.trialHistory.findUnique({
        where: { email: normalizedEmail }
      });
      
      if (!existingTrialHistory) {
        try {
          await prisma.trialHistory.create({
            data: {
              email: normalizedEmail,
              trialStartDate: user.trialStartDate,
              trialEndDate: user.trialEndDate,
              userId: user.id
            }
          });
          created++;
          console.log(`  ✅ Créé: ${normalizedEmail}`);
        } catch (e) {
          errors++;
          console.error(`  ❌ Erreur: ${normalizedEmail} - ${e.message}`);
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`[🔧 Admin] Migration terminée: ${created} créés, ${skipped} ignorés, ${errors} erreurs`);
    
    res.json({
      success: true,
      message: 'Migration terminée',
      stats: {
        total: usersWithTrial.length,
        created,
        skipped,
        errors
      }
    });
    
  } catch (error) {
    console.error('[❌ Admin Migration] Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/trial-history-stats
 * Affiche les statistiques TrialHistory
 * Réservé aux admins
 */
app.get('/api/admin/trial-history-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est admin
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });
    
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux administrateurs' 
      });
    }
    
    // Compter les utilisateurs avec trial
    const usersWithTrial = await prisma.user.count({
      where: {
        trialStartDate: { not: null },
        trialEndDate: { not: null }
      }
    });
    
    // Compter les entrées TrialHistory
    const trialHistoryCount = await prisma.trialHistory.count();
    
    // Compter les TrialHistory orphelins (userId = null)
    const orphanedTrialHistory = await prisma.trialHistory.count({
      where: { userId: null }
    });
    
    res.json({
      success: true,
      stats: {
        usersWithTrial,
        trialHistoryCount,
        orphanedTrialHistory,
        needsMigration: usersWithTrial - (trialHistoryCount - orphanedTrialHistory)
      }
    });
    
  } catch (error) {
    console.error('[❌ Admin Stats] Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// EXPORT POUR TESTS
// ============================================
module.exports = { calculateMaxDate };

// Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Pl4to Backend écoute sur http://localhost:${port}`);
  console.log(`📊 Test: http://localhost:${port}/api/health`);
  
  // 🔄 Migration: Activer le rapport hebdomadaire pour tous les utilisateurs existants
  prisma.user.updateMany({
    where: { weeklyReportEnabled: false },
    data: { weeklyReportEnabled: true }
  }).then(result => {
    if (result.count > 0) {
      console.log(`📧 Migration: ${result.count} utilisateur(s) activé(s) pour le rapport hebdomadaire`);
    }
  }).catch(err => {
    console.error('❌ Migration weeklyReport:', err.message);
  });

  // ⏰ Démarrer le CRON des emails trial
  startTrialEmailCron();
  console.log(`⏰ CRON emails trial démarré`);
  console.log(`📧 Preview emails: http://localhost:${port}/api/trial-emails/preview/welcome`);
  console.log(`📧 Preview EN: http://localhost:${port}/api/trial-emails/preview/welcome?lang=en`);
});