// 📧 PL4TO - Service d'emails Trial
// Gère l'envoi des emails de la séquence trial (14 jours)
// Respecte l'heure de création du compte utilisateur

const { Resend } = require('resend');
const prisma = require('../../prisma-client');

// Templates
const welcomeTemplate = require('./templates/welcome');
const firstStepsTemplate = require('./templates/firstSteps');
const gpsDiscoveryTemplate = require('./templates/gpsDiscovery');
const featureDiscoveryTemplate = require('./templates/featureDiscovery');
const reminder7DaysTemplate = require('./templates/reminder7Days');
const conversion1ScenarioTemplate = require('./templates/conversion1Scenario');
const conversion2CalculatorTemplate = require('./templates/conversion2Calculator');
const lastDayTemplate = require('./templates/lastDay');
const trialEndedTemplate = require('./templates/trialEnded');
const reactivationTemplate = require('./templates/reactivation');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'PL4TO <noreply@pl4to.com>';

// ============================================
// CONFIGURATION DES EMAILS TRIAL
// ============================================
const TRIAL_EMAIL_CONFIG = {
  welcome: {
    day: 0,          // Jour 0 (inscription)
    template: 'welcome',
    delayHours: 0    // Envoi immédiat (même heure que création)
  },
  first_steps: {
    day: 2,
    template: 'first_steps',
    delayHours: 0
  },
  gps_discovery: {
    day: 4,
    template: 'gps_discovery',
    delayHours: 0
  },
  feature_discovery: {
    day: 6,
    template: 'feature_discovery',
    delayHours: 0
  },
  reminder_7days: {
    day: 7,
    template: 'reminder_7days',
    delayHours: 0
  },
  conversion1_scenario: {
    day: 9,
    template: 'conversion1_scenario',
    delayHours: 0
  },
  conversion2_calculator: {
    day: 11,
    template: 'conversion2_calculator',
    delayHours: 0
  },
  last_day: {
    day: 13,
    template: 'last_day',
    delayHours: 0
  },
  trial_ended: {
    day: 14,
    template: 'trial_ended',
    delayHours: 0
  },
  reactivation: {
    day: 17,
    template: 'reactivation',
    delayHours: 0
  }
};

// ============================================
// HELPERS
// ============================================

/**
 * Formate une date en string lisible selon la langue
 */
