// 📧 PL4TO - Service de Communication
// Gère l'envoi des emails événementiels (calendrier) et résumés hebdomadaires
// Utilise Resend pour l'envoi

const { Resend } = require('resend');
const prisma = require('../../prisma-client');
const calendarEventTemplate = require('./templates/communication/calendarEvent');
const weeklyReportTemplate = require('./templates/communication/weeklyReport');

const { buildFinancialSnapshot, buildComparativeInsights, detectChanges, getWeekStartDate } = require('./snapshotBuilder');
const { computeEaster, computeMothersDay, computeFathersDay, computeThanksgiving, computeLabourDay } = require('./utils/calendarDates');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'PL4TO <contact@pl4to.com>';

// ============================================
// CALENDRIER DES ÉVÉNEMENTS
// Dates dynamiques pour fêtes mobiles (Pâques, Fête des Mères, etc.)
// ============================================
const currentYear = new Date().getFullYear();
const easterDate = computeEaster(currentYear);
const mothersDayDate = computeMothersDay(currentYear);
const fathersDayDate = computeFathersDay(currentYear);
const thanksgivingDate = computeThanksgiving(currentYear);
const labourDayDate = computeLabourDay(currentYear);

const CALENDAR_EVENTS = [
  {
    id: 'saint-valentin',
    name: 'Saint-Valentin',
    emoji: '💝',
    month_fr: 'février',
    month_en: 'February',
    date: { month: 2, day: 14 },
    description_fr: 'Souper romantique et cadeaux',
    description_en: 'Romantic dinner and gifts',
    category_fr: 'Loisirs',
    category_en: 'Leisure',
    color: '#ec4899',
    greeting_fr: 'Bonne Saint-Valentin!',
    greeting_en: 'Happy Valentine\'s Day!',
    funFact_fr: 'PL4TO avait déjà planifié cette journée pour cette belle facture rose. Souper romantique, cadeaux... tout était prévu dans ton calendrier bien avant aujourd\'hui. 😏',
    funFact_en: 'PL4TO had already planned this day for that lovely pink expense. Romantic dinner, gifts... it was all in your calendar well before today. 😏',
    countries: ["CA","US","MX"]
  },
  {
    id: 'printemps',
    name_fr: 'Début du printemps',
    name_en: 'Start of Spring',
    emoji: '🌸',
    month_fr: 'mars',
    month_en: 'March',
    date: { month: 3, day: 20 },
    description_fr: 'Entretien extérieur',
    description_en: 'Outdoor maintenance',
    category_fr: 'Maison',
    category_en: 'Home',
    color: '#f97316',
    greeting_fr: 'Le printemps est arrivé!',
    greeting_en: 'Spring has arrived!',
    funFact_fr: 'Le printemps est souvent synonyme de dépenses imprévues: entretien de la cour, nettoyage, équipements... PL4TO les avait déjà intégrées dans ton budget! 🌱',
    funFact_en: 'Spring often brings unexpected expenses: yard work, cleaning, equipment... PL4TO had already factored them into your budget! 🌱',
    countries: ["CA","US"]
  },
  {
    id: 'paques',
    name_fr: 'Pâques',
    name_en: 'Easter',
    emoji: '🐰',
    month_fr: easterDate.month <= 3 ? 'mars' : 'avril',
    month_en: easterDate.month <= 3 ? 'March' : 'April',
    date: easterDate, // 🔧 Calculé dynamiquement — Pâques 2026 = 5 avril
    description_fr: 'Brunch familial et chocolats',
    description_en: 'Family brunch and chocolate',
    category_fr: 'Fêtes',
    category_en: 'Holidays',
    color: '#f59e0b',
    greeting_fr: 'Joyeuses Pâques!',
    greeting_en: 'Happy Easter!',
    funFact_fr: 'Saviez-vous que les Canadiens dépensent en moyenne 20$ en chocolats à Pâques? PL4TO avait déjà prévu cette douce dépense! 🍫',
    funFact_en: 'Did you know Canadians spend an average of $20 on Easter chocolate? PL4TO had already planned for this sweet expense! 🍫',
    countries: ["CA","US","MX"]
  },
  {
    id: 'fete-meres',
    name_fr: 'Fête des Mères',
    name_en: 'Mother\'s Day',
    emoji: '🌸',
    month_fr: 'mai',
    month_en: 'May',
    date: mothersDayDate, // 🔧 2e dimanche de mai — calculé dynamiquement
    description_fr: 'Cadeau et restaurant',
    description_en: 'Gift and restaurant',
    category_fr: 'Famille',
    category_en: 'Family',
    color: '#ec4899',
    greeting_fr: 'Bonne Fête des Mères!',
    greeting_en: 'Happy Mother\'s Day!',
    funFact_fr: 'Les Canadiens dépensent en moyenne 120$ pour la Fête des Mères. PL4TO avait déjà prévu cette attention dans ton budget! 💐',
    funFact_en: 'Canadians spend an average of $120 on Mother\'s Day. PL4TO already planned this treat in your budget! 💐',
    countries: ["CA","US"]
  },
  {
    id: 'fete-peres',
    name_fr: 'Fête des Pères',
    name_en: 'Father\'s Day',
    emoji: '👔',
    month_fr: 'juin',
    month_en: 'June',
    date: fathersDayDate, // 🔧 3e dimanche de juin — calculé dynamiquement
    description_fr: 'Cadeau et activité',
    description_en: 'Gift and activity',
    category_fr: 'Famille',
    category_en: 'Family',
    color: '#3b82f6',
    greeting_fr: 'Bonne Fête des Pères!',
    greeting_en: 'Happy Father\'s Day!',
    funFact_fr: 'Un bon repas, une activité ensemble... PL4TO avait déjà prévu le budget pour cette journée spéciale! 🎣',
    funFact_en: 'A good meal, an activity together... PL4TO had already budgeted for this special day! 🎣',
    countries: ["CA","US"]
  },
  {
    id: 'fete-nationale',
    name_fr: 'Fête nationale',
    name_en: 'National Holiday',
    emoji: '🎆',
    month_fr: 'juin',
    month_en: 'June',
    date: { month: 6, day: 24 },
    description_fr: 'Festivités et sorties',
    description_en: 'Celebrations and outings',
    category_fr: 'Fêtes',
    category_en: 'Holidays',
    color: '#3b82f6',
    greeting_fr: 'Bonne Saint-Jean!',
    greeting_en: 'Happy National Holiday!',
    funFact_fr: 'L\'été est la saison où les dépenses de loisirs augmentent le plus. PL4TO avait prévu le coup pour que tu profites sans stress! ☀️',
    funFact_en: 'Summer is when leisure spending peaks. PL4TO planned ahead so you can enjoy stress-free! ☀️',
    countries: ["CA"]
  },
  {
    id: 'canada-day',
    name_fr: 'Fête du Canada',
    name_en: 'Canada Day',
    emoji: '🇨🇦',
    month_fr: 'juillet',
    month_en: 'July',
    date: { month: 7, day: 1 },
    description_fr: 'Célébrations et BBQ',
    description_en: 'Celebrations and BBQ',
    category_fr: 'Fêtes',
    category_en: 'Holidays',
    color: '#ef4444',
    greeting_fr: 'Bonne Fête du Canada!',
    greeting_en: 'Happy Canada Day!',
    funFact_fr: 'BBQ, feux d\'artifice, festivités... PL4TO avait intégré cette journée dans ton budget depuis longtemps! 🇨🇦',
    funFact_en: 'BBQ, fireworks, celebrations... PL4TO had this day in your budget all along! 🇨🇦',
    countries: ["CA"]
  },
  {
    id: 'rentree',
    name_fr: 'Rentrée scolaire',
    name_en: 'Back to School',
    emoji: '📚',
    month_fr: 'août',
    month_en: 'August',
    date: { month: 8, day: 25 },
    description_fr: 'Fournitures et préparatifs',
    description_en: 'Supplies and preparation',
    category_fr: 'Éducation',
    category_en: 'Education',
    color: '#8b5cf6',
    greeting_fr: 'Bonne rentrée!',
    greeting_en: 'Happy Back to School!',
    funFact_fr: 'La rentrée coûte en moyenne 400$ par enfant au Canada. PL4TO avait déjà intégré ces dépenses dans ton budget depuis des mois! 🎒',
    funFact_en: 'Back to school costs an average of $400 per child in Canada. PL4TO had factored these expenses into your budget months ago! 🎒',
    countries: ["CA","US","MX"]
  },
  {
    id: 'fete-travail',
    name_fr: 'Fête du Travail',
    name_en: 'Labour Day',
    emoji: '⚒️',
    month_fr: 'septembre',
    month_en: 'September',
    date: labourDayDate, // 🔧 1er lundi de septembre — calculé dynamiquement
    description_fr: 'Fin de l\'été',
    description_en: 'End of summer',
    category_fr: 'Fêtes',
    category_en: 'Holidays',
    color: '#6366f1',
    greeting_fr: 'Bonne Fête du Travail!',
    greeting_en: 'Happy Labour Day!',
    funFact_fr: 'La Fête du Travail marque la fin de l\'été et le début d\'une nouvelle routine. PL4TO est prêt! 🍂',
    funFact_en: 'Labour Day marks the end of summer and a new routine. PL4TO is ready! 🍂',
    countries: ["CA","US"]
  },
  {
    id: 'halloween',
    name_fr: 'Halloween',
    name_en: 'Halloween',
    emoji: '🎃',
    month_fr: 'octobre',
    month_en: 'October',
    date: { month: 10, day: 31 },
    description_fr: 'Costumes et bonbons',
    description_en: 'Costumes and candy',
    category_fr: 'Loisirs',
    category_en: 'Leisure',
    color: '#f97316',
    greeting_fr: 'Joyeuse Halloween!',
    greeting_en: 'Happy Halloween!',
    funFact_fr: 'Halloween est devenu la 2e fête la plus dépensière après Noël en Amérique du Nord. Costumes, bonbons, décor... PL4TO avait tout prévu! 👻',
    funFact_en: 'Halloween has become the 2nd most expensive holiday after Christmas in North America. Costumes, candy, decor... PL4TO had it all planned! 👻',
    countries: ["CA","US"]
  },
  {
    id: 'action-grace',
    name_fr: 'Action de Grâce',
    name_en: 'Thanksgiving',
    emoji: '🦃',
    month_fr: 'octobre',
    month_en: 'October',
    date: thanksgivingDate, // 🔧 2e lundi d'octobre — calculé dynamiquement
    description_fr: 'Repas familial',
    description_en: 'Family meal',
    category_fr: 'Fêtes',
    category_en: 'Holidays',
    color: '#f59e0b',
    greeting_fr: 'Joyeuse Action de Grâce!',
    greeting_en: 'Happy Thanksgiving!',
    funFact_fr: 'Un repas de Thanksgiving moyen coûte 50-80$ en épicerie. PL4TO l\'avait intégré dans ton budget! 🦃',
    funFact_en: 'An average Thanksgiving meal costs $50-80 in groceries. PL4TO factored it into your budget! 🦃',
    countries: ["CA"]
  },
  {
    id: 'noel',
    name_fr: 'Noël',
    name_en: 'Christmas',
    emoji: '🎄',
    month_fr: 'décembre',
    month_en: 'December',
    date: { month: 12, day: 25 },
    description_fr: 'Cadeaux et réceptions',
    description_en: 'Gifts and celebrations',
    category_fr: 'Fêtes',
    category_en: 'Holidays',
    color: '#ef4444',
    greeting_fr: 'Joyeux Noël!',
    greeting_en: 'Merry Christmas!',
    funFact_fr: 'Les Canadiens dépensent en moyenne 1 500$ pour les fêtes. PL4TO t\'avait préparé pour ce moment depuis le début de l\'année! 🎁',
    funFact_en: 'Canadians spend an average of $1,500 on the holidays. PL4TO has been preparing you for this moment since the start of the year! 🎁',
    countries: ["CA","US","MX"]
  }
];

