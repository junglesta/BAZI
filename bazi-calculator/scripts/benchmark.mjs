// scripts/benchmark.mjs
// Benchmark Ba Zi calculations

import { Solar } from "lunar-javascript";

console.log("🏃 Running performance benchmark...");

const iterations = 10000;
const start = Date.now();

for (let i = 0; i < iterations; i++) {
  const d = new Date(2000, 0, 1 + (i % 365));
  const solar = Solar.fromDate(d);
  const ec = solar.getLunar().getEightChar();
  ec.getYear();
  ec.getMonth();
  ec.getDay();
  ec.getTime();
}

const end = Date.now();
const duration = end - start;
const perCalc = duration / iterations;

console.log(`\n✅ Benchmark Complete:`);
console.log(`  - Total time: ${duration}ms`);
console.log(`  - Calculations: ${iterations}`);
console.log(`  - Per calculation: ${perCalc.toFixed(3)}ms`);
console.log(`  - Rate: ${Math.round(1000 / perCalc)}/second`);
