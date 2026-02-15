/**
 * GPS Financier - Budget Segment Calculator (Backend Version)
 * 
 * Version CommonJS pour Node.js/Express
 * Fichier à placer dans: C:\Users\jwesl\pl4to-backend\utils\budgetSegmentCalculator.js
 */

/**
 * Parse une date string en objet Date local
 */
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  const str = String(dateStr).split('T')[0];
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formate une Date en string YYYY-MM-DD
 */
function formatDateStr(date) {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Calcule les N prochaines occurrences d'une transaction récurrente
 */
function calculateNextOccurrences(item, referenceDate, maxOccurrences = 12) {
  const dates = [];
  const jour = parseInt(item.jourRecurrence) || 1;
  const frequence = (item.frequence || 'mensuel').toLowerCase();
  
  let currentDate = new Date(referenceDate);
  currentDate.setHours(0, 0, 0, 0);
  
  let occurrencesFound = 0;
  const maxDaysToSearch = 365 * maxOccurrences;
  let daysSearched = 0;
  
  while (occurrencesFound < maxOccurrences && daysSearched < maxDaysToSearch) {
    const dateDay = currentDate.getDate();
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    let isMatch = false;
    
    const checkDayMatch = (jourRecurrence) => {
      if (jourRecurrence > lastDayOfMonth) {
        return dateDay === lastDayOfMonth;
      }
      return dateDay === jourRecurrence;
    };
    
    switch (frequence) {
      case 'mensuel':
        isMatch = checkDayMatch(jour);
        break;
        
      case 'quinzaine':
        const firstDay = Math.min(jour, lastDayOfMonth);
        const secondDay = Math.min(jour + 15, lastDayOfMonth);
        isMatch = dateDay === firstDay || dateDay === secondDay;
        break;
        
      case 'bimensuel':
        if (item.jourSemaine !== undefined && item.dateReference) {
          const refDate = parseLocalDate(item.dateReference);
          if (refDate) {
            const diffTime = currentDate.getTime() - refDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            isMatch = diffDays >= 0 && diffDays % 14 === 0;
          }
        } else {
          isMatch = checkDayMatch(jour);
        }
        break;
        
      case 'hebdomadaire':
        if (item.jourSemaine !== undefined && item.dateReference) {
          const refDate = parseLocalDate(item.dateReference);
          if (refDate) {
            const diffTime = currentDate.getTime() - refDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            isMatch = diffDays >= 0 && diffDays % 7 === 0;
          }
        } else {
          const targetDayOfWeek = parseInt(item.jourSemaine);
          if (!isNaN(targetDayOfWeek)) {
            isMatch = currentDate.getDay() === targetDayOfWeek;
          }
        }
        break;
        
      case 'trimestriel':
        isMatch = checkDayMatch(jour) && currentDate.getMonth() % 3 === 0;
        break;
        
      case 'annuel':
        const moisAnnuel = parseInt(item.moisRecurrence) || 0;
        isMatch = checkDayMatch(jour) && currentDate.getMonth() === moisAnnuel;
        break;
        
      default:
        isMatch = checkDayMatch(jour);
    }
    
    if (isMatch && currentDate >= referenceDate) {
      dates.push(new Date(currentDate));
      occurrencesFound++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
    daysSearched++;
  }
  
  return dates;
}

/**
 * Calcule la DATE MAX pour un segment donné
 */
function calculateSegmentMaxDate(entrees, sorties, referenceDate, occurrencesPerItem = 12) {
  const refDate = parseLocalDate(referenceDate) || new Date();
  refDate.setHours(0, 0, 0, 0);
  
  const allDates = [];
  
  // Entrées
  (entrees || []).forEach(item => {
    const dates = calculateNextOccurrences(item, refDate, occurrencesPerItem);
    allDates.push(...dates);
  });
  
  // Sorties
  (sorties || []).forEach(item => {
    const dates = calculateNextOccurrences(item, refDate, occurrencesPerItem);
    allDates.push(...dates);
  });
  
  if (allDates.length === 0) {
    const defaultMax = new Date(refDate);
    defaultMax.setMonth(defaultMax.getMonth() + 1);
    return {
      maxDate: defaultMax,
      maxDateStr: formatDateStr(defaultMax),
      allDates: []
    };
  }
  
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  return {
    maxDate,
    maxDateStr: formatDateStr(maxDate),
    allDates: allDates.sort((a, b) => a - b)
  };
}

/**
 * Génère tous les segments jusqu'à une année cible
 * occurrencesPerSegment: 1 = mensuel, 3 = trimestriel, 6 = semestriel, 12 = annuel
 */
function generateAllSegments(baseEntrees, baseSorties, startDate, targetYear = 2079, occurrencesPerSegment = 1) {
  const segments = [];
  let currentRefDate = parseLocalDate(startDate) || new Date();
  currentRefDate.setHours(0, 0, 0, 0);
  
  let segmentIndex = 1;
  const maxDate = new Date(targetYear, 11, 31);
  const maxSegments = 1000;
  
  while (currentRefDate < maxDate && segmentIndex <= maxSegments) {
    // Utiliser occurrencesPerSegment pour contrôler la durée des segments
    const result = calculateSegmentMaxDate(baseEntrees, baseSorties, currentRefDate, occurrencesPerSegment);
    
    segments.push({
      segmentIndex,
      startDate: formatDateStr(currentRefDate),
      endDate: result.maxDateStr,
      entrees: JSON.parse(JSON.stringify(baseEntrees || [])),
      sorties: JSON.parse(JSON.stringify(baseSorties || [])),
      isBase: false,
      copiedFrom: segmentIndex === 1 ? 0 : segmentIndex - 1
    });
    
    currentRefDate = new Date(result.maxDate);
    currentRefDate.setDate(currentRefDate.getDate() + 1);
    segmentIndex++;
  }
  
  console.log(`[SegmentCalculator] Generated ${segments.length} segments (${occurrencesPerSegment} occurrence(s) per segment)`);
  return segments;
}

/**
 * Génère un nombre limité de segments
 * occurrencesPerSegment: 1 = mensuel, 3 = trimestriel, 6 = semestriel, 12 = annuel
 */
function generateSegmentsBatch(baseEntrees, baseSorties, startDate, batchSize = 10, occurrencesPerSegment = 1) {
  const segments = [];
  let currentRefDate = parseLocalDate(startDate) || new Date();
  currentRefDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i <= batchSize; i++) {
    const result = calculateSegmentMaxDate(baseEntrees, baseSorties, currentRefDate, occurrencesPerSegment);
    
    segments.push({
      segmentIndex: i,
      startDate: formatDateStr(currentRefDate),
      endDate: result.maxDateStr,
      entrees: JSON.parse(JSON.stringify(baseEntrees || [])),
      sorties: JSON.parse(JSON.stringify(baseSorties || [])),
      isBase: false,
      copiedFrom: i === 1 ? 0 : i - 1
    });
    
    currentRefDate = new Date(result.maxDate);
    currentRefDate.setDate(currentRefDate.getDate() + 1);
  }
  
  return segments;
}

// Export CommonJS pour Node.js
module.exports = {
  parseLocalDate,
  formatDateStr,
  calculateNextOccurrences,
  calculateSegmentMaxDate,
  generateAllSegments,
  generateSegmentsBatch
};
