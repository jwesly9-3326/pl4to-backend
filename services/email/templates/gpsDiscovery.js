// 📧 PL4TO - Template Email Récapitulation + Découverte GPS (Jour 4)
// Récap des étapes + incitation à explorer les vues GPS

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const gpsDiscoveryTemplate = {
  fr: {
    subject: '🚀 Ton outil est prêt — as-tu exploré ta trajectoire?',
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
            <p style="color: #666; font-size: 14px; margin-top: 5px;">
              Ton GPS Financier
            </p>
          </div>
          
          <!-- Card principale -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Titre -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">⚙️</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, ton outil prend forme!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Voici où tu en es — et ce qui t'attend
              </p>
            </div>

            <!-- Reminder trial -->
            <div style="background: #f0f4ff; border-radius: 10px; padding: 15px; text-align: center; margin-bottom: 25px;">
              <p style="color: #040449; font-size: 14px; margin: 0;">
                ⏰ Il te reste bientôt <strong>${daysRemaining} jours</strong> d'essai Essentiel
              </p>
            </div>

            <!-- RÉCAP DES ÉTAPES -->
            <div style="background: #f8faf8; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #040449; font-size: 16px; margin: 0 0 18px 0; text-align: center;">
                📋 Ta progression
              </h3>
              
              <div style="margin-bottom: 14px; display: flex; align-items: center;">
                <span style="background: #27ae60; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; font-size: 14px; flex-shrink: 0;">✓</span>
                <span style="color: #333; font-size: 15px; margin-left: 12px; font-weight: 600;">Tes comptes sont configurés</span>
              </div>
              
              <div style="margin-bottom: 14px; display: flex; align-items: center;">
                <span style="background: #27ae60; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; font-size: 14px; flex-shrink: 0;">✓</span>
                <span style="color: #333; font-size: 15px; margin-left: 12px; font-weight: 600;">Ton budget est en place</span>
              </div>
              
              <div style="margin-bottom: 14px; display: flex; align-items: center;">
                <span style="background: #27ae60; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; font-size: 14px; flex-shrink: 0;">✓</span>
                <span style="color: #333; font-size: 15px; margin-left: 12px; font-weight: 600;">Tes objectifs sont inscrits</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="background: #ff9800; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; font-size: 14px; flex-shrink: 0;">→</span>
                <span style="color: #ff9800; font-size: 15px; margin-left: 12px; font-weight: 700;">Explorer ta trajectoire GPS</span>
              </div>
            </div>

            <!-- SECTION GPS DISCOVERY -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #040449; font-size: 18px; margin: 0 0 15px 0; text-align: center;">
                🧭 As-tu essayé les vues de ton outil?
              </h3>
              <p style="color: #555; font-size: 14px; line-height: 1.7; text-align: center; margin: 0 0 20px 0;">
                Ton outil calcule ta trajectoire sur <strong>plusieurs années</strong>, jour par jour. Ça va vite et ça calcule sans arrêt. Essaie ces 3 vues pour voir ton portefeuille sous tous les angles :
              </p>
              
              <!-- Vue Jour -->
              <div style="background: #f0f4ff; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #3498db;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.4em;">📅</span>
                  <div>
                    <strong style="color: #040449; font-size: 15px;">Vue Jour</strong>
                    <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Navigue jour par jour. Vois chaque transaction qui bouge tes soldes.</p>
                  </div>
                </div>
              </div>
              
              <!-- Vue Mensuelle -->
              <div style="background: #fff8e1; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #ff9800;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.4em;">📊</span>
                  <div>
                    <strong style="color: #040449; font-size: 15px;">Vue Mensuelle</strong>
                    <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Zoom arrière! Vois tes tendances mois par mois et repère les périodes creuses.</p>
                  </div>
                </div>
              </div>
              
              <!-- Vue Annuelle -->
              <div style="background: #f0fff4; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #27ae60;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.4em;">🗓️</span>
                  <div>
                    <strong style="color: #040449; font-size: 15px;">Vue Annuelle</strong>
                    <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">La vue d'ensemble! Visualise ton portefeuille sur des décennies entières.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/gps" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🧭 Explorer ma trajectoire
              </a>
            </div>

            <!-- Astuce -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.6;">
                💡 <strong style="color: #ffffff;">Astuce :</strong> Si tu n'as pas encore configuré tes comptes ou ton budget, c'est le moment idéal! Plus ton outil a d'information, plus ta trajectoire sera précise.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Tu reçois cet email car tu as créé un compte sur PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #888; text-decoration: underline; margin-left: 8px;">Ne plus recevoir d'emails</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Ton GPS Financier
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  en: {
    subject: '🚀 Your tool is ready — have you explored your trajectory?',
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
            <p style="color: #666; font-size: 14px; margin-top: 5px;">
              Your Financial GPS
            </p>
          </div>
          
          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Title -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">⚙️</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, your tool is taking shape!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Here's where you stand — and what's next
              </p>
            </div>

            <!-- Trial reminder -->
            <div style="background: #f0f4ff; border-radius: 10px; padding: 15px; text-align: center; margin-bottom: 25px;">
              <p style="color: #040449; font-size: 14px; margin: 0;">
                ⏰ You have almost <strong>${daysRemaining} days</strong> left in your Essential trial
              </p>
            </div>

            <!-- PROGRESS RECAP -->
            <div style="background: #f8faf8; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #040449; font-size: 16px; margin: 0 0 18px 0; text-align: center;">
                📋 Your progress
              </h3>
              
              <div style="margin-bottom: 14px; display: flex; align-items: center;">
                <span style="background: #27ae60; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; font-size: 14px; flex-shrink: 0;">✓</span>
                <span style="color: #333; font-size: 15px; margin-left: 12px; font-weight: 600;">Your accounts are set up</span>
              </div>
              
              <div style="margin-bottom: 14px; display: flex; align-items: center;">
                <span style="background: #27ae60; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; font-size: 14px; flex-shrink: 0;">✓</span>
                <span style="color: #333; font-size: 15px; margin-left: 12px; font-weight: 600;">Your budget is in place</span>
              </div>
              
              <div style="margin-bottom: 14px; display: flex; align-items: center;">
                <span style="background: #27ae60; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; font-size: 14px; flex-shrink: 0;">✓</span>
                <span style="color: #333; font-size: 15px; margin-left: 12px; font-weight: 600;">Your goals are registered</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="background: #ff9800; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; font-size: 14px; flex-shrink: 0;">→</span>
                <span style="color: #ff9800; font-size: 15px; margin-left: 12px; font-weight: 700;">Explore your GPS trajectory</span>
              </div>
            </div>

            <!-- GPS DISCOVERY SECTION -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #040449; font-size: 18px; margin: 0 0 15px 0; text-align: center;">
                🧭 Have you tried your tool's views?
              </h3>
              <p style="color: #555; font-size: 14px; line-height: 1.7; text-align: center; margin: 0 0 20px 0;">
                Your tool calculates your trajectory over <strong>multiple years</strong>, day by day. It's fast and it never stops calculating. Try these 3 views to see your portfolio from every angle:
              </p>
              
              <!-- Day View -->
              <div style="background: #f0f4ff; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #3498db;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.4em;">📅</span>
                  <div>
                    <strong style="color: #040449; font-size: 15px;">Day View</strong>
                    <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Navigate day by day. See every transaction moving your balances.</p>
                  </div>
                </div>
              </div>
              
              <!-- Monthly View -->
              <div style="background: #fff8e1; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #ff9800;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.4em;">📊</span>
                  <div>
                    <strong style="color: #040449; font-size: 15px;">Monthly View</strong>
                    <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Zoom out! See your trends month by month and spot low periods.</p>
                  </div>
                </div>
              </div>
              
              <!-- Yearly View -->
              <div style="background: #f0fff4; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #27ae60;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.4em;">🗓️</span>
                  <div>
                    <strong style="color: #040449; font-size: 15px;">Yearly View</strong>
                    <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">The big picture! Visualize your portfolio across entire decades.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/gps" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🧭 Explore my trajectory
              </a>
            </div>

            <!-- Tip -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.6;">
                💡 <strong style="color: #ffffff;">Tip:</strong> If you haven't set up your accounts or budget yet, now's the perfect time! The more info your tool has, the more accurate your trajectory will be.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              You're receiving this email because you created an account on PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #888; text-decoration: underline; margin-left: 8px;">Stop receiving emails</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Your Financial GPS
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

module.exports = gpsDiscoveryTemplate;
