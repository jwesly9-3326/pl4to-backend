// 📧 PL4TO - Template Email Conversion 1 (Jour 9)
// Scénario GPS - Faire imaginer à l'utilisateur son outil en action

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const conversion1ScenarioTemplate = {
  fr: {
    subject: '🧠 Imagine: ton propre GPS financier en action',
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
            
            <!-- Titre -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧠</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                ${prenom}, imagine un instant...
              </h2>
              <p style="color: #555; font-size: 16px; margin: 0;">
                Comment ton outil travaille pour toi
              </p>
            </div>

            <!-- Intro -->
            <div style="margin-bottom: 30px;">
              <p style="color: #444; font-size: 16px; line-height: 1.7; text-align: center; margin: 0;">
                PL4TO n'est pas une app bancaire. C'est <strong>ton outil personnel</strong> que tu configures comme tu veux. Laisse-moi te montrer...
              </p>
            </div>

            <!-- SCÉNARIO 1: COMPTES -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 25px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; font-size: 18px; margin: 0 0 12px 0;">
                💼 Ton Portefeuille — Tes règles
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Crée les comptes que TU veux. Pas besoin de données bancaires sensibles!
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px; font-size: 15px; color: #444;">
                <strong style="color: #333;">💡 Exemple:</strong><br>
                → "Voyage 2026" pour suivre tes économies<br>
                → "Fonds d'urgence" pour ta tranquillité<br>
                → "Projet maison" pour ton rêve immobilier<br>
                <em style="color: #666; font-size: 14px;">Invente, organise, visualise — c'est TON outil.</em>
              </div>
            </div>

            <!-- SCÉNARIO 2: BUDGET -->
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 25px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
              <h3 style="color: #e65100; font-size: 18px; margin: 0 0 12px 0;">
                📊 Ton Budget — Ta flexibilité
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Ton outil calcule de façon <strong>exponentielle</strong> sur plusieurs années. Et toutes les fréquences sont supportées!
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px; font-size: 15px; color: #444;">
                <strong style="color: #333;">⚡ Tu peux entrer:</strong><br>
                → Salaire aux 2 semaines? ✅<br>
                → Loyer mensuel? ✅<br>
                → Abonnement hebdomadaire? ✅<br>
                → Prime annuelle? ✅<br>
                <em style="color: #666; font-size: 14px;">PL4TO convertit tout automatiquement.</em>
              </div>
            </div>

            <!-- SCÉNARIO 3: OBJECTIFS -->
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1565c0; font-size: 18px; margin: 0 0 12px 0;">
                🧭 Tes Objectifs — Ta clarté
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Ton outil sait <strong>exactement</strong> quand tu vas atteindre tes objectifs. Pas de devinettes.
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px; font-size: 15px; color: #444;">
                <strong style="color: #333;">🔮 PL4TO te dit:</strong><br>
                → "Tu atteindras 10 000$ le 15 mars 2027"<br>
                → "Objectif voyage: dans 8 mois et 3 jours"<br>
                → "Fonds d'urgence: 67% complété"<br>
                <em style="color: #666; font-size: 14px;">La clarté, c'est le pouvoir.</em>
              </div>
            </div>

            <!-- OFFRE SPÉCIALE -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">🎁</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Offre Premiers Utilisateurs
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                En tant que membre de nos premiers utilisateurs, tu peux garder ton accès <strong style="color: #ff9800;">Essentiel</strong> pour seulement:
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px;">
                <span style="color: #ff9800; font-size: 28px; font-weight: bold;">5,99$</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/mois</span>
                <br>
                <span style="color: rgba(255,255,255,0.8); font-size: 14px; text-decoration: line-through;">au lieu de 9,99$/mois</span>
              </div>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 15px 0 0 0;">
                🔒 Prix garanti à vie pour les nouveaux utilisateurs
              </p>
            </div>

            <!-- COMPTEUR -->
            <div style="background: #fff8e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px; border: 1px solid #ffcc80;">
              <p style="color: #e65100; font-size: 16px; margin: 0;">
                ⏳ Il te reste <strong style="font-size: 22px;">${daysRemaining} jours</strong> pour explorer
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🧭 Explorer mon outil
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
    subject: '🧠 Imagine: your own Financial GPS in action',
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
            
            <!-- Title -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧠</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                ${prenom}, imagine for a moment...
              </h2>
              <p style="color: #555; font-size: 16px; margin: 0;">
                How your tool works for you
              </p>
            </div>

            <!-- Intro -->
            <div style="margin-bottom: 30px;">
              <p style="color: #444; font-size: 16px; line-height: 1.7; text-align: center; margin: 0;">
                PL4TO isn't a banking app. It's <strong>your personal tool</strong> that you configure however you want. Let me show you...
              </p>
            </div>

            <!-- SCENARIO 1: ACCOUNTS -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 25px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; font-size: 18px; margin: 0 0 12px 0;">
                💼 Your Wallet — Your Rules
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Create the accounts YOU want. No sensitive banking data required!
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px; font-size: 15px; color: #444;">
                <strong style="color: #333;">💡 Example:</strong><br>
                → "Trip 2026" to track your savings<br>
                → "Emergency Fund" for your peace of mind<br>
                → "House Project" for your real estate dream<br>
                <em style="color: #666; font-size: 14px;">Create, organize, visualize — it's YOUR tool.</em>
              </div>
            </div>

            <!-- SCENARIO 2: BUDGET -->
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 25px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
              <h3 style="color: #e65100; font-size: 18px; margin: 0 0 12px 0;">
                📊 Your Budget — Your Flexibility
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Your tool calculates <strong>exponentially</strong> over multiple years. And all frequencies are supported!
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px; font-size: 15px; color: #444;">
                <strong style="color: #333;">⚡ You can enter:</strong><br>
                → Bi-weekly salary? ✅<br>
                → Monthly rent? ✅<br>
                → Weekly subscription? ✅<br>
                → Annual bonus? ✅<br>
                <em style="color: #666; font-size: 14px;">PL4TO converts everything automatically.</em>
              </div>
            </div>

            <!-- SCENARIO 3: GOALS -->
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1565c0; font-size: 18px; margin: 0 0 12px 0;">
                🧭 Your Goals — Your Clarity
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Your tool knows <strong>exactly</strong> when you'll reach your goals. No guesswork.
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px; font-size: 15px; color: #444;">
                <strong style="color: #333;">🔮 PL4TO tells you:</strong><br>
                → "You'll reach $10,000 on March 15, 2027"<br>
                → "Trip goal: in 8 months and 3 days"<br>
                → "Emergency fund: 67% complete"<br>
                <em style="color: #666; font-size: 14px;">Clarity is power.</em>
              </div>
            </div>

            <!-- SPECIAL OFFER -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">🎁</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Early User Offer
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                As one of our first users, you can keep your <strong style="color: #ff9800;">Essential</strong> access for only:
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px;">
                <span style="color: #ff9800; font-size: 28px; font-weight: bold;">$5.99</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/month</span>
                <br>
                <span style="color: rgba(255,255,255,0.8); font-size: 14px; text-decoration: line-through;">instead of $9.99/month</span>
              </div>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 15px 0 0 0;">
                🔒 Price guaranteed for life for new users
              </p>
            </div>

            <!-- COUNTER -->
            <div style="background: #fff8e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px; border: 1px solid #ffcc80;">
              <p style="color: #e65100; font-size: 16px; margin: 0;">
                ⏳ You have <strong style="font-size: 22px;">${daysRemaining} days</strong> left to explore
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🧭 Explore my tool
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

module.exports = conversion1ScenarioTemplate;