// ============================================
// FUN FACTS HEBDOMADAIRES (rotation)
// ============================================
const WEEKLY_FUN_FACTS = {
  fr: [
    'Les personnes qui suivent un budget épargnent en moyenne 20% de plus que celles qui n\'en ont pas.',
    'Vérifier ses finances une fois par semaine réduit le stress financier de 40%.',
    'La règle du 50/30/20: 50% besoins, 30% désirs, 20% épargne. Où en es-tu?',
    'Un café à 5$ par jour, c\'est 1 825$ par an. PL4TO le sait!',
    'Les objectifs financiers écrits ont 42% plus de chances d\'être atteints.',
    'Le meilleur moment pour investir était hier. Le deuxième meilleur moment, c\'est aujourd\'hui.',
    'Saviez-vous que 47% des Canadiens vivent d\'un chèque de paie à l\'autre? PL4TO t\'aide à briser ce cycle.',
    'Automatiser ses paiements réduit les retards de 90% et améliore ta cote de crédit.'
  ],
  en: [
    'People who follow a budget save an average of 20% more than those who don\'t.',
    'Checking your finances once a week reduces financial stress by 40%.',
    'The 50/30/20 rule: 50% needs, 30% wants, 20% savings. Where do you stand?',
    'A $5 coffee daily adds up to $1,825 a year. PL4TO knows this!',
    'Written financial goals are 42% more likely to be achieved.',
    'The best time to invest was yesterday. The second best time is today.',
    'Did you know 47% of Canadians live paycheck to paycheck? PL4TO helps you break that cycle.',
    'Automating payments reduces late fees by 90% and improves your credit score.'
  ]
};

