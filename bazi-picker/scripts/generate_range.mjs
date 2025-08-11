import { writeFileSync } from "node:fs";
import { Solar } from "lunar-javascript";

function* dateRange(start, end) {
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    yield new Date(d);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const fromIndex = args.indexOf('--from');
const toIndex = args.indexOf('--to');

if (fromIndex === -1 || toIndex === -1) {
  console.log('Usage: node generate_range.mjs --from YYYY-MM-DD --to YYYY-MM-DD');
  process.exit(1);
}

const fromDate = new Date(args[fromIndex + 1] + 'T00:00:00Z');
const toDate = new Date(args[toIndex + 1] + 'T00:00:00Z');

console.log(`Generating from ${fromDate.toISOString().slice(0,10)} to ${toDate.toISOString().slice(0,10)}...`);

const out = {};

for (const d of dateRange(fromDate, toDate)) {
  const solar = Solar.fromDate(d);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  const key = d.toISOString().slice(0, 10);
  out[key] = { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay() };
}

const filename = `bazi_${fromDate.getFullYear()}_${toDate.getFullYear()}.json`;
writeFileSync(filename, JSON.stringify(out));
console.log(`✅ Wrote ${filename} with ${Object.keys(out).length} days`);
