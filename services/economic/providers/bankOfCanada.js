// 🏦 PL4TO - Provider Banque du Canada (Valet API)
// Source: https://www.bankofcanada.ca/valet/docs
// Gratuit, sans clé API, JSON, mise à jour quotidienne

const axios = require('axios');

const BASE_URL = 'https://www.bankofcanada.ca/valet/observations';

// Séries à suivre
const BOC_SERIES = [
  {
    seriesKey: 'V122495',
    category: 'interest_rate',
    label_fr: 'Taux préférentiel',
    label_en: 'Prime Rate',
    unit: 'percent'
  },
  {
    seriesKey: 'V80691311',
    category: 'interest_rate',
    label_fr: 'Taux directeur',
    label_en: 'Policy Interest Rate',
    unit: 'percent'
  },
  {
    seriesKey: 'FXCADUSD',
    category: 'exchange_rate',
    label_fr: 'Taux de change CAD/USD',
    label_en: 'CAD/USD Exchange Rate',
    unit: 'cad_per_usd'
  }
];

/**
 * Récupère les dernières observations d'une série BOC
 * @param {string} seriesKey - Ex: "V122495", "FXCADUSD"
 * @param {number} recent - Nombre d'observations récentes
 * @returns {Array} [{date, value}]
 */
async function fetchSeries(seriesKey, recent = 5) {
  try {
    const url = `${BASE_URL}/${seriesKey}/json?recent=${recent}`;
    const response = await axios.get(url, { timeout: 10000 });

    const observations = response.data?.observations || [];

    return observations.map(obs => ({
      date: obs.d,
      value: parseFloat(obs[seriesKey]?.v) || null
    })).filter(o => o.value !== null);
  } catch (error) {
    console.error(`[🏦 BOC] Erreur fetch ${seriesKey}:`, error.message);
    return [];
  }
}

/**
 * Récupère toutes les séries BOC configurées
 * @returns {Array} [{seriesKey, category, label_fr, label_en, unit, observations: [{date, value}]}]
 */
async function fetchAllSeries() {
  const results = [];

  for (const series of BOC_SERIES) {
    const observations = await fetchSeries(series.seriesKey, 5);

    if (observations.length > 0) {
      results.push({
        ...series,
        source: 'boc',
        observations
      });
    }
  }

  console.log(`[🏦 BOC] ${results.length}/${BOC_SERIES.length} séries récupérées`);
  return results;
}

module.exports = { fetchAllSeries, fetchSeries, BOC_SERIES };
