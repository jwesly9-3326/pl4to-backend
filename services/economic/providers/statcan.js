// 📊 PL4TO - Provider Statistique Canada (Web Data Service)
// Source: https://www.statcan.gc.ca/en/developers/wds
// Gratuit, sans clé API, POST JSON, mise à jour mensuelle
//
// Vecteurs par province canadienne:
//   - Gasoline: table 18-10-0001 (city-level) → ville majeure par province
//   - CPI:      table 18-10-0004 (province-level)
// Tous les vectorId ont été vérifiés via getSeriesInfoFromCubePidCoord (avril 2026).

const axios = require('axios');

const WDS_URL = 'https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods';

// Mapping province → 4 vecteurs (fuel, cpi, food, transport)
// La clé `seriesKey` encode la région pour que le endpoint /economic/indicators
// puisse filtrer par user.region via un simple `contains`.
const REGIONAL_VECTORS = {
  QC: [
    { vectorId: 735096,   category: 'fuel',      label_fr: 'Essence régulière — Montréal', label_en: 'Regular Gasoline — Montreal', unit: 'cents_per_litre' },
    { vectorId: 41691783, category: 'cpi',       label_fr: 'IPC Global — Québec',         label_en: 'CPI All Items — Quebec',       unit: 'index' },
    { vectorId: 41691784, category: 'food',      label_fr: 'IPC Alimentation — Québec',    label_en: 'CPI Food — Quebec',            unit: 'index' },
    { vectorId: 41691852, category: 'transport', label_fr: 'IPC Transport — Québec',       label_en: 'CPI Transportation — Quebec',  unit: 'index' }
  ],
  ON: [
    { vectorId: 735098,   category: 'fuel',      label_fr: 'Essence régulière — Toronto', label_en: 'Regular Gasoline — Toronto',  unit: 'cents_per_litre' },
    { vectorId: 41691919, category: 'cpi',       label_fr: 'IPC Global — Ontario',        label_en: 'CPI All Items — Ontario',      unit: 'index' },
    { vectorId: 41691920, category: 'food',      label_fr: 'IPC Alimentation — Ontario',   label_en: 'CPI Food — Ontario',           unit: 'index' },
    { vectorId: 41691988, category: 'transport', label_fr: 'IPC Transport — Ontario',      label_en: 'CPI Transportation — Ontario', unit: 'index' }
  ],
  BC: [
    { vectorId: 735088,   category: 'fuel',      label_fr: 'Essence régulière — Vancouver',   label_en: 'Regular Gasoline — Vancouver',      unit: 'cents_per_litre' },
    { vectorId: 41692462, category: 'cpi',       label_fr: 'IPC Global — C.-B.',              label_en: 'CPI All Items — BC',                unit: 'index' },
    { vectorId: 41692463, category: 'food',      label_fr: 'IPC Alimentation — C.-B.',         label_en: 'CPI Food — BC',                     unit: 'index' },
    { vectorId: 41692531, category: 'transport', label_fr: 'IPC Transport — C.-B.',            label_en: 'CPI Transportation — BC',           unit: 'index' }
  ],
  AB: [
    { vectorId: 735087,   category: 'fuel',      label_fr: 'Essence régulière — Calgary', label_en: 'Regular Gasoline — Calgary',    unit: 'cents_per_litre' },
    { vectorId: 41692327, category: 'cpi',       label_fr: 'IPC Global — Alberta',        label_en: 'CPI All Items — Alberta',        unit: 'index' },
    { vectorId: 41692328, category: 'food',      label_fr: 'IPC Alimentation — Alberta',   label_en: 'CPI Food — Alberta',             unit: 'index' },
    { vectorId: 41692395, category: 'transport', label_fr: 'IPC Transport — Alberta',      label_en: 'CPI Transportation — Alberta',   unit: 'index' }
  ],
  MB: [
    { vectorId: 735083,   category: 'fuel',      label_fr: 'Essence régulière — Winnipeg', label_en: 'Regular Gasoline — Winnipeg', unit: 'cents_per_litre' },
    { vectorId: 41692055, category: 'cpi',       label_fr: 'IPC Global — Manitoba',        label_en: 'CPI All Items — Manitoba',     unit: 'index' },
    { vectorId: 41692056, category: 'food',      label_fr: 'IPC Alimentation — Manitoba',   label_en: 'CPI Food — Manitoba',          unit: 'index' },
    { vectorId: 41692124, category: 'transport', label_fr: 'IPC Transport — Manitoba',      label_en: 'CPI Transportation — Manitoba', unit: 'index' }
  ],
  SK: [
    { vectorId: 735085,   category: 'fuel',      label_fr: 'Essence régulière — Saskatoon',    label_en: 'Regular Gasoline — Saskatoon',      unit: 'cents_per_litre' },
    { vectorId: 41692191, category: 'cpi',       label_fr: 'IPC Global — Saskatchewan',        label_en: 'CPI All Items — Saskatchewan',      unit: 'index' },
    { vectorId: 41692192, category: 'food',      label_fr: 'IPC Alimentation — Saskatchewan',   label_en: 'CPI Food — Saskatchewan',           unit: 'index' },
    { vectorId: 41692260, category: 'transport', label_fr: 'IPC Transport — Saskatchewan',      label_en: 'CPI Transportation — Saskatchewan', unit: 'index' }
  ],
  NB: [
    { vectorId: 735094,   category: 'fuel',      label_fr: 'Essence régulière — Saint John',      label_en: 'Regular Gasoline — Saint John',       unit: 'cents_per_litre' },
    { vectorId: 41691648, category: 'cpi',       label_fr: 'IPC Global — Nouveau-Brunswick',      label_en: 'CPI All Items — New Brunswick',       unit: 'index' },
    { vectorId: 41691649, category: 'food',      label_fr: 'IPC Alimentation — Nouveau-Brunswick', label_en: 'CPI Food — New Brunswick',            unit: 'index' },
    { vectorId: 41691716, category: 'transport', label_fr: 'IPC Transport — Nouveau-Brunswick',    label_en: 'CPI Transportation — New Brunswick',  unit: 'index' }
  ],
  NS: [
    { vectorId: 735093,   category: 'fuel',      label_fr: 'Essence régulière — Halifax',      label_en: 'Regular Gasoline — Halifax',       unit: 'cents_per_litre' },
    { vectorId: 41691513, category: 'cpi',       label_fr: 'IPC Global — Nouvelle-Écosse',     label_en: 'CPI All Items — Nova Scotia',      unit: 'index' },
    { vectorId: 41691514, category: 'food',      label_fr: 'IPC Alimentation — Nouvelle-Écosse', label_en: 'CPI Food — Nova Scotia',           unit: 'index' },
    { vectorId: 41691581, category: 'transport', label_fr: 'IPC Transport — Nouvelle-Écosse',    label_en: 'CPI Transportation — Nova Scotia', unit: 'index' }
  ],
  PE: [
    { vectorId: 735092,   category: 'fuel',      label_fr: 'Essence régulière — Charlottetown',         label_en: 'Regular Gasoline — Charlottetown',          unit: 'cents_per_litre' },
    { vectorId: 41691379, category: 'cpi',       label_fr: 'IPC Global — Île-du-Prince-Édouard',        label_en: 'CPI All Items — Prince Edward Island',       unit: 'index' },
    { vectorId: 41691380, category: 'food',      label_fr: 'IPC Alimentation — Île-du-Prince-Édouard',   label_en: 'CPI Food — Prince Edward Island',            unit: 'index' },
    { vectorId: 41691447, category: 'transport', label_fr: 'IPC Transport — Île-du-Prince-Édouard',      label_en: 'CPI Transportation — Prince Edward Island',  unit: 'index' }
  ],
  NL: [
    { vectorId: 735082,   category: 'fuel',      label_fr: "Essence régulière — St. John's",          label_en: "Regular Gasoline — St. John's",              unit: 'cents_per_litre' },
    { vectorId: 41691244, category: 'cpi',       label_fr: 'IPC Global — Terre-Neuve',                 label_en: 'CPI All Items — Newfoundland and Labrador',  unit: 'index' },
    { vectorId: 41691245, category: 'food',      label_fr: 'IPC Alimentation — Terre-Neuve',            label_en: 'CPI Food — Newfoundland and Labrador',       unit: 'index' },
    { vectorId: 41691312, category: 'transport', label_fr: 'IPC Transport — Terre-Neuve',               label_en: 'CPI Transportation — Newfoundland and Labrador', unit: 'index' }
  ]
};

