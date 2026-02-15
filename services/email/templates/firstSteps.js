// 📧 PL4TO - Template Email Premiers Pas (Jour 2)
// Guide "3 étapes pour maîtriser ton GPS Financier"

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const firstStepsTemplate = {
  fr: {
    subject: '🧭 3 étapes pour maîtriser ton GPS Financier',
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
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧭</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, prêt à configurer ton outil?
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                En 3 étapes simples, tu verras ta trajectoire prendre forme
              </p>
            </div>

            <!-- Reminder trial -->
            <div style="background: #f0f4ff; border-radius: 10px; padding: 15px; text-align: center; margin-bottom: 30px;">
              <p style="color: #040449; font-size: 14px; margin: 0;">
                ⏰ Il te reste bientôt <strong>${daysRemaining} jours</strong> d'essai Essentiel
              </p>
            </div>
            
            <!-- ÉTAPE 1: Comptes -->
            <div style="margin-bottom: 28px; border-left: 4px solid #ff9800; padding-left: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="background: #ff9800; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px; flex-shrink: 0;">1</span>
                <h3 style="color: #040449; font-size: 18px; margin: 0 0 0 12px;">Ajoute tes comptes</h3>
              </div>
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                Commence par créer tes comptes bancaires : chèque, épargne, carte de crédit. Entre simplement le nom et le solde actuel — <strong>aucune donnée sensible requise</strong>.
              </p>
              <a href="https://pl4to.com/dashboard" style="color: #ff9800; font-size: 14px; font-weight: 600; text-decoration: none;">
                ➜ Aller à mes comptes
              </a>
            </div>
            
            <!-- ÉTAPE 2: Budget -->
            <div style="margin-bottom: 28px; border-left: 4px solid #667eea; padding-left: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="background: #667eea; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px; flex-shrink: 0;">2</span>
                <h3 style="color: #040449; font-size: 18px; margin: 0 0 0 12px;">Configure ton budget</h3>
              </div>
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                Ajoute tes revenus et dépenses récurrentes. Tu peux choisir la fréquence de chaque transaction : mensuelle, aux 2 semaines, hebdomadaire... ton outil calcule tout automatiquement.
              </p>
              <a href="https://pl4to.com/budget" style="color: #667eea; font-size: 14px; font-weight: 600; text-decoration: none;">
                ➜ Configurer mon budget
              </a>
            </div>
            
            <!-- ÉTAPE 3: Trajectoire -->
            <div style="margin-bottom: 28px; border-left: 4px solid #27ae60; padding-left: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="background: #27ae60; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px; flex-shrink: 0;">3</span>
                <h3 style="color: #040449; font-size: 18px; margin: 0 0 0 12px;">Explore ta trajectoire</h3>
              </div>
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                C'est ici que la magie opère! Navigue jour par jour dans ton futur portefeuille sur plusieurs années. Repère tout ce qui bouge pour ajuster ta route.
              </p>
              <a href="https://pl4to.com/gps" style="color: #27ae60; font-size: 14px; font-weight: 600; text-decoration: none;">
                ➜ Voir ma trajectoire
              </a>
            </div>

            <!-- Astuce -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 10px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.6;">
                💡 <strong style="color: #ffffff;">Astuce :</strong> Tu n'as pas besoin de tout remplir d'un coup. Commence par tes comptes et quelques transactions principales — tu pourras toujours affiner plus tard!
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
    subject: '🧭 3 steps to master your Financial GPS',
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
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧭</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, ready to set up your tool?
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                In 3 simple steps, you'll see your trajectory take shape
              </p>
            </div>

            <!-- Trial reminder -->
            <div style="background: #f0f4ff; border-radius: 10px; padding: 15px; text-align: center; margin-bottom: 30px;">
              <p style="color: #040449; font-size: 14px; margin: 0;">
                ⏰ You have almost <strong>${daysRemaining} days</strong> left in your Essential trial
              </p>
            </div>
            
            <!-- STEP 1: Accounts -->
            <div style="margin-bottom: 28px; border-left: 4px solid #ff9800; padding-left: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="background: #ff9800; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px; flex-shrink: 0;">1</span>
                <h3 style="color: #040449; font-size: 18px; margin: 0 0 0 12px;">Add your accounts</h3>
              </div>
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                Start by creating your bank accounts: checking, savings, credit card. Simply enter the name and current balance — <strong>no sensitive data required</strong>.
              </p>
              <a href="https://pl4to.com/dashboard" style="color: #ff9800; font-size: 14px; font-weight: 600; text-decoration: none;">
                ➜ Go to my accounts
              </a>
            </div>
            
            <!-- STEP 2: Budget -->
            <div style="margin-bottom: 28px; border-left: 4px solid #667eea; padding-left: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="background: #667eea; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px; flex-shrink: 0;">2</span>
                <h3 style="color: #040449; font-size: 18px; margin: 0 0 0 12px;">Set up your budget</h3>
              </div>
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                Add your recurring income and expenses. Choose the frequency for each transaction: monthly, biweekly, weekly... your tool calculates everything automatically.
              </p>
              <a href="https://pl4to.com/budget" style="color: #667eea; font-size: 14px; font-weight: 600; text-decoration: none;">
                ➜ Set up my budget
              </a>
            </div>
            
            <!-- STEP 3: Trajectory -->
            <div style="margin-bottom: 28px; border-left: 4px solid #27ae60; padding-left: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="background: #27ae60; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px; flex-shrink: 0;">3</span>
                <h3 style="color: #040449; font-size: 18px; margin: 0 0 0 12px;">Explore your trajectory</h3>
              </div>
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                This is where the magic happens! Navigate day by day through your future portfolio over many years. Spot everything that moves to adjust your route.
              </p>
              <a href="https://pl4to.com/gps" style="color: #27ae60; font-size: 14px; font-weight: 600; text-decoration: none;">
                ➜ View my trajectory
              </a>
            </div>

            <!-- Tip -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 10px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.6;">
                💡 <strong style="color: #ffffff;">Tip:</strong> You don't need to fill everything at once. Start with your accounts and a few key transactions — you can always refine later!
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

module.exports = firstStepsTemplate;
