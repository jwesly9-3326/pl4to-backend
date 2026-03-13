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
              Le GPS pour ton portefeuille
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

          <!-- 📊 Highlights comparatifs (si disponibles) -->
          ${report.highlights && report.highlights.length > 0 ? `
          <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #667eea30;">
            <p style="color: #667eea; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0; font-weight: bold;">
              📊 Cette semaine
            </p>
            ${report.highlights.map(h => `
            <div style="margin-bottom: 8px;">
              <p style="color: #333; font-size: 14px; line-height: 1.5; margin: 0;">
                ${h.icon} ${h.message}
              </p>
            </div>
            `).join('')}
          </div>
          ` : ''}

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
                  <td style="color: #333; font-size: 14px;">${obj.justReached ? '🎉' : obj.isReached ? '✅' : '📍'} ${obj.name}</td>
                  <td style="color: ${obj.isReached ? '#22c55e' : '#667eea'}; font-size: 14px; font-weight: bold; text-align: right;">
                    ${obj.progress}%${obj.progressChange !== null && obj.progressChange !== 0 ? ` <span style="color: ${obj.progressChange > 0 ? '#22c55e' : '#ef4444'}; font-size: 12px;">(${obj.progressChange > 0 ? '↑' : '↓'} ${obj.progressChange > 0 ? '+' : ''}${obj.progressChange}%)</span>` : ''}
                  </td>
                </tr>
              </table>
              <div style="background: #e9ecef; border-radius: 4px; height: 6px; margin-top: 6px; overflow: hidden;">
                <div style="background: ${obj.isReached ? '#22c55e' : '#667eea'}; height: 100%; width: ${obj.progress}%; border-radius: 4px;"></div>
              </div>
              ${obj.justReached ? `<p style="color: #22c55e; font-size: 12px; margin: 4px 0 0 0; font-style: italic;">🎉 Objectif atteint cette semaine!</p>` : ''}
            </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- 🚦 Alertes - Teaser enrichi -->
          <div style="background: ${report.alertesCount > 0 ? '#fef2f2' : '#fffbeb'}; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid ${report.alertesCount > 0 ? '#fecaca' : '#fef3c7'};">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              🚦 Trajectoire financière
            </p>
            ${report.alertesCount > 0 ? `
            <p style="color: #ef4444; font-size: 15px; font-weight: bold; margin: 0 0 6px 0;">
              ⚠️ ${report.alertesCount} alerte${report.alertesCount > 1 ? 's' : ''} détectée${report.alertesCount > 1 ? 's' : ''} dans les 6 prochains mois
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
              Consulte ton GPS pour voir les détails et ajuster ta route.
            </p>
            ` : `
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
              ✅ Aucune alerte sur ta trajectoire. Bonne route!
            </p>
            `}
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
              <!--[if mso]><i style="mso-font-width:200%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
              <span style="color: #ffffff;">Ouvrir mon PL4TO →</span>
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
              PS: Tes proches pourraient aussi bénéficier de PL4TO! Partage-leur pl4to.com 🧭
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px 0;">
              PL4T<span style="color: #fbbf24;">O</span> — Le GPS pour ton portefeuille
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
              The GPS for your wallet
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

          <!-- 📊 Comparative highlights (if available) -->
          ${report.highlights && report.highlights.length > 0 ? `
          <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #667eea30;">
            <p style="color: #667eea; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0; font-weight: bold;">
              📊 This week
            </p>
            ${report.highlights.map(h => `
            <div style="margin-bottom: 8px;">
              <p style="color: #333; font-size: 14px; line-height: 1.5; margin: 0;">
                ${h.icon} ${h.message}
              </p>
            </div>
            `).join('')}
          </div>
          ` : ''}

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
                  <td style="color: #333; font-size: 14px;">${obj.justReached ? '🎉' : obj.isReached ? '✅' : '📍'} ${obj.name}</td>
                  <td style="color: ${obj.isReached ? '#22c55e' : '#667eea'}; font-size: 14px; font-weight: bold; text-align: right;">
                    ${obj.progress}%${obj.progressChange !== null && obj.progressChange !== 0 ? ` <span style="color: ${obj.progressChange > 0 ? '#22c55e' : '#ef4444'}; font-size: 12px;">(${obj.progressChange > 0 ? '↑' : '↓'} ${obj.progressChange > 0 ? '+' : ''}${obj.progressChange}%)</span>` : ''}
                  </td>
                </tr>
              </table>
              <div style="background: #e9ecef; border-radius: 4px; height: 6px; margin-top: 6px; overflow: hidden;">
                <div style="background: ${obj.isReached ? '#22c55e' : '#667eea'}; height: 100%; width: ${obj.progress}%; border-radius: 4px;"></div>
              </div>
              ${obj.justReached ? `<p style="color: #22c55e; font-size: 12px; margin: 4px 0 0 0; font-style: italic;">🎉 Goal reached this week!</p>` : ''}
            </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- 🚦 Alerts - Enriched teaser -->
          <div style="background: ${report.alertesCount > 0 ? '#fef2f2' : '#fffbeb'}; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid ${report.alertesCount > 0 ? '#fecaca' : '#fef3c7'};">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              🚦 Financial trajectory
            </p>
            ${report.alertesCount > 0 ? `
            <p style="color: #ef4444; font-size: 15px; font-weight: bold; margin: 0 0 6px 0;">
              ⚠️ ${report.alertesCount} alert${report.alertesCount > 1 ? 's' : ''} detected in the next 6 months
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
              Check your GPS to see the details and adjust your route.
            </p>
            ` : `
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
              ✅ No alerts on your trajectory. Smooth sailing!
            </p>
            `}
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
              <!--[if mso]><i style="mso-font-width:200%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
              <span style="color: #ffffff;">Open my PL4TO →</span>
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
              PS: Your friends could also benefit from PL4TO! Share pl4to.com 🧭
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px 0;">
              PL4T<span style="color: #fbbf24;">O</span> — The GPS for your wallet
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
