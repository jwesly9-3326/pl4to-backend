// 📊 PL4TO - Benchmarks Canada par province (Statistique Canada)
// Source: Enquête sur les dépenses des ménages (EDM), table 11-10-0222-01
// Baseline: Québec 2023 (publié mai 2025). Les autres provinces sont
// dérivées par un multiplicateur de coût de vie basé sur 4 catégories
// clés (logement, épicerie, transport, services publics) — approximation
// pragmatique en attendant des données détaillées par province pour
// chacune des 12 catégories de l'EDM.

// ============================================================
// BASELINE QUÉBEC — données complètes StatCan EDM 2023
// ============================================================
const QUEBEC_BASELINE = {
  year: 2023,
  source: 'Statistique Canada, EDM table 11-10-0222-01',
  sourceUrl: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1110022201',
  province: 'QC',
  provinceName_fr: 'Québec',
  provinceName_en: 'Quebec',
  householdAvgAnnual: 65344,
  householdAvgMonthly: 5445,
  categories: {
    shelter: {
      monthly: 1483, annual: 17800, pctOfTotal: 27.2,
      label_fr: 'Logement', label_en: 'Shelter', icon: '🏠',
      detail_fr: 'Loyer, hypothèque, taxes foncières, entretien',
      detail_en: 'Rent, mortgage, property taxes, maintenance'
    },
    food: {
      monthly: 642, annual: 7700, pctOfTotal: 11.8,
      label_fr: 'Alimentation (épicerie)', label_en: 'Food (groceries)', icon: '🍎',
      detail_fr: 'Épicerie, supermarché, marché',
      detail_en: 'Groceries, supermarket, market'
    },
    transport: {
      monthly: 858, annual: 10300, pctOfTotal: 15.8,
      label_fr: 'Transport', label_en: 'Transportation', icon: '🚗',
      detail_fr: 'Auto, essence, assurance auto, transport en commun',
      detail_en: 'Car, gas, auto insurance, public transit'
    },
    utilities: {
      monthly: 458, annual: 5500, pctOfTotal: 8.4,
      label_fr: 'Services publics', label_en: 'Utilities & telecom', icon: '💡',
      detail_fr: 'Électricité, gaz, internet, téléphone',
      detail_en: 'Electricity, gas, internet, phone'
    },
    insurance: {
      monthly: 125, annual: 1500, pctOfTotal: 2.3,
      label_fr: 'Assurances', label_en: 'Insurance', icon: '🛡️',
      detail_fr: 'Assurance habitation, vie, invalidité',
      detail_en: 'Home, life, disability insurance'
    },
    health: {
      monthly: 233, annual: 2800, pctOfTotal: 4.3,
      label_fr: 'Soins de santé', label_en: 'Healthcare', icon: '💊',
      detail_fr: 'Pharmacie, médicaments, dentiste, optométriste',
      detail_en: 'Pharmacy, medications, dentist, optometrist'
    },
    dining_out: {
      monthly: 208, annual: 2500, pctOfTotal: 3.8,
      label_fr: 'Restaurants', label_en: 'Restaurants', icon: '🍽️',
      detail_fr: 'Restaurants, cafés, livraison',
      detail_en: 'Restaurants, cafes, delivery'
    },
    entertainment: {
      monthly: 300, annual: 3600, pctOfTotal: 5.5,
      label_fr: 'Loisirs et divertissement', label_en: 'Recreation & entertainment', icon: '🎨',
      detail_fr: 'Cinéma, sport, streaming, abonnements, jeux',
      detail_en: 'Movies, sports, streaming, subscriptions, gaming'
    },
    shopping: {
      monthly: 217, annual: 2600, pctOfTotal: 4.0,
      label_fr: 'Vêtements et chaussures', label_en: 'Clothing & footwear', icon: '🛍️',
      detail_fr: 'Vêtements, chaussures, accessoires',
      detail_en: 'Clothing, shoes, accessories'
    },
    childcare: {
      monthly: 133, annual: 1600, pctOfTotal: 2.4,
      label_fr: 'Éducation et garderie', label_en: 'Education & childcare', icon: '👶',
      detail_fr: 'Garderie, frais scolaires, fournitures',
      detail_en: 'Daycare, school fees, supplies'
    },
    giving: {
      monthly: 150, annual: 1800, pctOfTotal: 2.8,
      label_fr: 'Dons et contributions', label_en: 'Gifts & charity', icon: '❤️',
      detail_fr: 'Dons de bienfaisance, contributions',
      detail_en: 'Charitable donations, contributions'
    },
    beauty: {
      monthly: 100, annual: 1200, pctOfTotal: 1.8,
      label_fr: 'Soins personnels', label_en: 'Personal care', icon: '💈',
      detail_fr: 'Coiffure, esthétique, produits de beauté',
      detail_en: 'Hair, beauty, personal care products'
    }
  }
};

