# BeeFinder Troubleshooting Guide

## Common Issues & Solutions

### 1. Tailwind CSS Classes Not Working

**Symptoms:**
- Background colors not applying
- Styling appears basic/unstyled
- Classes work in development but not production

**Root Cause:**
Tailwind CSS purging removes "unused" classes during production build

**Solution:**
```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Add all classes you want to preserve
    'bg-gray-500',
    'bg-blue-500',
    'text-white',
    'bg-gradient-to-r',
    // ... etc
  ],
  // ... rest of config
}
```

**Prevention:**
- Always add classes to safelist if they're dynamically applied
- Use inline styles for critical styling
- Test production builds locally

### 2. Firebase Storage Images Not Accessible

**Symptoms:**
- Images upload but return 403 Forbidden
- Images not displaying in app
- Storage rules errors

**Solution:**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      allow read;  // Public read access
      allow write: if false;  // Only Admin SDK
    }
  }
}
```

**Deployment:**
```bash
firebase deploy --only storage:rules
```

### 3. Cloud Function Image Generation Fails

**Symptoms:**
- Function returns error
- No image data in response
- Gemini API errors

**Debug Steps:**
1. Check Cloud Function logs:
```bash
firebase functions:log --only generateImageAndText
```

2. Verify API keys:
```bash
firebase functions:config:get
```

3. Test with simple prompt first

**Common Fixes:**
- Retry with different Gemini model configuration
- Check API quota limits
- Verify network connectivity

### 4. Development vs Production Differences

**Symptoms:**
- Works locally but not in production
- Different behavior between environments

**Debug Checklist:**
1. **Environment Variables**: Check `.env` vs Firebase config
2. **Build Process**: Verify `npm run build` works
3. **Deployment**: Ensure latest code is deployed
4. **Caching**: Clear browser cache and CDN cache
5. **API Keys**: Verify production API keys are set

### 5. Image Generation Returns Text Instead of Image

**Symptoms:**
- Function completes but no image
- Logs show text response instead of image data

**Solution:**
The function includes retry logic:
```typescript
// If initial generation fails, retry with different config
if (message.includes('response_mime_type') || 
    message.includes('allowed mimetypes')) {
  // Retry with text/plain mime type
  const fallbackConfig = {
    ...imageGenerationConfig,
    responseMimeType: 'text/plain',
  };
}
```

### 6. Location API Failures

**Symptoms:**
- Invalid location errors
- Function fails on location lookup

**Debug:**
1. Test location API directly:
```bash
curl "http://api.zippopotam.us/us/90210"
```

2. Check for valid zipcode format (5 digits)
3. Verify city/state format

**Common Issues:**
- Invalid zipcode format
- City name encoding issues
- API rate limiting

### 7. Weather API Failures

**Symptoms:**
- Weather data not retrieved
- Function fails on weather lookup

**Debug:**
1. Check OpenWeatherMap API key
2. Verify coordinates are valid
3. Test API directly with coordinates

**Solution:**
```typescript
const weatherResponse = await fetch(
  `${weatherApi}?lat=${latitude}&lon=${longitude}&appid=${openWeatherMapKey}`
);
```

## Deployment Checklist

### Before Deployment:
- [ ] Test locally with `npm run dev`
- [ ] Build successfully with `npm run build`
- [ ] Verify all API keys are set
- [ ] Check storage rules are correct
- [ ] Test Cloud Function locally

### After Deployment:
- [ ] Check Firebase console for function logs
- [ ] Verify storage bucket is accessible
- [ ] Test with real location input
- [ ] Verify images are publicly accessible
- [ ] Check for any error messages

### Environment Setup:
```bash
# Set Firebase config
firebase functions:config:set gemini.api_key="YOUR_KEY"
firebase functions:config:set openweathermap.key="YOUR_KEY"

# Deploy everything
firebase deploy

# Deploy specific components
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only storage:rules
```

## Performance Optimization

### Cloud Function:
- Use appropriate Gemini model (2.5-flash for speed)
- Implement retry logic for reliability
- Add comprehensive logging for debugging

### Storage:
- Use appropriate image formats (PNG/JPEG)
- Consider image compression for faster loading
- Implement CDN for better performance

### Frontend:
- Optimize image loading
- Add loading states
- Implement error boundaries

## Monitoring & Debugging

### Cloud Function Logs:
```bash
firebase functions:log --only generateImageAndText
```

### Storage Monitoring:
- Check Firebase Storage console
- Monitor storage usage
- Verify public access rules

### Frontend Debugging:
- Use browser dev tools
- Check network requests
- Verify Firebase configuration

## Emergency Rollback

If deployment causes issues:

1. **Revert to previous version:**
```bash
git checkout previous-working-commit
firebase deploy
```

2. **Disable function temporarily:**
```bash
firebase functions:config:set maintenance.enabled=true
```

3. **Check previous working branch:**
```bash
git checkout bee-image-generation-success
firebase deploy
```

## Best Practices

### Code Organization:
- Keep functions focused and single-purpose
- Add comprehensive error handling
- Include detailed logging
- Use TypeScript for type safety

### Testing:
- Test with various location inputs
- Test error scenarios
- Verify image generation works
- Check storage accessibility

### Documentation:
- Keep this guide updated
- Document any new issues found
- Include solutions for future reference
