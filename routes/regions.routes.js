// 🌍 PL4TO - Régions supportées (pays + provinces/états)
// Source unique de vérité pour les régions disponibles dans l'app.
// Frontend consomme ce endpoint pour peupler les sélecteurs de région.

const express = require('express');
const router = express.Router();

// États-Unis — 50 états + DC avec timezone IANA principal
const US_REGIONS = [
  { code: 'AL', name_fr: 'Alabama',              name_en: 'Alabama',              timezone: 'America/Chicago'      },
  { code: 'AK', name_fr: 'Alaska',               name_en: 'Alaska',               timezone: 'America/Anchorage'    },
  { code: 'AZ', name_fr: 'Arizona',              name_en: 'Arizona',              timezone: 'America/Phoenix'      },
  { code: 'AR', name_fr: 'Arkansas',             name_en: 'Arkansas',             timezone: 'America/Chicago'      },
  { code: 'CA', name_fr: 'Californie',           name_en: 'California',           timezone: 'America/Los_Angeles'  },
  { code: 'CO', name_fr: 'Colorado',             name_en: 'Colorado',             timezone: 'America/Denver'       },
  { code: 'CT', name_fr: 'Connecticut',          name_en: 'Connecticut',          timezone: 'America/New_York'     },
  { code: 'DE', name_fr: 'Delaware',             name_en: 'Delaware',             timezone: 'America/New_York'     },
  { code: 'DC', name_fr: 'District de Columbia', name_en: 'District of Columbia', timezone: 'America/New_York'     },
  { code: 'FL', name_fr: 'Floride',              name_en: 'Florida',              timezone: 'America/New_York'     },
  { code: 'GA', name_fr: 'Géorgie',              name_en: 'Georgia',              timezone: 'America/New_York'     },
  { code: 'HI', name_fr: 'Hawaï',                name_en: 'Hawaii',               timezone: 'Pacific/Honolulu'     },
  { code: 'ID', name_fr: 'Idaho',                name_en: 'Idaho',                timezone: 'America/Boise'        },
  { code: 'IL', name_fr: 'Illinois',             name_en: 'Illinois',             timezone: 'America/Chicago'      },
  { code: 'IN', name_fr: 'Indiana',              name_en: 'Indiana',              timezone: 'America/Indianapolis' },
  { code: 'IA', name_fr: 'Iowa',                 name_en: 'Iowa',                 timezone: 'America/Chicago'      },
  { code: 'KS', name_fr: 'Kansas',               name_en: 'Kansas',               timezone: 'America/Chicago'      },
  { code: 'KY', name_fr: 'Kentucky',             name_en: 'Kentucky',             timezone: 'America/Louisville'   },
  { code: 'LA', name_fr: 'Louisiane',            name_en: 'Louisiana',            timezone: 'America/Chicago'      },
  { code: 'ME', name_fr: 'Maine',                name_en: 'Maine',                timezone: 'America/New_York'     },
  { code: 'MD', name_fr: 'Maryland',             name_en: 'Maryland',             timezone: 'America/New_York'     },
  { code: 'MA', name_fr: 'Massachusetts',        name_en: 'Massachusetts',        timezone: 'America/New_York'     },
  { code: 'MI', name_fr: 'Michigan',             name_en: 'Michigan',             timezone: 'America/Detroit'      },
  { code: 'MN', name_fr: 'Minnesota',            name_en: 'Minnesota',            timezone: 'America/Chicago'      },
  { code: 'MS', name_fr: 'Mississippi',          name_en: 'Mississippi',          timezone: 'America/Chicago'      },
  { code: 'MO', name_fr: 'Missouri',             name_en: 'Missouri',             timezone: 'America/Chicago'      },
  { code: 'MT', name_fr: 'Montana',              name_en: 'Montana',              timezone: 'America/Denver'       },
  { code: 'NE', name_fr: 'Nebraska',             name_en: 'Nebraska',             timezone: 'America/Chicago'      },
  { code: 'NV', name_fr: 'Nevada',               name_en: 'Nevada',               timezone: 'America/Los_Angeles'  },
  { code: 'NH', name_fr: 'New Hampshire',        name_en: 'New Hampshire',        timezone: 'America/New_York'     },
  { code: 'NJ', name_fr: 'New Jersey',           name_en: 'New Jersey',           timezone: 'America/New_York'     },
  { code: 'NM', name_fr: 'Nouveau-Mexique',      name_en: 'New Mexico',           timezone: 'America/Denver'       },
  { code: 'NY', name_fr: 'New York',             name_en: 'New York',             timezone: 'America/New_York'     },
  { code: 'NC', name_fr: 'Caroline du Nord',     name_en: 'North Carolina',       timezone: 'America/New_York'     },
  { code: 'ND', name_fr: 'Dakota du Nord',       name_en: 'North Dakota',         timezone: 'America/Chicago'      },
  { code: 'OH', name_fr: 'Ohio',                 name_en: 'Ohio',                 timezone: 'America/New_York'     },
  { code: 'OK', name_fr: 'Oklahoma',             name_en: 'Oklahoma',             timezone: 'America/Chicago'      },
  { code: 'OR', name_fr: 'Oregon',               name_en: 'Oregon',               timezone: 'America/Los_Angeles'  },
  { code: 'PA', name_fr: 'Pennsylvanie',         name_en: 'Pennsylvania',         timezone: 'America/New_York'     },
  { code: 'RI', name_fr: 'Rhode Island',         name_en: 'Rhode Island',         timezone: 'America/New_York'     },
  { code: 'SC', name_fr: 'Caroline du Sud',      name_en: 'South Carolina',       timezone: 'America/New_York'     },
  { code: 'SD', name_fr: 'Dakota du Sud',        name_en: 'South Dakota',         timezone: 'America/Chicago'      },
  { code: 'TN', name_fr: 'Tennessee',            name_en: 'Tennessee',            timezone: 'America/Chicago'      },
  { code: 'TX', name_fr: 'Texas',                name_en: 'Texas',                timezone: 'America/Chicago'      },
  { code: 'UT', name_fr: 'Utah',                 name_en: 'Utah',                 timezone: 'America/Denver'       },
  { code: 'VT', name_fr: 'Vermont',              name_en: 'Vermont',              timezone: 'America/New_York'     },
  { code: 'VA', name_fr: 'Virginie',             name_en: 'Virginia',             timezone: 'America/New_York'     },
  { code: 'WA', name_fr: 'Washington',           name_en: 'Washington',           timezone: 'America/Los_Angeles'  },
  { code: 'WV', name_fr: 'Virginie-Occidentale', name_en: 'West Virginia',        timezone: 'America/New_York'     },
  { code: 'WI', name_fr: 'Wisconsin',            name_en: 'Wisconsin',            timezone: 'America/Chicago'      },
  { code: 'WY', name_fr: 'Wyoming',              name_en: 'Wyoming',              timezone: 'America/Denver'       }
];

