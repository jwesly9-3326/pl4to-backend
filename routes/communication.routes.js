// ============================================
// 📧 ROUTES COMMUNICATIONS
// PL4TO - Emails événementiels + Résumés hebdo
// ============================================

const express = require('express');
const router = express.Router();
const communicationService = require('../services/email/communicationEmailService');
const prisma = require('../prisma-client');

// Middleware auth (réutiliser celui existant)
const authMiddleware = require('../middleware/auth');

// ============================================
// GET /api/communications/preferences
// Récupère les préférences de communication
// ============================================
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const prefs = await communicationService.getPreferences(req.user.id);
    res.json(prefs);
  } catch (error) {
    console.error('[Communications] Erreur get preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PUT /api/communications/preferences
// Met à jour les préférences de communication
// ============================================
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { weeklyReportEnabled, calendarEmailEnabled, weeklyReportDay } = req.body;
    
    const result = await communicationService.updatePreferences(req.user.id, {
      weeklyReportEnabled,
      calendarEmailEnabled,
      weeklyReportDay
    });
    
    res.json({ success: true, preferences: result });
  } catch (error) {
    console.error('[Communications] Erreur update preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/communications/unsubscribe
// Désabonnement par lien email (pas besoin d'auth)
// ============================================
router.get('/unsubscribe', async (req, res) => {
  try {
    const { userId, type } = req.query;
    
    if (!userId) {
      return res.status(400).send(unsubscribePage('Lien invalide', false));
    }
    
    await communicationService.unsubscribe(userId, type || 'all');
    
    const typeLabel = type === 'calendar' 
      ? 'des emails événements' 
      : type === 'weekly' 
        ? 'du résumé hebdomadaire' 
        : 'de toutes les communications';
    
    res.send(unsubscribePage(`Tu as été désabonné ${typeLabel}.`, true));
    
  } catch (error) {
    console.error('[Communications] Erreur unsubscribe:', error);
    res.status(500).send(unsubscribePage('Une erreur est survenue.', false));
  }
});

// ============================================
// POST /api/communications/trigger/calendar
// Déclenche l'envoi des emails calendrier (cron)
// Protégé par clé API
// ============================================
router.post('/trigger/calendar', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.key;
    if (apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    
    const result = await communicationService.sendCalendarEventEmails();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Communications] Erreur trigger calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/communications/trigger/weekly
// Déclenche l'envoi des résumés hebdo (cron)
// Protégé par clé API
// ============================================
router.post('/trigger/weekly', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.key;
    if (apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    
    const result = await communicationService.sendWeeklyReportEmails();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Communications] Erreur trigger weekly:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/communications/test/weekly
// Envoie un rapport hebdo TEST à l'utilisateur connecté
// ============================================
router.post('/test/weekly', authMiddleware, async (req, res) => {
  try {
    const result = await communicationService.sendTestWeeklyReport(req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Communications] Erreur test weekly:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/communications/events
// Liste tous les événements du calendrier
// ============================================
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const events = communicationService.CALENDAR_EVENTS.map(e => ({
      id: e.id,
      name: e.name_fr || e.name,
      emoji: e.emoji,
      date: e.date,
      color: e.color
    }));
    
    const todaysEvent = communicationService.getTodaysEvent();
    const nextEvent = communicationService.getNextEvent(req.user?.language || 'fr');
    
    res.json({ events, todaysEvent: todaysEvent?.id || null, nextEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/communications/report-history
// Liste paginée des rapports hebdo avec snapshots
// ============================================
router.get('/report-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 52);
    const offset = parseInt(req.query.offset) || 0;

    const [reports, total] = await Promise.all([
      prisma.weeklyReportSnapshot.findMany({
        where: { userId },
        orderBy: { snapshotDate: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          weekStart: true,
          snapshotDate: true,
          reportVersion: true,
          createdAt: true,
          // Summary fields from reportData (lighter than full snapshot)
          reportData: true,
          comparativeInsights: true
        }
      }),
      prisma.weeklyReportSnapshot.count({ where: { userId } })
    ]);

    // Return lighter version for list view
    const items = reports.map(r => {
      const report = r.reportData || {};
      const insights = r.comparativeInsights || {};
      return {
        id: r.id,
        weekStart: r.weekStart,
        snapshotDate: r.snapshotDate,
        reportVersion: r.reportVersion,
        // Summary data
        budgetStatus: report.budgetStatus || null,
        objectifsCount: (report.objectifs || []).length,
        highlightsCount: (report.highlights || []).length,
        alertesCount: report.alertesCount || 0,
        hasComparison: !!insights.portefeuille,
        // Quick stats from insights
        valeurNetteChange: insights.portefeuille?.valeurNetteChange || null,
        trend: insights.portefeuille?.trend || null
      };
    });

    res.json({
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('[Communications] Erreur report-history:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/communications/report-history/:id
// Détail d'un rapport avec snapshot complet
// ============================================
router.get('/report-history/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const report = await prisma.weeklyReportSnapshot.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // Security: only owner can access
    if (report.userId !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({
      id: report.id,
      weekStart: report.weekStart,
      snapshotDate: report.snapshotDate,
      reportVersion: report.reportVersion,
      createdAt: report.createdAt,
      financialSnapshot: report.financialSnapshot,
      reportData: report.reportData,
      comparativeInsights: report.comparativeInsights
    });
  } catch (error) {
    console.error('[Communications] Erreur report-history detail:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Page HTML de désabonnement
// ============================================
function unsubscribePage(message, success) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PL4TO - Désabonnement</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #040449; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div style="text-align: center; padding: 40px; max-width: 400px;">
      <h1 style="color: white; font-size: 32px; margin: 0 0 20px 0;">
        PL4T<span style="color: #fbbf24;">O</span>
      </h1>
      <div style="background: rgba(255,255,255,0.08); border-radius: 16px; padding: 30px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 48px; margin-bottom: 15px;">${success ? '✅' : '❌'}</div>
        <p style="color: white; font-size: 18px; margin: 0 0 15px 0;">${message}</p>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 0;">
          Tu peux réactiver tes communications dans <strong>Paramètres → Préférences</strong> à tout moment.
        </p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'https://pl4to.com'}" style="display: inline-block; margin-top: 20px; color: #667eea; text-decoration: none; font-size: 15px;">
        ← Retour à PL4TO
      </a>
    </div>
  </body>
  </html>`;
}

module.exports = router;
