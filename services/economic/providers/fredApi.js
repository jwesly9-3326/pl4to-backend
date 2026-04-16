// 📊 PL4TO - Provider FRED (Federal Reserve Economic Data)
// Source: https://fred.stlouisfed.org/docs/api/fred/
// Gratuit avec clé API (register: https://fred.stlouisfed.org/docs/api/api_key.html)
// Équivalent de Banque du Canada pour les utilisateurs américains.
//
// Configuration: définir FRED_API_KEY dans l'environnement.
// Si absent: le provider log un warning et retourne [] (pas d'erreur).

const axios = require('axios');

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

// Séries nationales US à suivre
// Doc: https://fred.stlouisfed.org/tags/series
const FRED_SERIES = [
  {
    seriesKey: 'FEDFUNDS',
    category: 'interest_rate',
    label_fr: 'Taux des fonds fédéraux',
    label_en: 'Federal Funds Effective Rate',
    unit: 'percent',
    frequency: 'monthly'
  },
  {
    seriesKey: 'MORTGAGE30US',
    category: 'interest_rate',
    label_fr: 'Taux hypothécaire fixe 30 ans',
    label_en: '30-Year Fixed Rate Mortgage Average',
    unit: 'percent',
    frequency: 'weekly'
  },
  {
    seriesKey: 'CPIAUCSL',
    category: 'cpi',
    label_fr: 'IPC Global — États-Unis',
    label_en: 'CPI All Items — US',
    unit: 'index',
    frequency: 'monthly'
  },
  {
    seriesKey: 'CUUR0000SAF1',
    category: 'food',
    label_fr: 'IPC Alimentation — États-Unis',
    label_en: 'CPI Food — US',
    unit: 'index',
    frequency: 'monthly'
  },
  {
    seriesKey: 'GASREGW',
    category: 'fuel',
    label_fr: 'Essence régulière — moyenne US',
    label_en: 'Regular Gasoline — US Weekly Avg',
    unit: 'usd_per_gallon',
    frequency: 'weekly'
  },
  {
    seriesKey: 'DEXCAUS',
    category: 'exchange_rate',
    label_fr: 'Taux de change USD/CAD',
    label_en: 'USD/CAD Exchange Rate',
    unit: 'cad_per_usd',
    frequency: 'daily'
  }
];

/**
 * Récupère les dernières observations d'une série FRED
 * @param {string} seriesId - Ex: "FEDFUNDS", "MORTGAGE30US"
 * @param {number} limit - Nombre d'observations récentes
 * @returns {Array<{date, value}>}
 */
async function fetchSeries(seriesId, limit = 6) {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return [];
  try {
    const response = await axios.get(FRED_BASE_URL, {
      params: {
        series_id: seriesId,
        api_key: apiKey,
        file_type: 'json',
        sort_order: 'desc',
        limit
      },
      timeout: 10000
    });
    const observations = response.data?.observations || [];
    // FRED renvoie '.' pour les valeurs manquantes → filtrer
    return observations
      .map(obs => ({ date: obs.date, value: parseFloat(obs.value) }))
      .filter(o => !isNaN(o.value))
      .reverse(); // FRED envoie en desc — on veut l'ordre chronologique (asc)
  } catch (error) {
    console.error(`[📊 FRED] Erreur fetch ${seriesId}:`, error.message);
    return [];
  }
}

/**
 * Récupère toutes les séries FRED configurées.
 * Retourne [] silencieusement si FRED_API_KEY n'est pas défini.
 * @returns {Array} [{seriesKey, category, label_fr, label_en, unit, observations, source:'fred'}]
 */
async function fetchAllSeries() {
  if (!process.env.FRED_API_KEY) {
    console.log('[📊 FRED] FRED_API_KEY non défini — skip fetch US');
    return [];
  }

  const results = [];
  for (const series of FRED_SERIES) {
    const observations = await fetchSeries(series.seriesKey, 6);
    if (observations.length > 0) {
      results.push({
        ...series,
        source: 'fred',
        observations
      });
    }
  }

  console.log(`[📊 FRED] ${results.length}/${FRED_SERIES.length} séries récupérées`);
  return results;
}

module.exports = { fetchAllSeries, fetchSeries, FRED_SERIES };
