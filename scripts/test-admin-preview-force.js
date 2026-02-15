// 📧 Script FORCE - Envoie l'aperçu admin Printemps maintenant
// Usage: node scripts/test-admin-preview-force.js

require('dotenv').config();
const { Resend } = require('resend');
const adminPreviewTemplate = require('../services/email/templates/communication/adminPreview');
const { CALENDAR_EVENTS, getNextEvent } = require('../services/email/communicationEmailService');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'PL4TO <contact@pl4to.com>';
const ADMIN_EMAIL = 'contact@pl4to.com';

async function main() {
  // Trouver l'événement Printemps
  const event = CALENDAR_EVENTS.find(e => e.id === 'printemps');
  if (!event) {
    console.log('❌ Événement Printemps non trouvé');
    process.exit(1);
  }
  
  const today = new Date();
  const eventDate = new Date(today.getFullYear(), event.date.month - 1, event.date.day);
  if (eventDate < today) eventDate.setFullYear(eventDate.getFullYear() + 1);
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  
  // Prochain événement après Printemps
  const nextEvent = getNextEvent('fr');
  
  console.log(`📧 Envoi aperçu admin: ${event.emoji} ${event.name_fr}`);
  console.log(`   Date: ${event.date.day}/${event.date.month} (dans ${daysUntil} jours)`);
  console.log(`   Destinataire: ${ADMIN_EMAIL}`);
  console.log('');
  
  try {
    const { subject, html } = adminPreviewTemplate.generate(
      event, nextEvent, daysUntil, false // false = aperçu 30j
    );
    
    console.log(`   Sujet: ${subject}`);
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html
    });
    
    console.log('');
    console.log(`✅ Envoyé! Resend ID: ${result?.id}`);
    console.log(`📧 Vérifie ta boîte: ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
  
  process.exit();
}

main();
