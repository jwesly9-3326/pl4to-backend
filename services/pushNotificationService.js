// 📱 PL4TO - Service de Push Notifications Natif
// Utilise Firebase Admin SDK pour envoyer via FCM (iOS + Android)
// Les tokens sont enregistrés dans la table native_device_tokens

const prisma = require('../prisma-client');

// Charger firebase-admin de façon tolérante (peut ne pas être installé en dev local)
let admin = null;
let firebaseInitialized = false;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({ projectId, clientEmail, privateKey })
        });
        firebaseInitialized = true;
        console.log('🔔 Firebase Admin SDK initialisé ✅');
      } catch (err) {
        console.error('🔔 Firebase Admin init error:', err.message);
      }
    } else {
      console.warn('⚠️ Firebase Admin: variables manquantes (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) — push natif désactivé');
    }
  } else {
    firebaseInitialized = true;
  }
} catch (err) {
  console.warn('⚠️ firebase-admin non installé — push natif désactivé (npm install firebase-admin pour l\'activer)');
}

/**
 * Enregistrer un token de device natif
 * @param {string} userId
 * @param {string} token - Token FCM
 * @param {string} platform - 'ios' ou 'android'
 */
async function registerDeviceToken(userId, token, platform) {
  if (!token || !userId) return null;

  return prisma.nativeDeviceToken.upsert({
    where: { userId_token: { userId, token } },
    update: { platform, updatedAt: new Date() },
    create: { userId, token, platform }
  });
}

/**
 * Supprimer un token (quand l'utilisateur se déconnecte)
 */
async function removeDeviceToken(userId, token) {
  return prisma.nativeDeviceToken.deleteMany({
    where: { userId, token }
  });
}

/**
 * Envoyer une notification push à un utilisateur
 * @param {string} userId
 * @param {object} notification - { title, body }
 * @param {object} data - données supplémentaires (ex: { url: '/dashboard', type: 'daily_summary' })
 */
async function sendPushToUser(userId, notification, data = {}) {
  if (!firebaseInitialized) {
    return { sent: 0, reason: 'Firebase not initialized' };
  }

  const tokens = await prisma.nativeDeviceToken.findMany({
    where: { userId },
    select: { id: true, token: true, platform: true }
  });

  if (tokens.length === 0) return { sent: 0, reason: 'No device tokens' };

  let sent = 0;
  let failed = 0;

  // Ne passer que des strings dans data (FCM exige string-only)
  const stringData = {};
  for (const [k, v] of Object.entries(data)) {
    stringData[k] = String(v);
  }
  stringData.url = stringData.url || '/dashboard';
  stringData.type = stringData.type || 'general';

  for (const device of tokens) {
    try {
      await admin.messaging().send({
        token: device.token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: stringData,
        apns: {
          headers: { 'apns-priority': '10' },
          payload: {
            aps: {
              badge: Number(data.badge) || 1,
              sound: 'default',
              'content-available': 1
            }
          }
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'pl4to-default'
          }
        }
      });
      sent++;
    } catch (err) {
      failed++;
      // Token invalide ou expiré → supprimer
      if (err.code === 'messaging/registration-token-not-registered' ||
          err.code === 'messaging/invalid-registration-token') {
        await prisma.nativeDeviceToken.delete({ where: { id: device.id } }).catch(() => {});
        console.log(`[🔔 Push] Token expiré supprimé: ${device.id}`);
      } else {
        console.error(`[🔔 Push] Erreur envoi ${device.platform}:`, err.message);
      }
    }
  }

  return { sent, failed };
}

/**
 * Envoyer une notification push à TOUS les utilisateurs (broadcast)
 */
async function sendPushBroadcast(notification, data = {}) {
  if (!firebaseInitialized) {
    return { sent: 0, reason: 'Firebase not initialized' };
  }

  const allTokens = await prisma.nativeDeviceToken.findMany({
    select: { token: true }
  });

  if (allTokens.length === 0) return { sent: 0, total: 0 };

  const stringData = {};
  for (const [k, v] of Object.entries(data)) {
    stringData[k] = String(v);
  }

  // FCM supporte max 500 tokens par batch
  const batches = [];
  for (let i = 0; i < allTokens.length; i += 500) {
    batches.push(allTokens.slice(i, i + 500).map(t => t.token));
  }

  let totalSent = 0;
  for (const batch of batches) {
    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: stringData
      });
      totalSent += response.successCount;
    } catch (err) {
      console.error('[🔔 Push] Broadcast error:', err.message);
    }
  }

  return { sent: totalSent, total: allTokens.length };
}

module.exports = {
  registerDeviceToken,
  removeDeviceToken,
  sendPushToUser,
  sendPushBroadcast
};
