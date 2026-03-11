/**
 * 📸 PL4TO - Financial Snapshot Builder
 *
 * Construit un snapshot financier complet pour les rapports hebdomadaires.
 * Permet des comparaisons semaine après semaine + alimente le futur AI Coach "Alain".
 *
 * Fonctions exportées:
 * - buildFinancialSnapshot(userId) → snapshot complet (~5-10KB)
 * - buildComparativeInsights(current, previous, lang) → deltas + highlights
 */

const prisma = require('../../prisma-client');

// ============================================
// HELPERS
// ============================================

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}

function round2(n) {
  return Math.round((n || 0) * 100) / 100;
}

function isDebt(type) {
  return ['credit', 'hypotheque', 'marge'].includes(type);
}

function formatDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getMonthLabel(date, lang = 'fr') {
  const monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = lang === 'fr' ? monthsFr : monthsEn;
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getWeekStartDate() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return formatDateStr(monday);
}

// Convertit montant en mensuel (même logique que communicationEmailService.js)
function calcMensuel(montant, frequence) {
  const m = parseFloat(montant) || 0;
  if (frequence === '1-fois') return 0;
  switch (frequence) {
    case 'hebdomadaire': return m * 4;
    case 'quinzaine': case 'bimensuel': return m * 2;
    case 'trimestriel': return m / 3;
    case 'semestriel': return m / 6;
    case 'annuel': return m / 12;
    default: return m; // mensuel
  }
}

// ============================================
// CALCULS FINANCIERS
// ============================================

/**
 * Calcule le portefeuille agrégé
 */
function calculatePortfolio(comptes) {
  let totalActifs = 0;
  let totalDettes = 0;

  comptes.forEach(c => {
    if (isDebt(c.type)) {
      totalDettes += c.solde;
    } else {
      totalActifs += c.solde;
    }
  });

  return {
    totalActifs: round2(totalActifs),
    totalDettes: round2(totalDettes),
    valeurNette: round2(totalActifs + totalDettes),
    nombreComptes: comptes.length
  };
}

/**
 * Calcule le résumé budget mensuel
 */
function calculateBudgetSummary(budgetEntrees, budgetSorties, accounts) {
  const map = {};

  const addToMap = (items, type) => {
    (items || []).forEach(item => {
      const key = item.compte || 'Sans compte';
      if (!map[key]) map[key] = { nom: key, type: 'cheque', entreesMensuelles: 0, sortiesMensuelles: 0 };
      const mensuel = calcMensuel(item.montant, item.frequence);
      if (type === 'entrees') map[key].entreesMensuelles += mensuel;
      else map[key].sortiesMensuelles += mensuel;
    });
  };

  addToMap(budgetEntrees, 'entrees');
  addToMap(budgetSorties, 'sorties');

  // Enrichir avec type de compte
  const accsArr = accounts || [];
  Object.values(map).forEach(acc => {
    const found = accsArr.find(a => a.nom === acc.nom);
    if (found) acc.type = found.type || 'cheque';
  });

  // Calculer totaux
  let totalEntrees = 0;
  let totalSorties = 0;
  const parCompte = Object.values(map).map(acc => {
    totalEntrees += acc.entreesMensuelles;
    totalSorties += acc.sortiesMensuelles;
    return {
      nom: acc.nom,
      type: acc.type,
      entreesMensuelles: round2(acc.entreesMensuelles),
      sortiesMensuelles: round2(acc.sortiesMensuelles),
      balance: round2(acc.entreesMensuelles - acc.sortiesMensuelles)
    };
  });

  // Vérifier équilibre (même logique que communicationEmailService)
  const hasOrange = Object.values(map).some(acc => {
    const isCredit = isDebt(acc.type);
    if (isCredit) return (acc.sortiesMensuelles - acc.entreesMensuelles) > 0;
    return (acc.entreesMensuelles - acc.sortiesMensuelles) < 0;
  });

  return {
    totalEntreesMensuelles: round2(totalEntrees),
    totalSortiesMensuelles: round2(totalSorties),
    balanceMensuelle: round2(totalEntrees - totalSorties),
    status: hasOrange ? 'unbalanced' : 'balanced',
    parCompte
  };
}

/**
 * Calcule le progrès des objectifs (même logique que buildUserReport)
 */
