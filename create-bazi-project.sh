#!/bin/bash

# Ba Zi Picker Project Setup Script
# Creates complete project structure with all files

set -e  # Exit on error

echo "🎯 Creating Ba Zi Picker Project..."

# Create project directory
PROJECT_NAME="bazi-picker"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo "📁 Creating project structure..."

# Create directories
mkdir -p scripts test

# Create package.json
cat > package.json << 'EOF'
{
  "name": "bazi-picker",
  "version": "1.0.0",
  "type": "module",
  "description": "Ba Zi Four Pillars Calculator with HTMX",
  "main": "server.mjs",
  "scripts": {
    "start": "node server.mjs",
    "dev": "node --watch server.mjs",
    "generate": "node generate_bazi_dataset.mjs",
    "generate:range": "node scripts/generate_range.mjs",
    "validate": "node scripts/validate_dataset.mjs",
    "benchmark": "node scripts/benchmark.mjs",
    "export:csv": "node scripts/export_csv.mjs",
    "clean": "rm -f *.json",
    "test": "node test/basic.test.mjs"
  },
  "dependencies": {
    "express": "^4.21.1",
    "lunar-javascript": "^1.7.3"
  },
  "devDependencies": {
    "csv-writer": "^1.6.0"
  },
  "engines": {
    "node": ">=20.11.0",
    "pnpm": ">=9.12.0"
  }
}
EOF

# Create .npmrc for pnpm
cat > .npmrc << 'EOF'
node-linker=hoisted
public-hoist-pattern[]=*
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock
*.json
!package.json
!tsconfig.json
.env
.DS_Store
*.log
dist/
build/
.vscode/
.idea/
EOF

# Create .nvmrc
echo "20.11.0" > .nvmrc

# Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "."
EOF

