// ============================================
// 🤖 AI COACH ROUTES - Coach financier "Coach O"
// POST /api/ai-coach/recommendations
// ============================================

const express = require('express');
const router = express.Router();
const prisma = require('../prisma-client');
const aiCoachService = require('../services/ai/aiCoachService');

// ============================================
// MIDDLEWARE: Vérification Plan Pro
// ============================================
const requireProPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, unlimitedAccess: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Autoriser le plan Pro ou l'accès illimité
    if (user.subscriptionPlan !== 'pro' && !user.unlimitedAccess) {
      console.log(`[AICoach] Accès refusé pour user ${userId} (plan: ${user.subscriptionPlan})`);
      return res.status(403).json({
        success: false,
        error: 'Coach O nécessite le plan Pro+IA'
      });
    }

    next();
  } catch (error) {
    console.error('[AICoach] Erreur vérification plan:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

// ============================================
// POST /recommendations - Obtenir des recommandations IA
// ============================================
router.post('/recommendations', requireProPlan, async (req, res) => {
  try {
    const userId = req.user.id;
    const { financialSummary, language, userPreferences } = req.body;

    if (!financialSummary) {
      return res.status(400).json({
        success: false,
        error: 'Résumé financier requis'
      });
    }

    // Validation minimale du résumé
    if (!financialSummary.accounts || !financialSummary.totals) {
      return res.status(400).json({
        success: false,
        error: 'Format du résumé financier invalide'
      });
    }

    console.log(`[AICoach] Demande de recommandations pour user ${userId} (prefs: ${userPreferences ? 'oui' : 'non'})`);

    const result = await aiCoachService.getRecommendations(
      userId,
      financialSummary,
      language || 'fr',
      userPreferences || {}
    );

    console.log(`[AICoach] ${result.recommendations.length} recommandations envoyées à user ${userId} (${result.usage.inputTokens}+${result.usage.outputTokens} tokens)`);

    res.json({
      success: true,
      data: result,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AICoach] Erreur recommandations:', error.message);

    // Distinguer les erreurs API des erreurs serveur
    if (error.message.includes('Limite de requêtes')) {
      return res.status(429).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('Clé API')) {
      return res.status(503).json({
        success: false,
        error: 'Service IA temporairement indisponible'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des recommandations'
    });
  }
});

module.exports = router;