function calculateGoalsProgress(financialGoals, accounts, soldes) {
  const goals = financialGoals || [];
  const accs = accounts || [];

  return goals.filter(goal => goal.compteAssocie && goal.montantCible).map(goal => {
    const soldeInfo = soldes.find(s => s.accountName === goal.compteAssocie);
    const currentBalance = parseFloat(soldeInfo?.solde) || 0;
    const targetAmount = parseFloat(goal.montantCible) || 0;
    if (targetAmount === 0) return null;

    const account = accs.find(a => a.nom === goal.compteAssocie);
    const isCredit = isDebt(account?.type);

    let progress;
    if (isCredit) {
      progress = currentBalance <= targetAmount ? 100 : Math.round((targetAmount / currentBalance) * 100);
    } else {
      progress = Math.min(Math.round((currentBalance / targetAmount) * 100), 100);
    }

    return {
      nom: goal.nom,
      montantCible: targetAmount,
      compteAssocie: goal.compteAssocie,
      soldeCourant: round2(currentBalance),
      progress: Math.max(0, progress),
      isReached: progress >= 100
    };
  }).filter(Boolean);
}

// ============================================
// TRAJECTOIRE 6 MOIS (serveur-side simplifié)
// ============================================

/**
 * Vérifie si une transaction se déclenche à une date donnée
 * (porté depuis budgetSegmentCalculator.js, simplifié)
 */
function isTransactionOnDate(item, date) {
  const frequence = (item.frequence || 'mensuel').toLowerCase();
  const jour = parseInt(item.jourDuMois) || parseInt(item.jourRecurrence) || 1;
  const dateDay = date.getDate();
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  // Gestion du jour > dernierJourDuMois (ex: jour 31 en février)
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

    case 'trimestriel':
      return checkDayMatch(jour) && date.getMonth() % 3 === 0;

    case 'semestriel':
      return checkDayMatch(jour) && (date.getMonth() === 0 || date.getMonth() === 6);

    case 'annuel':
      const mois = parseInt(item.moisRecurrence) || 0;
      return checkDayMatch(jour) && date.getMonth() === mois;

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

/**
 * Calcule la trajectoire financière sur 6 mois
 * Agrège par mois, détecte les alertes
 */
function calculateTrajectory6Months(accounts, soldes, budgetEntrees, budgetSorties) {
  const DAYS = 183; // ~6 mois
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Initialiser les soldes courants
  const runningBalances = {};
  accounts.forEach(acc => {
    const soldeInfo = soldes.find(s => s.accountName === acc.nom);
    runningBalances[acc.nom] = parseFloat(soldeInfo?.solde) || 0;
  });

  const monthsMap = new Map();
  const alertes = [];
  const alertesSeen = new Set(); // Dédupliquer par type+compte

  for (let i = 0; i < DAYS; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateStr = formatDateStr(currentDate);
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Initialiser le mois si nécessaire
    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, {
        monthKey,
        label: getMonthLabel(currentDate),
        comptes: {},
        _totalEntrees: {},
        _totalSorties: {}
      });
      accounts.forEach(acc => {
        monthsMap.get(monthKey).comptes[acc.nom] = { soldeFin: 0, totalEntrees: 0, totalSorties: 0 };
      });
    }

    const monthData = monthsMap.get(monthKey);

    // Appliquer les transactions du jour
    accounts.forEach(acc => {
      const isCredit = isDebt(acc.type);

      // Entrées pour ce compte ce jour
      const entreesJour = (budgetEntrees || []).filter(t =>
        t.compte === acc.nom && isTransactionOnDate(t, currentDate)
      );
      const sortiesJour = (budgetSorties || []).filter(t =>
        t.compte === acc.nom && isTransactionOnDate(t, currentDate)
      );

      const totalE = entreesJour.reduce((s, t) => s + (parseFloat(t.montant) || 0), 0);
      const totalS = sortiesJour.reduce((s, t) => s + (parseFloat(t.montant) || 0), 0);

      // Appliquer au solde courant
      if (isCredit) {
        runningBalances[acc.nom] = runningBalances[acc.nom] - totalE + totalS;
      } else {
        runningBalances[acc.nom] = runningBalances[acc.nom] + totalE - totalS;
      }

      // Accumuler pour le mois
      monthData.comptes[acc.nom].totalEntrees += totalE;
      monthData.comptes[acc.nom].totalSorties += totalS;
      monthData.comptes[acc.nom].soldeFin = round2(runningBalances[acc.nom]);

      // Détecter les alertes (1 par type+compte)
      const solde = runningBalances[acc.nom];

      // Découvert (actif < 0)
      if (!isCredit && solde < 0) {
        const alertKey = `overdraft_${acc.nom}`;
        if (!alertesSeen.has(alertKey)) {
          alertesSeen.add(alertKey);
          alertes.push({ type: 'overdraft', compte: acc.nom, dateStr, montant: round2(solde) });
        }
      }

      // Limite crédit dépassée (credit/marge)
      if ((acc.type === 'credit' || acc.type === 'marge') && acc.limite) {
        if (Math.abs(solde) > parseFloat(acc.limite)) {
          const alertKey = `limit_${acc.nom}`;
          if (!alertesSeen.has(alertKey)) {
            alertesSeen.add(alertKey);
            alertes.push({ type: 'limit', compte: acc.nom, dateStr, montant: round2(solde) });
          }
        }
      }

      // Seuil sécurité (chèque >= 0 mais < seuil)
      if (acc.type === 'cheque' && acc.seuilSecurite) {
        if (solde >= 0 && solde < parseFloat(acc.seuilSecurite)) {
          const alertKey = `threshold_${acc.nom}`;
          if (!alertesSeen.has(alertKey)) {
            alertesSeen.add(alertKey);
            alertes.push({ type: 'threshold', compte: acc.nom, dateStr, montant: round2(solde) });
          }
        }
      }
    });
  }

  // Calculer le portefeuille par mois
  const monthly = Array.from(monthsMap.values()).map(m => {
    let totalActifs = 0;
    let totalDettes = 0;

    accounts.forEach(acc => {
      const solde = m.comptes[acc.nom]?.soldeFin || 0;
      if (isDebt(acc.type)) totalDettes += solde;
      else totalActifs += solde;
    });

    // Arrondir les totaux par compte
    Object.keys(m.comptes).forEach(key => {
      m.comptes[key].totalEntrees = round2(m.comptes[key].totalEntrees);
      m.comptes[key].totalSorties = round2(m.comptes[key].totalSorties);
    });

    // Nettoyer les champs internes
    delete m._totalEntrees;
    delete m._totalSorties;

    return {
      ...m,
      portefeuille: {
        totalActifs: round2(totalActifs),
        totalDettes: round2(totalDettes),
        valeurNette: round2(totalActifs + totalDettes)
      }
    };
  });

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + DAYS);

  return {
    dateDebut: formatDateStr(today),
    dateFin: formatDateStr(endDate),
    monthly,
    alertes: alertes.slice(0, 10) // Max 10 alertes
  };
}

