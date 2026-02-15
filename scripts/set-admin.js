// 🔐 Script pour définir l'administrateur PL4TO
// Usage: node scripts/set-admin.js jhon.desir@pl4to.com

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdmin() {
  const adminEmail = process.argv[2] || 'jhon.desir@pl4to.com';
  
  console.log(`\n🔐 Configuration Admin PL4TO`);
  console.log(`================================`);
  
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!user) {
      console.log(`\n❌ Utilisateur ${adminEmail} non trouvé.`);
      console.log(`   → Crée d'abord un compte sur pl4to.com avec cet email.`);
      return;
    }
    
    // 2. Mettre isAdmin à true
    await prisma.user.update({
      where: { email: adminEmail },
      data: { isAdmin: true }
    });
    
    console.log(`\n✅ ${adminEmail} est maintenant administrateur!`);
    
    // 3. Retirer les droits admin des autres (optionnel)
    const otherAdmins = await prisma.user.findMany({
      where: {
        isAdmin: true,
        email: { not: adminEmail }
      }
    });
    
    if (otherAdmins.length > 0) {
      console.log(`\n📋 Autres admins trouvés:`);
      otherAdmins.forEach(admin => {
        console.log(`   - ${admin.email}`);
      });
      
      // Retirer leurs droits
      await prisma.user.updateMany({
        where: {
          isAdmin: true,
          email: { not: adminEmail }
        },
        data: { isAdmin: false }
      });
      
      console.log(`\n⚠️  Droits admin retirés des autres utilisateurs.`);
    }
    
    // 4. Afficher le résumé
    console.log(`\n================================`);
    console.log(`🎉 Terminé! Tu peux maintenant te connecter sur:`);
    console.log(`   → http://localhost:5173/admin`);
    console.log(`   → https://pl4to.com/admin`);
    console.log(`   avec: ${adminEmail}`);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
