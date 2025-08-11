import { readFileSync, existsSync, writeFileSync } from "node:fs";

const DATASET_PATH = "./bazi_1920_today.json";

if (!existsSync(DATASET_PATH)) {
  console.error("❌ Dataset not found. Run 'pnpm generate' first.");
  process.exit(1);
}

const dataset = JSON.parse(readFileSync(DATASET_PATH, "utf8"));

// Create CSV content
let csv = "Date,Year Pillar,Month Pillar,Day Pillar\n";

for (const [date, data] of Object.entries(dataset)) {
  csv += `${date},${data.year},${data.month},${data.day}\n`;
}

const filename = "bazi_dataset.csv";
writeFileSync(filename, csv);
console.log(`✅ Exported ${Object.keys(dataset).length} entries to ${filename}`);
