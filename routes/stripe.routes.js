// ============================================
// 💳 ROUTES STRIPE - Paiements & Abonnements
// PL4TO - GPS Financier
// ============================================

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Price IDs depuis .env
const PRICES = {
  essential_beta: process.env.STRIPE_PRICE_ESSENTIAL_BETA,
  essential: process.env.STRIPE_PRICE_ESSENTIAL,
  pro: process.env.STRIPE_PRICE_PRO
};

console.log('💳 Stripe configuré avec les prix:', Object.keys(PRICES));

// ============================================
// POST /api/stripe/create-checkout-session
// Crée une session de paiement Stripe Checkout
// ============================================
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId, userEmail, isBetaFounder } = req.body;
    
    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ 
        error: 'priceId, userId et userEmail requis' 
      });
    }
    
    // Vérifier que le priceId est valide
    const validPrices = Object.values(PRICES);
    if (!validPrices.includes(priceId)) {
      return res.status(400).json({ 
        error: 'Prix invalide' 
      });
    }
    
    // Chercher ou créer le customer Stripe
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
          isBetaFounder: isBetaFounder ? 'true' : 'false'
        }
      });
    }
    
    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: userId,
        isBetaFounder: isBetaFounder ? 'true' : 'false'
      },
      subscription_data: {
        metadata: {
          userId: userId,
          isBetaFounder: isBetaFounder ? 'true' : 'false'
        }
      },
      // Permettre codes promo
      allow_promotion_codes: true,
      // Collecter adresse de facturation
      billing_address_collection: 'required',
      // Langue française
      locale: 'fr-CA'
    });
    
    console.log(`[💳 Stripe] Session créée pour ${userEmail}: ${session.id}`);
    
    res.json({ 
      success: true,
      sessionId: session.id,
      url: session.url 
    });
    
  } catch (error) {
    console.error('[❌ Stripe] Erreur création session:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la session de paiement',
      details: error.message 
    });
  }
});

// ============================================
// POST /api/stripe/create-portal-session
// Crée une session pour le portail client Stripe
// (Gérer abonnement, factures, annuler, etc.)
// ============================================
router.post('/create-portal-session', async (req, res) => {
  try {
    const { userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail requis' });
    }
    
    // Trouver le customer
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      return res.status(404).json({ 
        error: 'Aucun abonnement trouvé pour cet email' 
      });
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.FRONTEND_URL}/parametres`,
    });
    
    console.log(`[💳 Stripe] Portal session créée pour ${userEmail}`);
    
    res.json({ 
      success: true,
      url: session.url 
    });
    
  } catch (error) {
    console.error('[❌ Stripe] Erreur création portal:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du portail',
      details: error.message 
    });
  }
});

// ============================================
// GET /api/stripe/subscription-status
// Récupère le statut d'abonnement d'un utilisateur
// ============================================
router.get('/subscription-status', async (req, res) => {
  try {
    const { userEmail } = req.query;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail requis' });
    }
    
    // Trouver le customer
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      return res.json({ 
        success: true,
        hasSubscription: false,
        subscription: null 
      });
    }
    
    // Récupérer les abonnements actifs
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length === 0) {
      // Vérifier aussi les abonnements en période d'essai
      const trialSubs = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'trialing',
        limit: 1
      });
      
      if (trialSubs.data.length === 0) {
        return res.json({ 
          success: true,
          hasSubscription: false,
          subscription: null 
        });
      }
      
      const sub = trialSubs.data[0];
      return res.json({
        success: true,
        hasSubscription: true,
        subscription: {
          id: sub.id,
          status: sub.status,
          priceId: sub.items.data[0].price.id,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          isBetaFounder: sub.metadata.isBetaFounder === 'true'
        }
      });
    }
    
    const sub = subscriptions.data[0];
    
    res.json({
      success: true,
      hasSubscription: true,
      subscription: {
        id: sub.id,
        status: sub.status,
        priceId: sub.items.data[0].price.id,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        isBetaFounder: sub.metadata.isBetaFounder === 'true'
      }
    });
    
  } catch (error) {
    console.error('[❌ Stripe] Erreur status:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du statut',
      details: error.message 
    });
  }
});

// ============================================
// GET /api/stripe/prices
// Retourne les prix disponibles (pour le frontend)
// ============================================
router.get('/prices', async (req, res) => {
  try {
    res.json({
      success: true,
      prices: {
        essential_beta: {
          id: PRICES.essential_beta,
          name: 'PL4TO Essentiel (Beta Founders)',
          amount: 999, // en cents
          currency: 'cad',
          interval: 'month'
        },
        essential: {
          id: PRICES.essential,
          name: 'PL4TO Essentiel',
          amount: 1499,
          currency: 'cad',
          interval: 'month'
        },
        pro: {
          id: PRICES.pro,
          name: 'PL4TO Pro + IA',
          amount: 2499,
          currency: 'cad',
          interval: 'month'
        }
      }
    });
  } catch (error) {
    console.error('[❌ Stripe] Erreur prices:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

module.exports = router;