// ============================================
// HELPERS
// ============================================

/**
 * Trouve l'événement du jour
 */
function getTodaysEvent() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  return CALENDAR_EVENTS.find(e => e.date.month === month && e.date.day === day);
}

/**
 * Trouve le prochain événement après aujourd'hui
 * @param {string} lang
 * @param {string} country - Filtre par pays (CA/US/MX). Défaut: CA.
 */
function getNextEvent(lang = 'fr', country = 'CA') {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // Filtrer par pays de l'utilisateur (événements sans countries = universels)
  const filtered = CALENDAR_EVENTS.filter(e =>
    !e.countries || e.countries.includes(country)
  );

  // Trier les événements par date
  const sorted = [...filtered].sort((a, b) => {
    if (a.date.month !== b.date.month) return a.date.month - b.date.month;
    return a.date.day - b.date.day;
  });

  // Trouver le prochain
  let next = sorted.find(e => {
    if (e.date.month > currentMonth) return true;
    if (e.date.month === currentMonth && e.date.day > currentDay) return true;
    return false;
  });
  
  // Si aucun trouvé cette année, prendre le premier de l'année prochaine
  if (!next) next = sorted[0];
  
  if (!next) return null;
  
  // Calculer le temps restant
  const eventDate = new Date(today.getFullYear(), next.date.month - 1, next.date.day);
  if (eventDate <= today) eventDate.setFullYear(eventDate.getFullYear() + 1);
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  
  const monthsUntil = Math.round(daysUntil / 30) || 1;
  const timeUntil = lang === 'fr' 
    ? (daysUntil >= 30 ? `Dans ${monthsUntil} mois` : `Dans ${daysUntil} jours`)
    : (daysUntil >= 30 ? `In ${monthsUntil} months` : `In ${daysUntil} days`);
  
  return {
    emoji: next.emoji,
    name: next[`name_${lang}`] || next.name || next[`name_fr`],
    description: next[`description_${lang}`] || next.description_fr,
    timeUntil,
    daysUntil
  };
}

/**
 * Obtient un fun fact aléatoire de la semaine
 */
function getWeeklyFunFact(lang = 'fr') {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const facts = WEEKLY_FUN_FACTS[lang] || WEEKLY_FUN_FACTS.fr;
  return facts[weekNumber % facts.length];
}

/**
 * Formatte la date de début de semaine
 */
