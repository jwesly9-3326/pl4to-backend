// 🏢 ROUTES ADMIN ENTERPRISE - Gestion des demandes de portail
// Accès: Admin PL4TO uniquement (isAdmin = true)
// Montées sur /api/admin/enterprise

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('../prisma-client');
const emailService = require('../utils/emailService');

// ============================================
// MIDDLEWARE: Vérifier que l'utilisateur est admin PL4TO
// ============================================
const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true }
    });
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs PL4TO.' });
    }
    
    next();
  } catch (error) {
    console.error('[Admin Enterprise] Erreur middleware:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

router.use(requireAdmin);

// ============================================
// GET /api/admin/enterprise/portal-requests
// Liste des demandes de portail
// ============================================
router.get('/portal-requests', async (req, res) => {
  try {
    const { status } = req.query; // ?status=pending|approved|rejected
    
    const where = status ? { status } : {};
    
    const requests = await prisma.portalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ requests, total: requests.length });
  } catch (error) {
    console.error('[Admin Enterprise] Erreur portal-requests:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/admin/enterprise/approve-request/:requestId
// Approuver une demande → crée Organization + Credential
// ============================================
router.post('/approve-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { customPassword } = req.body; // Optionnel
    
    // 1. Trouver la demande
    const request = await prisma.portalRequest.findUnique({
      where: { id: requestId }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée.' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Demande déjà ${request.status}.` });
    }
    
    // 2. Déterminer maxSeats selon le package
    const packageSeats = {
      solo: 1,
      cabinet: 5,
      firme: 15
    };
    
    // 3. Créer l'organisation
    const slug = request.cabinetName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Retirer accents
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    
    // Vérifier unicité du slug
    let finalSlug = slug;
    let slugCount = 0;
    while (await prisma.organization.findUnique({ where: { slug: finalSlug } })) {
      slugCount++;
      finalSlug = `${slug}-${slugCount}`;
    }
    
    const organization = await prisma.organization.create({
      data: {
        name: request.cabinetName,
        slug: finalSlug,
        contactEmail: request.contactEmail,
        plan: 'enterprise',
        maxSeats: packageSeats[request.selectedPackage] || 5,
        isActive: true
      }
    });
    
    // 4. Générer identifiant unique
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let identifiant;
    let exists = true;
    while (exists) {
      let suffix = '';
      for (let i = 0; i < 4; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      identifiant = `PLT-${new Date().getFullYear()}-${suffix}`;
      const check = await prisma.enterpriseCredential.findUnique({ where: { identifiant } });
      exists = !!check;
    }
    
    // 5. Mot de passe
    const tempChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    let password = customPassword || '';
    if (!password) {
      for (let i = 0; i < 12; i++) {
        password += tempChars.charAt(Math.floor(Math.random() * tempChars.length));
      }
    }
    const passwordHash = await bcrypt.hash(password, 12);
    
    // 6. Créer le credential
    await prisma.enterpriseCredential.create({
      data: {
        organizationId: organization.id,
        identifiant,
        passwordHash,
        isActive: true
      }
    });
    
    // 7. Mettre à jour la demande
    await prisma.portalRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        organizationId: organization.id,
        processedAt: new Date(),
        processedBy: req.user.id
      }
    });
    
    console.log(`[🏢 Admin] ✅ Demande approuvée: ${request.cabinetName} → ${identifiant}`);

    // 📧 Envoyer email avec identifiants au cabinet
    try {
      await emailService.sendEnterpriseCredentials(
        request.contactEmail,
        request.contactName,
        request.cabinetName,
        identifiant,
        password
      );
      console.log(`[🏢 Admin] 📧 Email envoyé à ${request.contactEmail}`);
    } catch (emailErr) {
      console.error('[🏢 Admin] ⚠️ Email non envoyé:', emailErr.message);
      // On ne bloque pas l'approbation si l'email échoue
    }

    res.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      },
      credential: {
        identifiant,
        password // ⚠️ Envoyé UNE SEULE FOIS, ne sera plus visible
      }
    });
    
  } catch (error) {
    console.error('[Admin Enterprise] Erreur approve-request:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/admin/enterprise/reject-request/:requestId
// Rejeter une demande
// ============================================
router.post('/reject-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    const request = await prisma.portalRequest.findUnique({
      where: { id: requestId }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée.' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Demande déjà ${request.status}.` });
    }
    
    await prisma.portalRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        adminNotes: reason || null,
        processedAt: new Date(),
        processedBy: req.user.id
      }
    });
    
    console.log(`[🏢 Admin] ❌ Demande rejetée: ${request.cabinetName}`);
    
    res.json({ success: true, message: 'Demande rejetée.' });
    
  } catch (error) {
    console.error('[Admin Enterprise] Erreur reject-request:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================
// GET /api/admin/enterprise/organizations
// Liste des organisations Enterprise
// ============================================
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        members: { where: { isActive: true }, select: { id: true, role: true } },
        clients: { where: { status: 'active' }, select: { id: true } },
        credentials: { select: { identifiant: true, isActive: true, lastLoginAt: true, loginCount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      organizations: organizations.map(org => ({
        ...org,
        memberCount: org.members.length,
        clientCount: org.clients.length,
        members: undefined,
        clients: undefined
      }))
    });
  } catch (error) {
    console.error('[Admin Enterprise] Erreur organizations:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