// ============================================================
// MOYENNES par province — 4 catégories clés ($/mois, personne seule)
// Source: StatCan 2025. Utilisées pour calculer le multiplicateur
// de coût de vie vs Québec (ratio de la somme).
// ============================================================
const PROVINCE_KEY_AVERAGES = {
  QC: { housing: 1200, groceries: 350, transport: 200, utilities: 150 },
  ON: { housing: 1600, groceries: 400, transport: 250, utilities: 180 },
  BC: { housing: 1800, groceries: 380, transport: 220, utilities: 170 },
  AB: { housing: 1400, groceries: 370, transport: 230, utilities: 200 },
  SK: { housing: 1100, groceries: 360, transport: 210, utilities: 190 },
  MB: { housing: 1150, groceries: 350, transport: 200, utilities: 180 },
  NB: { housing: 950,  groceries: 340, transport: 195, utilities: 170 },
  NS: { housing: 1050, groceries: 345, transport: 200, utilities: 175 },
  PE: { housing: 900,  groceries: 340, transport: 190, utilities: 165 },
  NL: { housing: 950,  groceries: 360, transport: 205, utilities: 180 }
};

const PROVINCE_NAMES = {
  QC: { fr: 'Québec',                   en: 'Quebec' },
  ON: { fr: 'Ontario',                  en: 'Ontario' },
  BC: { fr: 'Colombie-Britannique',     en: 'British Columbia' },
  AB: { fr: 'Alberta',                  en: 'Alberta' },
  SK: { fr: 'Saskatchewan',             en: 'Saskatchewan' },
  MB: { fr: 'Manitoba',                 en: 'Manitoba' },
  NB: { fr: 'Nouveau-Brunswick',        en: 'New Brunswick' },
  NS: { fr: 'Nouvelle-Écosse',          en: 'Nova Scotia' },
  PE: { fr: 'Île-du-Prince-Édouard',    en: 'Prince Edward Island' },
  NL: { fr: 'Terre-Neuve-et-Labrador',  en: 'Newfoundland and Labrador' }
};

/**
 * Calcule le multiplicateur de coût de vie d'une province vs Québec
 * basé sur la somme de 4 catégories clés.
 * @param {string} province - code ISO province (QC, ON, BC, etc.)
 * @returns {number} multiplicateur (ex: 1.0 pour QC, ~1.3 pour BC)
 */
function getCostOfLivingMultiplier(province) {
  const qc = PROVINCE_KEY_AVERAGES.QC;
  const target = PROVINCE_KEY_AVERAGES[province];
  if (!target || !qc) return 1;
  const sum = (a) => (a.housing || 0) + (a.groceries || 0) + (a.transport || 0) + (a.utilities || 0);
  const qcSum = sum(qc);
  if (qcSum <= 0) return 1;
  return sum(target) / qcSum;
}

// ============================================================
// Mapping: catégories PL4TO → catégories benchmark
// streaming, fitness, gaming sont fusionnés dans entertainment
// ============================================================
const PLATO_TO_BENCHMARK = {
  shelter: 'shelter', food: 'food', transport: 'transport',
  utilities: 'utilities', insurance: 'insurance', health: 'health',
  childcare: 'childcare', dining_out: 'dining_out', entertainment: 'entertainment',
  shopping: 'shopping', giving: 'giving', beauty: 'beauty',
  // Fusionnés dans entertainment
  streaming: 'entertainment', fitness: 'entertainment', gaming: 'entertainment',
  // Pas de benchmark
  debt: null, savings: null
};

/**
 * Retourne les benchmarks scalés pour une province donnée.
 * La baseline détaillée est le QC (StatCan EDM 2023); les autres provinces
 * sont dérivées par multiplicateur de coût de vie.
 * @param {string} province - Code ISO (défaut: 'QC')
 * @returns {object} Benchmarks scalés + métadonnées
 */
function getCanadaBenchmarks(province = 'QC') {
  const normalized = (province || 'QC').toUpperCase();
  const multiplier = getCostOfLivingMultiplier(normalized);
  const provinceKnown = PROVINCE_NAMES[normalized];

  // Scaler chaque catégorie du baseline QC par le multiplicateur
  const scaledCategories = {};
  for (const [key, cat] of Object.entries(QUEBEC_BASELINE.categories)) {
    scaledCategories[key] = {
      ...cat,
      monthly: Math.round(cat.monthly * multiplier),
      annual: Math.round(cat.annual * multiplier)
    };
  }

  return {
    year: QUEBEC_BASELINE.year,
    source: QUEBEC_BASELINE.source,
    sourceUrl: QUEBEC_BASELINE.sourceUrl,
    province: provinceKnown ? normalized : 'QC',
    provinceName_fr: provinceKnown?.fr || QUEBEC_BASELINE.provinceName_fr,
    provinceName_en: provinceKnown?.en || QUEBEC_BASELINE.provinceName_en,
    multiplier: Math.round(multiplier * 1000) / 1000,
    householdAvgAnnual: Math.round(QUEBEC_BASELINE.householdAvgAnnual * multiplier),
    householdAvgMonthly: Math.round(QUEBEC_BASELINE.householdAvgMonthly * multiplier),
    categories: scaledCategories,
    categoryMapping: PLATO_TO_BENCHMARK
  };
}

/**
 * Backward compat — retourne les benchmarks du Québec uniquement.
 * @deprecated Utiliser getCanadaBenchmarks('QC') à la place.
 */
function getQuebecBenchmarks() {
  return getCanadaBenchmarks('QC');
}

module.exports = {
  getCanadaBenchmarks,
  getQuebecBenchmarks,
  getCostOfLivingMultiplier,
  QUEBEC_BASELINE,
  PROVINCE_KEY_AVERAGES,
  PROVINCE_NAMES,
  PLATO_TO_BENCHMARK
};