function getWeekStart(lang = 'fr') {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  
  if (lang === 'fr') {
    return monday.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return monday.toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ============================================
// ENVOI: Email Événement Calendrier
// ============================================
async function sendCalendarEventEmails() {
  const event = getTodaysEvent();
  if (!event) {
    console.log('[Communication] Aucun événement calendrier aujourd\'hui');
    return { sent: 0 };
  }
  
  console.log(`[Communication] 📅 Événement du jour: ${event.name_fr || event.name}${event.countries ? ` (${event.countries.join('/')})` : ''}`);

  // Filtrer par pays si l'événement est régional (évite d'envoyer la Saint-Jean
  // à un user MX ou Canada Day à un user US). Absence de countries = universel.
  const countryFilter = event.countries
    ? { country: { in: event.countries } }
    : {};

  // Trouver les utilisateurs opt-in pour emails calendrier (filtrés par pays)
  const users = await prisma.user.findMany({
    where: {
      calendarEmailEnabled: true,
      emailVerified: true,
      emailOptOut: false,
      ...countryFilter
    },
    select: {
      id: true,
      prenom: true,
      email: true,
      language: true,
      country: true
    }
  });

  console.log(`[Communication] ${users.length} utilisateurs opt-in${event.countries ? ` (filtrés par pays ${event.countries.join('/')})` : ''}`);
  
  let sent = 0;
  let errors = 0;
  
  for (const user of users) {
    try {
      // Vérifier si déjà envoyé aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const alreadySent = await prisma.communicationEmail.findFirst({
        where: {
          userId: user.id,
          emailType: 'calendar_event',
          eventName: event.id,
          sentAt: { gte: today }
        }
      });
      
      if (alreadySent) continue;
      
      const lang = user.language || 'fr';
      const template = calendarEventTemplate[lang] || calendarEventTemplate.fr;
      const nextEvent = getNextEvent(lang, user.country || 'CA');
      
      const eventData = {
        emoji: event.emoji,
        name: event[`name_${lang}`] || event.name || event.name_fr,
        description: event[`description_${lang}`] || event.description_fr,
        month: event[`month_${lang}`] || event.month_fr,
        category: event[`category_${lang}`] || event.category_fr,
        color: event.color,
        greeting: event[`greeting_${lang}`] || event.greeting_fr,
        funFact: event[`funFact_${lang}`] || event.funFact_fr
      };
      
      const { subject, html } = template.generate(user.prenom, eventData, nextEvent, user.id);
      
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject,
        html
      });
      
      // Logger l'envoi
      await prisma.communicationEmail.create({
        data: {
          userId: user.id,
          emailType: 'calendar_event',
          eventName: event.id,
          resendId: result?.id || null
        }
      });
      
      sent++;
      console.log(`[Communication] ✅ Calendrier envoyé à ${user.email}`);

      // 📱 Push natif pour l'événement calendrier
      try {
        const { sendPushToUser } = require('../pushNotificationService');
        const eventName = event[`name_${lang}`] || event.name || event.name_fr;
        await sendPushToUser(user.id, {
          title: `${event.emoji} ${eventName}`,
          body: lang === 'fr'
            ? `As-tu prévu ton budget pour ${eventName}?`
            : `Did you plan your budget for ${eventName}?`
        }, {
          url: '/dashboard',
          type: 'calendar_event'
        });
      } catch (pushErr) {
        // Silencieux — email déjà envoyé
      }

    } catch (err) {
      errors++;
      console.error(`[Communication] ❌ Erreur pour ${user.email}:`, err.message);
    }
  }

  console.log(`[Communication] 📅 Résultat: ${sent} envoyés, ${errors} erreurs`);
  return { sent, errors, event: event.id };
}