// Fallback national — utilisé si la région demandée n'a pas de mapping
const NATIONAL_VECTORS = [
  { vectorId: 1352087861, category: 'fuel',      label_fr: 'Essence régulière — Canada',     label_en: 'Regular Gasoline — Canada',      unit: 'cents_per_litre' },
  { vectorId: 41690973,   category: 'cpi',       label_fr: 'IPC Global — Canada',            label_en: 'CPI All Items — Canada',          unit: 'index' },
  { vectorId: 41690974,   category: 'food',      label_fr: 'IPC Alimentation — Canada',       label_en: 'CPI Food — Canada',               unit: 'index' },
  { vectorId: 41691128,   category: 'transport', label_fr: 'IPC Transport — Canada',          label_en: 'CPI Transportation — Canada',     unit: 'index' }
];

/**
 * Retourne les vecteurs pour une région donnée. Fallback sur national si inconnue.
 * La seriesKey est générée au format SC_{REGION}_{VECTORID} pour permettre le filtrage
 * côté endpoint par simple `contains: region`.
 * @param {string} regionCode - Code province (QC, ON, ...) ou 'CA' pour national
 */
function getVectorsForRegion(regionCode) {
  const raw = REGIONAL_VECTORS[regionCode] || NATIONAL_VECTORS;
  const regionTag = REGIONAL_VECTORS[regionCode] ? regionCode : 'CA';
  return raw.map(v => ({
    ...v,
    seriesKey: `SC_${regionTag}_${v.vectorId}`,
    region: regionTag
  }));
}

