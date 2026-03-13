// 🔔 PL4TO - Générateur d'alertes économiques
// Match les indicateurs économiques avec le budget des utilisateurs
// Utilise la même logique de classification que le frontend (classifyBudgetItem)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Seuils de déclenchement d'alertes
const THRESHOLDS = {
  interest_rate: { minChange: 0.25, type: 'absolute' },  // ≥ 0.25% de changement absolu
  fuel:          { minChange: 5,    type: 'percent' },    // ≥ 5% de changement
  food:          { minChange: 2,    type: 'percent' },    // ≥ 2% de changement
  transport:     { minChange: 3,    type: 'percent' },    // ≥ 3% de changement
  cpi:           { minChange: 3,    type: 'percent' },    // ≥ 3% de changement
  exchange_rate: { minChange: 3,    type: 'percent' }     // ≥ 3% de changement
};

// Mapping: catégorie indicateur → catégories budget impactées
const CATEGORY_IMPACT_MAP = {
  interest_rate: ['shelter', 'debt'],     // Hypothèque, marge, prêt
  fuel:          ['transport'],            // Essence, auto
  food:          ['food'],                 // Épicerie, alimentation
  transport:     ['transport'],            // Transport en général
  cpi:           [],                       // Info générale (pas d'alerte spécifique)
  exchange_rate: []                        // Info générale
};

// Mots-clés budget pour détecter les catégories (miroir du frontend classifyBudgetItem)
const BUDGET_KEYWORDS = {
  shelter: ['loyer', 'rent', 'hypothèque', 'hypotheque', 'mortgage', 'logement', 'housing'],
  food: ['épicerie', 'epicerie', 'grocery', 'alimentation', 'food', 'marché', 'supermarché', 'iga', 'metro', 'maxi', 'provigo', 'costco', 'nourriture', 'walmart'],
  transport: ['essence', 'gas', 'transport', 'auto', 'voiture', 'car', 'stm', 'opus', 'bus', 'stationnement', 'parking'],
  debt: ['remboursement', 'paiement carte', 'visa', 'mastercard', 'prêt', 'pret', 'loan', 'crédit', 'credit', 'dette', 'debt', 'marge'],
  utilities: ['hydro', 'électricité', 'electricite', 'internet', 'téléphone', 'telephone', 'chauffage']
};

/**
 * Classifie un item de budget (version serveur simplifiée)
 */
function classifyBudgetCategory(description) {
  const nom = (description || '').toLowerCase().trim();
  for (const [category, keywords] of Object.entries(BUDGET_KEYWORDS)) {
    if (keywords.some(kw => nom.includes(kw))) return category;
  }
  return null;
}

/**
 * Calcule l'impact mensuel estimé d'un changement de prix
 */
function estimateMonthlyImpact(budgetItem, changePercent) {
  const montant = parseFloat(budgetItem.montant) || 0;
  const freq = (budgetItem.frequence || '').toLowerCase();

  // Convertir en mensuel
  let mensuel = montant;
  if (freq.includes('hebdo') || freq.includes('weekly') || freq === 'hebdomadaire') mensuel = montant * 4.33;
  else if (freq.includes('bi') || freq === 'bi-hebdomadaire' || freq === 'aux2semaines') mensuel = montant * 2.17;
  else if (freq.includes('quot') || freq.includes('daily') || freq === 'quotidien') mensuel = montant * 30;
  else if (freq.includes('annu') || freq.includes('yearly') || freq === 'annuel') mensuel = montant / 12;

  return Math.round(mensuel * (changePercent / 100) * 100) / 100;
}

/**
 * Génère des alertes pour tous les utilisateurs impactés par un changement d'indicateur
 * @param {Object} indicator - L'indicateur qui a changé (depuis EconomicIndicator)
 */
