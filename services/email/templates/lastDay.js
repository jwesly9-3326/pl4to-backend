// 📧 PL4TO - Template Email Dernier Jour (Jour 13)
// Urgence maximale + FOMO + Incitation à essayer une dernière fois

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const lastDayTemplate = {
  fr: {
    subject: '⚠️ Demain, ton accès Essentiel se termine',
    generate: (prenom, trialEndDate, daysRemaining, userId) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #040449; font-size: 32px; margin: 0;">
              PL4T<span style="color: #ff9800;">O</span>
            </h1>
            <p style="color: #555; font-size: 15px; margin-top: 5px;">
              Ton GPS Financier
            </p>
          </div>
          
          <!-- Card principale -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- URGENCE - Compte à rebours -->
            <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
              <h2 style="color: white; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, c'est ta dernière journée
              </h2>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">
                Demain, ton accès <strong>Essentiel</strong> se termine
              </p>
            </div>

            <!-- FOMO - Ce que tu vas perdre -->
            <div style="background: #fff3e0; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #ff9800;">
              <h3 style="color: #e65100; font-size: 18px; margin: 0 0 15px 0;">
                🔒 Ce que tu perds demain avec le plan Gratuit
              </h3>
              <div style="font-size: 15px; color: #444; line-height: 1.8;">
                <div style="margin-bottom: 8px;">❌ <span style="text-decoration: line-through; color: #888;">Vue Mensuelle et Annuelle</span> → Vue journalière seulement</div>
                <div style="margin-bottom: 8px;">❌ <span style="text-decoration: line-through; color: #888;">Calculatrice illimitée</span> → 5 simulations par mois</div>
                <div style="margin-bottom: 8px;">❌ <span style="text-decoration: line-through; color: #888;">Projection sur plusieurs années</span> → Limité à 90 jours</div>
                <div style="margin-bottom: 8px;">❌ <span style="text-decoration: line-through; color: #888;">Objectifs illimités</span> → 2 objectifs maximum</div>
                <div>❌ <span style="text-decoration: line-through; color: #888;">Comptes illimités</span> → 3 comptes maximum</div>
              </div>
            </div>

            <!-- INCITATION - Essaie une dernière fois -->
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1565c0; font-size: 22px; margin: 0 0 12px 0;">
                🧭 Profite de ta dernière journée
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Avant que ton accès change, essaie ce que tu n'as pas encore testé. Une fois que tu vois l'avenir de tes finances, tu voudras toujours y revenir.
              </p>
              
              <div style="display: grid; gap: 10px;">
                <a href="https://pl4to.com/gps-financier" style="text-decoration: none;">
                  <div style="background: white; border-radius: 8px; padding: 14px 15px; display: flex; align-items: center; cursor: pointer; transition: all 0.2s;">
                    <span style="font-size: 20px; margin-right: 12px;">🔭</span>
                    <span style="color: #333; font-size: 15px;"><strong>Voir loin</strong> — Voyage dans 1 an, 5 ans, 10 ans</span>
                  </div>
                </a>
                <a href="https://pl4to.com/budget" style="text-decoration: none;">
                  <div style="background: white; border-radius: 8px; padding: 14px 15px; display: flex; align-items: center; cursor: pointer;">
                    <span style="font-size: 20px; margin-right: 12px;">📊</span>
                    <span style="color: #333; font-size: 15px;"><strong>Confirmer un budget</strong> — Ajoute une dépense récurrente</span>
                  </div>
                </a>
                <a href="https://pl4to.com/calculatrice" style="text-decoration: none;">
                  <div style="background: white; border-radius: 8px; padding: 14px 15px; display: flex; align-items: center; cursor: pointer;">
                    <span style="font-size: 20px; margin-right: 12px;">🧮</span>
                    <span style="color: #333; font-size: 15px;"><strong>Simuler un achat</strong> — Vois l'impact avant de décider</span>
                  </div>
                </a>
                <a href="https://pl4to.com/gps-financier" style="text-decoration: none;">
                  <div style="background: white; border-radius: 8px; padding: 14px 15px; display: flex; align-items: center; cursor: pointer;">
                    <span style="font-size: 20px; margin-right: 12px;">📅</span>
                    <span style="color: #333; font-size: 15px;"><strong>Tester une période</strong> — 1 semaine, 1 mois, 3 mois</span>
                  </div>
                </a>
              </div>
            </div>

            <!-- DERNIÈRE CHANCE - Offre -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">🎁</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Dernière chance
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                Le prix <strong style="color: #ff9800;">premiers utilisateurs</strong> ne reviendra pas.<br>
                Garde ton accès Essentiel pour:
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px; margin-bottom: 15px;">
                <span style="color: #ff9800; font-size: 32px; font-weight: bold;">5,99$</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/mois</span>
                <br>
                <span style="color: rgba(255,255,255,0.7); font-size: 14px; text-decoration: line-through;">9,99$/mois après</span>
              </div>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">
                🔒 Prix garanti si tu t'abonnes aujourd'hui
              </p>
            </div>

            <!-- CTA Principal -->
            <div style="text-align: center; margin: 25px 0 15px 0;">
              <a href="https://pl4to.com/parametres" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Garder mon accès Essentiel
              </a>
            </div>

            <!-- CTA Secondaire -->
            <div style="text-align: center;">
              <a href="https://pl4to.com/gps-financier" 
                 style="color: #1565c0; font-size: 15px; text-decoration: underline;">
                ou explorer une dernière fois →
              </a>
            </div>

          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #777; font-size: 13px; margin: 0;">
              Tu reçois cet email car tu as créé un compte sur PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #666; text-decoration: underline; margin-left: 8px;">Ne plus recevoir d'emails</a>
            </p>
            <p style="color: #777; font-size: 13px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Ton GPS Financier
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  en: {
    subject: '⚠️ Tomorrow, your Essential access ends',
    generate: (prenom, trialEndDate, daysRemaining, userId) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #040449; font-size: 32px; margin: 0;">
              PL4T<span style="color: #ff9800;">O</span>
            </h1>
            <p style="color: #555; font-size: 15px; margin-top: 5px;">
              Your Financial GPS
            </p>
          </div>
          
          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- URGENCY - Countdown -->
            <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
              <h2 style="color: white; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, this is your last day
              </h2>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">
                Tomorrow, your <strong>Essential</strong> access ends
              </p>
            </div>

            <!-- FOMO - What you'll lose -->
            <div style="background: #fff3e0; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #ff9800;">
              <h3 style="color: #e65100; font-size: 18px; margin: 0 0 15px 0;">
                🔒 What you lose tomorrow with the Free plan
              </h3>
              <div style="font-size: 15px; color: #444; line-height: 1.8;">
                <div style="margin-bottom: 8px;">❌ <span style="text-decoration: line-through; color: #888;">Monthly and Yearly view</span> → Daily view only</div>
                <div style="margin-bottom: 8px;">❌ <span style="text-decoration: line-through; color: #888;">Unlimited calculator</span> → 5 simulations per month</div>
                <div style="margin-bottom: 8px;">❌ <span style="text-decoration: line-through; color: #888;">Multi-year projection</span> → Limited to 90 days</div>
                <div style="margin-bottom: 8px;">❌ <span style="text-decoration: line-through; color: #888;">Unlimited goals</span> → 2 goals maximum</div>
                <div>❌ <span style="text-decoration: line-through; color: #888;">Unlimited accounts</span> → 3 accounts maximum</div>
              </div>
            </div>

            <!-- INCITATION - Try one last time -->
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1565c0; font-size: 22px; margin: 0 0 12px 0;">
                🧭 Make the most of your last day
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Before your access changes, try what you haven't tested yet. Once you see the future of your finances, you'll always want to come back.
              </p>
              
              <div style="display: grid; gap: 10px;">
                <a href="https://pl4to.com/gps-financier" style="text-decoration: none;">
                  <div style="background: white; border-radius: 8px; padding: 14px 15px; display: flex; align-items: center; cursor: pointer; transition: all 0.2s;">
                    <span style="font-size: 20px; margin-right: 12px;">🔭</span>
                    <span style="color: #333; font-size: 15px;"><strong>See far ahead</strong> — Travel 1 year, 5 years, 10 years</span>
                  </div>
                </a>
                <a href="https://pl4to.com/budget" style="text-decoration: none;">
                  <div style="background: white; border-radius: 8px; padding: 14px 15px; display: flex; align-items: center; cursor: pointer;">
                    <span style="font-size: 20px; margin-right: 12px;">📊</span>
                    <span style="color: #333; font-size: 15px;"><strong>Confirm a budget</strong> — Add a recurring expense</span>
                  </div>
                </a>
                <a href="https://pl4to.com/calculatrice" style="text-decoration: none;">
                  <div style="background: white; border-radius: 8px; padding: 14px 15px; display: flex; align-items: center; cursor: pointer;">
                    <span style="font-size: 20px; margin-right: 12px;">🧮</span>
                    <span style="color: #333; font-size: 15px;"><strong>Simulate a purchase</strong> — See the impact before deciding</span>
                  </div>
                </a>
                <a href="https://pl4to.com/gps-financier" style="text-decoration: none;">
                  <div style="background: white; border-radius: 8px; padding: 14px 15px; display: flex; align-items: center; cursor: pointer;">
                    <span style="font-size: 20px; margin-right: 12px;">📅</span>
                    <span style="color: #333; font-size: 15px;"><strong>Test a period</strong> — 1 week, 1 month, 3 months</span>
                  </div>
                </a>
              </div>
            </div>

            <!-- LAST CHANCE - Offer -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">🎁</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Last chance
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                The <strong style="color: #ff9800;">early user</strong> price won't come back.<br>
                Keep your Essential access for:
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px; margin-bottom: 15px;">
                <span style="color: #ff9800; font-size: 32px; font-weight: bold;">$5.99</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/month</span>
                <br>
                <span style="color: rgba(255,255,255,0.7); font-size: 14px; text-decoration: line-through;">$9.99/month after</span>
              </div>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">
                🔒 Price guaranteed if you subscribe today
              </p>
            </div>

            <!-- Main CTA -->
            <div style="text-align: center; margin: 25px 0 15px 0;">
              <a href="https://pl4to.com/parametres" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Keep my Essential access
              </a>
            </div>

            <!-- Secondary CTA -->
            <div style="text-align: center;">
              <a href="https://pl4to.com/gps-financier" 
                 style="color: #1565c0; font-size: 15px; text-decoration: underline;">
                or explore one last time →
              </a>
            </div>

          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #777; font-size: 13px; margin: 0;">
              You're receiving this email because you created an account on PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #666; text-decoration: underline; margin-left: 8px;">Stop receiving emails</a>
            </p>
            <p style="color: #777; font-size: 13px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Your Financial GPS
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

module.exports = lastDayTemplate;
