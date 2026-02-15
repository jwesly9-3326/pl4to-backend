// 📧 PL4TO - Template Email Réactivation (Jour 17)
// Ton humble + Question + Dernière offre + Porte ouverte finale

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const reactivationTemplate = {
  fr: {
    subject: '💬 Une dernière chose...',
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
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">💬</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                ${prenom}, une dernière chose...
              </h2>
              <p style="color: #555; font-size: 16px; margin: 0;">
                Promis 😊
              </p>
            </div>

            <!-- Question -->
            <div style="background: #f5f5f5; border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
              <h3 style="color: #555; font-size: 18px; margin: 0 0 15px 0;">
                🤔 Est-ce que PL4TO n'était pas ce que tu cherchais?
              </h3>
              <p style="color: #666; font-size: 15px; line-height: 1.7; margin: 0;">
                On aimerait vraiment comprendre.<br>
                Peut-être qu'on peut s'améliorer grâce à toi.
              </p>
            </div>

            <!-- Feedback -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; font-size: 18px; margin: 0 0 15px 0;">
                💬 Ton avis compte pour nous
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
                PL4TO cherche continuellement à s'améliorer. Les feedbacks de nos membres sont essentiels pour développer un outil qui répond vraiment à tes besoins.
              </p>
              <div style="text-align: center;">
                <a href="https://pl4to.com/parametres?section=feedback" 
                   style="display: inline-block; background: #2e7d32; color: white; text-decoration: none; padding: 14px 30px; border-radius: 10px; font-size: 16px; font-weight: bold;">
                  📝 Partager mon feedback
                </a>
              </div>
            </div>

            <!-- Dernière offre -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">🎁</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Dernière chance — Prix premiers utilisateurs
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                On garde cette offre ouverte pour toi, une dernière fois:
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px; margin-bottom: 15px;">
                <span style="color: #ff9800; font-size: 32px; font-weight: bold;">5,99$</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/mois</span>
                <br>
                <span style="color: rgba(255,255,255,0.7); font-size: 14px; text-decoration: line-through;">9,99$/mois après</span>
              </div>
              <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0;">
                Après cet email, l'offre ne sera plus disponible.
              </p>
            </div>

            <!-- CTA Principal -->
            <div style="text-align: center; margin: 25px 0 20px 0;">
              <a href="https://pl4to.com/parametres" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Réactiver mon accès Essentiel
              </a>
            </div>

            <!-- Mot de fin -->
            <div style="background: #fff8e1; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #ffcc80;">
              <p style="color: #555; font-size: 15px; margin: 0; line-height: 1.7;">
                👋 Si ce n'est pas pour maintenant, on comprend totalement.<br>
                Ton compte gratuit reste actif, et on sera là si tu changes d'avis.<br>
                <strong>À bientôt peut-être, ${prenom}!</strong>
              </p>
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
    subject: '💬 One last thing...',
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
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">💬</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                ${prenom}, one last thing...
              </h2>
              <p style="color: #555; font-size: 16px; margin: 0;">
                Promise 😊
              </p>
            </div>

            <!-- Question -->
            <div style="background: #f5f5f5; border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
              <h3 style="color: #555; font-size: 18px; margin: 0 0 15px 0;">
                🤔 Wasn't PL4TO what you were looking for?
              </h3>
              <p style="color: #666; font-size: 15px; line-height: 1.7; margin: 0;">
                We'd really like to understand.<br>
                Maybe we can improve thanks to you.
              </p>
            </div>

            <!-- Feedback -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; font-size: 18px; margin: 0 0 15px 0;">
                💬 Your feedback matters to us
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
                PL4TO is continuously improving. Feedback from our members is essential to develop a tool that truly meets your needs.
              </p>
              <div style="text-align: center;">
                <a href="https://pl4to.com/parametres?section=feedback" 
                   style="display: inline-block; background: #2e7d32; color: white; text-decoration: none; padding: 14px 30px; border-radius: 10px; font-size: 16px; font-weight: bold;">
                  📝 Share my feedback
                </a>
              </div>
            </div>

            <!-- Last offer -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">🎁</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Last chance — Early user price
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                We're keeping this offer open for you, one last time:
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px; margin-bottom: 15px;">
                <span style="color: #ff9800; font-size: 32px; font-weight: bold;">$5.99</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/month</span>
                <br>
                <span style="color: rgba(255,255,255,0.7); font-size: 14px; text-decoration: line-through;">$9.99/month after</span>
              </div>
              <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0;">
                After this email, the offer will no longer be available.
              </p>
            </div>

            <!-- Main CTA -->
            <div style="text-align: center; margin: 25px 0 20px 0;">
              <a href="https://pl4to.com/parametres" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Reactivate my Essential access
              </a>
            </div>

            <!-- Closing message -->
            <div style="background: #fff8e1; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #ffcc80;">
              <p style="color: #555; font-size: 15px; margin: 0; line-height: 1.7;">
                👋 If now isn't the right time, we totally understand.<br>
                Your free account stays active, and we'll be here if you change your mind.<br>
                <strong>See you around maybe, ${prenom}!</strong>
              </p>
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

module.exports = reactivationTemplate;
