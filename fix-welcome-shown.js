// Script pour marquer le popup welcome comme déjà vu pour jwesly9@gmail.com
const prisma = require('./prisma-client');

async function fixWelcomeShown() {
  const email = 'jwesly9@gmail.com';
  
  console.log(`\n🔧 Correction trialWelcomeShown pour: ${email}\n`);
  
  try {
    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        trialWelcomeShown: true
      },
      select: {
        email: true,
        trialWelcomeShown: true,
        trialActive: true,
        trialEndDate: true
      }
    });
    
    console.log(`✅ Correction appliquée:`);
    console.log(`   - trialWelcomeShown: ${updatedUser.trialWelcomeShown}`);
    console.log(`   - trialActive: ${updatedUser.trialActive}`);
    console.log(`   - trialEndDate: ${updatedUser.trialEndDate}`);
    console.log(`\n📱 Le modal de bienvenue ne s'affichera plus!`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixWelcomeShown();
