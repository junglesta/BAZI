/**
 * PROFESSIONAL BA ZI CALCULATOR ENGINE
 * 
 * Implements accurate Ba Zi calculations using pre-calculated solar terms.
 * This is the core calculation engine used by professional Chinese astrology software.
 */

import SOLAR_TERMS_DATA from '../data/solar-terms-data.mjs';

export class BaZiCalculator {
  constructor() {
    // 天干 Heavenly Stems
    this.heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    
    // 地支 Earthly Branches
    this.earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    // Month branches (fixed by solar terms)
    this.monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    
    // Zodiac animals
    this.zodiacAnimals = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
    
    // Element mapping
    this.elements = {
      '甲': { element: '木', yin: false },
      '乙': { element: '木', yin: true },
      '丙': { element: '火', yin: false },
      '丁': { element: '火', yin: true },
      '戊': { element: '土', yin: false },
      '己': { element: '土', yin: true },
      '庚': { element: '金', yin: false },
      '辛': { element: '金', yin: true },
      '壬': { element: '水', yin: false },
      '癸': { element: '水', yin: true }
    };
  }
  
  /**
   * Calculate complete Ba Zi chart
   */
  calculate(year, month, day, hour = 0, minute = 0) {
    const dateTime = new Date(year, month - 1, day, hour, minute);
    
    // Calculate all four pillars
    const yearPillar = this.calculateYearPillar(year, month, day);
    const monthPillar = this.calculateMonthPillar(year, month, day, hour, minute);
    const dayPillar = this.calculateDayPillar(year, month, day);
    const hourPillar = this.calculateHourPillar(dayPillar.stem, hour);
    
    // Get zodiac animal
    const zodiac = this.getZodiacAnimal(yearPillar.branch);
    
    // Analyze elements
    const elementAnalysis = this.analyzeElements([yearPillar, monthPillar, dayPillar, hourPillar]);
    
    return {
      dateTime: {
        year, month, day, hour, minute,
        formatted: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      },
      pillars: {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
      },
      fourPillars: {
        year: yearPillar.ganZhi,
        month: monthPillar.ganZhi,
        day: dayPillar.ganZhi,
        hour: hourPillar.ganZhi
      },
      zodiac,
      dayMaster: {
        stem: dayPillar.stem,
        element: this.elements[dayPillar.stem]
      },
      elements: elementAnalysis,
      solarTerm: monthPillar.solarTerm
    };
  }
  
  /**
   * Calculate Year Pillar
   * The year changes at Li Chun (Beginning of Spring), not January 1st
   */
  calculateYearPillar(year, month, day) {
    // Check if before Li Chun (around Feb 4)
    let adjustedYear = year;
    const yearData = SOLAR_TERMS_DATA[year];
    
    if (yearData) {
      // Find Li Chun date
      const liChun = yearData.find(t => t.term === '立春');
      if (liChun) {
        const [lcMonth, lcDay] = liChun.date.split(' ')[0].split('-').map(Number);
        if (month < lcMonth || (month === lcMonth && day < lcDay)) {
          adjustedYear = year - 1;  // Still in previous year
        }
      }
    } else {
      // Fallback: Li Chun is usually around Feb 4
      if (month === 1 || (month === 2 && day < 4)) {
        adjustedYear = year - 1;
      }
    }
    
    // Calculate stems and branches
    const stemIndex = (adjustedYear - 4) % 10;
    const branchIndex = (adjustedYear - 4) % 12;
    
    const stem = this.heavenlyStems[stemIndex < 0 ? stemIndex + 10 : stemIndex];
    const branch = this.earthlyBranches[branchIndex < 0 ? branchIndex + 12 : branchIndex];
    
    return {
      ganZhi: stem + branch,
      stem,
      branch,
      year: adjustedYear
    };
  }
  
  /**
   * Calculate Month Pillar - THE CRITICAL FUNCTION
   * This uses actual solar terms, not approximations
   */
  calculateMonthPillar(year, month, day, hour = 0, minute = 0) {
    const solarMonth = this.getSolarMonth(year, month, day, hour, minute);
    
    // Get year stem for calculation
    const yearPillar = this.calculateYearPillar(year, month, day);
    const yearStemIndex = this.heavenlyStems.indexOf(yearPillar.stem);
    
    // Traditional formula from classical texts
    // 月干 = (年干序 × 2 + 月支序) % 10
    const monthStemIndex = (yearStemIndex * 2 + solarMonth.index) % 10;
    const monthStem = this.heavenlyStems[monthStemIndex];
    
    // Month branch is fixed by solar month
    const monthBranch = this.monthBranches[solarMonth.index - 1];
    
    return {
      ganZhi: monthStem + monthBranch,
      stem: monthStem,
      branch: monthBranch,
      solarMonth: solarMonth.index,
      solarTerm: solarMonth.term
    };
  }
  
