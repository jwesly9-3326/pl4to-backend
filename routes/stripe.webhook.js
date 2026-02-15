// ============================================
// 🔔 WEBHOOK STRIPE - Événements de paiement
// PL4TO - GPS Financier
// ============================================

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const zohoCRM = require('../services/zohoCRM.service');
const { handleNewSubscription } = require('../services/email/subscriberEmailService');

// ============================================
// POST /api/stripe/webhook
// Reçoit les événements Stripe (paiements, annulations, etc.)
// ============================================
const handleWebhook = async (req, res, prisma) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[❌ Webhook] Signature invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  console.log(`[🔔 Webhook] Event reçu: ${event.type}`);
  
  // Traiter les différents types d'événements
  try {
    switch (event.type) {
      // ✅ Paiement réussi (première fois ou renouvellement)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        
        console.log(`[💳 Webhook] Paiement réussi pour customer: ${customerId}`);
        
        // Récupérer les infos du customer
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.userId;
        
        if (userId) {
          // Récupérer l'utilisateur pour avoir ses infos
          const user = await prisma.user.findUnique({ where: { id: userId } });
          
          // Mettre à jour le statut de l'utilisateur dans la DB
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: 'essential', // ou 'pro' selon le price
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active',
              trialActive: false, // Fin du trial
              planChosen: true
            }
          });
          console.log(`[✅ Webhook] User ${userId} mis à jour: abonnement actif`);
          
          // 🔗 Synchroniser avec Zoho CRM
          if (user) {
            try {
              await zohoCRM.onSubscriptionActivated(user, customerId);
            } catch (zohoErr) {
              console.error('[⚠️ Webhook] Erreur Zoho CRM:', zohoErr.message);
            }
          }
        }
        break;
      }
      
      // ❌ Paiement échoué
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        
        console.log(`[⚠️ Webhook] Paiement échoué pour customer: ${customerId}`);
        
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.userId;
        
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'past_due'
            }
          });
          console.log(`[⚠️ Webhook] User ${userId}: paiement échoué`);
          
          // TODO: Envoyer email de relance
        }
        break;
      }
      
      // 🔄 Abonnement mis à jour (upgrade/downgrade)
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        console.log(`[🔄 Webhook] Subscription updated: ${subscription.id}`);
        
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.userId;
        
        if (userId) {
          // Déterminer le plan selon le price
          const priceId = subscription.items.data[0].price.id;
          let plan = 'essential';
          
          if (priceId === process.env.STRIPE_PRICE_PRO) {
            plan = 'pro';
          }
          
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: plan,
              subscriptionStatus: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end
            }
          });
          console.log(`[✅ Webhook] User ${userId}: plan mis à jour -> ${plan}`);
        }
        break;
      }
      
      // 🚫 Abonnement annulé
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        console.log(`[🚫 Webhook] Subscription deleted: ${subscription.id}`);
        
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.userId;
        
        if (userId) {
          // Récupérer l'utilisateur pour Zoho
          const user = await prisma.user.findUnique({ where: { id: userId } });
          
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: 'discovery', // Retour au plan gratuit
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              cancelAtPeriodEnd: false
            }
          });
          console.log(`[🚫 Webhook] User ${userId}: abonnement annulé, retour à Discovery`);
          
          // 🔗 Synchroniser avec Zoho CRM
          if (user) {
            try {
              await zohoCRM.onSubscriptionCanceled(user);
            } catch (zohoErr) {
              console.error('[⚠️ Webhook] Erreur Zoho CRM:', zohoErr.message);
            }
          }
          
          // TODO: Envoyer email de confirmation d'annulation
        }
        break;
      }
      
      // 🆕 Nouveau client créé
      case 'customer.created': {
        const customer = event.data.object;
        console.log(`[🆕 Webhook] Nouveau customer: ${customer.email}`);
        break;
      }
      
      // Checkout complété
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`[✅ Webhook] Checkout completed: ${session.id}`);
        
        const userId = session.metadata.userId;
        const isBetaFounder = session.metadata.isBetaFounder === 'true';
        
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: session.customer,
              isBetaFounder: isBetaFounder,
              planChosen: true
            }
          });
          console.log(`[✅ Webhook] User ${userId}: checkout complété`);
          
          // 📧 Envoyer l'email de confirmation + Guide PDF
          try {
            const emailResult = await handleNewSubscription(userId, 'essential');
            console.log(`[📧 Webhook] Email confirmation: ${emailResult.success ? '✅ envoyé' : '❌ erreur'}`);
          } catch (emailErr) {
            console.error('[⚠️ Webhook] Erreur envoi email confirmation:', emailErr.message);
            // Ne pas bloquer le webhook si l'email échoue
          }
        }
        break;
      }
      
      default:
        console.log(`[ℹ️ Webhook] Event non géré: ${event.type}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('[❌ Webhook] Erreur traitement:', error);
    res.status(500).json({ error: 'Erreur webhook' });
  }
};

module.exports = { handleWebhook };
