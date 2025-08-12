// Proper Ba Zi Month Pillar Calculation Using Solar Terms
// This demonstrates the correct way to calculate month pillars based on solar terms

import { Solar, Lunar } from 'lunar-javascript';

// Solar Terms that mark the beginning of each lunar month for Ba Zi
// These are the "Jie" (節) terms that determine month transitions
const MONTH_SOLAR_TERMS = {
  '立春': 1,  // Beginning of Spring (Feb 4/5) - Tiger month
  '驚蟄': 2,  // Awakening of Insects (Mar 5/6) - Rabbit month
  '清明': 3,  // Pure Brightness (Apr 4/5) - Dragon month
  '立夏': 4,  // Beginning of Summer (May 5/6) - Snake month
  '芒種': 5,  // Grain in Ear (Jun 5/6) - Horse month
  '小暑': 6,  // Minor Heat (Jul 7/8) - Goat month
  '立秋': 7,  // Beginning of Autumn (Aug 7/8) - Monkey month
  '白露': 8,  // White Dew (Sep 7/8) - Rooster month
  '寒露': 9,  // Cold Dew (Oct 8/9) - Dog month
  '立冬': 10, // Beginning of Winter (Nov 7/8) - Pig month
  '大雪': 11, // Major Snow (Dec 7/8) - Rat month
  '小寒': 12  // Minor Cold (Jan 5/6) - Ox month
};

// Earthly Branches for each month (fixed)
const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

// Heavenly Stems cycle
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * Calculate the correct month pillar based on solar terms
 * This is the proper way to do it - not based on lunar months
 */
function calculateMonthPillarBySolarTerms(year, month, day, hour = 0) {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  
  // Get the current and previous solar terms
  const currentJieQi = solar.getCurrentJieQi();
  const prevJieQi = solar.getPrevJieQi();
  const nextJieQi = solar.getNextJieQi();
  
  console.log(`Date: ${year}-${month}-${day}`);
  console.log(`Current JieQi: ${currentJieQi ? currentJieQi.getName() : 'none'}`);
  console.log(`Previous JieQi: ${prevJieQi ? prevJieQi.getName() : 'none'}`);
  console.log(`Next JieQi: ${nextJieQi ? nextJieQi.getName() : 'none'}`);
  
  // Determine which solar month we're in based on the Jie terms
  let solarMonth = determineSolarMonth(solar);
  
  // Calculate the heavenly stem for the month
  // Formula: (year stem index * 2 + month number) % 10
  const lunar = solar.getLunar();
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearStem = yearGanZhi[0];
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  
  const monthStemIndex = (yearStemIndex * 2 + solarMonth) % 10;
  const monthStem = HEAVENLY_STEMS[monthStemIndex];
  
  // Get the earthly branch for the month
  const monthBranch = MONTH_BRANCHES[solarMonth - 1];
  
  return monthStem + monthBranch;
}

/**
 * Determine the solar month based on solar terms
 * This is the KEY function that fixes the issue
 */
function determineSolarMonth(solar) {
  const year = solar.getYear();
  const month = solar.getMonth();
  const day = solar.getDay();
  
  // Get all solar terms for the year
  const jieQiTable = solar.getJieQiTable();
  
  // Find which Jie term period we're in
  let solarMonth = 12; // Default to December (Chou month)
  
  for (let i = 0; i < 12; i++) {
    const termName = Object.keys(MONTH_SOLAR_TERMS)[i];
    const termDate = jieQiTable[termName];
    
    if (termDate) {
      const [termYear, termMonth, termDay] = termDate.split('-').map(Number);
      
      // Check if we're after this solar term
      if (year > termYear || 
          (year === termYear && month > termMonth) ||
          (year === termYear && month === termMonth && day >= termDay)) {
        solarMonth = MONTH_SOLAR_TERMS[termName];
      } else {
        break; // We've passed our date, use the previous solar month
      }
    }
  }
  
  return solarMonth;
}

/**
 * Enhanced Ba Zi calculation with proper solar term handling
 */