// Mexique — 31 états + CDMX avec timezone IANA principal
const MX_REGIONS = [
  { code: 'AGU', name_fr: 'Aguascalientes',             name_en: 'Aguascalientes',       timezone: 'America/Mexico_City' },
  { code: 'BCN', name_fr: 'Basse-Californie',           name_en: 'Baja California',      timezone: 'America/Tijuana'     },
  { code: 'BCS', name_fr: 'Basse-Californie du Sud',    name_en: 'Baja California Sur',  timezone: 'America/Mazatlan'    },
  { code: 'CAM', name_fr: 'Campeche',                   name_en: 'Campeche',             timezone: 'America/Mexico_City' },
  { code: 'CHP', name_fr: 'Chiapas',                    name_en: 'Chiapas',              timezone: 'America/Mexico_City' },
  { code: 'CHH', name_fr: 'Chihuahua',                  name_en: 'Chihuahua',            timezone: 'America/Chihuahua'   },
  { code: 'CMX', name_fr: 'Mexico (CDMX)',              name_en: 'Mexico City',          timezone: 'America/Mexico_City' },
  { code: 'COA', name_fr: 'Coahuila',                   name_en: 'Coahuila',             timezone: 'America/Monterrey'   },
  { code: 'COL', name_fr: 'Colima',                     name_en: 'Colima',               timezone: 'America/Mexico_City' },
  { code: 'DUR', name_fr: 'Durango',                    name_en: 'Durango',              timezone: 'America/Mexico_City' },
  { code: 'GUA', name_fr: 'Guanajuato',                 name_en: 'Guanajuato',           timezone: 'America/Mexico_City' },
  { code: 'GRO', name_fr: 'Guerrero',                   name_en: 'Guerrero',             timezone: 'America/Mexico_City' },
  { code: 'HID', name_fr: 'Hidalgo',                    name_en: 'Hidalgo',              timezone: 'America/Mexico_City' },
  { code: 'JAL', name_fr: 'Jalisco',                    name_en: 'Jalisco',              timezone: 'America/Mexico_City' },
  { code: 'MEX', name_fr: 'État de Mexico',             name_en: 'State of Mexico',      timezone: 'America/Mexico_City' },
  { code: 'MIC', name_fr: 'Michoacán',                  name_en: 'Michoacán',            timezone: 'America/Mexico_City' },
  { code: 'MOR', name_fr: 'Morelos',                    name_en: 'Morelos',              timezone: 'America/Mexico_City' },
  { code: 'NAY', name_fr: 'Nayarit',                    name_en: 'Nayarit',              timezone: 'America/Mazatlan'    },
  { code: 'NLE', name_fr: 'Nuevo León',                 name_en: 'Nuevo León',           timezone: 'America/Monterrey'   },
  { code: 'OAX', name_fr: 'Oaxaca',                     name_en: 'Oaxaca',               timezone: 'America/Mexico_City' },
  { code: 'PUE', name_fr: 'Puebla',                     name_en: 'Puebla',               timezone: 'America/Mexico_City' },
  { code: 'QUE', name_fr: 'Querétaro',                  name_en: 'Querétaro',            timezone: 'America/Mexico_City' },
  { code: 'ROO', name_fr: 'Quintana Roo',               name_en: 'Quintana Roo',         timezone: 'America/Cancun'      },
  { code: 'SLP', name_fr: 'San Luis Potosí',            name_en: 'San Luis Potosí',      timezone: 'America/Mexico_City' },
  { code: 'SIN', name_fr: 'Sinaloa',                    name_en: 'Sinaloa',              timezone: 'America/Mazatlan'    },
  { code: 'SON', name_fr: 'Sonora',                     name_en: 'Sonora',               timezone: 'America/Hermosillo'  },
  { code: 'TAB', name_fr: 'Tabasco',                    name_en: 'Tabasco',              timezone: 'America/Mexico_City' },
  { code: 'TAM', name_fr: 'Tamaulipas',                 name_en: 'Tamaulipas',           timezone: 'America/Matamoros'   },
  { code: 'TLA', name_fr: 'Tlaxcala',                   name_en: 'Tlaxcala',             timezone: 'America/Mexico_City' },
  { code: 'VER', name_fr: 'Veracruz',                   name_en: 'Veracruz',             timezone: 'America/Mexico_City' },
  { code: 'YUC', name_fr: 'Yucatán',                    name_en: 'Yucatán',              timezone: 'America/Merida'      },
  { code: 'ZAC', name_fr: 'Zacatecas',                  name_en: 'Zacatecas',            timezone: 'America/Mexico_City' }
];

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
    },
    {
      code: 'US',
      name_fr: 'États-Unis',
      name_en: 'United States',
      currency: 'USD',
      currencySymbol: '$',
      flag: '🇺🇸',
      regions: US_REGIONS
    },
    {
      code: 'MX',
      name_fr: 'Mexique',
      name_en: 'Mexico',
      currency: 'MXN',
      currencySymbol: '$',
      flag: '🇲🇽',
      regions: MX_REGIONS
    }
  ]
};

