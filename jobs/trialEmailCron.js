// ⏰ PL4TO - CRON Job pour les emails trial
// Exécute toutes les heures pour vérifier quels emails envoyer

const { processTrialEmails } = require('../services/email/trialEmailService');
const { processSubscriberEmails } = require('../services/email/subscriberEmailService');
const { sendCalendarEventEmails, sendAdminPreviewEmails } = require('../services/email/communicationEmailService');

// Track: ne pas envoyer les emails calendrier plus d'une fois par jour
let lastCalendarSendDate = null;

let cronInterval = null;

/**
 * Démarre le CRON job des emails trial
 * Vérifie toutes les heures quels utilisateurs doivent recevoir un email
 */
function startTrialEmailCron() {
  // Exécuter toutes les heures (3600000 ms)
  const INTERVAL_MS = 60 * 60 * 1000; // 1 heure
  
  console.log(`[⏰ CRON] Démarrage du CRON emails trial (intervalle: 1 heure)`);
  
  // Première exécution après 5 minutes (laisser le serveur démarrer)
  setTimeout(async () => {
    console.log(`[⏰ CRON] Première exécution...`);
    try {
      const trialResult = await processTrialEmails();
      console.log(`[⏰ CRON] Trial:`, trialResult);
      
      const subResult = await processSubscriberEmails();
      console.log(`[⏰ CRON] Subscriber:`, subResult);
      
      // 📅 Vérifier si un événement calendrier correspond à aujourd'hui
      await processCalendarEmails();
    } catch (error) {
      console.error(`[❌ CRON] Erreur première exécution:`, error);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  // Ensuite toutes les heures
  cronInterval = setInterval(async () => {
    console.log(`[⏰ CRON] Exécution programmée - ${new Date().toISOString()}`);
    try {
      const trialResult = await processTrialEmails();
      console.log(`[⏰ CRON] Trial:`, trialResult);
      
      const subResult = await processSubscriberEmails();
      console.log(`[⏰ CRON] Subscriber:`, subResult);
      
      // 📅 Vérifier si un événement calendrier correspond à aujourd'hui
      await processCalendarEmails();
    } catch (error) {
      console.error(`[❌ CRON] Erreur:`, error);
    }
  }, INTERVAL_MS);
}

/**
 * Vérifie et envoie les emails calendrier (max 1 fois par jour)
 */
async function processCalendarEmails() {
  const today = new Date().toISOString().split('T')[0]; // "2026-02-14"
  
  // Déjà envoyé aujourd'hui? Skip
  if (lastCalendarSendDate === today) return;
  
  try {
    // 1. Envoyer les emails calendrier aux utilisateurs (si événement aujourd'hui)
    const result = await sendCalendarEventEmails();
    
    if (result.sent > 0) {
      console.log(`[⏰ CRON] 📅 Calendrier: ${result.sent} emails envoyés pour ${result.event}`);
    } else {
      console.log(`[⏰ CRON] 📅 Calendrier: aucun événement aujourd'hui`);
    }
    
    // 2. Vérifier les aperçus admin (événements dans 30j ou 7j)
    const adminResult = await sendAdminPreviewEmails();
    if (adminResult.sent > 0) {
      console.log(`[⏰ CRON] 📧 Admin: ${adminResult.sent} aperçu(s) envoyé(s)`);
    }
    
    lastCalendarSendDate = today;
  } catch (error) {
    console.error(`[❌ CRON] Erreur calendrier:`, error.message);
  }
}

/**
 * Arrête le CRON job
 */
function stopTrialEmailCron() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log(`[⏰ CRON] CRON emails trial arrêté`);
  }
}

module.exports = { startTrialEmailCron, stopTrialEmailCron };