  /**
   * Get solar month based on solar terms
   * This is where the magic happens - using precise astronomical data
   */
  getSolarMonth(year, month, day, hour = 0, minute = 0) {
    const yearData = SOLAR_TERMS_DATA[year];
    
    if (!yearData) {
      // Fallback to estimation for years not in database
      return this.estimateSolarMonth(month, day);
    }
    
    const inputDateTime = new Date(year, month - 1, day, hour, minute);
    let solarMonthIndex = 12;  // Default to previous year's 12th month
    let currentTerm = null;
    
    // Process solar terms in chronological order
    for (const termData of yearData) {
      const [dateStr, timeStr] = termData.date.split(' ');
      const [m, d] = dateStr.split('-').map(Number);
      const [h, min] = timeStr.split(':').map(Number);
      
      const termDateTime = new Date(year, m - 1, d, h, min);
      
      if (inputDateTime >= termDateTime && termData.type === 'jie') {
        solarMonthIndex = termData.month;
        currentTerm = termData.term;
      } else if (inputDateTime < termDateTime) {
        break;  // We've passed our date
      }
    }
    
    return {
      index: solarMonthIndex,
      term: currentTerm
    };
  }
  
  /**
   * Fallback estimation when exact data not available
   */
  estimateSolarMonth(month, day) {
    // Approximate solar term dates
    const transitions = [
      { m: 2, d: 4, idx: 1 },   // 立春
      { m: 3, d: 6, idx: 2 },   // 驚蟄
      { m: 4, d: 5, idx: 3 },   // 清明
      { m: 5, d: 6, idx: 4 },   // 立夏
      { m: 6, d: 6, idx: 5 },   // 芒種
      { m: 7, d: 7, idx: 6 },   // 小暑
      { m: 8, d: 8, idx: 7 },   // 立秋
      { m: 9, d: 8, idx: 8 },   // 白露
      { m: 10, d: 8, idx: 9 },  // 寒露
      { m: 11, d: 7, idx: 10 }, // 立冬
      { m: 12, d: 7, idx: 11 }, // 大雪
      { m: 1, d: 6, idx: 12 },  // 小寒
    ];
    
    for (let i = transitions.length - 1; i >= 0; i--) {
      const t = transitions[i];
      if (month > t.m || (month === t.m && day >= t.d)) {
        return { index: t.idx, term: null };
      }
    }
    
    return { index: 12, term: null };  // Previous year's 12th month
  }
  
  /**
   * Calculate Day Pillar
   * Uses the 60-day cycle starting from a known reference point
   */
  calculateDayPillar(year, month, day) {
    // Reference: January 1, 1900 was 甲戌 day (index 10)
    const refDate = new Date(1900, 0, 1);
    const currDate = new Date(year, month - 1, day);
    
    const daysDiff = Math.floor((currDate - refDate) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysDiff + 10) % 60;  // +10 for the reference offset
    
    const stemIndex = cycleDay % 10;
    const branchIndex = cycleDay % 12;
    
    const stem = this.heavenlyStems[stemIndex];
    const branch = this.earthlyBranches[branchIndex];
    
    return {
      ganZhi: stem + branch,
      stem,
      branch
    };
  }
  
  /**
   * Calculate Hour Pillar
   * Based on the day stem and the hour of birth
   */
  calculateHourPillar(dayStem, hour) {
    // Convert 24-hour to 12 Chinese double-hours
    const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
    const hourBranch = this.earthlyBranches[hourBranchIndex];
    
    // Hour stem calculation based on day stem
    const dayStemIndex = this.heavenlyStems.indexOf(dayStem);
    const hourStemBase = (dayStemIndex % 5) * 2;
    const hourStemIndex = (hourStemBase + hourBranchIndex) % 10;
    const hourStem = this.heavenlyStems[hourStemIndex];
    
    return {
      ganZhi: hourStem + hourBranch,
      stem: hourStem,
      branch: hourBranch,
      doubleHour: this.getDoubleHourName(hour)
    };
  }
  
  /**
   * Get Chinese double-hour name
   */
  getDoubleHourName(hour) {
    const doubleHours = [
      '子時', '丑時', '寅時', '卯時', '辰時', '巳時',
      '午時', '未時', '申時', '酉時', '戌時', '亥時'
    ];
    return doubleHours[Math.floor((hour + 1) / 2) % 12];
  }
  
  /**
   * Get zodiac animal from earthly branch
   */
  getZodiacAnimal(branch) {
    const branchIndex = this.earthlyBranches.indexOf(branch);
    return this.zodiacAnimals[branchIndex];
  }
  
  /**
   * Analyze element distribution in the chart
   */
  analyzeElements(pillars) {
    const elementCount = {
      '木': 0,
      '火': 0,
      '土': 0,
      '金': 0,
      '水': 0
    };
    
    const yinYangCount = {
      yin: 0,
      yang: 0
    };
    
    // Count elements from stems
    for (const pillar of pillars) {
      const stemData = this.elements[pillar.stem];
      if (stemData) {
        elementCount[stemData.element]++;
        yinYangCount[stemData.yin ? 'yin' : 'yang']++;
      }
    }
    
    // Branch elements (simplified - branches also contain hidden stems)
    const branchElements = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    
    for (const pillar of pillars) {
      const element = branchElements[pillar.branch];
      if (element) {
        elementCount[element]++;
      }
    }
    
    return {
      counts: elementCount,
      yinYang: yinYangCount,
      dominant: Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0][0],
      missing: Object.entries(elementCount).filter(([_, count]) => count === 0).map(([elem]) => elem)
    };
  }
}

export default BaZiCalculator;