// ============================================
// ENVOI: Résumé Hebdomadaire GPS
// ============================================
async function sendWeeklyReportEmails() {
  console.log('[Communication] 📊 Début envoi résumés hebdomadaires...');

  const users = await prisma.user.findMany({
    where: {
      weeklyReportEnabled: true,
      emailVerified: true,
      emailOptOut: false
    },
    select: {
      id: true,
      prenom: true,
      email: true,
      language: true,
      country: true,
      lastWeeklyReportAt: true,
      subscriptionPlan: true
    }
  });

  console.log(`[Communication] ${users.length} utilisateurs opt-in pour résumé hebdo`);

  let sent = 0;
  let errors = 0;

  for (const user of users) {
    try {
      // Vérifier si déjà envoyé cette semaine
      if (user.lastWeeklyReportAt) {
        const daysSinceLast = (Date.now() - new Date(user.lastWeeklyReportAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLast < 6) continue; // Minimum 6 jours entre les envois
      }

      const lang = user.language || 'fr';
      const template = weeklyReportTemplate[lang] || weeklyReportTemplate.fr;

      // 📸 NOUVEAU: Construire le snapshot financier
      let snapshot = null;
      let comparativeInsights = null;
      let changedSections = null;

      try {
        snapshot = await buildFinancialSnapshot(user.id);

        if (snapshot) {
          // Ajouter le prochain événement (filtré par pays de l'utilisateur)
          snapshot.nextEvent = getNextEvent(lang, user.country || 'CA');

          // Chercher le snapshot précédent pour comparaison
          const previousSnapshot = await prisma.weeklyReportSnapshot.findFirst({
            where: { userId: user.id },
            orderBy: { snapshotDate: 'desc' },
            select: { financialSnapshot: true }
          });

          if (previousSnapshot?.financialSnapshot) {
            const prevData = typeof previousSnapshot.financialSnapshot === 'string'
              ? JSON.parse(previousSnapshot.financialSnapshot)
              : previousSnapshot.financialSnapshot;
            comparativeInsights = buildComparativeInsights(snapshot, prevData, lang);
            changedSections = detectChanges(snapshot, prevData);
          } else {
            changedSections = detectChanges(snapshot, null); // Premier rapport
          }

          console.log(`[Communication] 📸 Snapshot construit pour ${user.email} (comparison: ${comparativeInsights ? 'oui' : 'non'}, changes: ${JSON.stringify(changedSections)})`);
        }
      } catch (snapshotErr) {
        console.error(`[Communication] ⚠️ Snapshot error for ${user.email}, proceeding without:`, snapshotErr.message);
      }

      // Construire le rapport enrichi
      const report = await buildUserReport(user.id, lang, {
        snapshot, comparativeInsights, changedSections,
        country: user.country || 'CA'
      });

      const { subject, html } = template.generate(user.prenom, report, user.id);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject,
        html
      });

      // 📸 NOUVEAU: Sauvegarder le snapshot après envoi réussi
      if (snapshot) {
        try {
          const weekStart = getWeekStartDate();
          await prisma.weeklyReportSnapshot.upsert({
            where: {
              userId_weekStart: { userId: user.id, weekStart }
            },
            update: {
              financialSnapshot: snapshot,
              reportData: report,
              comparativeInsights: comparativeInsights,
              emailResendId: result?.id || null,
              snapshotDate: new Date()
            },
            create: {
              userId: user.id,
              weekStart,
              financialSnapshot: snapshot,
              reportData: report,
              comparativeInsights: comparativeInsights,
              emailResendId: result?.id || null
            }
          });
          console.log(`[Communication] 📸 Snapshot saved for ${user.email} (week ${weekStart})`);
        } catch (saveErr) {
          console.error(`[Communication] ⚠️ Snapshot save error for ${user.email}:`, saveErr.message);
        }
      }

      // Mettre à jour la date du dernier envoi
      await prisma.user.update({
        where: { id: user.id },
        data: { lastWeeklyReportAt: new Date() }
      });

      // Logger
      await prisma.communicationEmail.create({
        data: {
          userId: user.id,
          emailType: 'weekly_report',
          resendId: result?.id || null
        }
      });

      sent++;
      console.log(`[Communication] ✅ Résumé hebdo envoyé à ${user.email}`);

      // 📱 Push natif pour le résumé hebdo
      try {
        const { sendPushToUser } = require('../pushNotificationService');
        const lang = user.language || 'fr';
        await sendPushToUser(user.id, {
          title: lang === 'fr' ? '📊 Ton résumé de la semaine' : '📊 Your weekly summary',
          body: lang === 'fr'
            ? 'Découvre ton évolution financière cette semaine!'
            : 'Discover your financial progress this week!'
        }, {
          url: '/parametres',
          type: 'weekly_report'
        });
      } catch (pushErr) {
        // Silencieux
      }

    } catch (err) {
      errors++;
      console.error(`[Communication] ❌ Erreur résumé pour ${user.email}:`, err.message);
    }
  }

  console.log(`[Communication] 📊 Résultat: ${sent} résumés envoyés, ${errors} erreurs`);
  return { sent, errors };
}

