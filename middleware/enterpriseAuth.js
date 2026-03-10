// 🏢 MIDDLEWARE: Authentification Enterprise JWT
// Valide les tokens JWT de type 'enterprise' (connexion via PLT-XXXX-XXXX)
// Séparé du middleware auth.js qui gère les tokens B2C (email/password)
//
// Usage: app.use('/api/enterprise/portal', enterpriseAuth, portalRoutes);
// Attache req.enterprise = { credentialId, organizationId, identifiant }

const jwt = require('jsonwebtoken');
const prisma = require('../prisma-client');

const enterpriseAuth = async (req, res, next) => {
  try {
    // 1. Extraire le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token d\'authentification requis.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Vérifier et décoder le JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Session expirée. Veuillez vous reconnecter.',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        error: 'Token invalide.',
        code: 'INVALID_TOKEN'
      });
    }

    // 3. Vérifier que c'est bien un token enterprise
    if (decoded.type !== 'enterprise') {
      return res.status(401).json({
        error: 'Ce token n\'est pas un token Enterprise.',
        code: 'WRONG_TOKEN_TYPE'
      });
    }

    // 4. Vérifier que le credential et l'organisation sont toujours actifs
    const credential = await prisma.enterpriseCredential.findUnique({
      where: { id: decoded.credentialId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            maxSeats: true,
            plan: true
          }
        }
      }
    });

    if (!credential) {
      return res.status(401).json({
        error: 'Identifiant introuvable.',
        code: 'CREDENTIAL_NOT_FOUND'
      });
    }

    if (!credential.isActive) {
      return res.status(403).json({
        error: 'Cet identifiant a été désactivé. Contactez l\'administration PL4TO.',
        code: 'CREDENTIAL_DISABLED'
      });
    }

    if (!credential.organization.isActive) {
      return res.status(403).json({
        error: 'Cette organisation a été désactivée. Contactez l\'administration PL4TO.',
        code: 'ORG_DISABLED'
      });
    }

    // 5. Attacher les infos enterprise à la requête
    req.enterprise = {
      credentialId: credential.id,
      organizationId: credential.organizationId,
      identifiant: credential.identifiant,
      organization: credential.organization
    };

    next();
  } catch (error) {
    console.error('[Enterprise Auth] Erreur middleware:', error);
    res.status(500).json({ error: 'Erreur serveur d\'authentification.' });
  }
};

module.exports = enterpriseAuth;
