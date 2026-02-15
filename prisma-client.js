// 📦 GPS FINANCIER - CLIENT PRISMA
// Configuration de la connexion à PostgreSQL

const { PrismaClient } = require('@prisma/client');

// Créer une instance unique de Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Logs pour debug
});

// Gérer la déconnexion proprement
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;