// ============================================
// CONSTRUIRE LE RAPPORT UTILISATEUR
// ============================================
async function buildUserReport(userId, lang = 'fr', options = {}) {
  const { snapshot = null, comparativeInsights = null, changedSections = null, country = 'CA' } = options;

  // Récupérer les données utilisateur
  const userData = await prisma.userData.findUnique({
    where: { userId }
  });

  // Par défaut: tout afficher (si pas de changedSections = premier rapport ou pas de snapshot)
  const defaultSections = {
    showUpcomingWeek: true,
    showNextEvent: true,
    showEmergencyFund: true,
    showEconomicIndicators: true,
    showBudgetStatus: true,
    showObjectifs: true,
    showTrajectory: true,
    isFirstReport: true,
    changedGoalNames: null
  };

  const report = {
    weekStart: getWeekStart(lang),
    budgetStatus: null,
    objectifs: [],
    nextEvent: snapshot?.nextEvent || getNextEvent(lang, country),
    highlights: [],
    comparisons: null,
    alertesCount: 0,
    changedSections: changedSections || defaultSections,
    semaineAVenir: snapshot?.semaineAVenir || null,
    emergencyFund: snapshot?.emergencyFund || null
  };

  if (!userData) return report;

  try {
    // Lire les champs JSON séparés de UserData (Prisma)
    const budgetPlanning = typeof userData.budgetPlanning === 'string' ? JSON.parse(userData.budgetPlanning) : userData.budgetPlanning;
    const financialGoals = typeof userData.financialGoals === 'string' ? JSON.parse(userData.financialGoals) : userData.financialGoals;
    const accounts = typeof userData.accounts === 'string' ? JSON.parse(userData.accounts) : userData.accounts;
    const initialBalances = typeof userData.initialBalances === 'string' ? JSON.parse(userData.initialBalances) : userData.initialBalances;

    // Budget - répartition par compte (même logique que Budget.jsx slide 2)
    const budgetEntrees = budgetPlanning?.entrees || [];
    const budgetSorties = budgetPlanning?.sorties || [];

    const calcMensuel = (montant, frequence) => {
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
    };

    if (budgetEntrees.length > 0 || budgetSorties.length > 0) {
      // Grouper par compte
      const map = {};
      const addToMap = (items, type) => {
        (items || []).forEach(item => {
          const key = item.compte || 'Sans compte';
          if (!map[key]) map[key] = { nom: key, entrees: 0, sorties: 0, type: 'checking' };
          const mensuel = calcMensuel(item.montant, item.frequence);
          if (type === 'entrees') map[key].entrees += mensuel;
          else map[key].sorties += mensuel;
        });
      };
      addToMap(budgetEntrees, 'entrees');
      addToMap(budgetSorties, 'sorties');

      // Enrichir avec type de compte
      const accsArr = accounts || [];
      Object.values(map).forEach(acc => {
        const found = accsArr.find(a => a.nom === acc.nom);
        if (found) acc.type = found.type || 'checking';
      });

      // Vérifier si un compte est en orange (déséquilibré)
      const hasOrange = Object.values(map).some(acc => {
        const isCredit = acc.type === 'credit' || acc.type === 'hypotheque' || acc.type === 'marge';
        if (isCredit) return (acc.sorties - acc.entrees) > 0; // Dépenses > paiements
        return (acc.entrees - acc.sorties) < 0; // Sorties > entrées
      });

      report.budgetStatus = hasOrange ? 'unbalanced' : 'balanced';
    }

    // 💰 Économies possibles — même logique que frontend/smartWidgets.js
    const savingsOpportunities = [];
    const groceryKeywords = ['épicerie', 'epicerie', 'grocery', 'alimentation', 'nourriture',
      'supermarché', 'supermarche', 'maxi', 'iga', 'metro', 'provigo', 'costco', 'walmart',
      'loblaws', 'sobeys', 'safeway', 'food', 'groceries'];
    const gasKeywords = ['essence', 'gas', 'gasolina', 'fuel', 'station', 'petro',
      'shell', 'esso', 'ultramar', 'couche-tard'];
    const phoneKeywords = ['téléphone', 'telephone', 'cell', 'cellulaire', 'mobile', 'phone',
      'vidéotron', 'videotron', 'fizz', 'bell', 'rogers', 'telus', 'internet'];

    const findCategoryAmount = (keywords) => {
      return budgetSorties
        .filter(s => keywords.some(kw => (s.description || '').toLowerCase().includes(kw)))
        .reduce((total, item) => total + calcMensuel(item.montant, item.frequence), 0);
    };

    const groceryAmount = findCategoryAmount(groceryKeywords);
    if (groceryAmount > 0) {
      savingsOpportunities.push({
        icon: '🛒',
        category: lang === 'fr' ? 'Épicerie' : 'Groceries',
        monthlyAmount: Math.round(groceryAmount),
        savingsAmount: Math.round(groceryAmount * 0.15),
        savingsAnnual: Math.round(groceryAmount * 0.15 * 12),
        tip: lang === 'fr'
          ? 'Consulte les rabais de la semaine avant de faire ton épicerie'
          : 'Check weekly deals before grocery shopping'
      });
    }

    const gasAmount = findCategoryAmount(gasKeywords);
    if (gasAmount > 0) {
      // Chercher le prix d'essence dans les indicateurs économiques (StatCan)
      let fuelPrice = null;
      try {
        const fuelIndicator = await prisma.economicIndicator.findFirst({
          where: { category: 'fuel' },
          orderBy: { fetchedAt: 'desc' }
        });
        if (fuelIndicator) fuelPrice = (parseFloat(fuelIndicator.value) / 100).toFixed(2);
      } catch (_) { /* no-op */ }

      savingsOpportunities.push({
        icon: '⛽',
        category: lang === 'fr' ? 'Essence' : 'Gas',
        monthlyAmount: Math.round(gasAmount),
        savingsAmount: Math.round(gasAmount * 0.10),
        savingsAnnual: Math.round(gasAmount * 0.10 * 12),
        fuelPrice,
        tip: lang === 'fr'
          ? `Compare les prix avant de faire le plein${fuelPrice ? ` (${fuelPrice}$/L cette semaine)` : ''}`
          : `Compare prices before filling up${fuelPrice ? ` ($${fuelPrice}/L this week)` : ''}`
      });
    }

    const phoneAmount = findCategoryAmount(phoneKeywords);
    if (phoneAmount > 0) {
      savingsOpportunities.push({
        icon: '📱',
        category: lang === 'fr' ? 'Téléphone' : 'Phone',
        monthlyAmount: Math.round(phoneAmount),
        savingsAmount: Math.round(phoneAmount * 0.20),
        savingsAnnual: Math.round(phoneAmount * 0.20 * 12),
        tip: lang === 'fr'
          ? 'As-tu comparé les forfaits récemment?'
          : 'Have you compared plans recently?'
      });
    }

    report.savingsOpportunities = savingsOpportunities;
    report.totalPotentialSavings = savingsOpportunities.reduce((s, o) => s + o.savingsAnnual, 0);

    // Objectifs - progression % seulement
    const goals = financialGoals || [];
    const accs = accounts || [];
    const soldes = initialBalances?.soldes || [];

    goals.forEach(goal => {
      if (!goal.compteAssocie || !goal.montantCible) return;
      const soldeInfo = soldes.find(s => s.accountName === goal.compteAssocie);
      const currentBalance = parseFloat(soldeInfo?.solde) || 0;
      const targetAmount = parseFloat(goal.montantCible) || 0;
      if (targetAmount === 0) return;

      const account = accs.find(a => a.nom === goal.compteAssocie);
      const isCredit = account?.type === 'credit' || account?.type === 'hypotheque' || account?.type === 'marge';

      let progress;
      if (isCredit) {
        progress = currentBalance <= targetAmount ? 100 : Math.round((targetAmount / currentBalance) * 100);
      } else {
        progress = Math.min(Math.round((currentBalance / targetAmount) * 100), 100);
      }

      report.objectifs.push({
        name: goal.nom,
        progress: Math.max(0, progress),
        isReached: progress >= 100,
        progressChange: null, // enrichi ci-dessous
        justReached: false
      });
    });

    // 📸 NOUVEAU: Enrichir avec données comparatives
    if (comparativeInsights) {
      report.comparisons = {
        valeurNetteChange: comparativeInsights.portefeuille.valeurNetteChange,
        trend: comparativeInsights.portefeuille.trend
      };
      // Filtrer les highlights de valeur nette (remplacés par "Ta semaine à venir")
      report.highlights = (comparativeInsights.highlights || []).filter(h =>
        !h.message.includes('Valeur nette') && !h.message.includes('Net worth')
      );

      // Enrichir chaque objectif avec le changement de progrès
      if (comparativeInsights.objectifsChanges) {
        report.objectifs = report.objectifs.map(obj => {
          const change = comparativeInsights.objectifsChanges.find(c => c.nom === obj.name);
          return {
            ...obj,
            progressChange: change && !change.isNew ? change.progressChange : null,
            justReached: change ? change.justReached : false
          };
        });
      }
    }

    // 📸 NOUVEAU: Nombre d'alertes trajectoire
    if (snapshot?.trajectoire6mois?.alertes) {
      report.alertesCount = snapshot.trajectoire6mois.alertes.length;
    }

    console.log('[Communication] Report built:', {
      budgetStatus: report.budgetStatus,
      objectifsCount: report.objectifs.length,
      highlightsCount: report.highlights.length,
      alertesCount: report.alertesCount
    });

  } catch (err) {
    console.error(`[Communication] Erreur parsing données user ${userId}:`, err.message);
  }

  return report;
}

