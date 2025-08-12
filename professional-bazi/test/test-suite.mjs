/**
 * COMPREHENSIVE TEST SUITE
 * Tests the accuracy of Ba Zi calculations against known values
 */

import BaZiCalculator from '../src/bazi-calculator.mjs';

const calculator = new BaZiCalculator();

console.log('╔════════════════════════════════════════════════╗');
console.log('║     PROFESSIONAL BA ZI CALCULATOR TEST SUITE   ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Test cases with expected results
const testCases = [
  {
    name: 'Oct 8, 1967 23:59 - Just before Cold Dew',
    input: { year: 1967, month: 10, day: 8, hour: 23, minute: 59 },
    expected: { month: '己酉' }
  },
  {
    name: 'Oct 9, 1967 02:44 - One minute before Cold Dew',
    input: { year: 1967, month: 10, day: 9, hour: 2, minute: 44 },
    expected: { month: '己酉' }
  },
  {
    name: 'Oct 9, 1967 10:45 - At Cold Dew (寒露)',
    input: { year: 1967, month: 10, day: 9, hour: 10, minute: 45 },
    expected: { month: '庚戌' }
  },
  {
    name: 'Oct 9, 1967 10:46 - One minute after Cold Dew',
    input: { year: 1967, month: 10, day: 9, hour: 10, minute: 46 },
    expected: { month: '庚戌' }
  },
  {
    name: 'Oct 10, 1967 00:00 - Day after Cold Dew',
    input: { year: 1967, month: 10, day: 10, hour: 0, minute: 0 },
    expected: { month: '庚戌' }
  },
  {
    name: 'Feb 3, 2025 22:09 - One minute before Li Chun',
    input: { year: 2025, month: 2, day: 3, hour: 22, minute: 9 },
    expected: { month: '丁丑', year: '甲辰' }  // Still previous year
  },
  {
    name: 'Feb 3, 2025 22:10 - At Li Chun (立春)',
    input: { year: 2025, month: 2, day: 3, hour: 22, minute: 10 },
    expected: { month: '戊寅', year: '乙巳' }  // New year begins
  }
];

let passed = 0;
let failed = 0;

console.log('Running tests...\n');

for (const test of testCases) {
  const result = calculator.calculate(
    test.input.year,
    test.input.month,
    test.input.day,
    test.input.hour,
    test.input.minute
  );
  
  let success = true;
  let failures = [];
  
  // Check month pillar
  if (test.expected.month && result.fourPillars.month !== test.expected.month) {
    success = false;
    failures.push(`Month: expected ${test.expected.month}, got ${result.fourPillars.month}`);
  }
  
  // Check year pillar if specified
  if (test.expected.year && result.fourPillars.year !== test.expected.year) {
    success = false;
    failures.push(`Year: expected ${test.expected.year}, got ${result.fourPillars.year}`);
  }
  
  if (success) {
    console.log(`✅ ${test.name}`);
    console.log(`   Result: ${result.fourPillars.month}`);
    if (result.solarTerm) {
      console.log(`   Solar Term: ${result.solarTerm}`);
    }
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    failures.forEach(f => console.log(`   ${f}`));
    failed++;
  }
  console.log('');
}

// Summary
console.log('╔════════════════════════════════════════════════╗');
console.log(`║  RESULTS: ${passed} passed, ${failed} failed                     ║`);
console.log('╚════════════════════════════════════════════════╝');

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
