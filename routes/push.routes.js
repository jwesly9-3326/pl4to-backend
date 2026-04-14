// 📱 PL4TO - Routes Push Notifications Natives
// Enregistre/supprime les tokens FCM pour les apps natives iOS/Android
// Toutes les routes exigent authentification (ajoutée dans server.js)

const express = require('express');
const router = express.Router();
const { registerDeviceToken, removeDeviceToken } = require('../services/pushNotificationService');

// POST /api/push/register-native — Enregistrer un token de device
router.post('/register-native', async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, platform } = req.body;

    if (!token || !platform) {
      return res.status(400).json({ success: false, error: 'token et platform requis' });
    }

    if (!['ios', 'android'].includes(platform)) {
      return res.status(400).json({ success: false, error: 'platform doit être ios ou android' });
    }

    await registerDeviceToken(userId, token, platform);
    console.log(`[🔔 Push] Token enregistré: ${platform} pour user ${userId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('[🔔 Push] Erreur register:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/push/unregister — Supprimer un token (logout)
router.post('/unregister', async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (token) {
      await removeDeviceToken(userId, token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[🔔 Push] Erreur unregister:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
