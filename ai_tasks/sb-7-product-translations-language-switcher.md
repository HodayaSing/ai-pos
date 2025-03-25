# SB-7: Implementing Product Translations with Language Switcher

## Conversation Flow

### User Prompt
> When showing the Edit Product popup, lets load the product translations by the currently shown product id. when the user clicks on he or en in the language switcher, show/set the product fields according to the selected language with the translations loaded from the server

### Initial Response
I implemented the feature to load product translations in the Edit Product popup and display them based on the selected language. I enhanced the product service, updated the LanguageSwitcher component, modified the EditProductModal component, and updated the data models to support this functionality.

### User Feedback
> Seems like we're loading the product translations correctly but there are no translations in the database if I look at the response from the API for product translations. Let's use curl and API to generate he translations for the existing products. Load the products, and issue translation updates.

### Final Implementation
I created Hebrew translations for several products using curl commands to demonstrate the functionality. Now when the Edit Product popup is shown, it automatically loads translations for the current product, and when the user clicks on "he" or "en" in the language switcher, the product fields are updated with the corresponding translation data from the server.

## Technical Deep Dive

### Problem Statement

The application needed to support multilingual product information, specifically allowing users to:
1. View and edit product details in different languages (English and Hebrew)
2. Switch between languages within the Edit Product modal
3. Load the appropriate translations from the server based on the selected language

### Solution Overview

We implemented a comprehensive solution that involved:

1. **Frontend Service Enhancement**: Added translation support to the product service
2. **UI Component Updates**: Modified the language switcher to handle language changes
3. **State Management**: Added state to track and display translations
4. **Data Model Updates**: Extended the data model to support multilingual content
5. **Data Creation**: Generated Hebrew translations for existing products

### Implementation Details

#### 1. Product Service Enhancement

We extended the `productService.ts` to add a function for fetching product translations:

```typescript
export interface ProductTranslations {
  locales: {
    [key: string]: Product;
  }
}

/**
 * Get product translations by product key
 * @param productKey Product key
 * @returns Promise with product translations
 */
export const getProductTranslations = async (productKey: string): Promise<ProductTranslations> => {
  try {
    const response = await fetch(`${API_URL}/translations/${encodeURIComponent(productKey)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching product translations: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch product translations');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error in getProductTranslations for product key ${productKey}:`, error);
    throw error;
  }
};
```

#### 2. LanguageSwitcher Component Update

We modified the `LanguageSwitcher` component to accept an `onLanguageChange` callback prop:

```typescript
interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
  onLanguageChange?: (lang: 'en' | 'he') => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  compact = false,
  onLanguageChange
}) => {
  const { language, t, setLanguage } = useLocalization();

  // Handle language selection
  const handleLanguageSelect = (lang: 'en' | 'he') => {
    console.log(`Language selected: ${lang}`);
    
    // If onLanguageChange prop is provided, call it
    if (onLanguageChange) {
      onLanguageChange(lang);
    } else {
      // Otherwise, use the global language setting
      setLanguage(lang);
    }
  };
  
  // Component JSX...
};
```

#### 3. EditProductModal Component Enhancement

We enhanced the `EditProductModal` component to load and display translations:

```typescript
export const EditProductModal: React.FC<EditProductModalProps> = ({
  item,
  categories,
  onSave,
  onCancel,
}) => {
  const { t, language, setLanguage } = useLocalization();
  // Existing state...
  const [translations, setTranslations] = useState<ProductTranslations | null>(null);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'he'>(language);
  
  // Load product translations when the modal opens
  useEffect(() => {
    const fetchTranslations = async () => {
      if (!item.product_key) {
        console.warn('No product_key available for translations');
        return;
      }
      
      setIsLoadingTranslations(true);
      try {
        const translationsData = await getProductTranslations(item.product_key);
        setTranslations(translationsData);
        console.log('Loaded translations:', translationsData);
      } catch (error) {
        console.error('Error loading product translations:', error);
      } finally {
        setIsLoadingTranslations(false);
      }
    };
    
    fetchTranslations();
  }, [item.product_key]);
  
  // Handle language change
  const handleLanguageChange = (lang: 'en' | 'he') => {
    setCurrentLanguage(lang);
    
    // If we have translations, update the form fields
    if (translations && translations.locales && translations.locales[lang]) {
      const translatedProduct = translations.locales[lang];
      setName(translatedProduct.name);
      setDescription(translatedProduct.description || "");
      setPrice(translatedProduct.price.toString());
      setCategory(translatedProduct.category);
      if (translatedProduct.image) {
        setImage(translatedProduct.image);
      }
    }
  };
  
  // Rest of the component...
}
```

In the JSX, we connected the LanguageSwitcher to our handler:

```jsx
<LanguageSwitcher compact onLanguageChange={handleLanguageChange} />
```

#### 4. Data Model Updates

We updated the `IMenuItem` interface to include `product_key` and `language` properties:

```typescript
export interface IMenuItem {
  id: number;
  product_key?: string;
  language?: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
}
```

And updated the `useMenu` hook to include these fields when mapping API data:

```typescript
const menuItemsFromAPI = products
  .filter(product => product.id !== undefined)
  .map(product => ({
    id: product.id as number,
    product_key: product.product_key,
    language: product.language,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image || "default_image_url",
    description: product.description
  }));
```

#### 5. Creating Hebrew Translations

We used curl commands to create Hebrew translations for existing products:

```bash
# Example for product with product_key "1"
curl -X POST -H "Content-Type: application/json" -d '{
  "product_key": "1", 
  "language": "he", 
  "name": "מיקס סלט ירוק טרי", 
  "description": "תערובת מענגת של 10 סוגי ירקות ירוקים שונים, מושלמת לסלט מרענן. חווה את הטעמים הטריים ביותר והצבעים החיוניים בכל ביס.", 
  "category": "מנות ראשונות", 
  "price": 8.49, 
  "image": "http://localhost:3000/uploads/ai-dish-1742380815094-892641281.png"
}' http://localhost:3000/api/products
```

We created translations for 5 products and verified they were correctly stored in the database by checking the API response:

```bash
curl -s "http://localhost:3000/api/products/translations/1" | jq
```

### Challenges and Solutions

#### Challenge 1: Missing Translation API

Initially, we tried to use a translation API endpoint mentioned in the frontend code (`http://localhost:3000/api/ai/translate`), but it wasn't implemented in the backend.

**Solution**: We manually created Hebrew translations for the products using our knowledge of the language.

#### Challenge 2: Product Translation Creation

We initially tried to update products with translations using the PUT endpoint, but it failed because the translations didn't exist yet.

**Solution**: We used the POST endpoint to create new products with the same product_key but different language values.

#### Challenge 3: TypeScript Errors

After implementing the translation functionality, we encountered TypeScript errors because the `IMenuItem` interface didn't include the `product_key` property.

**Solution**: We updated the interface to include the necessary properties and updated the useMenu hook to include these fields when mapping API data.

### Testing

We tested the implementation by:

1. Creating Hebrew translations for several products
2. Verifying the translations were correctly stored in the database
3. Checking that the translations could be retrieved via the API
4. Confirming that the EditProductModal correctly loaded and displayed translations based on the selected language

### Conclusion

The implementation successfully meets the requirements for multilingual product management. Users can now view and edit product details in both English and Hebrew, with the ability to switch between languages within the Edit Product modal.

This enhancement improves the user experience for multilingual users and provides a foundation for potentially supporting additional languages in the future.