// ============================================
// SNAPSHOT PRINCIPAL
// ============================================

/**
 * Construit un snapshot financier complet pour un utilisateur
 * @param {string} userId
 * @returns {Object|null} financialSnapshot (~5-10KB JSON)
 */
async function buildFinancialSnapshot(userId) {
  const userData = await prisma.userData.findUnique({
    where: { userId }
  });

  if (!userData) return null;

  const accounts = parseJson(userData.accounts) || [];
  const initialBalances = parseJson(userData.initialBalances) || {};
  const budgetPlanning = parseJson(userData.budgetPlanning) || {};
  const financialGoals = parseJson(userData.financialGoals) || [];

  const soldes = initialBalances?.soldes || [];
  const budgetEntrees = budgetPlanning?.entrees || [];
  const budgetSorties = budgetPlanning?.sorties || [];

  // 1. COMPTES snapshot
  const comptes = accounts.map(acc => {
    const soldeInfo = soldes.find(s => s.accountName === acc.nom);
    return {
      nom: acc.nom,
      type: acc.type || 'cheque',
      solde: round2(parseFloat(soldeInfo?.solde) || 0),
      seuilSecurite: acc.seuilSecurite || null,
      limite: acc.limite || null,
      tauxInteret: acc.tauxInteret || null
    };
  });

  // 2. PORTEFEUILLE
  const portefeuille = calculatePortfolio(comptes);

  // 3. BUDGET
  const budget = calculateBudgetSummary(budgetEntrees, budgetSorties, accounts);

  // 4. OBJECTIFS
  const objectifs = calculateGoalsProgress(financialGoals, accounts, soldes);

  // 5. TRAJECTOIRE 6 MOIS
  const trajectoire6mois = calculateTrajectory6Months(accounts, soldes, budgetEntrees, budgetSorties);

  return {
    version: 1,
    snapshotDate: new Date().toISOString(),
    comptes,
    portefeuille,
    budget,
    objectifs,
    trajectoire6mois
  };
}

// ============================================
// COMPARAISONS HEBDOMADAIRES
// ============================================

/**
 * Formate un delta en "+500 $" ou "-200 $"
 */
function formatDelta(value, lang) {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const sign = value > 0 ? '↑ +' : '↓ -';
  return `${sign}${formatted} $`;
}

/**
 * Détermine la tendance
 */
function determineTrend(current, previous) {
  const diff = current - previous;
  if (Math.abs(diff) < 10) return 'stable';
  return diff > 0 ? 'improving' : 'declining';
}

/**
 * Génère 2-4 messages highlights humains
 */
