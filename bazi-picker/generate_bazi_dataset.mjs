// generate_bazi_dataset.mjs
// Run with: node generate_bazi_dataset.mjs
import { writeFileSync } from "node:fs";
import { Solar } from "lunar-javascript";

function* dateRange(start, end) {
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    yield new Date(d);
  }
}

const start = new Date(Date.UTC(1920, 0, 1));
const today = new Date();
const end = new Date(
  Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
);

const out = {}; // { "YYYY-MM-DD": { year, month, day } }

for (const d of dateRange(start, end)) {
  const solar = Solar.fromDate(d);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  const key = d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  out[key] = { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay() };
}

writeFileSync("bazi_1920_today.json", JSON.stringify(out));
console.log("✅ Wrote bazi_1920_today.json with", Object.keys(out).length, "days");
