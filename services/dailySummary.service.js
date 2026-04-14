// 📱 PL4TO - Daily Summary Service
// Calcule le résumé financier du jour pour chaque utilisateur
// Utilisé par: CRON push notifications + route GET /api/communications/daily-summary

const prisma = require('../prisma-client');
const webpush = require('web-push');
const { sendPushToUser } = require('./pushNotificationService');

// ============================================
// HELPERS
// ============================================

function round2(n) {
  return Math.round((n || 0) * 100) / 100;
}

function isDebt(type) {
  return ['credit', 'hypotheque', 'marge'].includes(type);
}

function formatDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calcMensuel(montant, frequence) {
  const m = parseFloat(montant) || 0;
  if (frequence === '1-fois') return 0;
  switch (frequence) {
    case 'hebdomadaire': return m * 4;
    case 'quinzaine': case 'bimensuel': return m * 2;
    case 'trimestriel': return m / 3;
    case 'semestriel': return m / 6;
    case 'annuel': return m / 12;
    default: return m;
  }
}

/**
 * Vérifie si une transaction récurrente se déclenche à une date donnée
 */
function isTransactionOnDate(item, date) {
  const frequence = (item.frequence || 'mensuel').toLowerCase();
  const jour = parseInt(item.jourDuMois) || parseInt(item.jourRecurrence) || 1;
  const dateDay = date.getDate();
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const checkDayMatch = (j) => {
    if (j > lastDayOfMonth) return dateDay === lastDayOfMonth;
    return dateDay === j;
  };

  switch (frequence) {
    case 'mensuel': case 'monthly':
      return checkDayMatch(jour);
    case 'quinzaine':
      return dateDay === Math.min(jour, lastDayOfMonth) || dateDay === Math.min(jour + 15, lastDayOfMonth);
    case 'bimensuel':
      if (item.dateReference) {
        const ref = new Date(String(item.dateReference).split('T')[0]);
        const diffDays = Math.floor((date.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % 14 === 0;
      }
      return checkDayMatch(jour);
    case 'hebdomadaire':
      if (item.dateReference) {
        const ref = new Date(String(item.dateReference).split('T')[0]);
        const diffDays = Math.floor((date.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % 7 === 0;
      }
      if (item.jourSemaine !== undefined) {
        return date.getDay() === parseInt(item.jourSemaine);
      }
      return false;
    case 'quotidien':
      return true;
    case '1-fois':
      if (item.datePrevue || item.dateReference) {
        const dateStr = formatDateStr(date);
        const targetStr = String(item.datePrevue || item.dateReference).split('T')[0];
        return dateStr === targetStr;
      }
      return false;
    default:
      return checkDayMatch(jour);
  }
}

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}

// ============================================
// CORE: Build daily summary for a user
// ============================================

/**
 * Construit le résumé financier du jour pour un utilisateur
 * @param {string} userId
 * @returns {object} { date, entrees, sorties, totalEntrees, totalSorties, soldePrevuFin, alertes }
 */
async function buildDailySummary(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateStr(today);

  // Récupérer les données utilisateur
  const userData = await prisma.userData.findUnique({
    where: { userId }
  });

  if (!userData) {
    return { date: todayStr, entrees: [], sorties: [], totalEntrees: 0, totalSorties: 0, soldePrevuFin: 0, alertes: [] };
  }

  const data = parseJson(userData.data);
  if (!data) {
    return { date: todayStr, entrees: [], sorties: [], totalEntrees: 0, totalSorties: 0, soldePrevuFin: 0, alertes: [] };
  }

  const accounts = data.accounts || [];
  const soldes = data.initialBalances || [];
  const budgetEntrees = data.budgetPlanning?.entrees || [];
  const budgetSorties = data.budgetPlanning?.sorties || [];

  // Identifier les transactions du jour
  const entreesJour = budgetEntrees.filter(e => isTransactionOnDate(e, today));
  const sortiesJour = budgetSorties.filter(s => isTransactionOnDate(s, today));

  const totalEntrees = round2(entreesJour.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0));
  const totalSorties = round2(sortiesJour.reduce((sum, s) => sum + (parseFloat(s.montant) || 0), 0));

  // Calculer solde prévu (somme des actifs - somme des dettes + flux du jour)
  let totalActifs = 0;
  let totalDettes = 0;
  accounts.forEach(acc => {
    const soldeInfo = soldes.find(s => s.accountName === acc.nom);
    const balance = parseFloat(soldeInfo?.solde) || 0;
    if (isDebt(acc.type)) {
      totalDettes += Math.abs(balance);
    } else {
      totalActifs += balance;
    }
  });

  const soldePrevuFin = round2(totalActifs - totalDettes + totalEntrees - totalSorties);

  // Générer des alertes contextuelles
  const alertes = [];

  // Alerte: paiements à venir dans les 3 prochains jours
  for (let d = 1; d <= 3; d++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + d);
    const grossesSorties = budgetSorties.filter(s => {
      if (!isTransactionOnDate(s, futureDate)) return false;
      return (parseFloat(s.montant) || 0) >= 100;
    });
    grossesSorties.forEach(s => {
      alertes.push(`${parseFloat(s.montant).toFixed(0)}$ — ${s.description || s.nom} dans ${d} jour${d > 1 ? 's' : ''}`);
    });
  }

  // Alerte: solde négatif sur un compte chèque
  accounts.forEach(acc => {
    if (acc.type === 'cheque' || acc.type === 'checking') {
      const soldeInfo = soldes.find(s => s.accountName === acc.nom);
      const balance = parseFloat(soldeInfo?.solde) || 0;
      if (balance < 0) {
        alertes.push(`${acc.nom} en négatif (${balance.toFixed(0)}$)`);
      }
    }
  });

  // Alerte: carte de crédit proche de la limite
  accounts.forEach(acc => {
    if (acc.type === 'credit' && acc.limite) {
      const soldeInfo = soldes.find(s => s.accountName === acc.nom);
      const solde = Math.abs(parseFloat(soldeInfo?.solde) || 0);
      const limite = parseFloat(acc.limite) || 0;
      if (limite > 0 && solde / limite >= 0.85) {
        alertes.push(`${acc.nom} à ${Math.round(solde / limite * 100)}% de la limite`);
      }
    }
  });

  return {
    date: todayStr,
    entrees: entreesJour.map(e => ({ nom: e.description || e.nom, montant: parseFloat(e.montant) || 0 })),
    sorties: sortiesJour.map(s => ({ nom: s.description || s.nom, montant: parseFloat(s.montant) || 0 })),
    totalEntrees,
    totalSorties,
    soldePrevuFin,
    alertes: alertes.slice(0, 3) // Max 3 alertes
  };
}

// ============================================
// PUSH: Send daily summary push notification
// ============================================

/**
 * Envoie le résumé quotidien par push à un utilisateur
 * @param {object} user - { id, prenom, language }
 * @param {object} summary - Résultat de buildDailySummary
 */
async function sendDailyPush(user, summary) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: user.id }
  });

  if (subscriptions.length === 0) return { sent: 0, userId: user.id };

  const lang = user.language || 'fr';

  // Construire le message compact
  const entreesStr = summary.totalEntrees > 0 ? `+${summary.totalEntrees.toFixed(0)}$` : '';
  const sortiesStr = summary.totalSorties > 0 ? `-${summary.totalSorties.toFixed(0)}$` : '';
  const items = summary.sorties.map(s => s.nom).slice(0, 3).join(', ');

  let body;
  if (summary.totalEntrees > 0 && summary.totalSorties > 0) {
    body = lang === 'fr'
      ? `${entreesStr} / ${sortiesStr} (${items}). Solde: ${summary.soldePrevuFin.toFixed(0)}$`
      : `${entreesStr} / ${sortiesStr} (${items}). Balance: ${summary.soldePrevuFin.toFixed(0)}$`;
  } else if (summary.totalSorties > 0) {
    body = lang === 'fr'
      ? `${sortiesStr} (${items}). Solde: ${summary.soldePrevuFin.toFixed(0)}$`
      : `${sortiesStr} (${items}). Balance: ${summary.soldePrevuFin.toFixed(0)}$`;
  } else if (summary.totalEntrees > 0) {
    body = lang === 'fr'
      ? `${entreesStr} aujourd'hui. Solde: ${summary.soldePrevuFin.toFixed(0)}$`
      : `${entreesStr} today. Balance: ${summary.soldePrevuFin.toFixed(0)}$`;
  } else {
    body = lang === 'fr'
      ? `Aucune transaction prévue. Solde: ${summary.soldePrevuFin.toFixed(0)}$`
      : `No transactions today. Balance: ${summary.soldePrevuFin.toFixed(0)}$`;
  }

  // Ajouter alerte si présente
  if (summary.alertes.length > 0) {
    body += ` | ${summary.alertes[0]}`;
  }

  const title = lang === 'fr' ? 'Ton budget du jour' : 'Your daily budget';

  const payload = JSON.stringify({
    title,
    body,
    url: '/dashboard'
  });

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        console.log(`[📱 Daily] Subscription expirée supprimée: ${sub.id}`);
      }
    }
  }

  // 📱 Aussi envoyer en push natif (FCM) pour les apps iOS/Android
  try {
    await sendPushToUser(user.id, { title, body }, {
      url: '/dashboard',
      type: 'daily_summary'
    });
  } catch (pushErr) {
    // Silencieux — le web push a déjà été envoyé
  }

  return { sent, userId: user.id };
}

