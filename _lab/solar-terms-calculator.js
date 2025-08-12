// Proper Astronomical Solar Terms Calculator
// This calculates solar terms based on the sun's position on the ecliptic

/**
 * Calculate solar terms astronomically
 * Each solar term occurs when the sun reaches a specific ecliptic longitude
 * The 24 solar terms are spaced 15° apart (360° / 24 = 15°)
 */
class SolarTermsCalculator {
  constructor() {
    // Solar terms with their ecliptic longitudes
    // "Jie" terms (節) mark month transitions, "Qi" terms (氣) mark mid-months
    this.solarTerms = [
      { name: '立春', longitude: 315, type: 'jie', monthIndex: 1 },  // Beginning of Spring
      { name: '雨水', longitude: 330, type: 'qi' },                   // Rain Water
      { name: '驚蟄', longitude: 345, type: 'jie', monthIndex: 2 },  // Awakening of Insects
      { name: '春分', longitude: 0, type: 'qi' },                     // Spring Equinox
      { name: '清明', longitude: 15, type: 'jie', monthIndex: 3 },   // Pure Brightness
      { name: '穀雨', longitude: 30, type: 'qi' },                    // Grain Rain
      { name: '立夏', longitude: 45, type: 'jie', monthIndex: 4 },   // Beginning of Summer
      { name: '小滿', longitude: 60, type: 'qi' },                    // Grain Full
      { name: '芒種', longitude: 75, type: 'jie', monthIndex: 5 },   // Grain in Ear
      { name: '夏至', longitude: 90, type: 'qi' },                    // Summer Solstice
      { name: '小暑', longitude: 105, type: 'jie', monthIndex: 6 },  // Minor Heat
      { name: '大暑', longitude: 120, type: 'qi' },                   // Major Heat
      { name: '立秋', longitude: 135, type: 'jie', monthIndex: 7 },  // Beginning of Autumn
      { name: '處暑', longitude: 150, type: 'qi' },                   // End of Heat
      { name: '白露', longitude: 165, type: 'jie', monthIndex: 8 },  // White Dew
      { name: '秋分', longitude: 180, type: 'qi' },                   // Autumn Equinox
      { name: '寒露', longitude: 195, type: 'jie', monthIndex: 9 },  // Cold Dew
      { name: '霜降', longitude: 210, type: 'qi' },                   // Frost Descent
      { name: '立冬', longitude: 225, type: 'jie', monthIndex: 10 }, // Beginning of Winter
      { name: '小雪', longitude: 240, type: 'qi' },                   // Minor Snow
      { name: '大雪', longitude: 255, type: 'jie', monthIndex: 11 }, // Major Snow
      { name: '冬至', longitude: 270, type: 'qi' },                   // Winter Solstice
      { name: '小寒', longitude: 285, type: 'jie', monthIndex: 12 }, // Minor Cold
      { name: '大寒', longitude: 300, type: 'qi' }                    // Major Cold
    ];
    
    // Month earthly branches (fixed cycle)
    this.monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    
    // Heavenly stems
    this.heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  }
  
  /**
   * Calculate the sun's ecliptic longitude for a given date
   * This is a simplified calculation - professional software uses VSOP87 or similar
   */
  calculateSunLongitude(year, month, day, hour = 0) {
    // Convert to Julian Day Number
    const jd = this.toJulianDay(year, month, day, hour);
    
    // Calculate centuries from J2000.0
    const T = (jd - 2451545.0) / 36525;
    
    // Mean longitude of the sun (simplified)
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    
    // Mean anomaly of the sun
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const M_rad = M * Math.PI / 180;
    
    // Equation of center (simplified - only first 3 terms)
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad)
            + 0.000289 * Math.sin(3 * M_rad);
    
    // True longitude
    let longitude = L0 + C;
    
    // Normalize to 0-360
    longitude = longitude % 360;
    if (longitude < 0) longitude += 360;
    
