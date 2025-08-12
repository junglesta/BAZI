// test/test_accuracy.mjs
// Test Ba Zi calculations for accuracy

import { Solar } from 'lunar-javascript';

console.log('🔬 Testing Ba Zi Calculator Accuracy\n');
console.log('=' .repeat(70));

const testCases = [
    { 
        date: { year: 1967, month: 10, day: 7, hour: 1 },
        name: 'Oct 7, 1967 - Before Cold Dew',
        expectedMonth: '己酉',
        description: 'Should be Rooster month'
    },
    { 
        date: { year: 1967, month: 10, day: 9, hour: 1 },
        name: 'Oct 9, 1967 - PROBLEMATIC DATE',
        expectedMonth: '庚戌',
        description: 'Should be Dog month (needs correction)',
        needsCorrection: true
    },
    { 
        date: { year: 2000, month: 1, day: 1, hour: 0 },
        name: 'Jan 1, 2000 - Millennium',
        description: 'Standard test date'
    }
];

console.log('\n📊 Testing lunar-javascript library:\n');

let passedTests = 0;
let failedTests = 0;

for (const test of testCases) {
    const { year, month, day, hour } = test.date;
    
    try {
        const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
        const lunar = solar.getLunar();
        const ec = lunar.getEightChar();
        
        const monthPillar = ec.getMonth();
        
        console.log(`\n${test.name}`);
        console.log(`  ${test.description}`);
        console.log(`  Month Pillar: ${monthPillar}`);
        
        if (test.expectedMonth) {
            if (monthPillar === test.expectedMonth) {
                console.log(`  ✅ PASS`);
                passedTests++;
            } else {
                console.log(`  ❌ FAIL - Expected: ${test.expectedMonth}`);
                if (test.needsCorrection) {
                    console.log(`  ℹ️  Server includes correction for this date`);
                }
                failedTests++;
            }
        }
        
    } catch (e) {
        console.log(`  ❌ Error: ${e.message}`);
        failedTests++;
    }
}

console.log('\n' + '=' .repeat(70));
console.log(`\n📈 Results: ${passedTests} passed, ${failedTests} failed`);

if (failedTests > 0) {
    console.log(`\n✨ Note: The server includes corrections for problematic dates!`);
}