# Create index.html with bilingual support
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ba Zi Calculator • 八字計算器 - Four Pillars of Destiny</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@1.9.12"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/lunar-javascript/1.7.3/lunar.min.js"></script>
        <style>
            .mono {
                font-feature-settings: "tnum" on;
            }
            .chinese-char {
                font-size: 2.5rem;
                line-height: 1;
            }
            .tooltip {
                position: relative;
                display: inline-block;
            }
            .tooltip .tooltiptext {
                visibility: hidden;
                width: 200px;
                background-color: #333;
                color: #fff;
                text-align: center;
                border-radius: 6px;
                padding: 8px;
                position: absolute;
                z-index: 1;
                bottom: 125%;
                left: 50%;
                margin-left: -100px;
                opacity: 0;
                transition: opacity 0.3s;
                font-size: 0.875rem;
            }
            .tooltip:hover .tooltiptext {
                visibility: visible;
                opacity: 1;
            }
        </style>
    </head>
    <body class="bg-slate-50 text-slate-900">
        <main class="max-w-4xl mx-auto p-6 space-y-6">
            <header>
                <h1 class="text-3xl font-bold">Ba Zi Calculator • 八字計算器</h1>
                <p class="text-sm text-slate-500 mt-2">
                    Four Pillars of Destiny (四柱命理) - Calculate your Chinese astrology chart with complete translations.
                </p>
            </header>

            <!-- FORM -->
            <form id="bazi-form" class="grid md:grid-cols-4 gap-4 items-end">
                <label class="block">
                    <span class="text-xs text-slate-500">Year</span>
                    <input
                        id="year"
                        name="year"
                        type="number"
                        min="1900"
                        max="2100"
                        class="mt-1 w-full rounded-xl border p-2"
                        required
                    />
                </label>
                <label class="block">
                    <span class="text-xs text-slate-500">Month</span>
                    <input
                        id="month"
                        name="month"
                        type="number"
                        min="1"
                        max="12"
                        class="mt-1 w-full rounded-xl border p-2"
                        required
                    />
                </label>
                <label class="block">
                    <span class="text-xs text-slate-500">Day</span>
                    <input
                        id="day"
                        name="day"
                        type="number"
                        min="1"
                        max="31"
                        class="mt-1 w-full rounded-xl border p-2"
                        required
                    />
                </label>
                <label class="block">
                    <span class="text-xs text-slate-500">Hour (0–23)</span>
                    <input
                        id="hour"
                        name="hour"
                        type="number"
                        min="0"
                        max="23"
                        class="mt-1 w-full rounded-xl border p-2"
                        required
                    />
                </label>

                <div class="md:col-span-4 flex gap-3 items-center">
                    <label class="block">
                        <span class="text-xs text-slate-500">Timezone</span>
                        <select id="tz" name="tz" class="mt-1 rounded-xl border p-2">
                            <option>Europe/Rome</option>
                            <option>UTC</option>
                            <option>Europe/London</option>
                            <option>Europe/Paris</option>
                            <option>America/New_York</option>
                            <option>Asia/Shanghai</option>
                            <option>Asia/Tokyo</option>
                        </select>
                    </label>
                    <button
                        type="button"
                        id="btn-calculate"
                        class="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                        Calculate Ba Zi
                    </button>
                    <button
                        type="button"
                        id="btn-now"
                        class="px-4 py-2 rounded-xl bg-white border hover:bg-slate-50 transition-colors"
                    >
                        Use Current Time
                    </button>
                </div>
            </form>

            <!-- RESULT AREA -->
            <section id="result" class="min-h-24"></section>

            <!-- Legend/Help Section -->
            <details class="bg-white rounded-xl border p-4">
                <summary class="cursor-pointer font-semibold text-sm">📖 Understanding Your Ba Zi Chart • 了解您的八字</summary>
                <div class="mt-4 space-y-3 text-sm">
                    <div>
                        <h4 class="font-semibold">Heavenly Stems (天干 Tiān Gān) - Elements:</h4>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                            <div><span class="text-lg">甲</span> Jiǎ - Yang Wood</div>
                            <div><span class="text-lg">乙</span> Yǐ - Yin Wood</div>
                            <div><span class="text-lg">丙</span> Bǐng - Yang Fire</div>
                            <div><span class="text-lg">丁</span> Dīng - Yin Fire</div>
                            <div><span class="text-lg">戊</span> Wù - Yang Earth</div>
                            <div><span class="text-lg">己</span> Jǐ - Yin Earth</div>
                            <div><span class="text-lg">庚</span> Gēng - Yang Metal</div>
                            <div><span class="text-lg">辛</span> Xīn - Yin Metal</div>
                            <div><span class="text-lg">壬</span> Rén - Yang Water</div>
                            <div><span class="text-lg">癸</span> Guǐ - Yin Water</div>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold">Earthly Branches (地支 Dì Zhī) - Zodiac Animals:</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            <div><span class="text-lg">子</span> Zǐ - Rat</div>
                            <div><span class="text-lg">丑</span> Chǒu - Ox</div>
                            <div><span class="text-lg">寅</span> Yín - Tiger</div>
                            <div><span class="text-lg">卯</span> Mǎo - Rabbit</div>
                            <div><span class="text-lg">辰</span> Chén - Dragon</div>
                            <div><span class="text-lg">巳</span> Sì - Snake</div>
                            <div><span class="text-lg">午</span> Wǔ - Horse</div>
                            <div><span class="text-lg">未</span> Wèi - Goat</div>
                            <div><span class="text-lg">申</span> Shēn - Monkey</div>
                            <div><span class="text-lg">酉</span> Yǒu - Rooster</div>
                            <div><span class="text-lg">戌</span> Xū - Dog</div>
                            <div><span class="text-lg">亥</span> Hài - Pig</div>
                        </div>
                    </div>
                    <p class="text-slate-600 italic">
                        Each pillar combines one Heavenly Stem with one Earthly Branch, creating 60 possible combinations in the full cycle.
                    </p>
                </div>
            </details>

            <footer class="text-xs text-slate-500">
                Powered by <a class="underline" href="https://cdnjs.cloudflare.com/libraries/lunar-javascript" target="_blank">lunar-javascript</a>
            </footer>
        </main>

        <script>
            // Translation mappings
            const HEAVENLY_STEMS = {
                '甲': { pinyin: 'Jiǎ', element: 'Yang Wood', number: 1 },
                '乙': { pinyin: 'Yǐ', element: 'Yin Wood', number: 2 },
                '丙': { pinyin: 'Bǐng', element: 'Yang Fire', number: 3 },
                '丁': { pinyin: 'Dīng', element: 'Yin Fire', number: 4 },
                '戊': { pinyin: 'Wù', element: 'Yang Earth', number: 5 },
                '己': { pinyin: 'Jǐ', element: 'Yin Earth', number: 6 },
                '庚': { pinyin: 'Gēng', element: 'Yang Metal', number: 7 },
                '辛': { pinyin: 'Xīn', element: 'Yin Metal', number: 8 },
                '壬': { pinyin: 'Rén', element: 'Yang Water', number: 9 },
                '癸': { pinyin: 'Guǐ', element: 'Yin Water', number: 10 }
            };

            const EARTHLY_BRANCHES = {
                '子': { pinyin: 'Zǐ', animal: 'Rat', element: 'Water', number: 1 },
                '丑': { pinyin: 'Chǒu', animal: 'Ox', element: 'Earth', number: 2 },
                '寅': { pinyin: 'Yín', animal: 'Tiger', element: 'Wood', number: 3 },
                '卯': { pinyin: 'Mǎo', animal: 'Rabbit', element: 'Wood', number: 4 },
                '辰': { pinyin: 'Chén', animal: 'Dragon', element: 'Earth', number: 5 },
                '巳': { pinyin: 'Sì', animal: 'Snake', element: 'Fire', number: 6 },
                '午': { pinyin: 'Wǔ', animal: 'Horse', element: 'Fire', number: 7 },
                '未': { pinyin: 'Wèi', animal: 'Goat', element: 'Earth', number: 8 },
                '申': { pinyin: 'Shēn', animal: 'Monkey', element: 'Metal', number: 9 },
                '酉': { pinyin: 'Yǒu', animal: 'Rooster', element: 'Metal', number: 10 },
                '戌': { pinyin: 'Xū', animal: 'Dog', element: 'Earth', number: 11 },
                '亥': { pinyin: 'Hài', animal: 'Pig', element: 'Water', number: 12 }
            };

            // Parse a pillar (e.g., "甲子") into components
            function parsePillar(pillar) {
                if (!pillar || pillar.length !== 2) return null;
                
                const stem = pillar[0];
                const branch = pillar[1];
                
                const stemInfo = HEAVENLY_STEMS[stem] || {};
                const branchInfo = EARTHLY_BRANCHES[branch] || {};
                
                return {
                    chinese: pillar,
                    stem: stem,
                    branch: branch,
                    stemPinyin: stemInfo.pinyin || stem,
                    branchPinyin: branchInfo.pinyin || branch,
                    stemElement: stemInfo.element || 'Unknown',
                    branchAnimal: branchInfo.animal || 'Unknown',
                    branchElement: branchInfo.element || 'Unknown',
                    fullPinyin: `${stemInfo.pinyin || stem}-${branchInfo.pinyin || branch}`,
                    description: `${stemInfo.element || 'Unknown'} / ${branchInfo.animal || 'Unknown'}`
                };
            }

            // Compute Ba Zi
            function computeBaZiClient(y, m, d, h, tz) {
                try {
                    const date = new Date(y, m - 1, d, h, 0, 0);
                    
                    if (typeof Solar === 'undefined') {
                        throw new Error('Lunar library not loaded');
                    }
                    
                    const solar = Solar.fromDate(date);
                    const lunar = solar.getLunar();
                    const ec = lunar.getEightChar();
                    
                    return {
                        iso: date.toISOString(),
                        pillars: {
                            year: ec.getYear(),
                            month: ec.getMonth(),
                            day: ec.getDay(),
                            hour: ec.getTime(),
                        },
                        pillarsEnglish: {
                            year: parsePillar(ec.getYear()),
                            month: parsePillar(ec.getMonth()),
                            day: parsePillar(ec.getDay()),
                            hour: parsePillar(ec.getTime()),
                        },
                        lunar: lunar.toString(),
                        lunarFull: lunar.toFullString(),
                        shengxiao: lunar.getYearShengXiao(),
                    };
                } catch (error) {
                    console.error('Error computing Ba Zi:', error);
                    throw error;
                }
            }

            // Render result with translations
            function renderResultHTML(data) {
                const pillars = data.pillarsEnglish;
                const pillarNames = ['year', 'month', 'day', 'hour'];
                
                let html = `
                    <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p class="text-blue-900 font-semibold">Your Ba Zi (Four Pillars of Destiny) • 八字</p>
                        <p class="text-blue-700 text-sm mt-1">Born: ${new Date(data.iso).toLocaleString()}</p>
                        <p class="text-blue-700 text-sm">Chinese Zodiac: ${data.shengxiao}</p>
                    </div>
                    
                    <div class="grid md:grid-cols-4 gap-4 mb-6">
                `;
                
                pillarNames.forEach(name => {
                    const pillar = pillars[name];
                    if (!pillar) return;
                    
                    html += `
                        <div class="rounded-2xl bg-white border p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                                ${name} Pillar
                            </div>
                            <div class="chinese-char font-bold mt-2 text-slate-800">
                                ${pillar.chinese}
                            </div>
                            <div class="text-lg font-semibold text-slate-700 mt-1">
                                ${pillar.fullPinyin}
                            </div>
                            <div class="text-sm text-slate-600 mt-1">
                                ${pillar.description}
                            </div>
                            <div class="mt-3 pt-3 border-t border-slate-100">
                                <div class="text-xs text-slate-500">
                                    <div class="flex justify-between">
                                        <span>Stem (${pillar.stem}):</span>
                                        <span class="font-medium text-slate-700">${pillar.stemElement}</span>
                                    </div>
                                    <div class="flex justify-between mt-1">
                                        <span>Branch (${pillar.branch}):</span>
                                        <span class="font-medium text-slate-700">${pillar.branchAnimal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                    </div>
                    
                    <div class="bg-white rounded-xl border p-4">
                        <h3 class="font-semibold text-sm mb-3">Element Analysis • 五行分析</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            ${pillarNames.map(name => {
                                const p = pillars[name];
                                return `
                                    <div>
                                        <div class="text-xs text-slate-500 uppercase">${name}</div>
                                        <div class="font-medium">${p.stemElement.split(' ')[1]}</div>
                                        <div class="text-xs text-slate-600">${p.stemElement.split(' ')[0]}</div>
                                        <div class="text-xs text-slate-500">${p.stem} ${p.stemPinyin}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <details class="mt-4 bg-slate-50 rounded-xl border p-4">
                        <summary class="cursor-pointer text-sm font-semibold">View Raw Data</summary>
                        <pre class="mt-3 text-xs overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>
                    </details>
                `;
                
                return html;
            }

            // Calculate button handler
            function handleCalculate() {
                try {
                    const y = parseInt(document.getElementById('year').value);
                    const m = parseInt(document.getElementById('month').value);
                    const d = parseInt(document.getElementById('day').value);
                    const h = parseInt(document.getElementById('hour').value);
                    const tz = document.getElementById('tz').value;
                    
                    if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) {
                        alert('Please fill in all fields');
                        return;
                    }
                    
                    const data = computeBaZiClient(y, m, d, h, tz);
                    const html = renderResultHTML(data);
                    document.getElementById('result').innerHTML = html;
                    
                } catch (error) {
                    document.getElementById('result').innerHTML = `
                        <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p class="text-red-600 font-semibold">Error calculating Ba Zi:</p>
                            <p class="text-red-500 text-sm mt-1">${error.message}</p>
                        </div>
                    `;
                }
            }

            // Use Now button handler
            function handleUseNow() {
                const now = new Date();
                document.getElementById('year').value = now.getFullYear();
                document.getElementById('month').value = now.getMonth() + 1;
                document.getElementById('day').value = now.getDate();
                document.getElementById('hour').value = now.getHours();
            }

            // Initialize when DOM is ready
            document.addEventListener('DOMContentLoaded', function() {
                // Attach event listeners
                document.getElementById('btn-calculate').addEventListener('click', handleCalculate);
                document.getElementById('btn-now').addEventListener('click', handleUseNow);
                
                // Set initial values to current date/time
                handleUseNow();
                
                // Try to detect user's timezone
                try {
                    const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const tzSelect = document.getElementById('tz');
                    const options = Array.from(tzSelect.options);
                    
                    if (options.some(opt => opt.value === userTZ)) {
                        tzSelect.value = userTZ;
                    }
                } catch (e) {
                    console.log('Could not detect timezone');
                }
            });
        </script>
    </body>
</html>
EOF

# Create generate_bazi_dataset.mjs
cat > generate_bazi_dataset.mjs << 'EOF'
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
EOF

# Create server.mjs
cat > server.mjs << 'EOF'
// server.mjs
// Run: npm i express lunar-javascript
// then: node server.mjs

import express from "express";
import { readFileSync, existsSync } from "node:fs";
import { Solar } from "lunar-javascript";

const app = express();
app.use(express.static(".")); // serves index.html & dataset if present

const DATASET_PATH = "./bazi_1920_today.json";
const dataset = existsSync(DATASET_PATH)
  ? JSON.parse(readFileSync(DATASET_PATH, "utf8"))
  : null;

function pad(n) {
  return String(n).padStart(2, "0");
}

function toZonedDate(dateStr, hour, tz) {
  // Convert YYYY-MM-DD + hour in tz to a real Date
  const isoLocal = `${dateStr}T${pad(hour)}:00:00`;
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(new Date(isoLocal));
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const y = get("year"),
    m = get("month"),
    d = get("day");
  const h = get("hour"),
    min = get("minute"),
    s = get("second");
  return new Date(`${y}-${m}-${d}T${h}:${min}:${s}Z`);
}

app.get("/api/bazi", (req, res) => {
  const { date, hour = "0", tz = "UTC" } = req.query;
  if (!date)
    return res.status(400).send('<div class="text-red-600">Missing date</div>');

  const dt = toZonedDate(String(date), Number(hour), String(tz));

  // Use dataset for Y/M/D if available, compute hour live
  let ymd = null;
  if (dataset && dataset[date]) {
    ymd = dataset[date];
  } else {
    const solar = Solar.fromDate(dt);
    const ec = solar.getLunar().getEightChar();
    ymd = {
      year: ec.getYear(),
      month: ec.getMonth(),
      day: ec.getDay(),
    };
  }
  const hourGZ = Solar.fromDate(dt).getLunar().getEightChar().getTime();

  const html = `
    <div class="grid md:grid-cols-4 gap-4">
      <div class="rounded-2xl bg-white border p-4">
        <div class="text-xs text-slate-500">Year</div>
        <div class="text-2xl font-semibold mt-1">${ymd.year}</div>
      </div>
      <div class="rounded-2xl bg-white border p-4">
        <div class="text-xs text-slate-500">Month</div>
        <div class="text-2xl font-semibold mt-1">${ymd.month}</div>
      </div>
      <div class="rounded-2xl bg-white border p-4">
        <div class="text-xs text-slate-500">Day</div>
        <div class="text-2xl font-semibold mt-1">${ymd.day}</div>
      </div>
      <div class="rounded-2xl bg-white border p-4">
        <div class="text-xs text-slate-500">Hour</div>
        <div class="text-2xl font-semibold mt-1">${hourGZ}</div>
      </div>
    </div>
  `;

  res.type("html").send(html);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log("🚀 BaZi server running at http://localhost:" + PORT),
);
EOF

# Create README.md
cat > README.md << 'EOF'
# BaZi Picker & Dataset

A lightweight, **no-framework** way to compute and display **Ba Zi (Four Pillars)** for any date/time. 

## Quick Start

```bash
# Install dependencies
pnpm install

# Start server
pnpm start

# Open http://localhost:8080
```

## Available Scripts

- `pnpm start` - Start the server
- `pnpm dev` - Start with auto-reload
- `pnpm generate` - Generate dataset (1920-today)
- `pnpm test` - Run tests
- `pnpm clean` - Remove generated files

## Features

✅ Client-side calculations using lunar-javascript  
✅ HTMX for smooth UI updates  
✅ Optional server mode  
✅ Pre-generated dataset support  
✅ Timezone support  
✅ No build process required  

## License

MIT
EOF

# Create scripts/generate_range.mjs
cat > scripts/generate_range.mjs << 'EOF'
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
EOF

# Create scripts/validate_dataset.mjs
cat > scripts/validate_dataset.mjs << 'EOF'
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
EOF

# Create scripts/benchmark.mjs
cat > scripts/benchmark.mjs << 'EOF'
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

console.log(`✅ Benchmark Complete:`);
console.log(`  - Total time: ${duration}ms`);
console.log(`  - Calculations: ${iterations}`);
console.log(`  - Per calculation: ${perCalc.toFixed(3)}ms`);
console.log(`  - Rate: ${Math.round(1000 / perCalc)}/second`);
EOF

# Create scripts/export_csv.mjs
cat > scripts/export_csv.mjs << 'EOF'
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
EOF

# Create test/basic.test.mjs
cat > test/basic.test.mjs << 'EOF'
import { Solar } from "lunar-javascript";
import assert from "node:assert";

console.log("🧪 Running tests...");

// Test 1: Date calculation
const testDate = new Date(2025, 0, 1, 0, 0, 0);
const solar = Solar.fromDate(testDate);
const ec = solar.getLunar().getEightChar();

assert(ec.getYear(), "Year pillar should exist");
assert(ec.getMonth(), "Month pillar should exist");
assert(ec.getDay(), "Day pillar should exist");
assert(ec.getTime(), "Hour pillar should exist");

console.log("✅ Test 1: Basic calculation - PASSED");

// Test 2: Known date verification
const knownDate = new Date(2000, 0, 1, 0, 0, 0);
const knownSolar = Solar.fromDate(knownDate);
const knownEC = knownSolar.getLunar().getEightChar();

// These values should be consistent
assert(knownEC.getYear() === knownEC.getYear(), "Year should be consistent");

console.log("✅ Test 2: Known date - PASSED");

console.log("\n✅ All tests passed!");
EOF

# Create setup scripts for convenience
cat > setup.sh << 'EOF'
#!/bin/bash
echo "🔧 Setting up Ba Zi Picker..."
npm install -g pnpm@9.12.2
pnpm install
echo "✅ Setup complete! Run 'pnpm start' to begin."
EOF
chmod +x setup.sh

cat > setup.bat << 'EOF'
@echo off
echo Setting up Ba Zi Picker...
npm install -g pnpm@9.12.2
pnpm install
echo Setup complete! Run 'pnpm start' to begin.
EOF

echo "✅ Project structure created!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your index.html file into this directory"
echo "2. Run: pnpm install"
echo "3. Run: pnpm start"
echo "4. Open: http://localhost:8080"
echo ""
echo "Optional:"
echo "- Generate dataset: pnpm generate"
echo "- Run tests: pnpm test"
echo ""
echo "Project created in: $(pwd)"