    return longitude;
  }
  
  /**
   * Convert date to Julian Day Number
   */
  toJulianDay(year, month, day, hour = 0) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y 
              + Math.floor(y / 4) - Math.floor(y / 100) 
              + Math.floor(y / 400) - 32045;
    
    return jdn + hour / 24;
  }
  
  /**
   * Find which solar term period we're in
   */
  getCurrentSolarTerm(year, month, day, hour = 0) {
    const longitude = this.calculateSunLongitude(year, month, day, hour);
    
    // Find the most recent solar term
    let currentTerm = null;
    for (const term of this.solarTerms) {
      const termLong = term.longitude;
      const nextLong = (termLong + 15) % 360;
      
      // Check if we're in this term's period
      if (nextLong > termLong) {
        if (longitude >= termLong && longitude < nextLong) {
          currentTerm = term;
          break;
        }
      } else {
        // Handle wrap around 0°
        if (longitude >= termLong || longitude < nextLong) {
          currentTerm = term;
          break;
        }
      }
    }
    
    return currentTerm;
  }
  
  /**
   * Calculate the Ba Zi month pillar based on solar terms
   */
  calculateMonthPillar(year, month, day, hour = 0) {
    const term = this.getCurrentSolarTerm(year, month, day, hour);
    
    // Find the most recent "jie" term for month determination
    let monthIndex = 12; // Default to 12th month
    let currentLongitude = this.calculateSunLongitude(year, month, day, hour);
    
    for (const t of this.solarTerms) {
      if (t.type === 'jie') {
        const nextJieLong = (t.longitude + 30) % 360;
        
        // Check if we're past this jie term but before the next
        if (nextJieLong > t.longitude) {
          if (currentLongitude >= t.longitude && currentLongitude < nextJieLong) {
            monthIndex = t.monthIndex;
            break;
          }
        } else {
          // Handle wrap around
          if (currentLongitude >= t.longitude || currentLongitude < nextJieLong) {
            monthIndex = t.monthIndex;
            break;
          }
        }
      }
    }
    
    // Calculate the heavenly stem for the month
    // This requires knowing the year stem
    const yearStem = this.calculateYearStem(year);
    const yearStemIndex = this.heavenlyStems.indexOf(yearStem);
    const monthStemIndex = (yearStemIndex * 2 + monthIndex) % 10;
    const monthStem = this.heavenlyStems[monthStemIndex];
    
    // Get the earthly branch for the month
    const monthBranch = this.monthBranches[monthIndex - 1];
    
    return {
      pillar: monthStem + monthBranch,
      monthIndex: monthIndex,
      solarTerm: term?.name,
      sunLongitude: currentLongitude.toFixed(2)
    };
  }
  
  /**
   * Calculate year stem (simplified)
   */
  calculateYearStem(year) {
    // Year stem cycles every 10 years
    // Using 1984 (甲子 year) as reference
    const stemIndex = (year - 1984) % 10;
    return this.heavenlyStems[stemIndex < 0 ? stemIndex + 10 : stemIndex];
  }
  
  /**
   * Test the problematic dates
   */
  test() {
    console.log('=== Astronomical Solar Terms Calculation ===\n');
    
    const testDates = [
      { year: 1967, month: 10, day: 7, expected: '己酉' },
      { year: 1967, month: 10, day: 8, expected: '己酉' },
      { year: 1967, month: 10, day: 9, expected: '庚戌' },
      { year: 1967, month: 10, day: 10, expected: '庚戌' }
    ];
    
    for (const test of testDates) {
      const result = this.calculateMonthPillar(test.year, test.month, test.day);
      console.log(`Date: ${test.year}-${test.month}-${test.day}`);
      console.log(`Sun Longitude: ${result.sunLongitude}°`);
      console.log(`Solar Term: ${result.solarTerm || 'transitioning'}`);
      console.log(`Month Pillar: ${result.pillar}`);
      console.log(`Expected: ${test.expected}`);
      console.log(`✅ Match: ${result.pillar === test.expected}\n`);
    }
  }
}

// Usage example
const calculator = new SolarTermsCalculator();

// Test specific date
const result = calculator.calculateMonthPillar(1967, 10, 9, 0);
console.log('October 9, 1967:');
console.log(`Month Pillar: ${result.pillar}`);
console.log(`Solar Term: ${result.solarTerm}`);
console.log(`Sun Longitude: ${result.sunLongitude}°`);

// Run test suite
calculator.test();

// Export for use in other modules
export default SolarTermsCalculator;