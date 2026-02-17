// 📧 PL4TO - Template Résumé Hebdomadaire GPS
// Version 2: Confidentialité + Teaser pour engagement
// Sections: Calendrier, Budget (status), Objectifs (%), Alertes (teaser)

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://pl4to.com';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const weeklyReportTemplate = {
  fr: {
    generate: (prenom, report, userId) => ({
      subject: `🧭 ${prenom}, voici ton résumé hebdo PL4TO`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #040449; font-size: 32px; margin: 0;">
              PL4T<span style="color: #fbbf24;">O</span>
            </h1>
            <p style="color: #999; font-size: 14px; margin-top: 5px;">
              Ton GPS Financier
            </p>
          </div>
          
          <!-- Greeting -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #040449; font-size: 24px; margin: 0 0 8px 0;">
              Bonjour ${prenom}! 👋
            </h2>
            <p style="color: #666; font-size: 15px; margin: 0;">
              Voici ton résumé de la semaine du ${report.weekStart}
            </p>
          </div>

          <!-- 📅 Calendrier - Prochain événement -->
          ${report.nextEvent ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              📅 Prochain événement
            </p>
            <p style="color: #040449; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
              ${report.nextEvent.emoji} ${report.nextEvent.name} — <span style="color: #667eea;">${report.nextEvent.timeUntil}</span>
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
              As-tu prévu ton budget pour cet événement?
            </p>
          </div>
          ` : ''}

          <!-- 📊 Budget - Status -->
          ${report.budgetStatus ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              📋 Répartition budgétaire
            </p>
            ${report.budgetStatus === 'balanced' ? `
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">✅</td>
                <td style="vertical-align: middle;">
                  <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0;">Équilibré</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Ton budget est bien réparti. Continue comme ça!</p>
                </td>
              </tr>
            </table>
            ` : `
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">⚖️</td>
                <td style="vertical-align: middle;">
                  <p style="color: #f59e0b; font-size: 16px; font-weight: bold; margin: 0;">Petit ajustement requis</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Ta répartition pourrait bénéficier d'un ajustement. Consulte ton outil!</p>
                </td>
              </tr>
            </table>
            `}
          </div>
          ` : ''}

          <!-- 🎯 Objectifs -->
          ${report.objectifs && report.objectifs.length > 0 ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
              🧭 Tes objectifs
            </p>
            ${report.objectifs.map(obj => `
            <div style="margin-bottom: 14px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: #333; font-size: 14px;">${obj.isReached ? '✅' : '📍'} ${obj.name}</td>
                  <td style="color: ${obj.isReached ? '#22c55e' : '#667eea'}; font-size: 14px; font-weight: bold; text-align: right;">${obj.progress}%</td>
                </tr>
              </table>
              <div style="background: #e9ecef; border-radius: 4px; height: 6px; margin-top: 6px; overflow: hidden;">
                <div style="background: ${obj.isReached ? '#22c55e' : '#667eea'}; height: 100%; width: ${obj.progress}%; border-radius: 4px;"></div>
              </div>
            </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- 🚦 Alertes - Teaser -->
          <div style="background: #fffbeb; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #fef3c7;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              🚦 Trajectoire financière
            </p>
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
              Consulte ton GPS pour les alertes ou embouteillages sur ta trajectoire financière.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
              <!--[if mso]><i style="mso-font-width:200%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
              <span style="color: #ffffff;">Ouvrir mon GPS Financier →</span>
              <!--[if mso]><i style="mso-font-width:200%;">&nbsp;</i><![endif]-->
            </a>
          </div>

          <!-- Signature -->
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0;">
              Bonne semaine ${prenom}!<br>
              <span style="color: #999;">— L'équipe PL4TO</span>
            </p>
          </div>

          <!-- PS -->
          <div style="background: #f8f9fa; border-radius: 10px; padding: 16px; margin-bottom: 25px; text-align: center;">
            <p style="color: #999; font-size: 13px; margin: 0;">
              PS: Tes proches pourraient aussi bénéficier d'un GPS Financier! Partage-leur pl4to.com 🧭
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px 0;">
              PL4T<span style="color: #fbbf24;">O</span> — Ton GPS Financier
            </p>
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              <a href="${BACKEND_URL}/api/communications/unsubscribe?userId=${userId}&type=weekly" style="color: #bbb; text-decoration: underline;">Se désabonner du résumé hebdomadaire</a>
            </p>
          </div>

        </div>
      </body>
      </html>
      `
    })
  },
  en: {
    generate: (prenom, report, userId) => ({
      subject: `🧭 ${prenom}, here's your weekly PL4TO summary`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #040449; font-size: 32px; margin: 0;">
              PL4T<span style="color: #fbbf24;">O</span>
            </h1>
            <p style="color: #999; font-size: 14px; margin-top: 5px;">
              Your Financial GPS
            </p>
          </div>
          
          <!-- Greeting -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #040449; font-size: 24px; margin: 0 0 8px 0;">
              Hello ${prenom}! 👋
            </h2>
            <p style="color: #666; font-size: 15px; margin: 0;">
              Here's your summary for the week of ${report.weekStart}
            </p>
          </div>

          <!-- 📅 Calendar - Next event -->
          ${report.nextEvent ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              📅 Next event
            </p>
            <p style="color: #040449; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
              ${report.nextEvent.emoji} ${report.nextEvent.name} — <span style="color: #667eea;">${report.nextEvent.timeUntil}</span>
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
              Have you planned your budget for this event?
            </p>
          </div>
          ` : ''}

          <!-- 📊 Budget - Status -->
          ${report.budgetStatus ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              📋 Budget overview
            </p>
            ${report.budgetStatus === 'balanced' ? `
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">✅</td>
                <td style="vertical-align: middle;">
                  <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0;">Balanced</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Your budget is well balanced. Keep it up!</p>
                </td>
              </tr>
            </table>
            ` : `
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">⚖️</td>
                <td style="vertical-align: middle;">
                  <p style="color: #f59e0b; font-size: 16px; font-weight: bold; margin: 0;">Small adjustment needed</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Your budget could use a small adjustment. Check your tool!</p>
                </td>
              </tr>
            </table>
            `}
          </div>
          ` : ''}

          <!-- 🎯 Goals -->
          ${report.objectifs && report.objectifs.length > 0 ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
              🧭 Your goals
            </p>
            ${report.objectifs.map(obj => `
            <div style="margin-bottom: 14px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: #333; font-size: 14px;">${obj.isReached ? '✅' : '📍'} ${obj.name}</td>
                  <td style="color: ${obj.isReached ? '#22c55e' : '#667eea'}; font-size: 14px; font-weight: bold; text-align: right;">${obj.progress}%</td>
                </tr>
              </table>
              <div style="background: #e9ecef; border-radius: 4px; height: 6px; margin-top: 6px; overflow: hidden;">
                <div style="background: ${obj.isReached ? '#22c55e' : '#667eea'}; height: 100%; width: ${obj.progress}%; border-radius: 4px;"></div>
              </div>
            </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- 🚦 Alerts - Teaser -->
          <div style="background: #fffbeb; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #fef3c7;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              🚦 Financial trajectory
            </p>
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
              Check your GPS for any alerts or traffic jams on your financial trajectory.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
              <!--[if mso]><i style="mso-font-width:200%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
              <span style="color: #ffffff;">Open my Financial GPS →</span>
              <!--[if mso]><i style="mso-font-width:200%;">&nbsp;</i><![endif]-->
            </a>
          </div>

          <!-- Signature -->
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0;">
              Have a great week ${prenom}!<br>
              <span style="color: #999;">— The PL4TO team</span>
            </p>
          </div>

          <!-- PS -->
          <div style="background: #f8f9fa; border-radius: 10px; padding: 16px; margin-bottom: 25px; text-align: center;">
            <p style="color: #999; font-size: 13px; margin: 0;">
              PS: Your friends could also benefit from a Financial GPS! Share pl4to.com 🧭
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px 0;">
              PL4T<span style="color: #fbbf24;">O</span> — Your Financial GPS
            </p>
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              <a href="${BACKEND_URL}/api/communications/unsubscribe?userId=${userId}&type=weekly" style="color: #bbb; text-decoration: underline;">Unsubscribe from weekly reports</a>
            </p>
          </div>

        </div>
      </body>
      </html>
      `
    })
  }
};

module.exports = weeklyReportTemplate;
