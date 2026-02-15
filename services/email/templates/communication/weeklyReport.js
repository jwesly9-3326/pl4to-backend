// 📧 PL4TO - Template Résumé Hebdomadaire GPS
// Envoyé chaque semaine aux utilisateurs opt-in
// Résumé: comptes, budgets, objectifs, GPS status, prochain événement

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
            <h2 style="color: white; font-size: 24px; margin: 0 0 8px 0;">
              Bonjour ${prenom}! 👋
            </h2>
            <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin: 0;">
              Voici ton résumé de la semaine du ${report.weekStart}
            </p>
          </div>

          <!-- GPS Status Card -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 28px; margin-bottom: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">
              🧭 Statut GPS
            </p>
            <p style="color: white; font-size: 22px; font-weight: bold; margin: 0;">
              ${report.gpsStatus || 'Trajectoire en cours'}
            </p>
            ${report.gpsMessage ? `
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 10px 0 0 0;">
              ${report.gpsMessage}
            </p>` : ''}
          </div>

          <!-- Comptes résumé -->
          <div style="background: rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
              💰 Tes comptes
            </p>
            ${report.accounts && report.accounts.length > 0 ? 
              report.accounts.map(acc => `
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                  <td style="color: rgba(255,255,255,0.8); font-size: 15px;">${acc.name}</td>
                  <td style="color: ${acc.balance >= 0 ? '#22c55e' : '#ef4444'}; font-size: 15px; font-weight: bold; text-align: right;">
                    ${acc.balance >= 0 ? '' : '-'}${Math.abs(acc.balance).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                  </td>
                </tr>
              </table>
              `).join('') : `
              <p style="color: rgba(255,255,255,0.5); font-size: 14px; text-align: center; margin: 0;">
                Aucun compte configuré — <a href="${FRONTEND_URL}" style="color: #667eea; text-decoration: underline;">Configure tes comptes</a>
              </p>`
            }
          </div>

          <!-- Budget -->
          ${report.budget ? `
          <div style="background: rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
              📊 Budget du mois
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="color: rgba(255,255,255,0.7); font-size: 14px;">Revenus</td>
                <td style="color: #22c55e; font-size: 15px; font-weight: bold; text-align: right;">${report.budget.revenus}</td>
              </tr>
              <tr><td colspan="2" style="padding: 4px 0;"></td></tr>
              <tr>
                <td style="color: rgba(255,255,255,0.7); font-size: 14px;">Dépenses</td>
                <td style="color: #ef4444; font-size: 15px; font-weight: bold; text-align: right;">${report.budget.depenses}</td>
              </tr>
              <tr><td colspan="2" style="padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"></td></tr>
              <tr><td colspan="2" style="padding: 4px 0;"></td></tr>
              <tr>
                <td style="color: rgba(255,255,255,0.9); font-size: 15px; font-weight: bold;">Solde</td>
                <td style="color: ${report.budget.solde >= 0 ? '#22c55e' : '#ef4444'}; font-size: 16px; font-weight: bold; text-align: right;">${report.budget.soldeFormatted}</td>
              </tr>
            </table>
          </div>
          ` : ''}

          <!-- Objectifs -->
          ${report.objectifs && report.objectifs.length > 0 ? `
          <div style="background: rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
              🎯 Objectifs en cours
            </p>
            ${report.objectifs.map(obj => `
            <div style="margin-bottom: 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: rgba(255,255,255,0.8); font-size: 14px;">${obj.name}</td>
                  <td style="color: #fbbf24; font-size: 14px; font-weight: bold; text-align: right;">${obj.progress}%</td>
                </tr>
              </table>
              <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; margin-top: 6px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); height: 100%; width: ${obj.progress}%; border-radius: 4px;"></div>
              </div>
            </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Prochain événement calendrier -->
          ${report.nextEvent ? `
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.08);">
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
              📅 Prochain événement
            </p>
            <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">
              ${report.nextEvent.emoji} ${report.nextEvent.name} — <span style="color: #fbbf24;">${report.nextEvent.timeUntil}</span>
            </p>
          </div>
          ` : ''}

          <!-- Alertes -->
          ${report.alertes && report.alertes.length > 0 ? `
          <div style="background: rgba(239, 68, 68, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(239, 68, 68, 0.2);">
            <p style="color: #fca5a5; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">
              ⚠️ Alertes
            </p>
            ${report.alertes.map(a => `<p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 6px 0;">• ${a}</p>`).join('')}
          </div>
          ` : ''}

          <!-- Fun Fact -->
          ${report.funFact ? `
          <div style="background: rgba(251, 191, 36, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(251, 191, 36, 0.15);">
            <p style="color: #fbbf24; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">💡 Le savais-tu?</p>
            <p style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.6; margin: 0;">${report.funFact}</p>
          </div>
          ` : ''}

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
              Ouvrir mon GPS Financier →
            </a>
          </div>

          <!-- Signature -->
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0;">
              Bonne semaine ${prenom}!<br>
              <span style="color: rgba(255,255,255,0.4);">— L'équipe PL4TO</span>
            </p>
          </div>

          <!-- PS: Référence -->
          <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 16px; margin-bottom: 25px; text-align: center;">
            <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0;">
              PS: Tes proches pourraient aussi bénéficier d'un GPS Financier! Partage-leur pl4to.com 🧭
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0 0 8px 0;">
              PL4T<span style="color: #fbbf24;">O</span> — Ton GPS Financier
            </p>
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">
              <a href="${BACKEND_URL}/api/communications/unsubscribe?userId=${userId}&type=weekly" style="color: rgba(255,255,255,0.3); text-decoration: underline;">Se désabonner du résumé hebdomadaire</a>
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
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #040449;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; font-size: 32px; margin: 0;">PL4T<span style="color: #fbbf24;">O</span></h1>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 5px;">Your Financial GPS</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: white; font-size: 24px; margin: 0 0 8px 0;">Hello ${prenom}! 👋</h2>
            <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin: 0;">Here's your summary for the week of ${report.weekStart}</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 28px; margin-bottom: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">🧭 GPS Status</p>
            <p style="color: white; font-size: 22px; font-weight: bold; margin: 0;">${report.gpsStatus || 'Trajectory in progress'}</p>
            ${report.gpsMessage ? `<p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 10px 0 0 0;">${report.gpsMessage}</p>` : ''}
          </div>

          <div style="background: rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">💰 Your accounts</p>
            ${report.accounts && report.accounts.length > 0 ? 
              report.accounts.map(acc => `
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                  <td style="color: rgba(255,255,255,0.8); font-size: 15px;">${acc.name}</td>
                  <td style="color: ${acc.balance >= 0 ? '#22c55e' : '#ef4444'}; font-size: 15px; font-weight: bold; text-align: right;">${acc.balance >= 0 ? '' : '-'}$${Math.abs(acc.balance).toFixed(2)}</td>
                </tr>
              </table>`).join('') : `
              <p style="color: rgba(255,255,255,0.5); font-size: 14px; text-align: center; margin: 0;">No accounts configured — <a href="${FRONTEND_URL}" style="color: #667eea;">Set up your accounts</a></p>`
            }
          </div>

          ${report.nextEvent ? `
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.08);">
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">📅 Next event</p>
            <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">${report.nextEvent.emoji} ${report.nextEvent.name} — <span style="color: #fbbf24;">${report.nextEvent.timeUntil}</span></p>
          </div>` : ''}

          ${report.funFact ? `
          <div style="background: rgba(251, 191, 36, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(251, 191, 36, 0.15);">
            <p style="color: #fbbf24; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">💡 Did you know?</p>
            <p style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.6; margin: 0;">${report.funFact}</p>
          </div>` : ''}

          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">Open my Financial GPS →</a>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin: 0;">Have a great week ${prenom}!<br><span style="color: rgba(255,255,255,0.4);">— The PL4TO team</span></p>
          </div>

          <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 16px; margin-bottom: 25px; text-align: center;">
            <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0;">PS: Your friends could also benefit from a Financial GPS! Share pl4to.com 🧭</p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0 0 8px 0;">PL4T<span style="color: #fbbf24;">O</span> — Your Financial GPS</p>
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;"><a href="${BACKEND_URL}/api/communications/unsubscribe?userId=${userId}&type=weekly" style="color: rgba(255,255,255,0.3); text-decoration: underline;">Unsubscribe from weekly reports</a></p>
          </div>
        </div>
      </body>
      </html>
      `
    })
  }
};

module.exports = weeklyReportTemplate;
