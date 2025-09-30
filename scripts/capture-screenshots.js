#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function captureScreenshots() {
  console.log('Starting screenshot capture...');
  console.log('Note: Make sure dev server is running on http://localhost:3002');
  
  // Define all figure IDs to capture
  const figureIds = [
    'innovation-rankings-figure',
    'eis-progress-arrow-figure', 
    'competitiveness-rankings-figure',
    'swiss-rnd-sankey-figure',
    'gerd-gdp-comparison-figure',
    'rnd-expenditure-by-sector-figure',
    'rnd-activities-by-type-figure',
    'rnd-funding-sources-figure',
    'government-rnd-funding-figure',
    'government-business-rnd-figure',
    'rnd-personnel-intensity-figure',
    'venture-capital-gdp-figure',
    'entrepreneurial-activity-tea-figure',
    'technology-investor-score-country-figure',
    'swiss-investor-scores-figure',
    'unicorn-density-figure',
    'swiss-unicorns-figure',
    'multifactor-productivity-figure',
    'pct-patents-figure',
    'public-private-copubs-figure',
    'swiss-research-startups-figure',
    'green-technology-patents-figure',
    'hightech-exports-figure',
    'medium-hightech-exports-figure'
  ];
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for high-quality screenshots
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
    
    // Navigate to the images page
    console.log('Navigating to images page...');
    await page.goto('http://localhost:3000/images', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('Page loaded, waiting for page to fully render...');
    
    // Wait for the page to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 8000));
    console.log('Ready to capture screenshots');
    
    // Create images directory if it doesn't exist
    const imagesDir = join(__dirname, '..', 'src', 'images');
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true });
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // Capture all figures
    for (const figureId of figureIds) {
      try {
        console.log(`Capturing figure: ${figureId}...`);
        
        // Wait for the specific figure to be present
        await page.waitForSelector(`#${figureId}`, { timeout: 5000 });
        
        const element = await page.$(`#${figureId}`);
        
        if (element) {
          // Generate filename from figure ID
          const filename = `${figureId.replace(/-figure$/, '')}-live.png`;
          
          // Take screenshot and save to images directory
          await element.screenshot({
            path: join(imagesDir, filename),
            type: 'png'
          });
          
          console.log(`✓ Screenshot saved: ${filename}`);
          successCount++;
          
        } else {
          console.log(`✗ Could not find element: ${figureId}`);
          failCount++;
        }
        
        // Small delay between captures
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`✗ Error capturing ${figureId}: ${error.message}`);
        failCount++;
      }
    }
    
    console.log(`\nCapture complete: ${successCount} successful, ${failCount} failed`);
    
  } catch (error) {
    console.error('Error during screenshot capture:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('Screenshot capture completed');
  }
}

// Run the capture
captureScreenshots().catch(error => {
  console.error('Screenshot capture failed:', error);
  process.exit(1);
});