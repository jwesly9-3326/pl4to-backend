// ============================================
// 🔗 ROUTES ZOHO CRM
// PL4TO - API pour synchronisation CRM
// ============================================

const express = require('express');
const router = express.Router();
const zohoCRM = require('../services/zohoCRM.service');

// ============================================
// POST /api/zoho/sync-contact
// Synchronise un utilisateur avec Zoho CRM
// ============================================
router.post('/sync-contact', async (req, res) => {
  try {
    const { email, prenom, nom, plan, stripeCustomerId, statut } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    const result = await zohoCRM.updateContactByEmail(email, {
      email,
      prenom,
      nom,
      plan,
      stripeCustomerId,
      statut
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('[Zoho Route] Erreur sync-contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/zoho/user-registered
// Appelé quand un nouvel utilisateur s'inscrit
// ============================================
router.post('/user-registered', async (req, res) => {
  try {
    const { email, prenom, nom } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    const result = await zohoCRM.onUserRegistered({ email, prenom, nom });
    res.json(result);
    
  } catch (error) {
    console.error('[Zoho Route] Erreur user-registered:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/zoho/trial-started
// Appelé quand un utilisateur commence son essai
// ============================================
router.post('/trial-started', async (req, res) => {
  try {
    const { email, prenom, nom } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    const result = await zohoCRM.onTrialStarted({ email, prenom, nom });
    res.json(result);
    
  } catch (error) {
    console.error('[Zoho Route] Erreur trial-started:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/zoho/subscription-activated
// Appelé quand un paiement est confirmé
// ============================================
router.post('/subscription-activated', async (req, res) => {
  try {
    const { email, prenom, nom, subscriptionPlan, stripeCustomerId } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    const result = await zohoCRM.onSubscriptionActivated(
      { email, prenom, nom, subscriptionPlan },
      stripeCustomerId
    );
    res.json(result);
    
  } catch (error) {
    console.error('[Zoho Route] Erreur subscription-activated:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/zoho/subscription-canceled
// Appelé quand un abonnement est annulé
// ============================================
router.post('/subscription-canceled', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    const result = await zohoCRM.onSubscriptionCanceled({ email });
    res.json(result);
    
  } catch (error) {
    console.error('[Zoho Route] Erreur subscription-canceled:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/zoho/contact/:email
// Récupère un contact par email
// ============================================
router.get('/contact/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const result = await zohoCRM.findContactByEmail(email);
    res.json(result);
    
  } catch (error) {
    console.error('[Zoho Route] Erreur get contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/zoho/health
// Vérifie la connexion à Zoho
// ============================================
router.get('/health', async (req, res) => {
  try {
    // Essayer d'obtenir un token pour vérifier la connexion
    await zohoCRM.getAccessToken();
    
    res.json({
      status: 'OK',
      message: 'Connexion Zoho CRM active',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Connexion Zoho CRM échouée',
      error: error.message
    });
  }
});

module.exports = router;
