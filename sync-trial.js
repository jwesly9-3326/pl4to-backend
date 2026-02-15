// Script pour synchroniser le compte User avec son TrialHistory
const prisma = require('./prisma-client');

async function syncUserWithTrialHistory() {
  const email = 'jwesly9@gmail.com';
  
  console.log(`\n🔄 Synchronisation pour: ${email}\n`);
  
  try {
    // 1. Récupérer le TrialHistory
    const trialHistory = await prisma.trialHistory.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!trialHistory) {
      console.log('❌ Aucun TrialHistory trouvé');
      return;
    }
    
    // 2. Récupérer le User
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      console.log('❌ Aucun User trouvé');
      return;
    }
    
    // 3. Calculer les jours restants
    const now = new Date();
    const endDate = new Date(trialHistory.trialEndDate);
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    const trialActive = daysRemaining > 0;
    
    console.log(`📅 TrialHistory dates:`);
    console.log(`   - Début: ${trialHistory.trialStartDate}`);
    console.log(`   - Fin: ${trialHistory.trialEndDate}`);
    console.log(`   - Jours restants: ${daysRemaining}`);
    
    // 4. Mettre à jour le User
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        trialStartDate: trialHistory.trialStartDate,
        trialEndDate: trialHistory.trialEndDate,
        trialActive: trialActive,
        subscriptionPlan: trialActive ? 'essential' : 'discovery'
      }
    });
    
    // 5. Mettre à jour le TrialHistory avec le nouveau userId
    await prisma.trialHistory.update({
      where: { email: email.toLowerCase() },
      data: { userId: user.id }
    });
    
    console.log(`\n✅ Synchronisation réussie!`);
    console.log(`   - trialStartDate: ${updatedUser.trialStartDate}`);
    console.log(`   - trialEndDate: ${updatedUser.trialEndDate}`);
    console.log(`   - trialActive: ${updatedUser.trialActive}`);
    console.log(`   - subscriptionPlan: ${updatedUser.subscriptionPlan}`);
    console.log(`   - Jours restants: ${daysRemaining}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncUserWithTrialHistory();
