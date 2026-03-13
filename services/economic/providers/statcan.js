// 📊 PL4TO - Provider Statistique Canada (Web Data Service)
// Source: https://www.statcan.gc.ca/en/developers/wds
// Gratuit, sans clé API, POST JSON, mise à jour mensuelle

const axios = require('axios');

const WDS_URL = 'https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods';

// Vecteurs à suivre (Québec)
const STATCAN_VECTORS = [
  {
    vectorId: 735083,
    seriesKey: 'SC_735083',
    category: 'fuel',
    label_fr: 'Essence régulière — Québec',
    label_en: 'Regular Gasoline — Quebec',
    unit: 'cents_per_litre'
  },
  {
    vectorId: 41690973,
    seriesKey: 'SC_41690973',
    category: 'cpi',
    label_fr: 'IPC Global — Québec',
    label_en: 'CPI All Items — Quebec',
    unit: 'index'
  },
  {
    vectorId: 41690978,
    seriesKey: 'SC_41690978',
    category: 'food',
    label_fr: 'IPC Alimentation — Québec',
    label_en: 'CPI Food — Quebec',
    unit: 'index'
  },
  {
    vectorId: 41691033,
    seriesKey: 'SC_41691033',
    category: 'transport',
    label_fr: 'IPC Transport — Québec',
    label_en: 'CPI Transportation — Quebec',
    unit: 'index'
  }
];

/**
 * Récupère les données de Statistique Canada via WDS
 * @param {number} latestN - Nombre de périodes récentes
 * @returns {Array} [{seriesKey, category, label_fr, label_en, unit, observations}]
 */
async function fetchAllVectors(latestN = 6) {
  try {
    const payload = STATCAN_VECTORS.map(v => ({
      vectorId: v.vectorId,
      latestN
    }));

    const response = await axios.post(WDS_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    const results = [];

    for (let i = 0; i < response.data.length; i++) {
      const item = response.data[i];
      const config = STATCAN_VECTORS[i];

      if (item.status === 'SUCCESS' && item.object?.vectorDataPoint) {
        const observations = item.object.vectorDataPoint
          .filter(dp => dp.value !== null)
          .map(dp => ({
            date: dp.refPer, // "2026-01-01"
            value: dp.value
          }));

        if (observations.length > 0) {
          results.push({
            ...config,
            source: 'statcan',
            observations
          });
        }
      }
    }

    console.log(`[📊 StatCan] ${results.length}/${STATCAN_VECTORS.length} vecteurs récupérés`);
    return results;
  } catch (error) {
    console.error(`[📊 StatCan] Erreur fetch:`, error.message);
    return [];
  }
}

module.exports = { fetchAllVectors, STATCAN_VECTORS };
