// 📊 PL4TO - Routes Intelligence Économique
// Endpoints pour accéder aux indicateurs économiques et alertes personnalisées

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getLatestIndicators,
  getUserAlerts,
  markAlertRead,
  getEconomicSummary
} = require('../services/economic/economicDataService');
const { getQuebecBenchmarks } = require('../services/economic/quebecBenchmarks');

// ===================================================
// GET /api/economic/indicators
// Retourne les derniers indicateurs économiques (public — cache 5 min)
// ===================================================
router.get('/indicators', async (req, res) => {
  try {
    const { category } = req.query;
    const indicators = await getLatestIndicators(category || null);

    res.json({
      success: true,
      data: indicators,
      count: indicators.length
    });
  } catch (error) {
    console.error('[❌ ECON] GET /indicators:', error.message);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des indicateurs' });
  }
});

// ===================================================
// GET /api/economic/alerts
// Retourne les alertes économiques de l'utilisateur connecté
// ===================================================
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await getUserAlerts(req.user.id);

    res.json({
      success: true,
      data: alerts,
      unreadCount: alerts.filter(a => !a.isRead).length
    });
  } catch (error) {
    console.error('[❌ ECON] GET /alerts:', error.message);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des alertes' });
  }
});

// ===================================================
// PUT /api/economic/alerts/:id/read
// Marque une alerte comme lue
// ===================================================
router.put('/alerts/:id/read', authenticateToken, async (req, res) => {
  try {
    await markAlertRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[❌ ECON] PUT /alerts/:id/read:', error.message);
    res.status(500).json({ success: false, error: 'Erreur' });
  }
});

// ===================================================
// PUT /api/economic/alerts/read-all
// Marque toutes les alertes comme lues
// ===================================================
router.put('/alerts/read-all', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.economicAlert.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('[❌ ECON] PUT /alerts/read-all:', error.message);
    res.status(500).json({ success: false, error: 'Erreur' });
  }
});

// ===================================================
// GET /api/economic/summary
// Résumé économique pour le Coach IA
// ===================================================
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const summary = await getEconomicSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('[❌ ECON] GET /summary:', error.message);
    res.status(500).json({ success: false, error: 'Erreur' });
  }
});

// ===================================================
// GET /api/economic/benchmarks
// Retourne les benchmarks de dépenses moyennes du Québec (StatCan EDM)
// Public — données gouvernementales, pas de JWT requis
// ===================================================
router.get('/benchmarks', async (req, res) => {
  try {
    const benchmarks = getQuebecBenchmarks();
    res.json({ success: true, data: benchmarks });
  } catch (error) {
    console.error('[❌ ECON] GET /benchmarks:', error.message);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des benchmarks' });
  }
});

module.exports = router;
