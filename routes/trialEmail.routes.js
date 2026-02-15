// 📧 PL4TO - Routes de test pour les emails trial
// Prévisualisation HTML + envoi de test

const express = require('express');
const router = express.Router();
const { 
  previewEmail, 
  sendTestEmail, 
  sendAllTestEmails,
  sendWelcomeEmail,
  processTrialEmails,
  TRIAL_EMAIL_CONFIG 
} = require('../services/email/trialEmailService');
const {
  previewSubscriberEmail,
  sendTestSubscriberEmail,
  processSubscriberEmails,
  SUBSCRIBER_EMAIL_CONFIG
} = require('../services/email/subscriberEmailService');

module.exports = (prisma, authenticateToken) => {

  // ============================================
  // GET /api/trial-emails/types
  // Liste tous les types d'emails disponibles
  // ============================================
  router.get('/types', (req, res) => {
    const types = Object.entries(TRIAL_EMAIL_CONFIG).map(([type, config]) => ({
      type,
      day: config.day,
      template: config.template
    }));
    
    res.json({ success: true, types });
  });

  // ============================================
  // GET /api/trial-emails/preview/:type
  // Prévisualise un email dans le navigateur (HTML brut)
  // Query params: ?lang=fr (défaut) ou ?lang=en
  // ============================================
  router.get('/preview/:type', (req, res) => {
    try {
      const { type } = req.params;
      const language = req.query.lang || 'fr';
      
      const { subject, html } = previewEmail(type, language);
      
      // Retourner le HTML directement (rendu dans le navigateur)
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
      
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message,
        availableTypes: Object.keys(TRIAL_EMAIL_CONFIG)
      });
    }
  });

  // ============================================
  // GET /api/trial-emails/preview-json/:type
  // Retourne le sujet + HTML en JSON (pour debug)
  // ============================================
  router.get('/preview-json/:type', (req, res) => {
    try {
      const { type } = req.params;
      const language = req.query.lang || 'fr';
      
      const { subject, html } = previewEmail(type, language);
      
      res.json({ 
        success: true, 
        type,
        language,
        subject,
        htmlLength: html.length 
      });
      
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ============================================
  // POST /api/trial-emails/send-test
  // Envoie un email de test à une adresse spécifique
  // Body: { emailType: "welcome", toEmail: "jhon@...", lang: "fr" }
  // ============================================
  router.post('/send-test', authenticateToken, async (req, res) => {
    try {
      const { emailType, toEmail, lang } = req.body;
      
      if (!emailType || !toEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'emailType et toEmail requis',
          availableTypes: Object.keys(TRIAL_EMAIL_CONFIG)
        });
      }
      
      // Vérifier que l'utilisateur est admin
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { isAdmin: true, email: true }
      });
      
      if (!user?.isAdmin) {
        return res.status(403).json({ 
          success: false, 
          error: 'Accès réservé aux administrateurs' 
        });
      }
      
      console.log(`[📧 Test] Admin ${user.email} envoie "${emailType}" à ${toEmail}`);
      
      const result = await sendTestEmail(emailType, toEmail, lang || 'fr');
      
      res.json({
        success: result.success,
        emailType,
        sentTo: toEmail,
        language: lang || 'fr',
        resendId: result.id || null,
        error: result.error || null
      });
      
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ============================================
  // POST /api/trial-emails/send-all-test
  // Envoie TOUS les emails de la séquence à une adresse de test
  // Body: { toEmail: "jhon@...", lang: "fr" }
  // ============================================
  router.post('/send-all-test', authenticateToken, async (req, res) => {
    try {
      const { toEmail, lang } = req.body;
      
      if (!toEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'toEmail requis' 
        });
      }
      
      // Vérifier admin
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { isAdmin: true, email: true }
      });
      
      if (!user?.isAdmin) {
        return res.status(403).json({ 
          success: false, 
          error: 'Accès réservé aux administrateurs' 
        });
      }
      
      console.log(`[📧 Test] Admin ${user.email} envoie TOUS les emails à ${toEmail}`);
      
      const results = await sendAllTestEmails(toEmail, lang || 'fr');
      
      res.json({
        success: true,
        sentTo: toEmail,
        language: lang || 'fr',
        results
      });
      
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ============================================
  // POST /api/trial-emails/trigger-cron
  // Déclenche manuellement le traitement CRON (admin)
  // ============================================
  router.post('/trigger-cron', authenticateToken, async (req, res) => {
    try {
      // Vérifier admin
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { isAdmin: true, email: true }
      });
      
      if (!user?.isAdmin) {
        return res.status(403).json({ 
          success: false, 
          error: 'Accès réservé aux administrateurs' 
        });
      }
      
      console.log(`[📧 CRON] Déclenchement manuel par ${user.email}`);
      
      const result = await processTrialEmails();
      
      res.json({
        success: true,
        message: 'CRON exécuté manuellement',
        result
      });
      
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ============================================
  // GET /api/trial-emails/status
  // Affiche le statut des emails envoyés pour l'utilisateur connecté
  // ============================================
  router.get('/status', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const emailsSent = await prisma.trialEmailSent.findMany({
        where: { userId },
        orderBy: { sentAt: 'asc' }
      });
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          trialStartDate: true,
          trialEndDate: true,
          trialActive: true,
          createdAt: true
        }
      });
      
      res.json({
        success: true,
        trial: {
          startDate: user?.trialStartDate,
          endDate: user?.trialEndDate,
          active: user?.trialActive,
          accountCreatedAt: user?.createdAt
        },
        emailsSent: emailsSent.map(e => ({
          type: e.emailType,
          sentAt: e.sentAt,
          resendId: e.resendId
        })),
        allTypes: Object.keys(TRIAL_EMAIL_CONFIG)
      });
      
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ============================================
  // GET /api/trial-emails/admin/overview
  // Vue admin: tous les emails envoyés (résumé)
  // ============================================
  router.get('/admin/overview', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { isAdmin: true }
      });
      
      if (!user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin requis' });
      }
      
      // Compter par type
      const counts = await prisma.$queryRaw`
        SELECT "emailType", COUNT(*) as count 
        FROM trial_emails_sent 
        GROUP BY "emailType" 
        ORDER BY "emailType"
      `;
      
      // Total utilisateurs en trial
      const usersInTrial = await prisma.user.count({
        where: { trialActive: true }
      });
      
      res.json({
        success: true,
        usersInTrial,
        emailsSentByType: counts,
        totalEmailsSent: counts.reduce((sum, c) => sum + Number(c.count), 0)
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================
  // GET /api/trial-emails/subscriber/types
  // Liste tous les types d'emails subscriber
  // ============================================
  router.get('/subscriber/types', (req, res) => {
    const types = Object.entries(SUBSCRIBER_EMAIL_CONFIG).map(([type, config]) => ({
      type,
      day: config.day,
      description: config.description
    }));
    res.json({ success: true, types });
  });

  // ============================================
  // GET /api/trial-emails/preview/subscriber/:type
  // Prévisualise un email subscriber (confirmation, checkin, one_month_recap)
  // ============================================
  router.get('/preview/subscriber/:type', (req, res) => {
    try {
      const { type } = req.params;
      const language = req.query.lang || 'fr';
      const { subject, html } = previewSubscriberEmail(type, language);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        availableTypes: Object.keys(SUBSCRIBER_EMAIL_CONFIG)
      });
    }
  });

  // ============================================
  // POST /api/trial-emails/send-test/subscriber/:type
  // Envoie un test d'un email subscriber
  // ============================================
  router.post('/send-test/subscriber/:type', authenticateToken, async (req, res) => {
    try {
      const { type } = req.params;
      const { toEmail, lang } = req.body;
      if (!toEmail) {
        return res.status(400).json({ success: false, error: 'toEmail requis' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { isAdmin: true, email: true }
      });

      if (!user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin requis' });
      }

      const result = await sendTestSubscriberEmail(type, toEmail, lang || 'fr');
      res.json({
        success: result.success,
        emailType: type,
        sentTo: toEmail,
        resendId: result.id || null,
        error: result.error || null
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================
  // POST /api/trial-emails/trigger-cron-subscriber
  // Déclenche manuellement le CRON subscriber (admin)
  // ============================================
  router.post('/trigger-cron-subscriber', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { isAdmin: true, email: true }
      });

      if (!user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin requis' });
      }

      console.log(`[📧 CRON Subscriber] Déclenchement manuel par ${user.email}`);
      const result = await processSubscriberEmails();

      res.json({
        success: true,
        message: 'CRON subscriber exécuté manuellement',
        result
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