function calculateBaZiProper(year, month, day, hour) {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  
  // Get the standard calculation first
  const ec = lunar.getEightChar();
  
  // Get the properly calculated month pillar
  const properMonthPillar = calculateMonthPillarBySolarTerms(year, month, day, hour);
  
  // Compare with the library's calculation
  const libraryMonthPillar = ec.getMonth();
  
  const result = {
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    pillars: {
      year: ec.getYear(),
      month: properMonthPillar, // Use our corrected calculation
      day: ec.getDay(),
      hour: ec.getTime()
    },
    comparison: {
      libraryMonth: libraryMonthPillar,
      correctedMonth: properMonthPillar,
      needsCorrection: libraryMonthPillar !== properMonthPillar
    },
    solarTermInfo: {
      currentTerm: solar.getCurrentJieQi()?.getName(),
      previousTerm: solar.getPrevJieQi()?.getName(),
      nextTerm: solar.getNextJieQi()?.getName()
    }
  };
  
  return result;
}

// Test the problematic dates
console.log('\n=== Testing Problematic Dates ===\n');

const testDates = [
  { year: 1967, month: 10, day: 7, expected: '己酉', desc: 'Before Cold Dew - Rooster month' },
  { year: 1967, month: 10, day: 8, expected: '己酉', desc: 'Cold Dew eve - still Rooster' },
  { year: 1967, month: 10, day: 9, expected: '庚戌', desc: 'Cold Dew day - Dog month begins' },
  { year: 1967, month: 10, day: 10, expected: '庚戌', desc: 'After Cold Dew - Dog month' }
];

for (const test of testDates) {
  console.log(`\n${test.desc}`);
  const result = calculateBaZiProper(test.year, test.month, test.day, 0);
  
  console.log(`Date: ${result.date}`);
  console.log(`Library says: ${result.comparison.libraryMonth}`);
  console.log(`Corrected to: ${result.comparison.correctedMonth}`);
  console.log(`Expected: ${test.expected}`);
  console.log(`✅ Correct: ${result.comparison.correctedMonth === test.expected}`);
  
  if (result.solarTermInfo.currentTerm) {
    console.log(`Solar terms: ${result.solarTermInfo.previousTerm} → ${result.solarTermInfo.currentTerm} → ${result.solarTermInfo.nextTerm}`);
  }
}

// Alternative approach: Manual solar term dates for specific years
// This is more reliable for historical dates
const SOLAR_TERMS_1967 = {
  '1967-02-04': { term: '立春', monthIndex: 1 },
  '1967-03-06': { term: '驚蟄', monthIndex: 2 },
  '1967-04-05': { term: '清明', monthIndex: 3 },
  '1967-05-06': { term: '立夏', monthIndex: 4 },
  '1967-06-06': { term: '芒種', monthIndex: 5 },
  '1967-07-07': { term: '小暑', monthIndex: 6 },
  '1967-08-08': { term: '立秋', monthIndex: 7 },
  '1967-09-08': { term: '白露', monthIndex: 8 },
  '1967-10-09': { term: '寒露', monthIndex: 9 }, // KEY DATE
  '1967-11-08': { term: '立冬', monthIndex: 10 },
  '1967-12-07': { term: '大雪', monthIndex: 11 }
};

/**
 * Most reliable approach: Use precalculated solar term dates
 * This is what professional Ba Zi software does
 */
function getMonthPillarByPrecalculatedTerms(year, month, day) {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // Find the applicable solar month
  let solarMonthIndex = 12; // Default to December (Chou)
  
  for (const [termDate, termInfo] of Object.entries(SOLAR_TERMS_1967)) {
    if (dateStr >= termDate) {
      solarMonthIndex = termInfo.monthIndex;
    } else {
      break;
    }
  }
  
  // Calculate the stem based on the year and solar month
  // This would need the full calculation logic...
  
  return { solarMonthIndex, dateStr };
}

console.log('\n=== Using Precalculated Solar Terms ===\n');
console.log(getMonthPillarByPrecalculatedTerms(1967, 10, 8));  // Should be month 8 (Rooster)
console.log(getMonthPillarByPrecalculatedTerms(1967, 10, 9));  // Should be month 9 (Dog)

export { calculateBaZiProper, calculateMonthPillarBySolarTerms, SOLAR_TERMS_1967 };