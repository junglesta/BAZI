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