async function generateAlertsForIndicator(indicator) {
  const { category, changePercent, value, label_fr, label_en, unit } = indicator;

  // Vérifier si le changement dépasse le seuil
  const threshold = THRESHOLDS[category];
  if (!threshold) return { generated: 0 };

  const change = parseFloat(changePercent) || 0;
  if (threshold.type === 'absolute' && Math.abs(change) < threshold.minChange) return { generated: 0 };
  if (threshold.type === 'percent' && Math.abs(change) < threshold.minChange) return { generated: 0 };

  // Quelles catégories budget sont impactées?
  const impactedCategories = CATEGORY_IMPACT_MAP[category] || [];
  if (impactedCategories.length === 0) return { generated: 0 };

  // Récupérer tous les utilisateurs avec un budget
  const usersWithBudget = await prisma.userData.findMany({
    where: { budgetPlanning: { not: null } },
    select: { userId: true, budgetPlanning: true }
  });

  const isIncrease = change > 0;
  const direction = isIncrease ? 'increase' : 'decrease';
  const alertType = `${category === 'interest_rate' ? 'rate' : 'price'}_${direction}`;
  const severity = isIncrease ? 'warning' : 'positive';
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

  let generated = 0;

  for (const userData of usersWithBudget) {
    const budget = userData.budgetPlanning;
    const sorties = budget?.sorties || [];
    const entrees = budget?.entrees || [];
    const allItems = [...sorties, ...entrees];

    // Trouver les items de budget qui matchent les catégories impactées
    const matchedItems = allItems.filter(item => {
      const budgetCat = classifyBudgetCategory(item.description || item.nom);
      return impactedCategories.includes(budgetCat);
    });

    if (matchedItems.length === 0) continue;

    // Calculer l'impact total
    let totalImpact = 0;
    for (const item of matchedItems) {
      totalImpact += estimateMonthlyImpact(item, Math.abs(change));
    }

    // Vérifier qu'on n'a pas déjà envoyé une alerte similaire récemment (7 jours)
    const recentAlert = await prisma.economicAlert.findFirst({
      where: {
        userId: userData.userId,
        indicatorCategory: category,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    if (recentAlert) continue;

    // Formater les valeurs pour le message
    const formattedValue = unit === 'percent' ? `${value}%`
      : unit === 'cents_per_litre' ? `${value}¢/L`
      : unit === 'index' ? `${value}`
      : `${value}`;

    const absChange = Math.abs(change).toFixed(1);
    const impactStr = totalImpact > 0 ? totalImpact.toFixed(2) : null;

    // Générer les messages
    const messages = generateMessages(category, isIncrease, formattedValue, absChange, impactStr);

    await prisma.economicAlert.create({
      data: {
        userId: userData.userId,
        indicatorCategory: category,
        budgetCategory: impactedCategories[0],
        alertType,
        severity,
        message_fr: messages.fr,
        message_en: messages.en,
        impactEstimate: totalImpact > 0 ? totalImpact : null,
        expiresAt
      }
    });

    generated++;
  }

  return { generated, alertType, category };
}

/**
 * Génère les messages d'alerte bilingues
 */
function generateMessages(category, isIncrease, formattedValue, changePercent, impact) {
  const arrow = isIncrease ? '📈' : '📉';
  const impactFr = impact ? ` (~${isIncrease ? '+' : '-'}${impact}$/mois)` : '';
  const impactEn = impact ? ` (~${isIncrease ? '+' : '-'}$${impact}/mo)` : '';

  const templates = {
    interest_rate: {
      fr: `${arrow} Le taux préférentiel est à ${formattedValue}${isIncrease ? '. Tes paiements à taux variable pourraient augmenter' : '. Bonne nouvelle pour tes emprunts'}${impactFr}.`,
      en: `${arrow} The prime rate is at ${formattedValue}${isIncrease ? '. Your variable-rate payments could increase' : '. Good news for your loans'}${impactEn}.`
    },
    fuel: {
      fr: `${arrow} L'essence au Québec est à ${formattedValue} (${isIncrease ? '+' : '-'}${changePercent}%). Ton budget transport pourrait être affecté${impactFr}.`,
      en: `${arrow} Gas in Quebec is at ${formattedValue} (${isIncrease ? '+' : '-'}${changePercent}%). Your transport budget could be affected${impactEn}.`
    },
    food: {
      fr: `${arrow} Les prix alimentaires au Québec ont ${isIncrease ? 'augmenté' : 'diminué'} de ${changePercent}%. Ton budget épicerie pourrait nécessiter un ajustement${impactFr}.`,
      en: `${arrow} Food prices in Quebec have ${isIncrease ? 'increased' : 'decreased'} by ${changePercent}%. Your grocery budget may need adjusting${impactEn}.`
    },
    transport: {
      fr: `${arrow} L'indice des prix du transport au Québec a ${isIncrease ? 'augmenté' : 'diminué'} de ${changePercent}%. Ton budget transport pourrait être affecté${impactFr}.`,
      en: `${arrow} The transport price index in Quebec has ${isIncrease ? 'increased' : 'decreased'} by ${changePercent}%. Your transport budget could be affected${impactEn}.`
    }
  };

  return templates[category] || {
    fr: `${arrow} Indicateur économique: ${formattedValue} (${isIncrease ? '+' : '-'}${changePercent}%)`,
    en: `${arrow} Economic indicator: ${formattedValue} (${isIncrease ? '+' : '-'}${changePercent}%)`
  };
}

/**
 * Nettoie les alertes expirées
 */
async function cleanExpiredAlerts() {
  const result = await prisma.economicAlert.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
  if (result.count > 0) {
    console.log(`[🧹 ECON] ${result.count} alertes expirées supprimées`);
  }
  return result.count;
}

module.exports = { generateAlertsForIndicator, cleanExpiredAlerts, classifyBudgetCategory };
