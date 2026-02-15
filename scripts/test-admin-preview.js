// 📧 Script de test - Aperçu Admin
// Envoie un aperçu de l'événement Printemps à contact@pl4to.com
// Usage: node scripts/test-admin-preview.js

require('dotenv').config();
const { sendAdminPreviewEmails, CALENDAR_EVENTS } = require('../services/email/communicationEmailService');

async function main() {
  console.log('📧 Test aperçu admin...');
  console.log('FROM:', process.env.FROM_EMAIL);
  console.log('');
  
  // Afficher le calendrier des aperçus
  const today = new Date();
  console.log('📅 Prochains aperçus admin programmés:');
  console.log('');
  
  for (const event of CALENDAR_EVENTS) {
    const eventDate = new Date(today.getFullYear(), event.date.month - 1, event.date.day);
    if (eventDate < today) eventDate.setFullYear(eventDate.getFullYear() + 1);
    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    
    const preview30 = new Date(eventDate);
    preview30.setDate(preview30.getDate() - 30);
    const reminder7 = new Date(eventDate);
    reminder7.setDate(reminder7.getDate() - 7);
    
    console.log(`  ${event.emoji} ${(event.name_fr || event.name).padEnd(22)} | ${event.date.day}/${event.date.month} | Dans ${daysUntil}j | Aperçu: ${preview30.toLocaleDateString('fr-CA')} | Rappel: ${reminder7.toLocaleDateString('fr-CA')}`);
  }
  
  console.log('');
  console.log('📧 Envoi du test...');
  
  try {
    const result = await sendAdminPreviewEmails();
    console.log('');
    console.log('✅ Résultat:', JSON.stringify(result, null, 2));
    
    if (result.sent === 0) {
      console.log('');
      console.log('ℹ️  Aucun événement dans la fenêtre 30j ou 7j aujourd\'hui.');
      console.log('    Pour tester, lance: node scripts/test-admin-preview-force.js');
    }
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
  
  process.exit();
}

main();
