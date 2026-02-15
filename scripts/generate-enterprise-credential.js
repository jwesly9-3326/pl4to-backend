// 🔑 SCRIPT ADMIN - Générer un identifiant Enterprise
// Usage: node scripts/generate-enterprise-credential.js <organizationId> [password]
// Si pas de password fourni, un mot de passe temporaire est généré
//
// Exemple:
//   node scripts/generate-enterprise-credential.js abc-123-def
//   node scripts/generate-enterprise-credential.js abc-123-def MonMotDePasse123

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Générer un identifiant unique PLT-XXXX-XXXX
function generateIdentifiant() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Pas de 0/O/1/I pour éviter confusion
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PLT-${year}-${suffix}`;
}

// Générer un mot de passe temporaire
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function main() {
  const organizationId = process.argv[2];
  const customPassword = process.argv[3];
  
  if (!organizationId) {
    console.log('');
    console.log('🔑 Générateur d\'identifiants Enterprise PL4TO');
    console.log('================================================');
    console.log('');
    console.log('Usage: node scripts/generate-enterprise-credential.js <organizationId> [password]');
    console.log('');
    
    // Lister les organisations existantes
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true, isActive: true }
    });
    
    if (orgs.length > 0) {
      console.log('📋 Organisations existantes:');
      orgs.forEach(org => {
        console.log(`   ${org.isActive ? '✅' : '❌'} ${org.name} (${org.slug}) → ID: ${org.id}`);
      });
    } else {
      console.log('⚠️  Aucune organisation trouvée. Créez-en une d\'abord avec seed-enterprise.js');
    }
    
    // Lister les demandes en attente
    const requests = await prisma.portalRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' }
    });
    
    if (requests.length > 0) {
      console.log('');
      console.log('📨 Demandes de portail en attente:');
      requests.forEach(req => {
        console.log(`   📋 ${req.cabinetName} — ${req.contactEmail} — Package: ${req.selectedPackage} — ${req.createdAt.toLocaleDateString()}`);
      });
    }
    
    console.log('');
    await prisma.$disconnect();
    process.exit(0);
  }
  
  try {
    // Vérifier que l'organisation existe
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { credentials: true }
    });
    
    if (!org) {
      console.error(`❌ Organisation non trouvée: ${organizationId}`);
      await prisma.$disconnect();
      process.exit(1);
    }
    
    // Générer identifiant unique (vérifier unicité)
    let identifiant;
    let exists = true;
    while (exists) {
      identifiant = generateIdentifiant();
      const check = await prisma.enterpriseCredential.findUnique({ where: { identifiant } });
      exists = !!check;
    }
    
    // Mot de passe
    const password = customPassword || generateTempPassword();
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Créer le credential
    const credential = await prisma.enterpriseCredential.create({
      data: {
        organizationId,
        identifiant,
        passwordHash,
        isActive: true
      }
    });
    
    console.log('');
    console.log('✅ ═══════════════════════════════════════════════');
    console.log('   IDENTIFIANT ENTERPRISE CRÉÉ AVEC SUCCÈS');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`   🏢 Organisation: ${org.name}`);
    console.log(`   🔑 Identifiant:  ${identifiant}`);
    console.log(`   🔒 Mot de passe: ${password}`);
    console.log('');
    console.log('   📧 Envoyez ces informations au cabinet par courriel sécurisé.');
    console.log('   ⚠️  Le mot de passe ne sera plus visible après cette étape.');
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  await prisma.$disconnect();
}

main();