function formatDate(date, language = 'fr') {
  const d = new Date(date);
  if (language === 'en') {
    return d.toLocaleDateString('en-CA', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  }
  return d.toLocaleDateString('fr-CA', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
}

/**
 * Calcule le nombre de jours restants dans le trial
 */
function getDaysRemaining(trialEndDate) {
  const now = new Date();
  const end = new Date(trialEndDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Calcule le jour du trial (0 = jour d'inscription)
 */
function getTrialDay(trialStartDate) {
  const now = new Date();
  const start = new Date(trialStartDate);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

/**
 * Vérifie si l'heure actuelle correspond à l'heure de création du compte
 * (avec une tolérance de ±30 minutes)
 */
function isCorrectHour(userCreatedAt) {
  const now = new Date();
  const createdHour = new Date(userCreatedAt).getUTCHours();
  const currentHour = now.getUTCHours();
  return createdHour === currentHour;
}

// ============================================
// GÉNÉRATION DU HTML
// ============================================

/**
 * Génère le HTML d'un email trial
 */
function generateEmailHTML(emailType, user) {
  const language = user.language || 'fr';
  const prenom = user.prenom || 'Utilisateur';
  const trialEndDate = formatDate(user.trialEndDate, language);
  const daysRemaining = getDaysRemaining(user.trialEndDate);
  
  switch (emailType) {
    case 'welcome':
      const template = welcomeTemplate[language] || welcomeTemplate.fr;
      return {
        subject: template.subject,
        html: template.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'first_steps':
      const fsTemplate = firstStepsTemplate[language] || firstStepsTemplate.fr;
      return {
        subject: fsTemplate.subject,
        html: fsTemplate.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'gps_discovery':
      const gdTemplate = gpsDiscoveryTemplate[language] || gpsDiscoveryTemplate.fr;
      return {
        subject: gdTemplate.subject,
        html: gdTemplate.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'feature_discovery':
      const fdTemplate = featureDiscoveryTemplate[language] || featureDiscoveryTemplate.fr;
      return {
        subject: fdTemplate.subject,
        html: fdTemplate.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'reminder_7days':
      const r7Template = reminder7DaysTemplate[language] || reminder7DaysTemplate.fr;
      return {
        subject: r7Template.subject,
        html: r7Template.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'conversion1_scenario':
      const c1Template = conversion1ScenarioTemplate[language] || conversion1ScenarioTemplate.fr;
      return {
        subject: c1Template.subject,
        html: c1Template.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'conversion2_calculator':
      const c2Template = conversion2CalculatorTemplate[language] || conversion2CalculatorTemplate.fr;
      return {
        subject: c2Template.subject,
        html: c2Template.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'last_day':
      const ldTemplate = lastDayTemplate[language] || lastDayTemplate.fr;
      return {
        subject: ldTemplate.subject,
        html: ldTemplate.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'trial_ended':
      const teTemplate = trialEndedTemplate[language] || trialEndedTemplate.fr;
      return {
        subject: teTemplate.subject,
        html: teTemplate.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    case 'reactivation':
      const rTemplate = reactivationTemplate[language] || reactivationTemplate.fr;
      return {
        subject: rTemplate.subject,
        html: rTemplate.generate(prenom, trialEndDate, daysRemaining, user.id || 'preview')
      };
    
    default:
      throw new Error(`Template email inconnu: ${emailType}`);
  }
}

// ============================================
// ENVOI D'EMAILS
// ============================================

/**
 * Envoie un email trial à un utilisateur
 * @param {Object} user - Utilisateur Prisma
 * @param {string} emailType - Type d'email (welcome, first_steps, etc.)
 * @returns {Object} { success, id, error }
 */
async function sendTrialEmail(user, emailType) {
  try {
    // 1. Vérifier si cet email a déjà été envoyé
    const alreadySent = await prisma.trialEmailSent.findUnique({
      where: {
        userId_emailType: {
          userId: user.id,
          emailType: emailType
        }
      }
    });
    
    if (alreadySent) {
      console.log(`[📧 Trial] Email "${emailType}" déjà envoyé à ${user.email} le ${alreadySent.sentAt.toISOString()}`);
      return { success: false, reason: 'already_sent' };
    }
    
    // 2. Générer le contenu
    const { subject, html } = generateEmailHTML(emailType, user);
    
    // 3. Envoyer via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user.email],
      subject: subject,
      html: html,
      text: `PL4TO - ${subject}` // Version texte simplifiée
    });
    
    if (error) {
      console.error(`[❌ Trial Email] Erreur Resend pour "${emailType}" à ${user.email}:`, error);
      return { success: false, error };
    }
    
    // 4. Enregistrer dans la base de données
    await prisma.trialEmailSent.create({
      data: {
        userId: user.id,
        emailType: emailType,
        resendId: data.id
      }
    });
    
    console.log(`[✅ Trial Email] "${emailType}" envoyé à ${user.email} (Resend ID: ${data.id})`);
    return { success: true, id: data.id };
    
  } catch (error) {
    console.error(`[❌ Trial Email] Erreur envoi "${emailType}" à ${user.email}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie l'email de bienvenue immédiatement (appelé lors de l'inscription)
 */
async function sendWelcomeEmail(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        prenom: true,
        language: true,
        trialStartDate: true,
        trialEndDate: true,
        trialActive: true
      }
    });
    
    if (!user || !user.trialActive) {
      console.log(`[📧 Trial] Pas de trial actif pour user ${userId}`);
      return { success: false, reason: 'no_active_trial' };
    }
    
    return await sendTrialEmail(user, 'welcome');
  } catch (error) {
    console.error(`[❌ Trial] Erreur sendWelcomeEmail:`, error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CRON: Traitement par lot
// ============================================

/**
 * Traite tous les utilisateurs en trial et envoie les emails appropriés
 * Appelé par le CRON job toutes les heures
 */
async function processTrialEmails() {
  try {
    console.log(`[📧 CRON] Début du traitement des emails trial - ${new Date().toISOString()}`);
    
    // Récupérer tous les utilisateurs en trial (actif ou récemment terminé)
    const users = await prisma.user.findMany({
      where: {
        trialStartDate: { not: null },
        trialEndDate: { not: null },
        // Inclure les trials terminés depuis max 20 jours (pour reactivation)
        trialEndDate: {
          gte: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        email: true,
        prenom: true,
        language: true,
        createdAt: true,
        trialStartDate: true,
        trialEndDate: true,
        trialActive: true,
        planChosen: true,
        subscriptionPlan: true,
        emailOptOut: true,
        trialEmailsSent: {
          select: { emailType: true }
        }
      }
    });
    
    console.log(`[📧 CRON] ${users.length} utilisateurs en trial trouvés`);
    
    let sent = 0;
    let skipped = 0;
    
    for (const user of users) {
      // Ne pas envoyer si l'utilisateur a déjà un plan payant
      if (user.planChosen && user.subscriptionPlan !== 'discovery') {
        continue;
      }
      
      // Ne pas envoyer si l'utilisateur a désactivé les emails
      if (user.emailOptOut) {
        continue;
      }
      
      // Vérifier si c'est la bonne heure (heure de création du compte)
      if (!isCorrectHour(user.createdAt)) {
        continue;
      }
      
      // Calculer le jour du trial
      const trialDay = getTrialDay(user.trialStartDate);
      
      // Types d'emails déjà envoyés avec leurs dates
      const sentTypes = new Set(user.trialEmailsSent.map(e => e.emailType));
      
      // 🔒 PROTECTION: Vérifier si un email a été envoyé dans les dernières 20 heures
      // Cela évite d'envoyer 2 emails le même jour si le CRON tourne plusieurs fois
      const lastEmailSent = await prisma.trialEmailSent.findFirst({
        where: { userId: user.id },
        orderBy: { sentAt: 'desc' }
      });
      
      if (lastEmailSent) {
        const hoursSinceLastEmail = (Date.now() - lastEmailSent.sentAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastEmail < 20) {
          // Un email a été envoyé il y a moins de 20h, on skip
          continue;
        }
      }
      
      // 🛡️ PROTECTION: Ignorer les comptes créés avant le déploiement du système d'emails
      // Seuls les comptes créés après cette date recevront la séquence
      const EMAIL_SYSTEM_DEPLOY_DATE = new Date('2025-02-05T00:00:00Z');
      if (new Date(user.trialStartDate) < EMAIL_SYSTEM_DEPLOY_DATE) {
        console.log(`[📧 CRON] Skip ${user.email} - compte créé avant le déploiement du système d'emails`);
        skipped++;
        continue;
      }
      
      // Déterminer quel email envoyer
      for (const [emailType, config] of Object.entries(TRIAL_EMAIL_CONFIG)) {
        // Skip si déjà envoyé
        if (sentTypes.has(emailType)) continue;
        
        // Skip l'email welcome (envoyé directement à l'inscription)
        if (emailType === 'welcome') continue;
        
        // Vérifier si c'est le bon jour (avec fenêtre de tolérance de 2 jours)
        // Empêche l'envoi en "rattrapage" pour les vieux comptes
        if (trialDay >= config.day && trialDay <= config.day + 2) {
          try {
            const result = await sendTrialEmail(user, emailType);
            if (result.success) {
              sent++;
            } else {
              skipped++;
            }
          } catch (err) {
            console.error(`[❌ CRON] Erreur pour ${user.email} (${emailType}):`, err.message);
          }
          // Envoyer un seul email par utilisateur par cycle CRON
          break;
        }
      }
    }
    
    console.log(`[📧 CRON] Terminé: ${sent} envoyés, ${skipped} ignorés`);
    return { sent, skipped, total: users.length };
    
  } catch (error) {
    console.error(`[❌ CRON] Erreur processTrialEmails:`, error);
    return { error: error.message };
  }
}

// ============================================
// FONCTIONS DE TEST
// ============================================

/**
 * Prévisualise un email (retourne le HTML sans envoyer)
 */
function previewEmail(emailType, language = 'fr') {
  const mockUser = {
    prenom: 'TestUser',
    email: 'test@example.com',
    language: language,
    trialStartDate: new Date(),
    trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    trialActive: true
  };
  
  return generateEmailHTML(emailType, mockUser);
}

/**
 * Envoie un email de test à une adresse spécifique
 * (ignore la vérification de doublon)
 */
async function sendTestEmail(emailType, toEmail, language = 'fr') {
  try {
    const mockUser = {
      prenom: 'TestUser',
      email: toEmail,
      language: language,
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      trialActive: true
    };
    
    const { subject, html } = generateEmailHTML(emailType, mockUser);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `[TEST] ${subject}`,
      html: html,
      text: `[TEST] PL4TO - ${subject}`
    });
    
    if (error) {
      console.error(`[❌ Test Email] Erreur:`, error);
      return { success: false, error };
    }
    
    console.log(`[✅ Test Email] "${emailType}" envoyé à ${toEmail} (ID: ${data.id})`);
    return { success: true, id: data.id };
    
  } catch (error) {
    console.error(`[❌ Test Email] Erreur:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie tous les emails de la séquence à une adresse de test
 */
async function sendAllTestEmails(toEmail, language = 'fr') {
  const results = {};
  const emailTypes = Object.keys(TRIAL_EMAIL_CONFIG);
  
  for (let i = 0; i < emailTypes.length; i++) {
    const emailType = emailTypes[i];
    
    try {
      // Délai de 2 secondes entre chaque envoi (rate limit Resend)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      results[emailType] = await sendTestEmail(emailType, toEmail, language);
    } catch (err) {
      results[emailType] = { success: false, error: err.message };
    }
  }
  
  return results;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  // Envoi production
  sendTrialEmail,
  sendWelcomeEmail,
  processTrialEmails,
  
  // Test & Preview
  previewEmail,
  sendTestEmail,
  sendAllTestEmails,
  
  // Config (pour référence)
  TRIAL_EMAIL_CONFIG,
  
  // Helpers (exportés pour tests)
  generateEmailHTML,
  getDaysRemaining,
  getTrialDay,
  isCorrectHour,
  formatDate
};
