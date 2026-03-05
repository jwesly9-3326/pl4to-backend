// 🔐 ROUTES ENTERPRISE AUTH - Connexion Cabinet + Demande de Portail
// Routes PUBLIQUES (pas de JWT utilisateur requis)
// Séparé des routes enterprise.routes.js (qui nécessitent un JWT)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma-client');
const emailService = require('../utils/emailService');

// ============================================
// STORE TEMPORAIRE - Codes de vérification email portail
// En mémoire (pas en BD) — codes valides 15 min max
// ============================================
const verificationCodes = new Map();
// Nettoyage automatique toutes les 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of verificationCodes) {
    if (now > data.expires) verificationCodes.delete(email);
  }
}, 15 * 60 * 1000);

// Rate limit en mémoire: max 3 envois par email par heure
const sendRateLimit = new Map();

// ============================================
// POST /api/enterprise/login
// Connexion avec identifiant unique (PLT-XXXX-XXXX) + mot de passe
// Retourne un JWT Enterprise séparé du JWT B2C
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { identifiant, password } = req.body;
    
    if (!identifiant || !password) {
      return res.status(400).json({ 
        error: 'Identifiant et mot de passe requis.' 
      });
    }
    
    // 1. Trouver le credential
    const credential = await prisma.enterpriseCredential.findUnique({
      where: { identifiant: identifiant.trim().toUpperCase() },
      include: {
        organization: {
          include: {
            members: {
              where: { isActive: true },
              select: { id: true, role: true, userId: true, title: true }
            }
          }
        }
      }
    });
    
    if (!credential) {
      return res.status(401).json({ 
        error: 'Identifiant invalide. Vérifiez votre numéro PLT-XXXX-XXXX.' 
      });
    }
    
    // 2. Vérifier si actif
    if (!credential.isActive) {
      return res.status(403).json({ 
        error: 'Cet identifiant a été désactivé. Contactez l\'administration PL4TO.' 
      });
    }
    
    if (!credential.organization.isActive) {
      return res.status(403).json({ 
        error: 'Cette organisation a été désactivée. Contactez l\'administration PL4TO.' 
      });
    }
    
    // 3. Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, credential.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Mot de passe incorrect.' 
      });
    }
    
    // 4. Mettre à jour lastLoginAt et loginCount
    await prisma.enterpriseCredential.update({
      where: { id: credential.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 }
      }
    });
    
    // 5. Générer un JWT Enterprise
    const token = jwt.sign(
      {
        type: 'enterprise',
        credentialId: credential.id,
        organizationId: credential.organizationId,
        identifiant: credential.identifiant
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 6. Retourner le token + infos organisation
    console.log(`[🏢 Enterprise Login] ✅ Connexion réussie: ${credential.identifiant} → ${credential.organization.name}`);
    
    res.json({
      success: true,
      token,
      organization: {
        id: credential.organization.id,
        name: credential.organization.name,
        slug: credential.organization.slug,
        logoUrl: credential.organization.logoUrl,
        brandColor: credential.organization.brandColor,
        plan: credential.organization.plan,
        maxSeats: credential.organization.maxSeats,
        memberCount: credential.organization.members.length
      },
      identifiant: credential.identifiant
    });
    
  } catch (error) {
    console.error('[Enterprise Login] ❌ Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
});

// ============================================
// POST /api/enterprise/request-portal
// Demande de portail Enterprise (public, pas de JWT)
// L'admin PL4TO traite la demande manuellement
// ============================================
router.post('/request-portal', async (req, res) => {
  try {
    const { 
      cabinetName, 
      contactName, 
      contactEmail, 
      contactPhone, 
      numberOfAdvisors, 
      selectedPackage, 
      message 
    } = req.body;
    
    // Validation
    if (!cabinetName || !contactName || !contactEmail || !selectedPackage) {
      return res.status(400).json({ 
        error: 'Veuillez remplir tous les champs obligatoires.' 
      });
    }
    
    // Vérifier si une demande existe déjà pour cet email
    const existingRequest = await prisma.portalRequest.findFirst({
      where: { 
        contactEmail: contactEmail.trim().toLowerCase(),
        status: 'pending'
      }
    });
    
    if (existingRequest) {
      return res.status(409).json({ 
        error: 'Une demande est déjà en cours de traitement pour cette adresse courriel.',
        existingRequestDate: existingRequest.createdAt
      });
    }
    
    // Créer la demande
    const request = await prisma.portalRequest.create({
      data: {
        cabinetName: cabinetName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone?.trim() || null,
        numberOfAdvisors: parseInt(numberOfAdvisors) || 1,
        selectedPackage,
        message: message?.trim() || null,
        status: 'pending'
      }
    });
    
    console.log(`[🏢 Portal Request] 📨 Nouvelle demande: ${cabinetName} (${contactEmail}) — Package: ${selectedPackage}`);
    
    // TODO: Envoyer un email de notification à l'admin PL4TO
    // TODO: Envoyer un email de confirmation au demandeur
    
    res.status(201).json({
      success: true,
      message: 'Votre demande a été soumise avec succès.',
      requestId: request.id
    });
    
  } catch (error) {
    console.error('[Portal Request] ❌ Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la soumission.' });
  }
});

