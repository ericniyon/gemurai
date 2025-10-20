# KoraLink Logo Replacement Instructions

## Current Status
- ✅ Removed all 'Gemurai' text from header components
- ✅ Updated all header components to use KoraLink branding
- ✅ Updated all logo references to use PNG format
- ✅ Updated translations and branding references

## Next Steps
To complete the logo implementation:

1. **Add the PNG logo file**: 
   - Place your `KoraLink.png` file in `/public/KoraLink.png`
   - All header components are already configured to use `/KoraLink.png`:
     - `components/auth-header.tsx`
     - `components/dashboard-header.tsx` 
     - `app/[lang]/dashboard/layout.tsx`
     - `app/[lang]/set-password/page.tsx`

2. **Files Updated**:
   - Header components now display KoraLink logo instead of Gemurai text
   - All branding references updated to KoraLink
   - Translations updated for English, French, and Kinyarwanda
   - Token storage updated to use "KoraLink_token"

## Testing
Visit `http://localhost:3000/[lang]` to see the updated headers with the new KoraLink branding.
