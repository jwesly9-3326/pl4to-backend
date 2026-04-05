// 🔐 Middleware d'authentification optionnelle
// Popule req.user si un JWT valide est fourni, sinon laisse passer sans erreur.
// Utilisé par les endpoints publics qui personnalisent la réponse si l'user est connecté.
const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024', (err, user) => {
    if (!err && user) {
      req.user = { id: user.userId, email: user.email };
    }
    next();
  });
};

module.exports = optionalAuth;
