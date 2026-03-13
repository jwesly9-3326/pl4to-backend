// 📧 PL4TO - Template Email de Bienvenue (Jour 0)
// Envoyé immédiatement après vérification de l'email

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const welcomeTemplate = {
  fr: {
    subject: '🎉 Bienvenue sur PL4TO — Ton PL4TO est prêt!',
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
              Le GPS pour ton portefeuille
            </p>
          </div>

          <!-- Card principale -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Titre de bienvenue -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧭</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                Bienvenue à bord, ${prenom}!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Ton voyage financier commence maintenant
              </p>
            </div>
            
            <!-- Message principal -->
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Tu as maintenant accès à <strong>toutes les fonctionnalités</strong> pendant 
              <strong style="color: #040449;">${daysRemaining} jours</strong>. 
              C'est le moment de configurer ton outil et voir ta trajectoire financière sur plusieurs années!
            </p>
            
            <!-- Badge Trial -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
                Ton essai Essentiel
              </p>
              <p style="color: #ffffff; font-size: 36px; font-weight: bold; margin: 0 0 8px 0;">
                ${daysRemaining} jours
              </p>
              <p style="color: #ffffff; font-size: 13px; margin: 0;">
                Jusqu'au ${trialEndDate}
              </p>
            </div>
            
            <!-- 3 étapes rapides -->
            <h3 style="color: #040449; font-size: 18px; margin: 0 0 20px 0; text-align: center;">
              🚀 3 étapes pour démarrer
            </h3>
            
            <div style="margin-bottom: 30px;">
              <!-- Étape 1 -->
              <div style="display: flex; align-items: flex-start; margin-bottom: 18px;">
                <div style="background: #ff9800; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0; line-height: 32px; text-align: center;">
                  1
                </div>
                <div style="margin-left: 15px;">
                  <p style="color: #333; font-size: 15px; margin: 0; font-weight: 600;">Ajoute tes comptes bancaires</p>
                  <p style="color: #888; font-size: 13px; margin: 4px 0 0 0;">Chèque, épargne, crédit... avec tes taux d'intérêt pour voir leur vrai impact.</p>
                </div>
              </div>
              
              <!-- Étape 2 -->
              <div style="display: flex; align-items: flex-start; margin-bottom: 18px;">
                <div style="background: #ff9800; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0; line-height: 32px; text-align: center;">
                  2
                </div>
                <div style="margin-left: 15px;">
                  <p style="color: #333; font-size: 15px; margin: 0; font-weight: 600;">Configure ton budget</p>
                  <p style="color: #888; font-size: 13px; margin: 4px 0 0 0;">Revenus, dépenses — ton budget quotidien et la règle 50/30/20 se calculent automatiquement.</p>
                </div>
              </div>
              
              <!-- Étape 3 -->
              <div style="display: flex; align-items: flex-start; margin-bottom: 0;">
                <div style="background: #ff9800; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0; line-height: 32px; text-align: center;">
                  3
                </div>
                <div style="margin-left: 15px;">
                  <p style="color: #333; font-size: 15px; margin: 0; font-weight: 600;">Explore ta trajectoire</p>
                  <p style="color: #888; font-size: 13px; margin: 4px 0 0 0;">Valeur nette, alertes intelligentes, et ton portefeuille projeté jour par jour!</p>
                </div>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="https://pl4to.com/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Commencer maintenant
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Tu reçois cet email car tu as créé un compte sur PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #888; text-decoration: underline; margin-left: 8px;">Ne plus recevoir d'emails</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Le GPS pour ton portefeuille
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  en: {
    subject: '🎉 Welcome to PL4TO — Your PL4TO is ready!',
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
              The GPS for your wallet
            </p>
          </div>

          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Welcome title -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧭</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                Welcome aboard, ${prenom}!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Your financial journey starts now
              </p>
            </div>
            
            <!-- Main message -->
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              You now have access to <strong>all features</strong> for 
              <strong style="color: #040449;">${daysRemaining} days</strong>. 
              It's time to set up your tool and see your financial trajectory over many years!
            </p>
            
            <!-- Trial Badge -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
                Your Essential Trial
              </p>
              <p style="color: #ffffff; font-size: 36px; font-weight: bold; margin: 0 0 8px 0;">
                ${daysRemaining} days
              </p>
              <p style="color: #ffffff; font-size: 13px; margin: 0;">
                Until ${trialEndDate}
              </p>
            </div>
            
            <!-- 3 quick steps -->
            <h3 style="color: #040449; font-size: 18px; margin: 0 0 20px 0; text-align: center;">
              🚀 3 steps to get started
            </h3>
            
            <div style="margin-bottom: 30px;">
              <!-- Step 1 -->
              <div style="display: flex; align-items: flex-start; margin-bottom: 18px;">
                <div style="background: #ff9800; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0; line-height: 32px; text-align: center;">
                  1
                </div>
                <div style="margin-left: 15px;">
                  <p style="color: #333; font-size: 15px; margin: 0; font-weight: 600;">Add your bank accounts</p>
                  <p style="color: #888; font-size: 13px; margin: 4px 0 0 0;">Checking, savings, credit... with your interest rates to see their real impact.</p>
                </div>
              </div>
              
              <!-- Step 2 -->
              <div style="display: flex; align-items: flex-start; margin-bottom: 18px;">
                <div style="background: #ff9800; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0; line-height: 32px; text-align: center;">
                  2
                </div>
                <div style="margin-left: 15px;">
                  <p style="color: #333; font-size: 15px; margin: 0; font-weight: 600;">Set up your budget</p>
                  <p style="color: #888; font-size: 13px; margin: 4px 0 0 0;">Income, expenses — your daily budget and 50/30/20 rule are calculated automatically.</p>
                </div>
              </div>
              
              <!-- Step 3 -->
              <div style="display: flex; align-items: flex-start; margin-bottom: 0;">
                <div style="background: #ff9800; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0; line-height: 32px; text-align: center;">
                  3
                </div>
                <div style="margin-left: 15px;">
                  <p style="color: #333; font-size: 15px; margin: 0; font-weight: 600;">Explore your trajectory</p>
                  <p style="color: #888; font-size: 13px; margin: 4px 0 0 0;">Net worth, smart alerts, and your portfolio projected day by day!</p>
                </div>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="https://pl4to.com/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Get started now
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              You're receiving this email because you created an account on PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #888; text-decoration: underline; margin-left: 8px;">Stop receiving emails</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — The GPS for your wallet
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

module.exports = welcomeTemplate;
