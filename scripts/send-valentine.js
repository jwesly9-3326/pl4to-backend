// 📧 Script d'envoi direct - Saint-Valentin 2026
// Usage: node scripts/send-valentine.js

require('dotenv').config();
const { sendCalendarEventEmails } = require('../services/email/communicationEmailService');

async function main() {
  console.log('📧 Envoi courriel Saint-Valentin...');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅' : '❌');
  console.log('');
  
  try {
    const result = await sendCalendarEventEmails();
    console.log('');
    console.log('✅ Résultat:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
  
  process.exit();
}

main();