// Index rapide: code région → { country, currency, timezone }
// ⚠️ Codes ambigus (ex: "CA" = Californie US) : le premier pays rencontré
// gagne. L'ordre d'itération est CA → US → MX, donc "CA" (pas un code de
// province canadienne) pointe vers Californie. Utiliser ?country= pour
// lever l'ambiguïté quand nécessaire.
const REGION_INDEX = {};
// Index scopé par pays pour lookups non-ambigus: `${country}_${region}`
const REGION_INDEX_SCOPED = {};
REGIONS.countries.forEach(c => {
  c.regions.forEach(r => {
    const entry = {
      country: c.code,
      currency: c.currency,
      timezone: r.timezone,
      name_fr: r.name_fr,
      name_en: r.name_en
    };
    REGION_INDEX_SCOPED[`${c.code}_${r.code}`] = entry;
    // Index flat: premier pays gagne (CA → US → MX)
    if (!REGION_INDEX[r.code]) REGION_INDEX[r.code] = entry;
  });
});

// GET /api/regions — liste complète
// ?country=XX → filtre à un seul pays (optionnel)
router.get('/', (req, res) => {
  const country = req.query.country?.toUpperCase();
  if (country) {
    const c = REGIONS.countries.find(x => x.code === country);
    if (!c) return res.status(404).json({ success: false, error: 'Pays inconnu' });
    return res.json({ success: true, data: { countries: [c] } });
  }
  res.json({ success: true, data: REGIONS });
});

// GET /api/regions/:code — détail d'une région
// ?country=XX → désambiguïsation (ex: CA = California vs mégarde Canada)
router.get('/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = req.query.country?.toUpperCase();

  // Si country fourni, lookup scopé (non-ambigu)
  if (country) {
    const region = REGION_INDEX_SCOPED[`${country}_${code}`];
    if (!region) {
      return res.status(404).json({ success: false, error: 'Région inconnue pour ce pays' });
    }
    return res.json({ success: true, data: { code, ...region } });
  }

  // Sinon, lookup flat (premier pays qui matche)
  const region = REGION_INDEX[code];
  if (!region) {
    return res.status(404).json({ success: false, error: 'Région inconnue' });
  }
  res.json({ success: true, data: { code, ...region } });
});

module.exports = { router, REGIONS, REGION_INDEX, REGION_INDEX_SCOPED };
