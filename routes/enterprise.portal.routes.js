// 🏢 ROUTES PORTAIL ENTERPRISE - Dashboard courtier/firme
// Accès: Authentifié via JWT Enterprise (PLT-XXXX-XXXX login)
// Montées sur /api/enterprise/portal
// req.enterprise = { credentialId, organizationId, identifiant, organization }

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const prisma = require('../prisma-client');
const enterpriseAuth = require('../middleware/enterpriseAuth');
const emailService = require('../utils/emailService');

// Appliquer le middleware enterprise auth sur toutes les routes
router.use(enterpriseAuth);

// Rate limit en mémoire pour invitations (organizationId → timestamps[])
const inviteRateLimit = new Map();

// ============================================
// GET /api/enterprise/portal/organization
// Infos de l'organisation du courtier
// ============================================
router.get('/organization', async (req, res) => {
  try {
    const { organization } = req.enterprise;

    // Récupérer les infos complètes de l'organisation
    const org = await prisma.organization.findUnique({
      where: { id: organization.id },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        brandColor: true,
        contactEmail: true,
        phone: true,
        address: true,
        website: true,
        plan: true,
        maxSeats: true,
        isActive: true,
        createdAt: true
      }
    });

    // Récupérer l'identifiant du credential
    const credential = await prisma.enterpriseCredential.findUnique({
      where: { id: req.enterprise.credentialId },
      select: { identifiant: true, lastLoginAt: true, loginCount: true }
    });

    res.json({
      success: true,
      organization: org,
      credential: {
        identifiant: credential.identifiant,
        lastLoginAt: credential.lastLoginAt,
        loginCount: credential.loginCount
      }
    });
  } catch (error) {
    console.error('[Portal] Erreur organization:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// PUT /api/enterprise/portal/organization
// Modifier les infos du cabinet
// ============================================
router.put('/organization', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;
    const { name, contactEmail, phone, address, website, brandColor } = req.body;

    // Validation
    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({ error: 'Le nom ne peut pas être vide.' });
    }
    if (contactEmail !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail.trim())) {
        return res.status(400).json({ error: 'Format de courriel invalide.' });
      }
    }
    if (brandColor !== undefined) {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexRegex.test(brandColor)) {
        return res.status(400).json({ error: 'La couleur doit être un code hexadécimal valide (#XXXXXX).' });
      }
    }

    // Update only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (address !== undefined) updateData.address = address.trim() || null;
    if (website !== undefined) updateData.website = website.trim() || null;
    if (brandColor !== undefined) updateData.brandColor = brandColor;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Aucune modification fournie.' });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
      select: { id: true, name: true, contactEmail: true, phone: true, address: true, website: true, brandColor: true }
    });

    console.log(`[🏢 Portal] ✏️ Organisation modifiée: ${updatedOrg.name}`);
    res.json({ success: true, organization: updatedOrg });
  } catch (error) {
    console.error('[Portal] Erreur PUT organization:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// GET /api/enterprise/portal/dashboard
// Statistiques du portail courtier
// ============================================
router.get('/dashboard', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;

    // Compter les clients en parallèle (exclure les templates)
    const [totalClients, activeClients, invitedClients, recentClients] = await Promise.all([
      prisma.clientProfile.count({
        where: { organizationId: orgId, isTemplate: false, status: { not: 'archived' } }
      }),
      prisma.clientProfile.count({
        where: { organizationId: orgId, isTemplate: false, status: 'active' }
      }),
      prisma.clientProfile.count({
        where: { organizationId: orgId, isTemplate: false, status: 'invited' }
      }),
      prisma.clientProfile.count({
        where: {
          organizationId: orgId,
          isTemplate: false,
          status: { not: 'archived' },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalClients,
        activeClients,
        invitedClients,
        recentClients
      }
    });
  } catch (error) {
    console.error('[Portal] Erreur dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// GET /api/enterprise/portal/clients
// Liste des clients (info de base seulement)
// ============================================
router.get('/clients', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;
    const { search, status } = req.query;

    // Construire le filtre (exclure les templates)
    const where = { organizationId: orgId, isTemplate: false };

    if (status && status !== 'all') {
      where.status = status;
    } else {
      // Par défaut, exclure les archivés
      where.status = { not: 'archived' };
    }

    if (search) {
      where.OR = [
        { prenom: { contains: search, mode: 'insensitive' } },
        { nom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Récupérer les clients (info de base SEULEMENT, pas de données financières)
    const clients = await prisma.clientProfile.findMany({
      where,
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        status: true,
        invitedToB2C: true,
        b2cUserId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer le referralCode de l'org pour affichage
    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { referralCode: true } });

    res.json({
      success: true,
      clients,
      total: clients.length,
      referralCode: org?.referralCode || null
    });
  } catch (error) {
    console.error('[Portal] Erreur clients:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/enterprise/portal/clients/invite
// Inviter un client par courriel
// ============================================
router.post('/clients/invite', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;
    const orgName = req.enterprise.organization.name;
    const { email, prenom, nom } = req.body;

    // 1. Validation email
    if (!email) {
      return res.status(400).json({ error: 'Le courriel est requis.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Format de courriel invalide.' });
    }

    // 2. Rate limiting: max 50 invitations par org par jour
    const now = Date.now();
    const rateKey = orgId;
    const rateData = inviteRateLimit.get(rateKey);
    if (rateData) {
      rateData.timestamps = rateData.timestamps.filter(t => now - t < 86400000); // 24h
      if (rateData.timestamps.length >= 50) {
        return res.status(429).json({
          error: 'Limite d\'invitations atteinte pour aujourd\'hui (50/jour).'
        });
      }
      rateData.timestamps.push(now);
    } else {
      inviteRateLimit.set(rateKey, { timestamps: [now] });
    }

    // 3. Vérifier si ce client est déjà invité dans cette org
    const existingClient = await prisma.clientProfile.findFirst({
      where: {
        organizationId: orgId,
        email: normalizedEmail,
        status: { not: 'archived' }
      }
    });

    if (existingClient) {
      return res.status(409).json({
        error: 'Ce courriel a déjà été invité dans votre organisation.',
        existingStatus: existingClient.status
      });
    }

    // 4. Auto-générer le referralCode du cabinet s'il n'en a pas encore
    let org = await prisma.organization.findUnique({ where: { id: orgId }, select: { referralCode: true } });
    if (!org.referralCode) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      let code;
      for (let i = 0; i < 5; i++) {
        code = `REF-${part()}-${part()}`;
        const exists = await prisma.organization.findUnique({ where: { referralCode: code } });
        if (!exists) break;
      }
      await prisma.organization.update({ where: { id: orgId }, data: { referralCode: code } });
      org = { referralCode: code };
      console.log(`[🏢 Portal] 🔗 Code référence auto-généré: ${code} pour org ${orgId}`);
    }

    // 5. Créer le ClientProfile avec status 'invited'
    const clientProfile = await prisma.clientProfile.create({
      data: {
        organizationId: orgId,
        prenom: prenom?.trim() || '',
        nom: nom?.trim() || '',
        email: normalizedEmail,
        status: 'invited',
        invitedToB2C: true
      }
    });

    // 5. Créer le token d'invitation (UUID, expire dans 30 jours)
    const invitationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    await prisma.clientInvitation.create({
      data: {
        organizationId: orgId,
        clientProfileId: clientProfile.id,
        token: invitationToken,
        email: normalizedEmail,
        expiresAt
      }
    });

    // 6. Envoyer l'email d'invitation
    const inviteUrl = `https://pl4to.com/register?ref=${invitationToken}`;
    const clientName = [prenom, nom].filter(Boolean).join(' ') || normalizedEmail;

    try {
      await emailService.sendClientInvitation(
        normalizedEmail,
        clientName,
        orgName,
        inviteUrl
      );
      console.log(`[🏢 Portal] 📧 Invitation envoyée: ${normalizedEmail} → ${orgName}`);
    } catch (emailErr) {
      console.error('[🏢 Portal] ⚠️ Email non envoyé:', emailErr.message);
      // On ne bloque pas si l'email échoue — le client est quand même créé
    }

    // 8. Réponse (avec referralCode pour confirmation visuelle)
    res.status(201).json({
      success: true,
      message: 'Invitation envoyée avec succès.',
      referralCode: org.referralCode,
      client: {
        id: clientProfile.id,
        prenom: clientProfile.prenom,
        nom: clientProfile.nom,
        email: clientProfile.email,
        status: clientProfile.status,
        createdAt: clientProfile.createdAt
      }
    });

  } catch (error) {
    console.error('[Portal] Erreur invite:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/enterprise/portal/clients/:clientId/resend
// Renvoyer l'invitation à un client
// ============================================
router.post('/clients/:clientId/resend', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;
    const orgName = req.enterprise.organization.name;
    const { clientId } = req.params;

    // Trouver le client
    const client = await prisma.clientProfile.findFirst({
      where: { id: clientId, organizationId: orgId, status: 'invited' }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé ou déjà actif.' });
    }

    // Trouver ou créer un nouveau token
    const existingInvitation = await prisma.clientInvitation.findFirst({
      where: { clientProfileId: clientId, acceptedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    let invitationToken;
    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      // Réutiliser le token existant
      invitationToken = existingInvitation.token;
    } else {
      // Créer un nouveau token
      invitationToken = uuidv4();
      await prisma.clientInvitation.create({
        data: {
          organizationId: orgId,
          clientProfileId: clientId,
          token: invitationToken,
          email: client.email,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Envoyer l'email
    const inviteUrl = `https://pl4to.com/register?ref=${invitationToken}`;
    const clientName = [client.prenom, client.nom].filter(Boolean).join(' ') || client.email;

    await emailService.sendClientInvitation(
      client.email,
      clientName,
      orgName,
      inviteUrl
    );

    console.log(`[🏢 Portal] 📧 Invitation renvoyée: ${client.email}`);

    res.json({
      success: true,
      message: 'Invitation renvoyée avec succès.'
    });

  } catch (error) {
    console.error('[Portal] Erreur resend:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/enterprise/portal/change-password
// Changer le mot de passe du credential enterprise
// ============================================
router.post('/change-password', async (req, res) => {
  try {
    const { credentialId } = req.enterprise;
    const { currentPassword, newPassword } = req.body;

    // 1. Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    }

    // 2. Récupérer le credential avec le hash actuel
    const credential = await prisma.enterpriseCredential.findUnique({
      where: { id: credentialId }
    });

    if (!credential) {
      return res.status(404).json({ error: 'Identifiant introuvable.' });
    }

    // 3. Vérifier le mot de passe actuel
    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(currentPassword, credential.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
    }

    // 4. Hasher et sauvegarder le nouveau mot de passe
    const newHash = await bcrypt.hash(newPassword, 12);

    await prisma.enterpriseCredential.update({
      where: { id: credentialId },
      data: { passwordHash: newHash }
    });

    console.log(`[🏢 Portal] 🔒 Mot de passe changé pour credential: ${credentialId}`);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès.'
    });

  } catch (error) {
    console.error('[Portal] Erreur change-password:', error.message, error.stack);
    res.status(500).json({ error: `Erreur serveur: ${error.message}` });
  }
});

// ============================================
// GET /api/enterprise/portal/templates
// Liste des templates de démonstration
// ============================================
router.get('/templates', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;

    const templates = await prisma.clientProfile.findMany({
      where: {
        organizationId: orgId,
        isTemplate: true
      },
      select: {
        id: true,
        prenom: true,
        nom: true,
        templateName: true,
        notes: true,
        userDataSnapshot: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const templatesWithSummary = templates.map(tpl => {
      const snap = tpl.userDataSnapshot;
      let summary = null;
      if (snap) {
        const accounts = snap.accounts || [];
        const balances = snap.initialBalances?.soldes || [];
        const totalBalance = balances.reduce((sum, b) => sum + (parseFloat(b.solde) || 0), 0);
        const entrees = snap.budgetPlanning?.entrees || [];
        const sorties = snap.budgetPlanning?.sorties || [];
        const goals = snap.financialGoals || [];

        summary = {
          accountCount: accounts.length,
          totalBalance,
          incomeItems: entrees.length,
          expenseItems: sorties.length,
          goalCount: goals.length,
          situation: snap.userInfo?.situationFamiliale || 'inconnu'
        };
      }
      return {
        id: tpl.id,
        prenom: tpl.prenom,
        nom: tpl.nom,
        templateName: tpl.templateName,
        notes: tpl.notes,
        summary,
        createdAt: tpl.createdAt
      };
    });

    res.json({ success: true, templates: templatesWithSummary });
  } catch (error) {
    console.error('[Portal] Erreur GET templates:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/enterprise/portal/templates/:templateId/clone
// Cloner un template en nouveau client
// ============================================
router.post('/templates/:templateId/clone', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;
    const { templateId } = req.params;
    const { prenom, nom } = req.body;

    const template = await prisma.clientProfile.findFirst({
      where: { id: templateId, organizationId: orgId, isTemplate: true }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template non trouvé.' });
    }

    // Cloner le snapshot avec noms mis à jour
    let clonedSnapshot = template.userDataSnapshot
      ? JSON.parse(JSON.stringify(template.userDataSnapshot))
      : null;
    if (clonedSnapshot?.userInfo) {
      if (prenom) clonedSnapshot.userInfo.prenom = prenom;
      if (nom) clonedSnapshot.userInfo.nom = nom;
    }
    if (clonedSnapshot?.initialBalances) {
      clonedSnapshot.initialBalances.dateDepart = new Date().toISOString().split('T')[0];
    }

    const newClient = await prisma.clientProfile.create({
      data: {
        organizationId: orgId,
        prenom: prenom || template.prenom,
        nom: nom || template.nom,
        notes: `Créé à partir du modèle "${template.templateName || 'Démo'}"`,
        userDataSnapshot: clonedSnapshot,
        isTemplate: false,
        status: 'active'
      }
    });

    console.log(`[🏢 Portal] Template "${template.templateName}" cloné → ${newClient.prenom} ${newClient.nom}`);

    res.json({
      success: true,
      client: {
        id: newClient.id,
        prenom: newClient.prenom,
        nom: newClient.nom,
        status: newClient.status,
        createdAt: newClient.createdAt
      }
    });
  } catch (error) {
    console.error('[Portal] Erreur clone template:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// GET /api/enterprise/portal/advisor
// Stats et données pour la page Conseiller
// ============================================
router.get('/advisor', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalReferred, activeClients, invitedClients, recentReferred, recentActive, organization] = await Promise.all([
      prisma.clientProfile.count({
        where: { organizationId: orgId, isTemplate: false, status: { not: 'archived' } }
      }),
      prisma.clientProfile.count({
        where: { organizationId: orgId, isTemplate: false, status: 'active' }
      }),
      prisma.clientProfile.count({
        where: { organizationId: orgId, isTemplate: false, status: 'invited' }
      }),
      prisma.clientProfile.count({
        where: { organizationId: orgId, isTemplate: false, status: { not: 'archived' }, createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.clientProfile.count({
        where: { organizationId: orgId, isTemplate: false, status: 'active', updatedAt: { gte: thirtyDaysAgo } }
      }),
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { referralCode: true, name: true }
      })
    ]);

    res.json({
      success: true,
      referralCode: organization.referralCode || null,
      referralLink: organization.referralCode
        ? `https://pl4to.com/register?ref=${organization.referralCode}`
        : null,
      stats: { totalReferred, activeClients, invitedClients, recentReferred, recentActive }
    });
  } catch (error) {
    console.error('[Portal] Erreur advisor:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/enterprise/portal/advisor/generate-code
// Générer un code de référence unique pour l'organisation
// ============================================
router.post('/advisor/generate-code', async (req, res) => {
  try {
    const orgId = req.enterprise.organizationId;

    // Vérifier si un code existe déjà
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { referralCode: true }
    });

    if (org.referralCode) {
      return res.json({
        success: true,
        referralCode: org.referralCode,
        referralLink: `https://pl4to.com/register?ref=${org.referralCode}`
      });
    }

    // Générer code unique: REF-XXXX-XXXX (sans I/O/0/1 pour lisibilité)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    let referralCode;
    let attempts = 0;
    while (attempts < 10) {
      referralCode = `REF-${part()}-${part()}`;
      const existing = await prisma.organization.findFirst({ where: { referralCode } });
      if (!existing) break;
      attempts++;
    }

    if (attempts >= 10) {
      return res.status(500).json({ error: 'Impossible de générer un code unique.' });
    }

    await prisma.organization.update({
      where: { id: orgId },
      data: { referralCode }
    });

    console.log(`[🏢 Portal] Code référence généré: ${referralCode} pour org ${orgId}`);

    res.json({
      success: true,
      referralCode,
      referralLink: `https://pl4to.com/register?ref=${referralCode}`
    });
  } catch (error) {
    console.error('[Portal] Erreur generate-code:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
