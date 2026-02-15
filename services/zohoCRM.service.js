// ============================================
// 🔗 ZOHO CRM SERVICE
// PL4TO - Intégration CRM pour gestion utilisateurs
// ============================================

const axios = require('axios');

class ZohoCRMService {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Zoho CRM API base URL (pour le Canada, utiliser .com)
    this.baseUrl = 'https://www.zohoapis.com/crm/v2';
    this.authUrl = 'https://accounts.zoho.com/oauth/v2/token';
  }

  // ============================================
  // 🔐 AUTHENTIFICATION - Obtenir/Rafraîchir Access Token
  // ============================================
  async getAccessToken() {
    // Si on a un token valide, le réutiliser
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('[🔐 Zoho] Rafraîchissement du token...');
      
      const response = await axios.post(this.authUrl, null, {
        params: {
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token'
        }
      });

      this.accessToken = response.data.access_token;
      // Token expire dans 1 heure, on rafraîchit 5 min avant
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);
      
      console.log('[✅ Zoho] Token rafraîchi avec succès');
      return this.accessToken;
      
    } catch (error) {
      console.error('[❌ Zoho] Erreur refresh token:', error.response?.data || error.message);
      throw new Error('Impossible de rafraîchir le token Zoho');
    }
  }

  // ============================================
  // 📝 CRÉER UN CONTACT (Nouvel utilisateur)
  // ============================================
  async createContact(userData) {
    const token = await this.getAccessToken();
    
    // Construire les données de base (champs standards seulement)
    const contactRecord = {
      First_Name: userData.prenom || '',
      Last_Name: userData.nom || 'Utilisateur',
      Email: userData.email
    };
    
    // Ajouter les champs personnalisés seulement s'ils existent dans Zoho
    // Note: Les noms API exacts doivent être vérifiés dans Zoho CRM > Setup > Modules > Contacts > Fields
    if (userData.plan) contactRecord.Plan_d_abonnement = userData.plan;
    if (userData.stripeCustomerId) contactRecord.Stripe_Customer_ID = userData.stripeCustomerId;
    
    const contactData = {
      data: [contactRecord],
      trigger: ['workflow']
    };

    try {
      console.log(`[📝 Zoho] Création contact: ${userData.email}`);
      console.log(`[📝 Zoho] Data envoyée:`, JSON.stringify(contactData, null, 2));
      
      const response = await axios.post(
        `${this.baseUrl}/Contacts`,
        contactData,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.data[0];
      
      if (result.code === 'SUCCESS') {
        console.log(`[✅ Zoho] Contact créé: ${result.details.id}`);
        return {
          success: true,
          contactId: result.details.id,
          message: 'Contact créé dans Zoho CRM'
        };
      } else {
        throw new Error(result.message || 'Erreur création contact');
      }
      
    } catch (error) {
      // Si le contact existe déjà (duplicate), essayer de le mettre à jour
      if (error.response?.data?.data?.[0]?.code === 'DUPLICATE_DATA') {
        console.log(`[ℹ️ Zoho] Contact existant, mise à jour...`);
        return this.updateContactByEmail(userData.email, userData);
      }
      
      console.error('[❌ Zoho] Erreur création contact:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || error.message
      };
    }
  }

  // ============================================
  // 🔄 METTRE À JOUR UN CONTACT PAR EMAIL
  // ============================================
  async updateContactByEmail(email, updateData) {
    const token = await this.getAccessToken();
    
    try {
      // 1. Chercher le contact par email
      const searchResponse = await axios.get(
        `${this.baseUrl}/Contacts/search?email=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`
          }
        }
      );

      if (!searchResponse.data.data || searchResponse.data.data.length === 0) {
        console.log(`[ℹ️ Zoho] Contact non trouvé: ${email}, création...`);
        return this.createContact(updateData);
      }

      const contactId = searchResponse.data.data[0].id;
      
      // 2. Mettre à jour le contact
      return this.updateContact(contactId, updateData);
      
    } catch (error) {
      console.error('[❌ Zoho] Erreur recherche contact:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🔄 METTRE À JOUR UN CONTACT PAR ID
  // ============================================
  async updateContact(contactId, updateData) {
    const token = await this.getAccessToken();
    
    // Construire les données de mise à jour
    const dataToUpdate = {};
    
    if (updateData.prenom) dataToUpdate.First_Name = updateData.prenom;
    if (updateData.nom) dataToUpdate.Last_Name = updateData.nom;
    if (updateData.plan) dataToUpdate.Plan_d_abonnement = updateData.plan;
    if (updateData.stripeCustomerId) dataToUpdate.Stripe_Customer_ID = updateData.stripeCustomerId;
    if (updateData.statut) dataToUpdate.Statut_compte = updateData.statut;
    if (updateData.derniereConnexion) dataToUpdate.Derni_re_connexion = updateData.derniereConnexion;

    const contactData = {
      data: [{
        id: contactId,
        ...dataToUpdate
      }]
    };

    try {
      console.log(`[🔄 Zoho] Mise à jour contact: ${contactId}`);
      
      const response = await axios.put(
        `${this.baseUrl}/Contacts`,
        contactData,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.data[0];
      
      if (result.code === 'SUCCESS') {
        console.log(`[✅ Zoho] Contact mis à jour: ${contactId}`);
        return {
          success: true,
          contactId: contactId,
          message: 'Contact mis à jour'
        };
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('[❌ Zoho] Erreur mise à jour contact:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 📊 CRÉER/METTRE À JOUR UNE AFFAIRE (Deal)
  // Pour le pipeline "Utilisateurs PL4TO"
  // ============================================
  async upsertDeal(userData, stage) {
    const token = await this.getAccessToken();
    
    // Mapping des étapes
    const stageMapping = {
      'inscription': 'Inscription',
      'essai': 'Essaie gratuit',
      'actif': 'Abonné actif',
      'churned': 'Churned'
    };

    const dealData = {
      data: [{
        Deal_Name: `${userData.prenom || ''} ${userData.nom || 'Utilisateur'} - PL4TO`,
        Stage: stageMapping[stage] || 'Inscription',
        Pipeline: 'Utilisateurs PL4TO',
        // Lier au contact si on a l'ID
        ...(userData.zohoContactId && {
          Contact_Name: { id: userData.zohoContactId }
        })
      }]
    };

    try {
      console.log(`[📊 Zoho] Création/MAJ deal pour: ${userData.email}, stage: ${stage}`);
      
      const response = await axios.post(
        `${this.baseUrl}/Deals`,
        dealData,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.data[0];
      
      if (result.code === 'SUCCESS') {
        console.log(`[✅ Zoho] Deal créé/mis à jour: ${result.details.id}`);
        return {
          success: true,
          dealId: result.details.id
        };
      }
      
    } catch (error) {
      console.error('[❌ Zoho] Erreur deal:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🔍 RECHERCHER UN CONTACT
  // ============================================
  async findContactByEmail(email) {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/Contacts/search?email=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`
          }
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          success: true,
          contact: response.data.data[0]
        };
      }
      
      return {
        success: false,
        message: 'Contact non trouvé'
      };
      
    } catch (error) {
      console.error('[❌ Zoho] Erreur recherche:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 📈 ÉVÉNEMENTS LIFECYCLE UTILISATEUR
  // Méthodes pratiques pour les événements PL4TO
  // ============================================

  // Nouvel utilisateur inscrit
  async onUserRegistered(user) {
    console.log(`[🎉 Zoho] Nouvel utilisateur: ${user.email}`);
    
    const result = await this.createContact({
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      plan: 'Gratuit',
      statut: 'Actif'
    });

    // Créer le deal dans le pipeline
    if (result.success) {
      await this.upsertDeal({
        ...user,
        zohoContactId: result.contactId
      }, 'inscription');
    }

    return result;
  }

  // Utilisateur commence essai gratuit
  async onTrialStarted(user) {
    console.log(`[🆓 Zoho] Essai gratuit démarré: ${user.email}`);
    
    const result = await this.updateContactByEmail(user.email, {
      plan: 'Essai Gratuit',
      statut: 'Actif'
    });

    await this.upsertDeal(user, 'essai');
    
    return result;
  }

  // Utilisateur devient abonné payant
  async onSubscriptionActivated(user, stripeCustomerId) {
    console.log(`[💰 Zoho] Abonnement activé: ${user.email}`);
    
    const planName = user.subscriptionPlan === 'pro' ? 'Premium' : 'Fondateur';
    
    const result = await this.updateContactByEmail(user.email, {
      plan: planName,
      stripeCustomerId: stripeCustomerId,
      statut: 'Actif'
    });

    await this.upsertDeal(user, 'actif');
    
    return result;
  }

  // Utilisateur annule son abonnement
  async onSubscriptionCanceled(user) {
    console.log(`[🚫 Zoho] Abonnement annulé: ${user.email}`);
    
    const result = await this.updateContactByEmail(user.email, {
      plan: 'Gratuit',
      statut: 'Inactif'
    });

    await this.upsertDeal(user, 'churned');
    
    return result;
  }

  // Mise à jour dernière connexion
  async onUserLogin(email) {
    return this.updateContactByEmail(email, {
      derniereConnexion: new Date().toISOString()
    });
  }
}

// Export singleton
module.exports = new ZohoCRMService();
