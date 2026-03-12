// ============================================
// 🔔 PUSH NOTIFICATIONS ROUTES
// POST /api/notifications/subscribe
// POST /api/notifications/unsubscribe
// POST /api/notifications/send (admin)
// GET  /api/notifications/vapid-public-key
// ============================================

const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const prisma = require('../prisma-client');

// Configurer VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:support@pl4to.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ============================================
// GET /vapid-public-key - Clé publique pour le frontend
// ============================================
router.get('/vapid-public-key', (req, res) => {
  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// ============================================
// POST /subscribe - Enregistrer une subscription push
// ============================================
router.post('/subscribe', async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        error: 'Subscription invalide'
      });
    }

    // Upsert: créer ou mettre à jour
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint: subscription.endpoint
        }
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    console.log(`[🔔 Push] Subscription enregistrée pour user ${userId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('[🔔 Push] Erreur subscribe:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// POST /unsubscribe - Supprimer une subscription
// ============================================
router.post('/unsubscribe', async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    if (endpoint) {
      // Supprimer une subscription spécifique
      await prisma.pushSubscription.deleteMany({
        where: { userId, endpoint }
      });
    } else {
      // Supprimer toutes les subscriptions du user
      await prisma.pushSubscription.deleteMany({
        where: { userId }
      });
    }

    console.log(`[🔔 Push] Unsubscribe pour user ${userId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('[🔔 Push] Erreur unsubscribe:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// POST /send - Envoyer une notification (usage interne/admin)
// ============================================
router.post('/send', async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;

    if (!userId || !title) {
      return res.status(400).json({
        success: false,
        error: 'userId et title requis'
      });
    }

    // Vérifier que l'appelant est admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Accès réservé aux administrateurs'
      });
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subscriptions.length === 0) {
      return res.json({ success: true, sent: 0, message: 'Aucune subscription active' });
    }

    const payload = JSON.stringify({ title, body, url: url || '/' });

    let sent = 0;
    let failed = 0;
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          payload
        );
        sent++;
      } catch (err) {
        failed++;
        // Si subscription expirée (410 Gone), la supprimer
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
          console.log(`[🔔 Push] Subscription expirée supprimée: ${sub.id}`);
        }
      }
    }

    console.log(`[🔔 Push] Envoyé à user ${userId}: ${sent} ok, ${failed} échecs`);

    res.json({ success: true, sent, failed });
  } catch (error) {
    console.error('[🔔 Push] Erreur send:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
