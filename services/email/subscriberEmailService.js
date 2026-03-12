// 📧 PL4TO - Service d'emails Subscriber (Post-abonnement)
// Gère l'envoi des emails après souscription à un plan payant
// S0: Confirmation (immédiat) | S1: Check-in (J+14) | S2: Récap 1 mois (J+30)

const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');
const prisma = require('../../prisma-client');

// Templates
const confirmationEssentialTemplate = require('./templates/subscriber/confirmationEssential');
const checkinTemplate = require('./templates/subscriber/checkin');
const oneMonthRecapTemplate = require('./templates/subscriber/oneMonthRecap');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'PL4TO <noreply@pl4to.com>';

// Chemin vers le Guide PDF
const GUIDE_PDF_PATH = path.join(__dirname, '../../assets/Guide_Bienvenue_PL4TO.pdf');

// ============================================
// CONFIGURATION DES EMAILS SUBSCRIBER
// ============================================
const SUBSCRIBER_EMAIL_CONFIG = {
  subscription_confirmation: {
    day: 0,
    template: 'subscription_confirmation',
    description: 'Confirmation abonnement + Guide PDF'
  },
  checkin: {
    day: 14,
    template: 'checkin',
    description: 'Check-in: Comment se passe ton expérience?'
  },
  one_month_recap: {
    day: 30,
    template: 'one_month_recap',
    description: 'Récap 1 mois + Teaser nouvelles fonctionnalités'
  }
};

// ============================================
// HELPERS
// ============================================

/**
 * Charge le Guide PDF en base64 pour l'envoyer en pièce jointe
 */
function loadGuidePDF() {
  try {
    if (!fs.existsSync(GUIDE_PDF_PATH)) {
      console.error(`[❌ Subscriber] Guide PDF introuvable: ${GUIDE_PDF_PATH}`);
      return null;
    }
    
    const pdfBuffer = fs.readFileSync(GUIDE_PDF_PATH);
    const pdfBase64 = pdfBuffer.toString('base64');
    
    return {
      filename: 'Guide_Bienvenue_PL4TO.pdf',
      content: pdfBase64
    };
  } catch (error) {
    console.error(`[❌ Subscriber] Erreur lecture Guide PDF:`, error.message);
    return null;
  }
}

/**
 * Calcule le nombre de jours depuis l'abonnement
 */
