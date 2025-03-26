#!/usr/bin/env node

/**
 * Script to generate translations for all products
 * 
 * Usage:
 * node generateTranslations.js [targetLanguage]
 * 
 * Example:
 * node generateTranslations.js he  # Generate Hebrew translations for all English products
 * node generateTranslations.js en  # Generate English translations for all Hebrew products
 */

const fetch = require('node-fetch');

// Default target language is Hebrew
const targetLanguage = process.argv[2] || 'he';

if (!['en', 'he'].includes(targetLanguage)) {
  console.error('Error: Target language must be either "en" or "he"');
  process.exit(1);
}

async function generateTranslations() {
  try {
    console.log(`Generating ${targetLanguage === 'he' ? 'Hebrew' : 'English'} translations for all products...`);
    
    const response = await fetch('http://localhost:3000/api/ai/generate-product-translations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetLanguage,
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('Error:', result.error || 'Unknown error');
      process.exit(1);
    }
    
    console.log(`Translation complete!`);
    console.log(`Total products: ${result.total}`);
    console.log(`Successfully translated: ${result.translated}`);
    console.log(`Failed: ${result.failed}`);
    
    if (result.details && result.details.length > 0) {
      console.log('\nDetails:');
      
      result.details.forEach((detail, index) => {
        console.log(`\n[${index + 1}] Product ID: ${detail.id}`);
        
        if (detail.success) {
          console.log(`  Original name: "${detail.original.name}"`);
          console.log(`  Translated name: "${detail.translated.name}"`);
          
          if (detail.original.description) {
            console.log(`  Original description: "${detail.original.description}"`);
            console.log(`  Translated description: "${detail.translated.description}"`);
          }
        } else {
          console.log(`  Error: ${detail.error}`);
        }
      });
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
}

// Run the script
generateTranslations();
