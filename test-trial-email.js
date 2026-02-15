// 🧪 Script de test rapide - Envoie l'email de bienvenue à ton adresse
// Usage: node test-trial-email.js

require('dotenv').config();

const { sendTestEmail } = require('./services/email/trialEmailService');

const TO_EMAIL = 'jhon.desir@pl4to.com'; // ← Ton email
const LANGUAGE = 'fr';

async function main() {
  console.log(`\n📧 Envoi de l'email de bienvenue à: ${TO_EMAIL} (${LANGUAGE})\n`);
  
  const result = await sendTestEmail('welcome', TO_EMAIL, LANGUAGE);
  
  if (result.success) {
    console.log(`✅ Email envoyé avec succès!`);
    console.log(`   Resend ID: ${result.id}`);
    console.log(`\n👉 Vérifie ta boîte de réception: ${TO_EMAIL}`);
  } else {
    console.log(`❌ Erreur:`, result.error);
  }
  
  process.exit(0);
}

main();
