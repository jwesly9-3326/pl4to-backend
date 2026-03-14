// 📊 PL4TO - Benchmarks Québec (Statistique Canada)
// Source: Enquête sur les dépenses des ménages (EDM), table 11-10-0222-01
// Données: 2023 (publiées mai 2025)
// Moyenne québécoise: ~65 344$/an
// Les données sont annuelles — hardcodées et mises à jour 1x/an

const QUEBEC_BENCHMARKS = {
  year: 2023,
  source: 'Statistique Canada, EDM table 11-10-0222-01',
  sourceUrl: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1110022201',
  province: 'Quebec',
  householdAvgAnnual: 65344,
  householdAvgMonthly: 5445,
  categories: {
    shelter: {
      monthly: 1483,
      annual: 17800,
      pctOfTotal: 27.2,
      label_fr: 'Logement',
      label_en: 'Shelter',
      icon: '🏠',
      detail_fr: 'Loyer, hypothèque, taxes foncières, entretien',
      detail_en: 'Rent, mortgage, property taxes, maintenance'
    },
    food: {
      monthly: 642,
      annual: 7700,
      pctOfTotal: 11.8,
      label_fr: 'Alimentation (épicerie)',
      label_en: 'Food (groceries)',
      icon: '🍎',
      detail_fr: 'Épicerie, supermarché, marché',
      detail_en: 'Groceries, supermarket, market'
    },
    transport: {
      monthly: 858,
      annual: 10300,
      pctOfTotal: 15.8,
      label_fr: 'Transport',
      label_en: 'Transportation',
      icon: '🚗',
      detail_fr: 'Auto, essence, assurance auto, transport en commun',
      detail_en: 'Car, gas, auto insurance, public transit'
    },
    utilities: {
      monthly: 458,
      annual: 5500,
      pctOfTotal: 8.4,
      label_fr: 'Services publics',
      label_en: 'Utilities & telecom',
      icon: '💡',
      detail_fr: 'Électricité, gaz, internet, téléphone',
      detail_en: 'Electricity, gas, internet, phone'
    },
    insurance: {
      monthly: 125,
      annual: 1500,
      pctOfTotal: 2.3,
      label_fr: 'Assurances',
      label_en: 'Insurance',
      icon: '🛡️',
      detail_fr: 'Assurance habitation, vie, invalidité',
      detail_en: 'Home, life, disability insurance'
    },
    health: {
      monthly: 233,
      annual: 2800,
      pctOfTotal: 4.3,
      label_fr: 'Soins de santé',
      label_en: 'Healthcare',
      icon: '💊',
      detail_fr: 'Pharmacie, médicaments, dentiste, optométriste',
      detail_en: 'Pharmacy, medications, dentist, optometrist'
    },
    dining_out: {
      monthly: 208,
      annual: 2500,
      pctOfTotal: 3.8,
      label_fr: 'Restaurants',
      label_en: 'Restaurants',
      icon: '🍽️',
      detail_fr: 'Restaurants, cafés, livraison',
      detail_en: 'Restaurants, cafes, delivery'
    },
    entertainment: {
      monthly: 300,
      annual: 3600,
      pctOfTotal: 5.5,
      label_fr: 'Loisirs et divertissement',
      label_en: 'Recreation & entertainment',
      icon: '🎨',
      detail_fr: 'Cinéma, sport, streaming, abonnements, jeux',
      detail_en: 'Movies, sports, streaming, subscriptions, gaming'
    },
    shopping: {
      monthly: 217,
      annual: 2600,
      pctOfTotal: 4.0,
      label_fr: 'Vêtements et chaussures',
      label_en: 'Clothing & footwear',
      icon: '🛍️',
      detail_fr: 'Vêtements, chaussures, accessoires',
      detail_en: 'Clothing, shoes, accessories'
    },
    childcare: {
      monthly: 133,
      annual: 1600,
      pctOfTotal: 2.4,
      label_fr: 'Éducation et garderie',
      label_en: 'Education & childcare',
      icon: '👶',
      detail_fr: 'Garderie, frais scolaires, fournitures',
      detail_en: 'Daycare, school fees, supplies'
    },
    giving: {
      monthly: 150,
      annual: 1800,
      pctOfTotal: 2.8,
      label_fr: 'Dons et contributions',
      label_en: 'Gifts & charity',
      icon: '❤️',
      detail_fr: 'Dons de bienfaisance, contributions',
      detail_en: 'Charitable donations, contributions'
    },
    beauty: {
      monthly: 100,
      annual: 1200,
      pctOfTotal: 1.8,
      label_fr: 'Soins personnels',
      label_en: 'Personal care',
      icon: '💈',
      detail_fr: 'Coiffure, esthétique, produits de beauté',
      detail_en: 'Hair, beauty, personal care products'
    }
  }
};

// Mapping: catégories PL4TO (budgetIntelligence.js) → catégories benchmark
// streaming, fitness, gaming sont fusionnés dans entertainment
const PLATO_TO_BENCHMARK = {
  shelter: 'shelter',
  food: 'food',
  transport: 'transport',
  utilities: 'utilities',
  insurance: 'insurance',
  health: 'health',
  childcare: 'childcare',
  dining_out: 'dining_out',
  entertainment: 'entertainment',
  shopping: 'shopping',
  giving: 'giving',
  beauty: 'beauty',
  // Fusionnés dans entertainment
  streaming: 'entertainment',
  fitness: 'entertainment',
  gaming: 'entertainment',
  // Pas de benchmark pour ces catégories
  debt: null,
  savings: null
};

/**
 * Retourne les données benchmark du Québec
 * @returns {object} Benchmarks avec catégories et mapping
 */
function getQuebecBenchmarks() {
  return {
    ...QUEBEC_BENCHMARKS,
    categoryMapping: PLATO_TO_BENCHMARK
  };
}

module.exports = { getQuebecBenchmarks, QUEBEC_BENCHMARKS, PLATO_TO_BENCHMARK };
