// 🌍 PL4TO - Régions supportées (pays + provinces/états)
// Source unique de vérité pour les régions disponibles dans l'app.
// Frontend consomme ce endpoint pour peupler les sélecteurs de région.

const express = require('express');
const router = express.Router();

const REGIONS = {
  countries: [
    {
      code: 'CA',
      name_fr: 'Canada',
      name_en: 'Canada',
      currency: 'CAD',
      currencySymbol: '$',
      flag: '🇨🇦',
      regions: [
        { code: 'QC', name_fr: 'Québec',                   name_en: 'Quebec',                   timezone: 'America/Toronto'   },
        { code: 'ON', name_fr: 'Ontario',                  name_en: 'Ontario',                  timezone: 'America/Toronto'   },
        { code: 'BC', name_fr: 'Colombie-Britannique',     name_en: 'British Columbia',         timezone: 'America/Vancouver' },
        { code: 'AB', name_fr: 'Alberta',                  name_en: 'Alberta',                  timezone: 'America/Edmonton'  },
        { code: 'SK', name_fr: 'Saskatchewan',             name_en: 'Saskatchewan',             timezone: 'America/Regina'    },
        { code: 'MB', name_fr: 'Manitoba',                 name_en: 'Manitoba',                 timezone: 'America/Winnipeg'  },
        { code: 'NB', name_fr: 'Nouveau-Brunswick',        name_en: 'New Brunswick',            timezone: 'America/Moncton'   },
        { code: 'NS', name_fr: 'Nouvelle-Écosse',          name_en: 'Nova Scotia',              timezone: 'America/Halifax'   },
        { code: 'PE', name_fr: 'Île-du-Prince-Édouard',    name_en: 'Prince Edward Island',     timezone: 'America/Halifax'   },
        { code: 'NL', name_fr: 'Terre-Neuve-et-Labrador',  name_en: 'Newfoundland and Labrador', timezone: 'America/St_Johns'  }
      ]
    }
    // Phase 2: ajouter US quand les providers de données éco pour les états US sont prêts
  ]
};

// Index rapide: code région → { country, currency, timezone }
const REGION_INDEX = {};
REGIONS.countries.forEach(c => {
  c.regions.forEach(r => {
    REGION_INDEX[r.code] = {
      country: c.code,
      currency: c.currency,
      timezone: r.timezone,
      name_fr: r.name_fr,
      name_en: r.name_en
    };
  });
});

// GET /api/regions — liste complète
router.get('/', (req, res) => {
  res.json({ success: true, data: REGIONS });
});

// GET /api/regions/:code — détail d'une région précise
router.get('/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const region = REGION_INDEX[code];
  if (!region) {
    return res.status(404).json({ success: false, error: 'Région inconnue' });
  }
  res.json({ success: true, data: { code, ...region } });
});

module.exports = { router, REGIONS, REGION_INDEX };
