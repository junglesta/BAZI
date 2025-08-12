// test/test_dates.mjs
// Test specific dates against the API

import http from 'http';

const testDates = [
    { year: 1967, month: 10, day: 9, hour: 1, expected: '庚戌' },
    { year: 2000, month: 1, day: 1, hour: 0, expected: null },
    { year: 2025, month: 2, day: 4, hour: 0, expected: null }
];

console.log('🧪 Testing API endpoints...\n');

// Make sure server is running
console.log('Note: Make sure the server is running on port 8080\n');

for (const test of testDates) {
    const url = `http://localhost:8080/api/bazi?year=${test.year}&month=${test.month}&day=${test.day}&hour=${test.hour}`;
    
    http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log(`Date: ${test.year}-${test.month}-${test.day}`);
                console.log(`Month Pillar: ${result.pillars.month}`);
                if (test.expected && result.pillars.month === test.expected) {
                    console.log('✅ Correct!\n');
                } else if (result.corrected) {
                    console.log('✅ Corrected by server\n');
                } else {
                    console.log('ℹ️  Result\n');
                }
            } catch (e) {
                console.error('Error parsing response:', e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Error: ${e.message}`);
        console.log('Make sure the server is running!');
    });
}