function generateHighlights(current, previous, lang) {
  const highlights = [];

  // 1. Changement valeur nette
  const nvChange = current.portefeuille.valeurNette - previous.portefeuille.valeurNette;
  if (Math.abs(nvChange) > 10) {
    highlights.push({
      type: nvChange > 0 ? 'positive' : 'negative',
      icon: nvChange > 0 ? '📈' : '📉',
      text: lang === 'fr'
        ? `Valeur nette: ${formatDelta(nvChange, lang)} vs la semaine dernière`
        : `Net worth: ${formatDelta(nvChange, lang)} vs last week`
    });
  }

  // 2. Objectifs qui viennent d'être atteints
  current.objectifs.forEach(g => {
    const prev = previous.objectifs.find(p => p.nom === g.nom);
    if (g.isReached && prev && !prev.isReached) {
      highlights.push({
        type: 'achievement',
        icon: '🎯',
        text: lang === 'fr'
          ? `Objectif "${g.nom}" atteint!`
          : `Goal "${g.nom}" reached!`
      });
    }
  });

  // 3. Compte avec le plus gros changement positif
  const accountChanges = current.comptes.map(c => {
    const prev = previous.comptes.find(p => p.nom === c.nom);
    return { nom: c.nom, change: prev ? c.solde - prev.solde : 0 };
  }).filter(c => Math.abs(c.change) > 10);

  if (accountChanges.length > 0) {
    const best = accountChanges.reduce((a, b) => a.change > b.change ? a : b);
    if (best.change > 0) {
      highlights.push({
        type: 'positive',
        icon: '💰',
        text: lang === 'fr'
          ? `${best.nom}: ${formatDelta(best.change, lang)}`
          : `${best.nom}: ${formatDelta(best.change, lang)}`
      });
    }
  }

  // 4. Changement de statut budget
  if (current.budget.status !== previous.budget.status) {
    highlights.push({
      type: current.budget.status === 'balanced' ? 'positive' : 'warning',
      icon: current.budget.status === 'balanced' ? '✅' : '⚖️',
      text: lang === 'fr'
        ? (current.budget.status === 'balanced'
            ? 'Budget maintenant équilibré!'
            : 'Budget déséquilibré — un ajustement serait bénéfique')
        : (current.budget.status === 'balanced'
            ? 'Budget now balanced!'
            : 'Budget unbalanced — an adjustment would help')
    });
  }

  return highlights.slice(0, 4);
}

/**
 * Compare le snapshot actuel avec le précédent
 * @param {Object} current - Snapshot financier actuel
 * @param {Object} previous - Snapshot financier précédent
 * @param {string} lang - 'fr' | 'en'
 * @returns {Object|null} comparativeInsights
 */
function buildComparativeInsights(current, previous, lang = 'fr') {
  if (!previous || !current) return null;

  return {
    generatedAt: new Date().toISOString(),

    // Changements portefeuille
    portefeuille: {
      valeurNetteChange: round2(current.portefeuille.valeurNette - previous.portefeuille.valeurNette),
      totalActifsChange: round2(current.portefeuille.totalActifs - previous.portefeuille.totalActifs),
      totalDettesChange: round2(current.portefeuille.totalDettes - previous.portefeuille.totalDettes),
      trend: determineTrend(current.portefeuille.valeurNette, previous.portefeuille.valeurNette)
    },

    // Changements par compte
    comptesChanges: current.comptes.map(c => {
      const prev = previous.comptes.find(p => p.nom === c.nom);
      if (!prev) return { nom: c.nom, type: c.type, isNew: true, solde: c.solde };
      return {
        nom: c.nom,
        type: c.type,
        isNew: false,
        soldePrecedent: prev.solde,
        soldeCourant: c.solde,
        change: round2(c.solde - prev.solde),
        changePercent: prev.solde !== 0
          ? round2(((c.solde - prev.solde) / Math.abs(prev.solde)) * 100)
          : null
      };
    }),

    // Changements objectifs
    objectifsChanges: current.objectifs.map(g => {
      const prev = previous.objectifs.find(p => p.nom === g.nom);
      if (!prev) return { nom: g.nom, isNew: true, progress: g.progress };
      return {
        nom: g.nom,
        isNew: false,
        progressPrecedent: prev.progress,
        progressCourant: g.progress,
        progressChange: g.progress - prev.progress,
        justReached: g.isReached && !prev.isReached
      };
    }),

    // Changement budget
    budgetChange: {
      balanceMensuelleChange: round2(
        current.budget.balanceMensuelle - previous.budget.balanceMensuelle
      ),
      statusChanged: current.budget.status !== previous.budget.status,
      previousStatus: previous.budget.status,
      currentStatus: current.budget.status
    },

    // Messages highlights lisibles
    highlights: generateHighlights(current, previous, lang)
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  buildFinancialSnapshot,
  buildComparativeInsights,
  calculatePortfolio,
  calculateBudgetSummary,
  calculateGoalsProgress,
  calculateTrajectory6Months,
  getWeekStartDate,
  formatDelta,
  round2
};
