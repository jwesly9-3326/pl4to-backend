// 🗓️ PL4TO Backend — Calcul dynamique des dates de fêtes mobiles
// Même algorithmes que le frontend (src/utils/calendarEvents.js)
// Format CommonJS pour le backend Node.js

/**
 * Calcule la date de Pâques pour une année donnée
 * Algorithme de Butcher/Meeus (valide 1900-2099)
 * @returns {{ month: number, day: number }} month = 1-indexed (1=jan, 12=déc)
 */
function computeEaster(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 1-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/**
 * Calcule la Fête des Mères (2e dimanche de mai, Canada)
 * @returns {{ month: number, day: number }}
 */
function computeMothersDay(y) {
  const may1 = new Date(y, 4, 1); // month 0-indexed for Date constructor
  const firstSun = may1.getDay() === 0 ? 1 : 8 - may1.getDay();
  return { month: 5, day: firstSun + 7 };
}

/**
 * Calcule la Fête des Pères (3e dimanche de juin, Canada)
 * @returns {{ month: number, day: number }}
 */
function computeFathersDay(y) {
  const jun1 = new Date(y, 5, 1);
  const firstSun = jun1.getDay() === 0 ? 1 : 8 - jun1.getDay();
  return { month: 6, day: firstSun + 14 };
}

/**
 * Calcule l'Action de Grâce (2e lundi d'octobre, Canada)
 * @returns {{ month: number, day: number }}
 */
function computeThanksgiving(y) {
  const oct1 = new Date(y, 9, 1);
  const firstMon = oct1.getDay() <= 1 ? 2 - oct1.getDay() : 9 - oct1.getDay();
  return { month: 10, day: firstMon + 7 };
}

/**
 * Calcule la Fête du Travail (1er lundi de septembre, Canada)
 * @returns {{ month: number, day: number }}
 */
function computeLabourDay(y) {
  const sep1 = new Date(y, 8, 1);
  const firstMon = sep1.getDay() <= 1 ? 2 - sep1.getDay() : 9 - sep1.getDay();
  return { month: 9, day: firstMon };
}

module.exports = {
  computeEaster,
  computeMothersDay,
  computeFathersDay,
  computeThanksgiving,
  computeLabourDay
};
