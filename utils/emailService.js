// 📧 PL4TO - Service d'envoi d'emails
// Utilise Resend pour l'envoi d'emails transactionnels

const { Resend } = require('resend');

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

// Email d'expédition - Domaine pl4to.com vérifié ✅
const FROM_EMAIL = process.env.FROM_EMAIL || 'PL4TO <jhon.desir@pl4to.com>';

const emailService = {
  /**
   * Envoyer un code de vérification d'email
   * @param {string} to - Email du destinataire
   * @param {string} prenom - Prénom de l'utilisateur
   * @param {string} code - Code à 6 chiffres
   * @param {string} [customSubject] - Sujet personnalisé (optionnel)
   * @param {string} [type] - Type d'email: 'verification' | 'email_change' (optionnel)
   */
  sendVerificationCode: async (to, prenom, code, customSubject = null, type = 'verification') => {
    try {
      // Déterminer le sujet et le message selon le type
      const isEmailChange = type === 'email_change' || customSubject?.includes('Changement');
      const subject = customSubject || `🔐 Ton code de vérification PL4TO: ${code}`;
      const welcomeMessage = isEmailChange 
        ? `Salut ${prenom}! Tu as demandé à changer ton adresse email PL4TO.`
        : `Utilise ce code pour vérifier ton adresse email et activer ton compte PL4TO.`;
      const headerTitle = isEmailChange ? 'Changement d\'email' : `Bienvenue ${prenom}! 🎉`;
      const footerMessage = isEmailChange 
        ? 'Si tu n\'as pas demandé ce changement d\'email, ignore cet email et ton adresse restera inchangée.'
        : 'Si tu n\'as pas créé de compte PL4TO, ignore cet email.';
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header avec logo -->
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
                <h2 style="color: #040449; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
                  ${headerTitle}
                </h2>
                
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                  ${welcomeMessage}
                </p>
                
                <!-- Code de vérification -->
                <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                  <p style="color: #ffffff; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                    Ton code de vérification
                  </p>
                  <p style="color: #ffffff; font-size: 42px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">
                    ${code}
                  </p>
                </div>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
                  ⏰ Ce code expire dans <strong>15 minutes</strong>.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  ${footerMessage}
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                  © ${new Date().getFullYear()} PL4TO - Ton GPS Financier
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `${headerTitle} ${welcomeMessage} Ton code de vérification PL4TO est: ${code}. Ce code expire dans 15 minutes.`
      });

      if (error) {
        console.error('❌ [EMAIL] Erreur Resend:', error);
        return { success: false, error };
      }

      console.log('✅ [EMAIL] Code envoyé à:', to, 'ID:', data.id);
      return { success: true, id: data.id };
      
    } catch (error) {
      console.error('❌ [EMAIL] Erreur:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Générer un code aléatoire à 6 chiffres
   */
  generateCode: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * Envoyer un email de réinitialisation de mot de passe
   * @param {string} to - Email du destinataire
   * @param {string} prenom - Prénom de l'utilisateur
   * @param {string} resetToken - Token de réinitialisation
   * @param {string} resetUrl - URL complète de réinitialisation
   */
  sendPasswordResetEmail: async (to, prenom, resetToken, resetUrl) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: `🔑 Réinitialise ton mot de passe PL4TO`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header avec logo -->
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
                <h2 style="color: #040449; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
                  🔑 Réinitialisation du mot de passe
                </h2>
                
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                  Salut ${prenom}! Tu as demandé à réinitialiser ton mot de passe PL4TO.
                </p>
                
                <!-- Bouton de réinitialisation -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    🔐 Réinitialiser mon mot de passe
                  </a>
                </div>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
                  ⏰ Ce lien expire dans <strong>1 heure</strong>.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                  Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur:<br>
                  <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  Si tu n'as pas demandé cette réinitialisation, ignore cet email.
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                  © ${new Date().getFullYear()} PL4TO - Ton GPS Financier
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Salut ${prenom}! Tu as demandé à réinitialiser ton mot de passe PL4TO. Clique sur ce lien pour créer un nouveau mot de passe: ${resetUrl}. Ce lien expire dans 1 heure. Si tu n'as pas demandé cette réinitialisation, ignore cet email.`
      });

      if (error) {
        console.error('❌ [EMAIL] Erreur Resend (reset):', error);
        return { success: false, error };
      }

      console.log('✅ [EMAIL] Email de réinitialisation envoyé à:', to, 'ID:', data.id);
      return { success: true, id: data.id };
      
    } catch (error) {
      console.error('❌ [EMAIL] Erreur:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envoyer une notification de waitlist à l'équipe PL4TO
   * @param {string} email - Email de l'utilisateur inscrit
   * @param {string} plan - Plan demandé (pro_ia)
   * @param {string} source - Source de l'inscription
   */
  sendWaitlistNotification: async (email, plan, source) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: ['jhon.desir@pl4to.com'],
        subject: `📥 Nouvelle inscription Waitlist Pro + IA`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 16px; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0 0 10px 0;">🎉 Nouvelle inscription Waitlist!</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Plan Pro + IA</p>
              </div>
              
              <div style="background: white; border-radius: 16px; padding: 30px; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h3 style="color: #333; margin: 0 0 20px 0;">📧 Détails de l'inscription</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Email:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-weight: bold;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Plan:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #8b5cf6; font-weight: bold;">${plan}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Source:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${source}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #666;">Date:</td>
                    <td style="padding: 12px 0; color: #333;">${new Date().toLocaleString('fr-CA')}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} PL4TO - Notification automatique
              </p>
            </div>
          </body>
          </html>
        `,
        text: `Nouvelle inscription Waitlist Pro + IA! Email: ${email}, Plan: ${plan}, Source: ${source}, Date: ${new Date().toLocaleString('fr-CA')}`
      });

      if (error) {
        console.error('❌ [EMAIL] Erreur Resend (waitlist):', error);
        return { success: false, error };
      }

      console.log('✅ [EMAIL] Notification waitlist envoyée, ID:', data.id);
      return { success: true, id: data.id };
      
    } catch (error) {
      console.error('❌ [EMAIL] Erreur:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
