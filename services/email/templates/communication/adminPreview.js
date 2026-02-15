// 📧 PL4TO - Template Email Admin (Préparation événement)
// Envoyé 30 jours et 7 jours avant un événement calendrier
// Contient: aperçu du courriel utilisateur + infos modifiables

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const adminPreviewTemplate = {
  generate: (event, nextEvent, daysUntil, isReminder) => ({
    subject: isReminder
      ? `⚠️ RAPPEL 7 JOURS — ${event.emoji} ${event.name_fr} arrive le ${event.date.day}/${event.date.month}!`
      : `📅 APERÇU 30 JOURS — ${event.emoji} ${event.name_fr} arrive dans ${daysUntil} jours`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header Admin -->
        <div style="background: linear-gradient(135deg, #040449 0%, #1e1b4b 100%); border-radius: 16px 16px 0 0; padding: 28px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0 0 8px 0;">
            PL4T<span style="color: #fbbf24;">O</span> — Admin
          </h1>
          <div style="display: inline-block; background: ${isReminder ? '#ef4444' : '#667eea'}; color: white; padding: 6px 18px; border-radius: 20px; font-size: 14px; font-weight: bold;">
            ${isReminder ? '⚠️ RAPPEL FINAL — 7 jours' : '📅 APERÇU — 30 jours avant'}
          </div>
        </div>

        <!-- Info Card -->
        <div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 28px;">
          
          <h2 style="color: #1e293b; font-size: 22px; margin: 0 0 20px 0;">
            ${event.emoji} ${event.name_fr} — ${event.date.day}/${event.date.month}
          </h2>
          
          <div style="background: ${isReminder ? '#fef2f2' : '#eff6ff'}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${isReminder ? '#ef4444' : '#3b82f6'};">
            <p style="color: ${isReminder ? '#991b1b' : '#1e40af'}; font-weight: bold; margin: 0 0 6px 0;">
              ${isReminder ? '⏰ Dernier rappel!' : '📋 Préparation requise'}
            </p>
            <p style="color: #475569; margin: 0; line-height: 1.6;">
              ${isReminder 
                ? `L'événement <strong>${event.name_fr}</strong> est dans <strong>7 jours</strong>. Le courriel sera envoyé automatiquement le <strong>${event.date.day}/${event.date.month}</strong> à tous les utilisateurs. Vérifie le contenu ci-dessous.`
                : `L'événement <strong>${event.name_fr}</strong> est dans <strong>${daysUntil} jours</strong>. C'est le moment de réviser le contenu du courriel qui sera envoyé aux utilisateurs.`
              }
            </p>
          </div>

          <!-- Contenu actuel modifiable -->
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">
            📝 Contenu actuel du courriel
          </h3>
          
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b; font-weight: 600; width: 140px; vertical-align: top;">Greeting FR</td>
              <td style="padding: 12px; color: #1e293b;">${event.greeting_fr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b; font-weight: 600; vertical-align: top;">Greeting EN</td>
              <td style="padding: 12px; color: #1e293b;">${event.greeting_en}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b; font-weight: 600; vertical-align: top;">Description FR</td>
              <td style="padding: 12px; color: #1e293b;">${event.description_fr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b; font-weight: 600; vertical-align: top;">Description EN</td>
              <td style="padding: 12px; color: #1e293b;">${event.description_en}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b; font-weight: 600; vertical-align: top;">Fun Fact FR</td>
              <td style="padding: 12px; color: #1e293b; line-height: 1.5;">${event.funFact_fr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b; font-weight: 600; vertical-align: top;">Fun Fact EN</td>
              <td style="padding: 12px; color: #1e293b; line-height: 1.5;">${event.funFact_en}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b; font-weight: 600; vertical-align: top;">Catégorie</td>
              <td style="padding: 12px; color: #1e293b;">${event.category_fr} / ${event.category_en}</td>
            </tr>
            <tr>
              <td style="padding: 12px; color: #64748b; font-weight: 600; vertical-align: top;">Couleur</td>
              <td style="padding: 12px;">
                <span style="display: inline-block; width: 20px; height: 20px; background: ${event.color}; border-radius: 4px; vertical-align: middle;"></span>
                <span style="color: #1e293b; margin-left: 8px;">${event.color}</span>
              </td>
            </tr>
          </table>

          ${nextEvent ? `
          <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 4px 0;">📅 Prochain événement affiché dans le courriel:</p>
            <p style="color: #1e293b; font-weight: bold; margin: 0;">${nextEvent.emoji} ${nextEvent.name} — ${nextEvent.timeUntil}</p>
          </div>
          ` : ''}

        </div>

        <!-- APERÇU DU COURRIEL UTILISATEUR -->
        <div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 28px;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">
            👁️ Aperçu du courriel utilisateur
          </h3>
          <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0;">
            Voici exactement ce que les utilisateurs recevront. Le prénom sera remplacé dynamiquement.
          </p>
          
          <!-- Mini preview dans un cadre -->
          <div style="border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <!-- Simulated email preview -->
            <div style="background: #040449; padding: 20px;">
              <div style="text-align: center; margin-bottom: 15px;">
                <span style="color: white; font-size: 20px; font-weight: bold;">PL4T<span style="color: #fbbf24;">O</span></span>
              </div>
              <div style="text-align: center; margin-bottom: 15px;">
                <span style="color: white; font-size: 20px;">${event.greeting_fr} ${event.emoji}</span>
              </div>
              
              <!-- Mini carte -->
              <div style="background: white; border-radius: 10px; padding: 16px; margin-bottom: 15px; border-left: 4px solid ${event.color};">
                <span style="font-size: 24px;">${event.emoji}</span>
                <span style="color: #1e293b; font-size: 16px; font-weight: bold; margin-left: 8px;">${event.name_fr}</span>
                <p style="color: ${event.color}; font-size: 13px; margin: 4px 0 0 0;">${event.description_fr}</p>
              </div>
              
              <!-- Mini fun fact -->
              <div style="background: rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1);">
                <p style="color: #f9a8d4; font-size: 12px; font-weight: bold; margin: 0 0 6px 0;">💡 Fun Fact</p>
                <p style="color: rgba(255,255,255,0.8); font-size: 13px; line-height: 1.5; margin: 0;">${event.funFact_fr}</p>
              </div>
              
              <div style="text-align: center;">
                <span style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 24px; border-radius: 25px; font-size: 13px; font-weight: bold;">Voir mon GPS Financier →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div style="background: white; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 28px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0;">
            Pour modifier le contenu, réponds à cet email ou modifie directement dans le code.
          </p>
          <div style="background: #f0fdf4; border-radius: 8px; padding: 12px; border: 1px solid #bbf7d0;">
            <p style="color: #166534; font-size: 13px; margin: 0;">
              ✅ L'envoi automatique est programmé pour le <strong>${event.date.day}/${event.date.month}</strong>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            PL4T<span style="color: #fbbf24;">O</span> — Système de communication interne
          </p>
        </div>

      </div>
    </body>
    </html>
    `
  })
};

module.exports = adminPreviewTemplate;
