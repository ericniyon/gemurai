# Product Image Generation

## Overview

The TCP App now includes automatic product image generation based on product names. This feature enhances the user experience by providing relevant, high-quality images for products that don't have custom images uploaded.

## Features

- **Automatic Generation**: Images are automatically generated when products are loaded
- **Smart Caching**: Generated images are cached to avoid repeated API calls
- **Fallback System**: Uses placeholder images if generation fails
- **Category-Aware**: Uses both product name and category for better image relevance
- **Error Handling**: Graceful fallback when API is unavailable

## Setup

### 1. Get Unsplash API Key

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create an account and register your application
3. Get your API access key

### 2. Configure Environment Variable

Add to your `.env.local` file:
```bash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

### 3. Restart the Application

After adding the environment variable, restart your development server:
```bash
npm run dev
```

## How It Works

### API Endpoint

The image generation is handled by `/api/generate-product-image`:

```typescript
POST /api/generate-product-image
{
  "productName": "Organic Honey",
  "category": "Food & Beverages"
}
```

### Response Format

```json
{
  "success": true,
  "imageUrl": "https://images.unsplash.com/photo-...",
  "source": "unsplash",
  "photographer": "John Doe",
  "photographerUrl": "https://unsplash.com/@johndoe"
}
```

### Fallback Response

When no API key is provided or on error:
```json
{
  "success": true,
  "imageUrl": "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Product%20Name",
  "source": "placeholder"
}
```

## Implementation Details

### Frontend Integration

The product cards automatically use generated images:

```typescript
// Product card image
<img
  src={generatedImages[product.id] || product.image}
  alt={product.name}
  onError={async (e) => {
    const generatedImage = await generateProductImage(product)
    if (generatedImage && generatedImage !== product.image) {
      e.currentTarget.src = generatedImage
    } else {
      e.currentTarget.src = "/placeholder.jpg"
    }
  }}
/>
```

### Image Generation Logic

1. **Check Cache**: First checks if image is already generated
2. **Skip Valid Images**: Skips products that already have valid images
3. **API Call**: Makes request to Unsplash API with product name and category
4. **Cache Result**: Stores generated image URL in state
5. **Fallback**: Uses placeholder if generation fails

### Search Query Optimization

The system creates optimized search queries:

```typescript
// Example transformations
"Organic Honey" + "Food & Beverages" → "food beverages organic honey"
"Premium Coffee Beans" + "Beverages" → "beverages premium coffee beans"
```

## Usage Examples

### Product Names and Generated Images

| Product Name | Category | Generated Image Type |
|--------------|----------|---------------------|
| "Organic Honey" | "Food & Beverages" | Honey jar/bottle |
| "Premium Coffee" | "Beverages" | Coffee beans/cup |
| "Natural Soap" | "Personal Care" | Soap bar/bottle |
| "Herbal Tea" | "Beverages" | Tea leaves/cup |

## Benefits

1. **Better UX**: Products always have relevant images
2. **Professional Look**: High-quality stock photos
3. **Reduced Manual Work**: No need to upload images for every product
4. **Consistent Quality**: All images follow same style and quality
5. **Cost Effective**: Uses free Unsplash API

## Troubleshooting

### No Images Generated

1. Check if `UNSPLASH_ACCESS_KEY` is set correctly
2. Verify the API key is valid
3. Check browser console for errors
4. Ensure network connectivity

### Poor Image Quality

1. Product names should be descriptive
2. Categories help improve relevance
3. Consider adding more specific product details

### API Rate Limits

Unsplash has rate limits:
- 50 requests per hour for demo applications
- 5000 requests per hour for production applications

## Future Enhancements

- [ ] Multiple image generation per product
- [ ] Image style customization
- [ ] Local image storage
- [ ] AI-powered image selection
- [ ] User preference learning 