/**
 * Récupère les données StatCan pour une région spécifique.
 * @param {string} regionCode - Code province (QC, ON, BC, ...)
 * @param {number} latestN - Nombre de périodes récentes
 * @returns {Array} [{seriesKey, category, label_fr, label_en, unit, region, observations}]
 */
async function fetchVectorsForRegion(regionCode, latestN = 6) {
  const vectors = getVectorsForRegion(regionCode);
  try {
    const payload = vectors.map(v => ({ vectorId: v.vectorId, latestN }));
    const response = await axios.post(WDS_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    const results = [];
    // L'ordre de la réponse n'est PAS garanti de matcher l'ordre du payload.
    // On re-associe par vectorId.
    const byId = {};
    response.data.forEach(item => {
      if (item.status === 'SUCCESS' && item.object?.vectorDataPoint) {
        byId[item.object.vectorId] = item.object.vectorDataPoint;
      }
    });

    for (const config of vectors) {
      const dataPoints = byId[config.vectorId];
      if (!dataPoints) continue;

      const observations = dataPoints
        .filter(dp => dp.value !== null)
        .map(dp => ({ date: dp.refPer, value: dp.value }));

      if (observations.length > 0) {
        results.push({
          ...config,
          source: 'statcan',
          observations
        });
      }
    }

    console.log(`[📊 StatCan ${regionCode}] ${results.length}/${vectors.length} vecteurs récupérés`);
    return results;
  } catch (error) {
    console.error(`[📊 StatCan ${regionCode}] Erreur fetch:`, error.message);
    return [];
  }
}

/**
 * Récupère les données pour plusieurs régions d'un coup.
 * Utilisé par le CRON pour rafraîchir toutes les régions actives.
 * @param {string[]} regionCodes - Liste de codes provinces
 * @param {number} latestN
 * @returns {Array} Tous les résultats aplatis
 */
async function fetchMultiRegion(regionCodes, latestN = 6) {
  const all = [];
  for (const region of regionCodes) {
    const data = await fetchVectorsForRegion(region, latestN);
    all.push(...data);
  }
  return all;
}

/**
 * @deprecated Utiliser fetchVectorsForRegion(regionCode) à la place.
 * Conservé pour rétro-compat du CRON existant — retourne Québec par défaut.
 */
async function fetchAllVectors(latestN = 6) {
  return fetchVectorsForRegion('QC', latestN);
}

module.exports = {
  fetchAllVectors,          // legacy
  fetchVectorsForRegion,
  fetchMultiRegion,
  getVectorsForRegion,
  REGIONAL_VECTORS,
  NATIONAL_VECTORS
};