// ============================================
// DÉSABONNEMENT
// ============================================
async function unsubscribe(userId, type) {
  const updateData = {};
  
  if (type === 'calendar') {
    updateData.calendarEmailEnabled = false;
  } else if (type === 'weekly') {
    updateData.weeklyReportEnabled = false;
  } else {
    updateData.calendarEmailEnabled = false;
    updateData.weeklyReportEnabled = false;
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  
  console.log(`[Communication] Utilisateur ${userId} désabonné de: ${type}`);
  return { success: true };
}

// ============================================
// METTRE À JOUR LES PRÉFÉRENCES
// ============================================
async function updatePreferences(userId, preferences) {
  const updateData = {};
  
  if (typeof preferences.weeklyReportEnabled === 'boolean') {
    updateData.weeklyReportEnabled = preferences.weeklyReportEnabled;
  }
  if (typeof preferences.calendarEmailEnabled === 'boolean') {
    updateData.calendarEmailEnabled = preferences.calendarEmailEnabled;
  }
  if (typeof preferences.weeklyReportDay === 'number' && preferences.weeklyReportDay >= 0 && preferences.weeklyReportDay <= 6) {
    updateData.weeklyReportDay = preferences.weeklyReportDay;
  }
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      weeklyReportEnabled: true,
      weeklyReportDay: true,
      calendarEmailEnabled: true
    }
  });
  
  console.log(`[Communication] Préférences mises à jour pour ${userId}:`, user);
  return user;
}

/**
 * Récupérer les préférences de communication
 */
async function getPreferences(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      weeklyReportEnabled: true,
      weeklyReportDay: true,
      calendarEmailEnabled: true
    }
  });
  
  return user || { weeklyReportEnabled: true, weeklyReportDay: 1, calendarEmailEnabled: false };
}

// ============================================
// ENVOI ADMIN: Aperçu événements à venir
// Vérifie si un événement arrive dans 30 ou 7 jours
// ============================================
const adminPreviewTemplate = require('./templates/communication/adminPreview');
const ADMIN_EMAIL = 'contact@pl4to.com';

/**
 * Vérifie les événements à venir et envoie des aperçus admin
 * Appelé quotidiennement par le CRON
 */
async function sendAdminPreviewEmails() {
  const today = new Date();
  const results = { sent: 0, events: [] };
  
  for (const event of CALENDAR_EVENTS) {
    // Calculer la date de l'événement cette année
    const eventDate = new Date(today.getFullYear(), event.date.month - 1, event.date.day);
    // Si l'événement est déjà passé cette année, prendre l'année prochaine
    if (eventDate < today) {
      eventDate.setFullYear(eventDate.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    
    // 30 jours avant (entre 29 et 31 pour rattraper si le serveur était down)
    const is30Days = daysUntil >= 29 && daysUntil <= 31;
    // 7 jours avant (entre 6 et 8)
    const is7Days = daysUntil >= 6 && daysUntil <= 8;
    
    if (!is30Days && !is7Days) continue;
    
    const isReminder = is7Days;
    const alertType = isReminder ? '7_days' : '30_days';
    
    // Vérifier si déjà envoyé (même event + même type dans les 5 derniers jours)
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const alreadySent = await prisma.communicationEmail.findFirst({
      where: {
        emailType: `admin_preview_${alertType}`,
        eventName: event.id,
        sentAt: { gte: fiveDaysAgo }
      }
    });
    
    if (alreadySent) continue;
    
    // Préparer le prochain événement (pour l'aperçu)
    const nextEvent = getNextEventAfter(event, 'fr');
    
    try {
      const { subject, html } = adminPreviewTemplate.generate(
        event, nextEvent, daysUntil, isReminder
      );
      
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject,
        html
      });
      
      // Logger l'envoi admin (userId null car c'est un email admin)
      await prisma.communicationEmail.create({
        data: {
          emailType: `admin_preview_${alertType}`,
          eventName: event.id,
          resendId: result?.id || null
        }
      });
      
      results.sent++;
      results.events.push(`${event.emoji} ${event.name_fr || event.name} (${alertType})`);
      console.log(`[Communication] 📧 Admin preview envoyé: ${event.name_fr || event.name} (${alertType}, ${daysUntil}j)`);
      
    } catch (err) {
      console.error(`[Communication] ❌ Erreur admin preview ${event.id}:`, err.message);
    }
  }
  
  if (results.sent > 0) {
    console.log(`[Communication] 📧 ${results.sent} aperçu(s) admin envoyé(s):`, results.events.join(', '));
  }
  
  return results;
}

