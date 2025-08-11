import { readFileSync, existsSync } from "node:fs";

const DATASET_PATH = "./bazi_1920_today.json";

if (!existsSync(DATASET_PATH)) {
  console.error("❌ Dataset not found. Run 'pnpm generate' first.");
  process.exit(1);
}

const dataset = JSON.parse(readFileSync(DATASET_PATH, "utf8"));
const keys = Object.keys(dataset);

console.log(`📊 Dataset Statistics:`);
console.log(`  - Total days: ${keys.length}`);
console.log(`  - First date: ${keys[0]}`);
console.log(`  - Last date: ${keys[keys.length - 1]}`);

// Validate structure
let valid = true;
for (const [date, data] of Object.entries(dataset)) {
  if (!data.year || !data.month || !data.day) {
    console.error(`❌ Invalid entry for ${date}`);
    valid = false;
  }
}

if (valid) {
  console.log("✅ Dataset is valid!");
} else {
  console.error("❌ Dataset has errors!");
  process.exit(1);
}
