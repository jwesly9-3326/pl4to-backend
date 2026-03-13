// 📊 PL4TO - Service d'Intelligence Économique
// Orchestrateur principal: fetch APIs → cache DB → analyse → alertes
// Sources: Banque du Canada + Statistique Canada

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { fetchAllSeries } = require('./providers/bankOfCanada');
const { fetchAllVectors } = require('./providers/statcan');
const { generateAlertsForIndicator, cleanExpiredAlerts } = require('./alertGenerator');

// Intervalle minimum entre deux fetches (6 heures)
const MIN_FETCH_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Orchestre la mise à jour complète des données économiques
 * Appelé par le CRON toutes les heures (mais skip si < 6h depuis le dernier fetch)
 */
async function processEconomicData() {
  try {
    // Vérifier si on doit fetcher (dernière mise à jour > 6h?)
    const lastFetch = await prisma.economicIndicator.findFirst({
      orderBy: { fetchedAt: 'desc' },
      select: { fetchedAt: true }
    });

    if (lastFetch && (Date.now() - lastFetch.fetchedAt.getTime()) < MIN_FETCH_INTERVAL_MS) {
      return { skipped: true, reason: 'Dernière mise à jour < 6h' };
    }

    console.log(`[📊 ECON] Début de la mise à jour des indicateurs économiques...`);

    // 1. Fetch toutes les sources en parallèle
    const [bocData, statcanData] = await Promise.all([
      fetchAllSeries(),
      fetchAllVectors()
    ]);

    const allData = [...bocData, ...statcanData];
    let updated = 0;
    let alertsGenerated = 0;

    // 2. Stocker dans la DB et analyser les changements
    for (const series of allData) {
      const latestObs = series.observations[series.observations.length - 1];
      const previousObs = series.observations.length >= 2
        ? series.observations[series.observations.length - 2]
        : null;

      if (!latestObs) continue;

      const currentValue = latestObs.value;
      const previousValue = previousObs?.value || null;
      const changePercent = previousValue && previousValue !== 0
        ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
        : null;

      // Upsert dans EconomicIndicator (cache)
      const indicator = await prisma.economicIndicator.upsert({
        where: {
          source_seriesKey_observationDate: {
            source: series.source,
            seriesKey: series.seriesKey,
            observationDate: new Date(latestObs.date)
          }
        },
        update: {
          value: currentValue,
          previousValue: previousValue,
          changePercent: changePercent ? Math.round(changePercent * 10000) / 10000 : null,
          fetchedAt: new Date()
        },
        create: {
          source: series.source,
          category: series.category,
          seriesKey: series.seriesKey,
          label_fr: series.label_fr,
          label_en: series.label_en,
          value: currentValue,
          previousValue: previousValue,
          unit: series.unit,
          changePercent: changePercent ? Math.round(changePercent * 10000) / 10000 : null,
          observationDate: new Date(latestObs.date),
          fetchedAt: new Date()
        }
      });

      updated++;

      // 3. Générer des alertes si changement significatif
      if (changePercent !== null) {
        const alertResult = await generateAlertsForIndicator({
          ...indicator,
          changePercent
        });
        alertsGenerated += alertResult.generated || 0;
      }
    }

    // 4. Nettoyer les alertes expirées
    const cleaned = await cleanExpiredAlerts();

    const result = {
      skipped: false,
      updated,
      alertsGenerated,
      expiredCleaned: cleaned,
      sources: { boc: bocData.length, statcan: statcanData.length }
    };

    console.log(`[📊 ECON] Terminé: ${updated} indicateurs mis à jour, ${alertsGenerated} alertes générées`);
    return result;
  } catch (error) {
    console.error(`[❌ ECON] Erreur processEconomicData:`, error);
    return { skipped: false, error: error.message };
  }
}

/**
 * Retourne les derniers indicateurs économiques (pour le frontend)
 * @param {string} category - Filtre optionnel par catégorie
 */
async function getLatestIndicators(category = null) {
  try {
    // Sous-requête: dernier indicateur par seriesKey
    const where = category ? { category } : {};

    const indicators = await prisma.$queryRaw`
      SELECT DISTINCT ON ("seriesKey")
        id, source, category, "seriesKey", label_fr, label_en,
        value, "previousValue", unit, "changePercent",
        "observationDate", "fetchedAt"
      FROM economic_indicators
      ${category ? prisma.$queryRaw`WHERE category = ${category}` : prisma.$queryRaw``}
      ORDER BY "seriesKey", "observationDate" DESC
    `;

    return indicators;
  } catch (error) {
    // Fallback: requête simple si raw query échoue
    const where = category ? { category } : {};
    const indicators = await prisma.economicIndicator.findMany({
      where,
      orderBy: { observationDate: 'desc' },
      distinct: ['seriesKey']
    });
    return indicators;
  }
}

/**
 * Retourne les alertes actives d'un utilisateur
 * @param {string} userId
 */
async function getUserAlerts(userId) {
  return prisma.economicAlert.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
}

/**
 * Marque une alerte comme lue
 */
async function markAlertRead(alertId, userId) {
  return prisma.economicAlert.updateMany({
    where: { id: alertId, userId },
    data: { isRead: true }
  });
}

/**
 * Retourne un résumé économique pour le Coach IA
 */
async function getEconomicSummary() {
  try {
    const indicators = await getLatestIndicators();

    if (indicators.length === 0) return null;

    const summary = {
      lastUpdated: indicators[0]?.fetchedAt,
      indicators: indicators.map(i => ({
        label_fr: i.label_fr,
        label_en: i.label_en,
        category: i.category,
        value: parseFloat(i.value),
        change: i.changePercent ? parseFloat(i.changePercent) : null,
        unit: i.unit,
        date: i.observationDate
      }))
    };

    return summary;
  } catch (error) {
    console.error(`[❌ ECON] Erreur getEconomicSummary:`, error.message);
    return null;
  }
}

module.exports = {
  processEconomicData,
  getLatestIndicators,
  getUserAlerts,
  markAlertRead,
  getEconomicSummary
};