/**
 * Trouve le prochain événement après un événement donné
 */
function getNextEventAfter(currentEvent, lang = 'fr') {
  const today = new Date();
  const sorted = [...CALENDAR_EVENTS]
    .filter(e => e.id !== currentEvent.id)
    .sort((a, b) => {
      if (a.date.month !== b.date.month) return a.date.month - b.date.month;
      return a.date.day - b.date.day;
    });
  
  // Trouver le premier après la date de l'événement courant
  let next = sorted.find(e => {
    if (e.date.month > currentEvent.date.month) return true;
    if (e.date.month === currentEvent.date.month && e.date.day > currentEvent.date.day) return true;
    return false;
  });
  
  if (!next) next = sorted[0];
  if (!next) return null;
  
  const eventDate = new Date(today.getFullYear(), next.date.month - 1, next.date.day);
  if (eventDate <= today) eventDate.setFullYear(eventDate.getFullYear() + 1);
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  const monthsUntil = Math.floor(daysUntil / 30);
  const timeUntil = lang === 'fr'
    ? (monthsUntil > 0 ? `Dans ${monthsUntil} mois` : `Dans ${daysUntil} jours`)
    : (monthsUntil > 0 ? `In ${monthsUntil} months` : `In ${daysUntil} days`);
  
  return {
    emoji: next.emoji,
    name: next[`name_${lang}`] || next.name || next.name_fr,
    description: next[`description_${lang}`] || next.description_fr,
    timeUntil
  };
}

// ============================================
// TEST: Envoyer un rapport hebdo à un utilisateur spécifique
// ============================================
async function sendTestWeeklyReport(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, prenom: true, email: true, language: true }
  });

  if (!user) throw new Error('Utilisateur non trouvé');

  const lang = user.language || 'fr';
  const template = weeklyReportTemplate[lang] || weeklyReportTemplate.fr;

  // 📸 Construire snapshot + comparaison (même logique que sendWeeklyReportEmails)
  let snapshot = null;
  let comparativeInsights = null;

  try {
    snapshot = await buildFinancialSnapshot(user.id);
    if (snapshot) {
      const previousSnapshot = await prisma.weeklyReportSnapshot.findFirst({
        where: { userId: user.id },
        orderBy: { snapshotDate: 'desc' },
        select: { financialSnapshot: true }
      });
      if (previousSnapshot?.financialSnapshot) {
        const prevData = typeof previousSnapshot.financialSnapshot === 'string'
          ? JSON.parse(previousSnapshot.financialSnapshot)
          : previousSnapshot.financialSnapshot;
        comparativeInsights = buildComparativeInsights(snapshot, prevData, lang);
      }
    }
  } catch (snapshotErr) {
    console.error(`[Communication] ⚠️ Test snapshot error:`, snapshotErr.message);
  }

  const report = await buildUserReport(user.id, lang, { snapshot, comparativeInsights });

  console.log('[Communication] 🧪 Test rapport hebdo pour', user.email);
  console.log('[Communication] Report data:', JSON.stringify(report, null, 2));

  const { subject, html } = template.generate(user.prenom, report, user.id);

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject: `[TEST] ${subject}`,
    html
  });

  // 📸 Sauvegarder le snapshot même pour les tests (pour les comparaisons futures)
  if (snapshot) {
    try {
      const weekStart = getWeekStartDate();
      await prisma.weeklyReportSnapshot.upsert({
        where: { userId_weekStart: { userId: user.id, weekStart } },
        update: { financialSnapshot: snapshot, reportData: report, comparativeInsights, emailResendId: result?.id || null, snapshotDate: new Date() },
        create: { userId: user.id, weekStart, financialSnapshot: snapshot, reportData: report, comparativeInsights, emailResendId: result?.id || null }
      });
    } catch (saveErr) {
      console.error(`[Communication] ⚠️ Test snapshot save error:`, saveErr.message);
    }
  }

  console.log('[Communication] ✅ Test rapport hebdo envoyé à', user.email);
  return { sent: true, email: user.email, report, snapshot: snapshot ? 'saved' : 'none', resendId: result?.id };
}

module.exports = {
  sendCalendarEventEmails,
  sendWeeklyReportEmails,
  sendAdminPreviewEmails,
  sendTestWeeklyReport,
  unsubscribe,
  updatePreferences,
  getPreferences,
  getTodaysEvent,
  getNextEvent,
  CALENDAR_EVENTS
};
