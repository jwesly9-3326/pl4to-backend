// 🔐 Middleware d'authentification JWT réutilisable
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token d\'authentification requis' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'gps_financier_secret_key_super_secure_2024', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token invalide ou expiré' 
      });
    }
    req.user = { id: user.userId, email: user.email };
    next();
  });
};

module.exports = authenticateToken;
