// 🔐 ROUTES ENTERPRISE AUTH - Connexion Cabinet + Demande de Portail
// Routes PUBLIQUES (pas de JWT utilisateur requis)
// Séparé des routes enterprise.routes.js (qui nécessitent un JWT)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma-client');

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

module.exports = router;
