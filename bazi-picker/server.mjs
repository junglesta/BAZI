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
