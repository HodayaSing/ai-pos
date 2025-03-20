/**
 * Calculates a realistic price based on category, description, and name
 * @param category - The product category
 * @param description - The product description (optional)
 * @param name - The product name (optional)
 * @returns A calculated price in USD
 */
export const calculateRealisticPrice = (
  category: string, 
  description: string = "", 
  name: string = ""
): number => {
  console.log(`Calculating price for: Category=${category}, Name=${name}, Description=${description}`);
  
  // Exchange rate: 1 USD = 3.7 ILS (approximate)
  const shekelToUsd = (shekelAmount: number) => shekelAmount / 3.7;
  
  // Base prices in shekels by category - increased variation
  const basePrices: Record<string, number> = {
    "Starters": 32,
    "Breakfast": 48,
    "Lunch": 68,
    "Supper": 89,
    "Desserts": 28,
    "Beverages": 18
  };
  
  // Get base price for category or default to 35 shekels
  let basePrice = basePrices[category] || 35;
  console.log(`Base price for ${category}: ${basePrice} shekels`);
  
  // Adjust price based on ingredients mentioned in description or name
  const fullText = (description + " " + name).toLowerCase();
  
  // Premium ingredients that increase price
  const premiumIngredients = [
    { term: "salmon", increase: 25 },
    { term: "beef", increase: 30 },
    { term: "steak", increase: 40 },
    { term: "shrimp", increase: 20 },
    { term: "seafood", increase: 25 },
    { term: "truffle", increase: 35 },
    { term: "cheese", increase: 10 },
    { term: "avocado", increase: 8 },
    { term: "organic", increase: 15 },
    { term: "special", increase: 10 },
    { term: "premium", increase: 20 },
    { term: "wellington", increase: 45 }
  ];
  
  // Check for premium ingredients and adjust price
  let ingredientAdjustment = 0;
  premiumIngredients.forEach(ingredient => {
    if (fullText.includes(ingredient.term)) {
      ingredientAdjustment += ingredient.increase;
      console.log(`Found ingredient: ${ingredient.term}, adding ${ingredient.increase} shekels`);
    }
  });
  
  basePrice += ingredientAdjustment;
  console.log(`Price after ingredients: ${basePrice} shekels`);
  
  // Adjust for portion size if mentioned
  if (fullText.includes("large") || fullText.includes("extra") || fullText.includes("double")) {
    const beforeSize = basePrice;
    basePrice *= 1.3;
    console.log(`Large portion detected, increasing from ${beforeSize} to ${basePrice} shekels`);
  }
  
  // Convert to USD
  const priceInUsd = shekelToUsd(basePrice);
  console.log(`Price in USD (raw): ${priceInUsd}`);
  
  // Add random variation to make prices more unique (±10%)
  const variationFactor = 0.9 + (Math.random() * 0.2); // Between 0.9 and 1.1
  const priceWithVariation = priceInUsd * variationFactor;
  console.log(`Added random variation: ${priceInUsd} → ${priceWithVariation}`);
  
  // Make prices look natural with .49 or .99 endings
  let finalPrice: number;
  
  // Use a mix of price endings for more variety
  const priceEndings = [0.49, 0.79, 0.89, 0.99];
  const randomEndingIndex = Math.floor(Math.random() * priceEndings.length);
  
  if (priceWithVariation < 10) {
    // For cheaper items, use random endings
    finalPrice = Math.floor(priceWithVariation) + priceEndings[randomEndingIndex];
  } else if (priceWithVariation < 20) {
    // For medium-priced items, prefer .99
    finalPrice = Math.floor(priceWithVariation) + 0.99;
  } else {
    // For expensive items, round to nearest whole number + .99
    finalPrice = Math.floor(priceWithVariation) + 0.99;
  }
  
  console.log(`Final price: $${finalPrice.toFixed(2)}`);
  return parseFloat(finalPrice.toFixed(2));
};
