// Script pour vérifier le TrialHistory de jwesly9@gmail.com
const prisma = require('./prisma-client');

async function checkTrialHistory() {
  const email = 'jwesly9@gmail.com';
  
  console.log(`\n🔍 Vérification pour: ${email}\n`);
  
  try {
    // 1. Vérifier TrialHistory
    const trialHistory = await prisma.trialHistory.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (trialHistory) {
      const now = new Date();
      const endDate = new Date(trialHistory.trialEndDate);
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      
      console.log('✅ TrialHistory TROUVÉ:');
      console.log(`   - Email: ${trialHistory.email}`);
      console.log(`   - Début: ${trialHistory.trialStartDate}`);
      console.log(`   - Fin: ${trialHistory.trialEndDate}`);
      console.log(`   - UserId: ${trialHistory.userId || 'NULL (compte supprimé)'}`);
      console.log(`   - Jours restants: ${daysRemaining > 0 ? daysRemaining : 'EXPIRÉ'}`);
    } else {
      console.log('❌ TrialHistory NON TROUVÉ pour cet email');
      console.log('   → Si tu te réinscris, tu auras un NOUVEAU trial de 14 jours');
      console.log('   → Lance la migration admin pour corriger ça!');
    }
    
    // 2. Vérifier User (si existe encore)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        trialStartDate: true,
        trialEndDate: true,
        trialActive: true,
        subscriptionPlan: true
      }
    });
    
    console.log('\n👤 Compte User:');
    if (user) {
      const now = new Date();
      const endDate = user.trialEndDate ? new Date(user.trialEndDate) : null;
      const daysRemaining = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 'N/A';
      
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Trial Start: ${user.trialStartDate}`);
      console.log(`   - Trial End: ${user.trialEndDate}`);
      console.log(`   - Trial Active: ${user.trialActive}`);
      console.log(`   - Plan: ${user.subscriptionPlan}`);
      console.log(`   - Jours restants: ${daysRemaining}`);
    } else {
      console.log('   - Compte supprimé ou inexistant');
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTrialHistory();