// ============================================
// BATCH: Process all users for daily summary
// ============================================

/**
 * Envoie le résumé quotidien à tous les utilisateurs éligibles
 * Appelé par le CRON job chaque heure — filtre par heure préférée
 */
async function processDailySummaries() {
  const now = new Date();
  const currentHourUTC = now.getUTCHours();

  // Montréal = UTC-5 (EST) ou UTC-4 (EDT)
  // On approxime EDT (mars-novembre) = UTC-4
  const isDST = now.getMonth() >= 2 && now.getMonth() <= 10; // Mars-Novembre
  const offset = isDST ? -4 : -5;
  const currentHourET = (currentHourUTC + offset + 24) % 24;

  console.log(`[📱 Daily] Processing — UTC ${currentHourUTC}h → ET ${currentHourET}h`);

  // Trouver les utilisateurs dont l'heure préférée correspond
  const users = await prisma.user.findMany({
    where: {
      dailySummaryEnabled: true,
      dailySummaryTime: currentHourET,
      pushSubscriptions: { some: {} } // Au moins une subscription push
    },
    select: {
      id: true,
      prenom: true,
      language: true,
      lastDailySummaryAt: true
    }
  });

  if (users.length === 0) {
    console.log(`[📱 Daily] Aucun utilisateur éligible à ${currentHourET}h ET`);
    return { sent: 0, total: 0 };
  }

  const todayStr = formatDateStr(now);
  let totalSent = 0;
  let skipped = 0;

  for (const user of users) {
    // Vérifier qu'on n'a pas déjà envoyé aujourd'hui
    if (user.lastDailySummaryAt) {
      const lastSentStr = formatDateStr(new Date(user.lastDailySummaryAt));
      if (lastSentStr === todayStr) {
        skipped++;
        continue;
      }
    }

    try {
      const summary = await buildDailySummary(user.id);
      const result = await sendDailyPush(user, summary);
      totalSent += result.sent;

      // Mettre à jour la date du dernier envoi
      await prisma.user.update({
        where: { id: user.id },
        data: { lastDailySummaryAt: now }
      });

      // Logger dans communication_emails
      await prisma.communicationEmail.create({
        data: {
          userId: user.id,
          emailType: 'daily_summary',
          sentAt: now
        }
      });
    } catch (err) {
      console.error(`[📱 Daily] Erreur pour user ${user.id}:`, err.message);
    }
  }

  console.log(`[📱 Daily] Résultat: ${totalSent} push envoyés, ${skipped} déjà envoyés, ${users.length} utilisateurs ciblés`);
  return { sent: totalSent, skipped, total: users.length };
}

module.exports = {
  buildDailySummary,
  sendDailyPush,
  processDailySummaries
};
