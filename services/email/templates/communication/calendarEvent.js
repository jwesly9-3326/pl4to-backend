// 📧 PL4TO - Template Email Événement Calendrier
// Envoyé quand un événement du calendrier arrive (Saint-Valentin, Pâques, etc.)
// Style: fond sombre PL4TO + carte événement + fun fact + prochain événement

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://pl4to.com';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const calendarEventTemplate = {
  fr: {
    generate: (prenom, event, nextEvent, userId) => ({
      subject: `${event.emoji} ${event.name} — Ton GPS Financier avait prévu le coup!`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #040449;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; font-size: 32px; margin: 0;">
              PL4T<span style="color: #fbbf24;">O</span>
            </h1>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 5px;">
              Ton GPS Financier
            </p>
          </div>
          
          <!-- Greeting -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: white; font-size: 28px; margin: 0;">
              ${event.greeting || ('Bonne ' + event.name + '!')} ${event.emoji}
            </h2>
          </div>

          <!-- Carte événement (style dashboard) -->
          <div style="background: white; border-radius: 16px; padding: 28px; margin-bottom: 25px; border-left: 5px solid ${event.color || '#ec4899'}; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top;">
                  <div style="font-size: 36px; margin-bottom: 8px;">${event.emoji}</div>
                  <h3 style="color: #1e293b; font-size: 22px; font-weight: bold; margin: 0 0 6px 0;">${event.name}</h3>
                  <p style="color: ${event.color || '#ec4899'}; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${event.description}</p>
                  <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0;">${event.month}</p>
                  <span style="display: inline-block; background: ${event.color || '#ec4899'}15; color: ${event.color || '#ec4899'}; padding: 3px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">${event.category}</span>
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <div style="background: linear-gradient(135deg, ${event.color || '#ec4899'}, #f43f5e); color: white; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; display: inline-block;">
                    Aujourd'hui
                  </div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Fun Fact -->
          <div style="background: rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="color: #f9a8d4; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              💡 Fun Fact
            </p>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; line-height: 1.7; margin: 0;">
              ${event.funFact}
            </p>
          </div>

          <!-- Prochain événement -->
          ${nextEvent ? `
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.08);">
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
              📅 Prochain événement sur ta trajectoire
            </p>
            <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">
              ${nextEvent.emoji} ${nextEvent.name} — <span style="color: #fbbf24;">${nextEvent.timeUntil}</span>
            </p>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 6px 0 0 0;">
              ${nextEvent.description}
            </p>
          </div>
          ` : ''}

          <!-- Message -->
          <p style="color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.7; text-align: center; margin: 0 0 30px 0;">
            Pendant que tu profites de ta journée, <strong style="color: white;">PL4TO veille sur la suite</strong>. 🧭
          </p>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
              Voir mon GPS Financier →
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0 0 8px 0;">
              PL4T<span style="color: #fbbf24;">O</span> — Ton GPS Financier
            </p>
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">
              <a href="${BACKEND_URL}/api/communications/unsubscribe?userId=${userId}&type=calendar" style="color: rgba(255,255,255,0.3); text-decoration: underline;">Se désabonner des emails événements</a>
            </p>
          </div>

        </div>
      </body>
      </html>
      `
    })
  },
  en: {
    generate: (prenom, event, nextEvent, userId) => ({
      subject: `${event.emoji} ${event.name} — Your Financial GPS saw it coming!`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #040449;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; font-size: 32px; margin: 0;">PL4T<span style="color: #fbbf24;">O</span></h1>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 5px;">Your Financial GPS</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: white; font-size: 28px; margin: 0;">${event.greeting || ('Happy ' + event.name + '!')} ${event.emoji}</h2>
          </div>

          <div style="background: white; border-radius: 16px; padding: 28px; margin-bottom: 25px; border-left: 5px solid ${event.color || '#ec4899'}; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top;">
                  <div style="font-size: 36px; margin-bottom: 8px;">${event.emoji}</div>
                  <h3 style="color: #1e293b; font-size: 22px; font-weight: bold; margin: 0 0 6px 0;">${event.name}</h3>
                  <p style="color: ${event.color || '#ec4899'}; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${event.description}</p>
                  <p style="color: #94a3b8; font-size: 14px; margin: 0;">${event.month}</p>
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <div style="background: linear-gradient(135deg, ${event.color || '#ec4899'}, #f43f5e); color: white; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; display: inline-block;">Today</div>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="color: #f9a8d4; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">💡 Fun Fact</p>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; line-height: 1.7; margin: 0;">${event.funFact}</p>
          </div>

          ${nextEvent ? `
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.08);">
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">📅 Next event on your trajectory</p>
            <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">${nextEvent.emoji} ${nextEvent.name} — <span style="color: #fbbf24;">${nextEvent.timeUntil}</span></p>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 6px 0 0 0;">${nextEvent.description}</p>
          </div>
          ` : ''}

          <p style="color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.7; text-align: center; margin: 0 0 30px 0;">
            While you enjoy your day, <strong style="color: white;">PL4TO is watching over what's next</strong>. 🧭
          </p>

          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">View my Financial GPS →</a>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0 0 8px 0;">PL4T<span style="color: #fbbf24;">O</span> — Your Financial GPS</p>
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;"><a href="${BACKEND_URL}/api/communications/unsubscribe?userId=${userId}&type=calendar" style="color: rgba(255,255,255,0.3); text-decoration: underline;">Unsubscribe from event emails</a></p>
          </div>
        </div>
      </body>
      </html>
      `
    })
  }
};

module.exports = calendarEventTemplate;
