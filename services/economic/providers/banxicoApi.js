// 📊 PL4TO - Provider Banxico (Sistema de Información Económica)
// Source: https://www.banxico.org.mx/SieAPIRest/service/v1/doc/
// Gratuit avec token (register: https://www.banxico.org.mx/SieAPIRest/)
// Équivalent de Banque du Canada pour les utilisateurs mexicains.
//
// Configuration: définir BANXICO_API_TOKEN dans l'environnement.
// Si absent: le provider log un warning et retourne [] (pas d'erreur).

const axios = require('axios');

const BANXICO_BASE_URL = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series';

// Séries nationales MX à suivre
// Doc: https://www.banxico.org.mx/SieAPIRest/service/v1/doc/catalogoSeries
const BANXICO_SERIES = [
  {
    seriesKey: 'SF43783',
    category: 'interest_rate',
    label_fr: 'Taux objectif Banxico',
    label_en: 'Banxico Policy Rate',
    label_es: 'Tasa objetivo Banxico',
    unit: 'percent'
  },
  {
    seriesKey: 'SF43718',
    category: 'interest_rate',
    label_fr: 'TIIE 28 jours',
    label_en: 'TIIE 28-day (interbank rate)',
    label_es: 'TIIE 28 días',
    unit: 'percent'
  },
  {
    seriesKey: 'SF63528',
    category: 'exchange_rate',
    label_fr: 'Taux de change USD/MXN',
    label_en: 'USD/MXN Exchange Rate (FIX)',
    label_es: 'Tipo de cambio USD/MXN (FIX)',
    unit: 'mxn_per_usd'
  },
  {
    seriesKey: 'SP74660',
    category: 'cpi',
    label_fr: 'IPC Global — Mexique',
    label_en: 'CPI All Items — Mexico',
    label_es: 'INPC General — México',
    unit: 'index'
  }
];

/**
 * Parse une date Banxico au format "DD/MM/YYYY" → ISO "YYYY-MM-DD"
 */
function parseBanxicoDate(dateStr) {
  if (!dateStr) return null;
  const [dd, mm, yyyy] = dateStr.split('/');
  if (!dd || !mm || !yyyy) return null;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

/**
 * Récupère les dernières observations d'une série Banxico
 * @param {string} seriesId - Ex: "SF43783"
 * @param {number} recent - Nombre d'observations récentes
 * @returns {Array<{date, value}>}
 */
async function fetchSeries(seriesId, recent = 6) {
  const token = process.env.BANXICO_API_TOKEN;
  if (!token) return [];
  try {
    // Banxico API: on demande les N dernières périodes disponibles via /oportuno
    // Puis on slice les `recent` dernières observations côté client.
    const url = `${BANXICO_BASE_URL}/${seriesId}/datos/oportuno`;
    const response = await axios.get(url, {
      headers: { 'Bmx-Token': token },
      timeout: 10000
    });

    const serie = response.data?.bmx?.series?.[0];
    const datos = serie?.datos || [];

    // Banxico renvoie les données en ordre chronologique (asc).
    // Valeurs "N/E" = no disponible → filtrer.
    return datos
      .filter(d => d.dato && d.dato !== 'N/E')
      .map(d => ({
        date: parseBanxicoDate(d.fecha),
        value: parseFloat(String(d.dato).replace(/,/g, ''))
      }))
      .filter(o => o.date && !isNaN(o.value))
      .slice(-recent); // N dernières observations
  } catch (error) {
    console.error(`[📊 Banxico] Erreur fetch ${seriesId}:`, error.message);
    return [];
  }
}

/**
 * Récupère toutes les séries Banxico configurées.
 * Retourne [] silencieusement si BANXICO_API_TOKEN n'est pas défini.
 * @returns {Array} [{seriesKey, category, label_fr, label_en, unit, observations, source:'banxico'}]
 */
async function fetchAllSeries() {
  if (!process.env.BANXICO_API_TOKEN) {
    console.log('[📊 Banxico] BANXICO_API_TOKEN non défini — skip fetch MX');
    return [];
  }

  const results = [];
  for (const series of BANXICO_SERIES) {
    const observations = await fetchSeries(series.seriesKey, 6);
    if (observations.length > 0) {
      results.push({
        ...series,
        source: 'banxico',
        observations
      });
    }
  }

  console.log(`[📊 Banxico] ${results.length}/${BANXICO_SERIES.length} séries récupérées`);
  return results;
}

module.exports = { fetchAllSeries, fetchSeries, BANXICO_SERIES };
