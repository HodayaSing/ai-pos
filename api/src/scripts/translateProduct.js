#!/usr/bin/env node

/**
 * Script to translate a specific product
 * 
 * Usage:
 * node translateProduct.js <productId> <targetLanguage>
 * 
 * Example:
 * node translateProduct.js 1 he  # Translate product with ID 1 to Hebrew
 * node translateProduct.js 2 en  # Translate product with ID 2 to English
 */

const fetch = require('node-fetch');

// Get command line arguments
const productId = process.argv[2];
const targetLanguage = process.argv[3] || 'he';

if (!productId) {
  console.error('Error: Product ID is required');
  console.error('Usage: node translateProduct.js <productId> <targetLanguage>');
  process.exit(1);
}

if (!['en', 'he'].includes(targetLanguage)) {
  console.error('Error: Target language must be either "en" or "he"');
  process.exit(1);
}

async function translateProduct() {
  try {
    console.log(`Fetching product with ID ${productId}...`);
    
    // First, get the product details
    const productResponse = await fetch(`http://localhost:3000/api/products/${productId}`);
    const productData = await productResponse.json();
    
    if (!productData.success) {
      console.error('Error:', productData.error || 'Failed to fetch product');
      process.exit(1);
    }
    
    const product = productData.data;
    console.log(`Found product: "${product.name}"`);
    
    // Prepare the translation request
    const sourceLanguage = product.language || 'en';
    
    if (sourceLanguage === targetLanguage) {
      console.error(`Error: Product is already in ${targetLanguage} language`);
      process.exit(1);
    }
    
    console.log(`Translating from ${sourceLanguage} to ${targetLanguage}...`);
    
    // Translate the name
    console.log(`Translating name: "${product.name}"...`);
    const nameResponse = await fetch('http://localhost:3000/api/ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: product.name,
        targetLanguage,
      }),
    });
    
    const nameData = await nameResponse.json();
    
    if (!nameData.success) {
      console.error('Error translating name:', nameData.error || 'Unknown error');
      process.exit(1);
    }
    
    const translatedName = nameData.translatedText;
    console.log(`Translated name: "${translatedName}"`);
    
    // Translate the description if it exists
    let translatedDescription = '';
    if (product.description) {
      console.log(`Translating description: "${product.description}"...`);
      const descResponse = await fetch('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: product.description,
          targetLanguage,
        }),
      });
      
      const descData = await descResponse.json();
      
      if (!descData.success) {
        console.error('Error translating description:', descData.error || 'Unknown error');
        process.exit(1);
      }
      
      translatedDescription = descData.translatedText;
      console.log(`Translated description: "${translatedDescription}"`);
    }
    
    // Check if the product has a product_key
    if (!product.product_key) {
      console.error('Error: Product does not have a product_key');
      process.exit(1);
    }
    
    // Create or update the translation
    console.log(`Saving ${targetLanguage} translation for product with key ${product.product_key}...`);
    
    // Check if translation already exists
    const checkResponse = await fetch(`http://localhost:3000/api/products/key/${product.product_key}/${targetLanguage}`);
    const exists = checkResponse.ok;
    
    let saveResponse;
    if (exists) {
      // Update existing translation
      saveResponse = await fetch(`http://localhost:3000/api/products/key/${product.product_key}/${targetLanguage}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: translatedName,
          description: translatedDescription,
          category: product.category,
          price: product.price,
          image: product.image
        }),
      });
    } else {
      // Create new translation
      saveResponse = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_key: product.product_key,
          language: targetLanguage,
          name: translatedName,
          description: translatedDescription,
          category: product.category,
          price: product.price,
          image: product.image
        }),
      });
    }
    
    const saveData = await saveResponse.json();
    
    if (!saveData.success) {
      console.error('Error saving translation:', saveData.error || 'Unknown error');
      process.exit(1);
    }
    
    console.log(`Successfully ${exists ? 'updated' : 'created'} ${targetLanguage} translation for product with ID ${productId}`);
    console.log('\nTranslation details:');
    console.log(`Original (${sourceLanguage}): "${product.name}"`);
    console.log(`Translated (${targetLanguage}): "${translatedName}"`);
    
    if (product.description) {
      console.log(`\nOriginal description (${sourceLanguage}): "${product.description}"`);
      console.log(`Translated description (${targetLanguage}): "${translatedDescription}"`);
    }
    
    // Show curl command equivalent
    console.log('\nEquivalent curl commands:');
    
    // Translate name
    console.log(`\n# Translate name`);
    console.log(`curl -X POST http://localhost:3000/api/ai/translate \\
  -H "Content-Type: application/json" \\
  -d '{"text": "${product.name.replace(/'/g, "\\'")}","targetLanguage": "${targetLanguage}"}'`);
    
    // Translate description
    if (product.description) {
      console.log(`\n# Translate description`);
      console.log(`curl -X POST http://localhost:3000/api/ai/translate \\
  -H "Content-Type: application/json" \\
  -d '{"text": "${product.description.replace(/'/g, "\\'")}","targetLanguage": "${targetLanguage}"}'`);
    }
    
    // Save translation
    if (exists) {
      console.log(`\n# Update existing translation`);
      console.log(`curl -X PUT http://localhost:3000/api/products/key/${product.product_key}/${targetLanguage} \\
  -H "Content-Type: application/json" \\
  -d '{"name": "${translatedName.replace(/'/g, "\\'")}","description": "${translatedDescription.replace(/'/g, "\\'")}","category": "${product.category.replace(/'/g, "\\'")}","price": ${product.price}${product.image ? `,"image": "${product.image.replace(/'/g, "\\'")}"` : ''}}'`);
    } else {
      console.log(`\n# Create new translation`);
      console.log(`curl -X POST http://localhost:3000/api/products \\
  -H "Content-Type: application/json" \\
  -d '{"product_key": "${product.product_key}","language": "${targetLanguage}","name": "${translatedName.replace(/'/g, "\\'")}","description": "${translatedDescription.replace(/'/g, "\\'")}","category": "${product.category.replace(/'/g, "\\'")}","price": ${product.price}${product.image ? `,"image": "${product.image.replace(/'/g, "\\'")}"` : ''}}'`);
    }
    
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
}

// Run the script
translateProduct();