function getDaysSinceSubscription(planChosenDate) {
  const now = new Date();
  const start = new Date(planChosenDate);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

/**
 * Vérifie si l'heure actuelle correspond à l'heure de création du compte
 * (avec tolérance = même heure UTC)
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
 * Génère le HTML d'un email subscriber
 */
function generateSubscriberEmailHTML(emailType, user) {
  const language = user.language || 'fr';
  const prenom = user.prenom || 'Utilisateur';
  
  switch (emailType) {
    case 'subscription_confirmation': {
      const template = confirmationEssentialTemplate[language] || confirmationEssentialTemplate.fr;
      return {
        subject: template.subject,
        html: template.generate(prenom, user.id || 'preview')
      };
    }
    
    case 'checkin': {
      const template = checkinTemplate[language] || checkinTemplate.fr;
      return {
        subject: template.subject,
        html: template.generate(prenom, user.id || 'preview')
      };
    }
    
    case 'one_month_recap': {
      const template = oneMonthRecapTemplate[language] || oneMonthRecapTemplate.fr;
      return {
        subject: template.subject,
        html: template.generate(prenom, user.id || 'preview')
      };
    }
    
    default:
      throw new Error(`Template subscriber inconnu: ${emailType}`);
  }
}

// ============================================
// ENVOI D'EMAILS
// ============================================

/**
 * Envoie un email subscriber à un utilisateur
 */
async function sendSubscriberEmail(user, emailType) {
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
      console.log(`[📧 Subscriber] Email "${emailType}" déjà envoyé à ${user.email}`);
      return { success: false, reason: 'already_sent' };
    }
    
    // 2. Générer le contenu
    const { subject, html } = generateSubscriberEmailHTML(emailType, user);
    
    // 3. Préparer les options d'envoi
    const emailOptions = {
      from: FROM_EMAIL,
      to: [user.email],
      subject: subject,
      html: html,
      text: `PL4TO - ${subject}`
    };
    
    // Ajouter le PDF en pièce jointe pour la confirmation uniquement
    if (emailType === 'subscription_confirmation') {
      const guidePDF = loadGuidePDF();
      if (guidePDF) {
        emailOptions.attachments = [guidePDF];
        console.log(`[📧 Subscriber] Guide PDF attaché pour ${user.email}`);
      } else {
        console.warn(`[⚠️ Subscriber] Guide PDF non disponible, envoi sans pièce jointe`);
      }
    }
    
    // 4. Envoyer via Resend
    const { data, error } = await resend.emails.send(emailOptions);
    
    if (error) {
      console.error(`[❌ Subscriber] Erreur Resend pour "${emailType}" à ${user.email}:`, error);
      return { success: false, error };
    }
    
    // 5. Enregistrer dans la base de données
    await prisma.trialEmailSent.create({
      data: {
        userId: user.id,
        emailType: emailType,
        resendId: data.id
      }
    });
    
    console.log(`[✅ Subscriber] "${emailType}" envoyé à ${user.email} (Resend ID: ${data.id})`);
    return { success: true, id: data.id };
    
  } catch (error) {
    console.error(`[❌ Subscriber] Erreur envoi "${emailType}" à ${user.email}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie l'email de confirmation d'abonnement (S0)
 */
async function sendSubscriptionConfirmation(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        prenom: true,
        language: true,
        subscriptionPlan: true,
        planChosen: true,
        emailOptOut: true
      }
    });
    
    if (!user) {
      return { success: false, reason: 'user_not_found' };
    }
    
    if (user.emailOptOut) {
      return { success: false, reason: 'opted_out' };
    }
    
    return await sendSubscriberEmail(user, 'subscription_confirmation');
  } catch (error) {
    console.error(`[❌ Subscriber] Erreur sendSubscriptionConfirmation:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Appelé quand un utilisateur souscrit à un plan payant
 */
async function handleNewSubscription(userId, plan = 'essential') {
  try {
    console.log(`[📧 Subscriber] Traitement nouvel abonnement: user=${userId}, plan=${plan}`);
    
    // 1. Mettre à jour l'utilisateur en base
    await prisma.user.update({
      where: { id: userId },
      data: {
        planChosen: true,
        subscriptionStartDate: new Date(),
        subscriptionPlan: plan,
        trialActive: false
      }
    });
    
    console.log(`[✅ Subscriber] Utilisateur ${userId} mis à jour: plan=${plan}, planChosen=true`);
    
    // 2. Envoyer l'email de confirmation avec le Guide PDF
    const emailResult = await sendSubscriptionConfirmation(userId);
    
    return { success: true, emailResult };
    
  } catch (error) {
    console.error(`[❌ Subscriber] Erreur handleNewSubscription:`, error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CRON: Traitement par lot des emails subscriber
// ============================================

/**
 * Traite tous les abonnés et envoie les emails appropriés (S1, S2)
 * Appelé par le CRON job toutes les heures
 */
async function processSubscriberEmails() {
  try {
    console.log(`[📧 CRON Subscriber] Début du traitement - ${new Date().toISOString()}`);
    
    // Récupérer tous les utilisateurs avec un plan payant
    const users = await prisma.user.findMany({
      where: {
        planChosen: true,
        subscriptionStartDate: { not: null },
        subscriptionPlan: { not: 'discovery' },
        emailOptOut: { not: true }
      },
      select: {
        id: true,
        email: true,
        prenom: true,
        language: true,
        createdAt: true,
        subscriptionStartDate: true,
        subscriptionPlan: true,
        trialEmailsSent: {
          select: { emailType: true, sentAt: true }
        }
      }
    });
    
    console.log(`[📧 CRON Subscriber] ${users.length} abonnés trouvés`);
    
    let sent = 0;
    let skipped = 0;
    
    for (const user of users) {
      // Vérifier si c'est la bonne heure
      if (!isCorrectHour(user.createdAt)) {
        continue;
      }
      
      // Calculer les jours depuis l'abonnement
      const daysSinceSubscription = getDaysSinceSubscription(user.subscriptionStartDate);
      
      // Types d'emails déjà envoyés
      const sentTypes = new Set(user.trialEmailsSent.map(e => e.emailType));
      
      // 🔒 PROTECTION: Vérifier si un email subscriber a été envoyé dans les dernières 20h
      const subscriberEmails = user.trialEmailsSent.filter(e => 
        Object.keys(SUBSCRIBER_EMAIL_CONFIG).includes(e.emailType)
      );
      
      if (subscriberEmails.length > 0) {
        const lastSent = subscriberEmails.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];
        const hoursSinceLast = (Date.now() - new Date(lastSent.sentAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLast < 20) {
          continue;
        }
      }
      
      // Déterminer quel email envoyer (S1 et S2 uniquement, S0 est envoyé par le webhook)
      for (const [emailType, config] of Object.entries(SUBSCRIBER_EMAIL_CONFIG)) {
        // Skip S0 (envoyé directement par le webhook)
        if (emailType === 'subscription_confirmation') continue;
        
        // Skip si déjà envoyé
        if (sentTypes.has(emailType)) continue;
        
        // Vérifier si c'est le bon jour (avec fenêtre de tolérance de 2 jours)
        if (daysSinceSubscription >= config.day && daysSinceSubscription <= config.day + 2) {
          try {
            const result = await sendSubscriberEmail(user, emailType);
            if (result.success) {
              sent++;
            } else {
              skipped++;
            }
          } catch (err) {
            console.error(`[❌ CRON Subscriber] Erreur pour ${user.email} (${emailType}):`, err.message);
          }
          // Un seul email par utilisateur par cycle
          break;
        }
      }
    }
    
    console.log(`[📧 CRON Subscriber] Terminé: ${sent} envoyés, ${skipped} ignorés`);
    return { sent, skipped, total: users.length };
    
  } catch (error) {
    console.error(`[❌ CRON Subscriber] Erreur processSubscriberEmails:`, error);
    return { error: error.message };
  }
}

// ============================================
// FONCTIONS DE TEST & PREVIEW
// ============================================

/**
 * Prévisualise un email subscriber
 */
function previewSubscriberEmail(emailType, language = 'fr') {
  const mockUser = {
    id: 'preview',
    prenom: 'TestUser',
    email: 'test@example.com',
    language: language
  };
  
  return generateSubscriberEmailHTML(emailType, mockUser);
}

// Alias pour rétrocompatibilité
function previewConfirmationEmail(language = 'fr') {
  return previewSubscriberEmail('subscription_confirmation', language);
}

/**
 * Envoie un email de test subscriber
 */
async function sendTestSubscriberEmail(emailType, toEmail, language = 'fr') {
  try {
    const mockUser = {
      id: 'test',
      prenom: 'TestUser',
      email: toEmail,
      language: language
    };
    
    const { subject, html } = generateSubscriberEmailHTML(emailType, mockUser);
    
    const emailOptions = {
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `[TEST] ${subject}`,
      html: html,
      text: `[TEST] PL4TO - ${subject}`
    };
    
    // Ajouter le PDF pour le test de confirmation
    if (emailType === 'subscription_confirmation') {
      const guidePDF = loadGuidePDF();
      if (guidePDF) {
        emailOptions.attachments = [guidePDF];
      }
    }
    
    const { data, error } = await resend.emails.send(emailOptions);
    
    if (error) {
      console.error(`[❌ Test Subscriber] Erreur:`, error);
      return { success: false, error };
    }
    
    console.log(`[✅ Test Subscriber] "${emailType}" envoyé à ${toEmail} (ID: ${data.id})`);
    return { success: true, id: data.id };
    
  } catch (error) {
    console.error(`[❌ Test Subscriber] Erreur:`, error);
    return { success: false, error: error.message };
  }
}

// Alias pour rétrocompatibilité
function sendTestConfirmationEmail(toEmail, language = 'fr') {
  return sendTestSubscriberEmail('subscription_confirmation', toEmail, language);
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  // Production
  sendSubscriberEmail,
  sendSubscriptionConfirmation,
  handleNewSubscription,
  processSubscriberEmails,
  
  // Test & Preview
  previewSubscriberEmail,
  previewConfirmationEmail,
  sendTestSubscriberEmail,
  sendTestConfirmationEmail,
  
  // Config
  SUBSCRIBER_EMAIL_CONFIG,
  
  // Helpers
  loadGuidePDF,
  getDaysSinceSubscription,
  generateSubscriberEmailHTML
};