// ============================================
// POST /api/enterprise/public/request-portal/send-code
// Envoie un code de vérification à 6 chiffres par email
// ============================================
router.post('/request-portal/send-code', async (req, res) => {
  try {
    const { contactEmail, contactName } = req.body;

    if (!contactEmail) {
      return res.status(400).json({ error: 'Courriel requis.' });
    }

    const email = contactEmail.trim().toLowerCase();

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format de courriel invalide.' });
    }

    // Rate limit: max 3 envois par email par heure
    const now = Date.now();
    const rateKey = email;
    const rateData = sendRateLimit.get(rateKey);
    if (rateData) {
      // Nettoyer les entrées expirées (> 1 heure)
      rateData.timestamps = rateData.timestamps.filter(t => now - t < 3600000);
      if (rateData.timestamps.length >= 3) {
        return res.status(429).json({
          error: 'Trop de demandes. Réessayez dans quelques minutes.'
        });
      }
      rateData.timestamps.push(now);
    } else {
      sendRateLimit.set(rateKey, { timestamps: [now] });
    }

    // Générer le code 6 chiffres
    const code = emailService.generateCode();

    // Stocker dans la Map (expire dans 15 minutes)
    verificationCodes.set(email, {
      code,
      expires: now + 15 * 60 * 1000,
      attempts: 0
    });

    // Envoyer l'email via Resend
    const prenom = (contactName || '').trim().split(' ')[0] || 'Professionnel';
    const result = await emailService.sendVerificationCode(
      email,
      prenom,
      code,
      `🔐 Code de vérification PL4TO Pro: ${code}`,
      'verification'
    );

    if (!result.success) {
      console.error('[Portal Verify] ❌ Erreur envoi email:', result.error);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi du courriel.' });
    }

    console.log(`[🏢 Portal Verify] 📧 Code envoyé à ${email}`);

    res.json({
      success: true,
      message: 'Code de vérification envoyé.'
    });

  } catch (error) {
    console.error('[Portal Verify] ❌ Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/enterprise/public/request-portal/verify-code
// Vérifie le code à 6 chiffres saisi par l'utilisateur
// ============================================
router.post('/request-portal/verify-code', async (req, res) => {
  try {
    const { contactEmail, code } = req.body;

    if (!contactEmail || !code) {
      return res.status(400).json({ error: 'Courriel et code requis.' });
    }

    const email = contactEmail.trim().toLowerCase();
    const stored = verificationCodes.get(email);

    if (!stored) {
      return res.status(400).json({
        error: 'Aucun code en attente pour ce courriel. Demandez un nouveau code.',
        expired: true
      });
    }

    // Vérifier expiration
    if (Date.now() > stored.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({
        error: 'Code expiré. Demandez un nouveau code.',
        expired: true
      });
    }

    // Vérifier max tentatives (5)
    if (stored.attempts >= 5) {
      verificationCodes.delete(email);
      return res.status(429).json({
        error: 'Trop de tentatives. Demandez un nouveau code.',
        expired: true
      });
    }

    // Vérifier le code
    stored.attempts += 1;
    if (stored.code !== code.trim()) {
      return res.status(400).json({
        error: 'Code invalide. Vérifiez et réessayez.',
        attemptsLeft: 5 - stored.attempts
      });
    }

    // Succès — supprimer le code
    verificationCodes.delete(email);
    console.log(`[🏢 Portal Verify] ✅ Email vérifié: ${email}`);

    res.json({
      success: true,
      verified: true,
      message: 'Courriel vérifié avec succès.'
    });

  } catch (error) {
    console.error('[Portal Verify] ❌ Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
