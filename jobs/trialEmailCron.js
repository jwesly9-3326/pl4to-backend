// ⏰ PL4TO - CRON Job pour les emails trial
// Exécute toutes les heures pour vérifier quels emails envoyer

const { processTrialEmails } = require('../services/email/trialEmailService');
const { processSubscriberEmails } = require('../services/email/subscriberEmailService');
const { sendCalendarEventEmails, sendAdminPreviewEmails, sendWeeklyReportEmails } = require('../services/email/communicationEmailService');
const { processEconomicData } = require('../services/economic/economicDataService');
const { processDailySummaries } = require('../services/dailySummary.service');

// Track: ne pas envoyer les emails calendrier plus d'une fois par jour
let lastCalendarSendDate = null;
// Track: ne pas envoyer les rapports hebdo plus d'une fois par semaine
let lastWeeklyReportDate = null;

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

      // 📊 Vérifier si c'est le moment d'envoyer les rapports hebdo
      await processWeeklyReports();

      // 📈 Mise à jour des indicateurs économiques (toutes les 6h)
      await processEconomicIndicators();

      // 📱 Résumés quotidiens push (filtre par heure préférée de l'utilisateur)
      await processDailySummariesSafe();
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

      // 📊 Vérifier si c'est le moment d'envoyer les rapports hebdo
      await processWeeklyReports();

      // 📈 Mise à jour des indicateurs économiques (toutes les 6h)
      await processEconomicIndicators();

      // 📱 Résumés quotidiens push (filtre par heure préférée de l'utilisateur)
      await processDailySummariesSafe();
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
 * Vérifie et envoie les rapports hebdomadaires (1 fois par semaine, le lundi entre 8h-9h ET)
 */
async function processWeeklyReports() {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // "2026-03-10"

  // Déjà envoyé aujourd'hui? Skip
  if (lastWeeklyReportDate === today) return;

  // Envoyer le lundi (1 = Monday) entre 8h et 13h (heure ET / UTC-5)
  // Le serveur tourne en UTC, donc 8h ET = 13h UTC, 13h ET = 18h UTC
  const dayOfWeek = now.getUTCDay(); // 0=dim, 1=lun, ...
  const hourUTC = now.getUTCHours();

  if (dayOfWeek !== 1) return; // Seulement le lundi
  if (hourUTC < 13 || hourUTC >= 18) return; // 8h-13h ET = 13h-18h UTC

  try {
    console.log(`[⏰ CRON] 📊 Envoi des rapports hebdomadaires...`);
    const result = await sendWeeklyReportEmails();
    console.log(`[⏰ CRON] 📊 Rapports hebdo: ${result.sent} envoyés, ${result.errors} erreurs`);
    lastWeeklyReportDate = today;
  } catch (error) {
    console.error(`[❌ CRON] Erreur rapports hebdo:`, error.message);
  }
}

/**
 * Mise à jour des indicateurs économiques (Banque du Canada + StatCan)
 * Le service gère lui-même l'intervalle de 6h (skip si < 6h)
 */
async function processEconomicIndicators() {
  try {
    const result = await processEconomicData();
    if (result.skipped) {
      // Silencieux si skip (pas de spam logs)
    } else if (result.error) {
      console.error(`[❌ CRON] 📈 Erreur indicateurs éco:`, result.error);
    } else {
      console.log(`[⏰ CRON] 📈 Indicateurs éco: ${result.updated} mis à jour, ${result.alertsGenerated} alertes`);
    }
  } catch (error) {
    console.error(`[❌ CRON] Erreur indicateurs économiques:`, error.message);
  }
}

/**
 * Envoie les résumés quotidiens push (wrapper safe)
 */
async function processDailySummariesSafe() {
  try {
    const result = await processDailySummaries();
    if (result.sent > 0) {
      console.log(`[⏰ CRON] 📱 Daily push: ${result.sent} envoyés sur ${result.total} utilisateurs`);
    }
  } catch (error) {
    console.error(`[❌ CRON] Erreur résumés quotidiens:`, error.message);
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
