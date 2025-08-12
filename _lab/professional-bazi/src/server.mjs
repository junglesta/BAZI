/**
 * PROFESSIONAL BA ZI CALCULATOR SERVER
 * Production-ready Express server with caching and API endpoints
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import BaZiCalculator from './bazi-calculator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const calculator = new BaZiCalculator();

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Helper function for caching
function getCacheKey(year, month, day, hour, minute) {
  return `${year}-${month}-${day}-${hour}-${minute}`;
}

// API Endpoints

/**
 * Calculate Ba Zi - Main endpoint
 */
app.get('/api/calculate', (req, res) => {
  try {
    const { year, month, day, hour = 0, minute = 0 } = req.query;
    
    // Validation
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);
    
    if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h) || isNaN(min)) {
      return res.status(400).json({ 
        error: 'Invalid parameters. Please provide valid numbers.' 
      });
    }
    
    if (m < 1 || m > 12 || d < 1 || d > 31 || h < 0 || h > 23 || min < 0 || min > 59) {
      return res.status(400).json({ 
        error: 'Invalid date or time values.' 
      });
    }
    
    // Check cache
    const cacheKey = getCacheKey(y, m, d, h, min);
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ ...cached.data, cached: true });
    }
    
    // Calculate
    const result = calculator.calculate(y, m, d, h, min);
    
    // Cache result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ 
      error: 'Calculation failed', 
      message: error.message 
    });
  }
});

/**
 * Get solar terms for a specific year
 */
app.get('/api/solar-terms/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    // Dynamically import to get the data
    const { default: SOLAR_TERMS_DATA } = await import('../data/solar-terms-data.mjs');
    
    if (!SOLAR_TERMS_DATA[year]) {
      return res.status(404).json({ 
        error: `No solar term data available for year ${year}` 
      });
    }
    
    res.json({
      year,
      terms: SOLAR_TERMS_DATA[year]
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve solar terms', 
      message: error.message 
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    cacheSize: cache.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Clear cache endpoint
 */
app.post('/api/cache/clear', (req, res) => {
  const previousSize = cache.size;
  cache.clear();
  res.json({
    message: 'Cache cleared',
    entriesCleared: previousSize
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║     Professional Ba Zi Calculator Server      ║
║                                                ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Status:  ✅ Running                          ║
║  Port:    ${PORT}                                ║
║  URL:     http://localhost:${PORT}                ║
║                                                ║
║  API Endpoints:                                ║
║  • GET  /api/calculate                        ║
║  • GET  /api/solar-terms/:year                ║
║  • GET  /api/health                           ║
║  • POST /api/cache/clear                      ║
║                                                ║
║  Features:                                     ║
║  • Pre-calculated solar terms (1900-2100)     ║
║  • Accurate month pillar calculations         ║
║  • In-memory caching with TTL                 ║
║  • Professional-grade accuracy                ║
║                                                ║
╚════════════════════════════════════════════════╝
  `);
});

export default app;
