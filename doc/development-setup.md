# BeeFinder Development Setup Guide

## Prerequisites

### Required Software:
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git** (for version control)

### Required Accounts:
- **Google Cloud Platform** (for Gemini AI)
- **Firebase** (for hosting and functions)
- **OpenWeatherMap** (for weather data)

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/jynxmynx82/BeeFinder.git
cd BeeFinder
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select services:
# - Functions
# - Hosting
# - Storage
```

### 4. Environment Configuration

#### Frontend (.env file):
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Backend (Firebase Functions Config):
```bash
# Set Gemini API key
firebase functions:config:set gemini.api_key="your_gemini_api_key"

# Set OpenWeatherMap API key
firebase functions:config:set openweathermap.key="your_openweathermap_key"
```

## Development Workflow

### 1. Local Development
```bash
# Start development server
npm run dev

# In another terminal, start Firebase emulators
firebase emulators:start
```

### 2. Testing Cloud Functions
```bash
# Test function locally
firebase functions:shell

# In the shell:
generateImageAndText({zipcode: "90210"})
```

### 3. Building for Production
```bash
# Build frontend
npm run build

# Deploy everything
firebase deploy

# Deploy specific components
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only storage:rules
```

## Project Structure

```
BeeFinder/
├── functions/                 # Cloud Functions
│   ├── src/
│   │   └── index.ts         # Main Cloud Function
│   ├── package.json
│   └── tsconfig.json
├── src/                      # Frontend React app
│   ├── components/           # React components
│   ├── services/            # Firebase service layer
│   ├── types.ts             # TypeScript types
│   └── App.tsx              # Main app component
├── public/                   # Static assets
├── doc/                      # Documentation
│   ├── bee-image-generation-system.md
│   ├── troubleshooting-guide.md
│   └── development-setup.md
├── firebase.json             # Firebase configuration
├── storage.rules            # Firebase Storage rules
├── tailwind.config.js       # Tailwind CSS config
└── package.json             # Frontend dependencies
```

## Key Files Explained

### Cloud Function (`functions/src/index.ts`)
- **Purpose**: Generates bee images and text using AI
- **APIs Used**: Gemini AI, OpenWeatherMap, Zippopotam.us
- **Output**: Returns image URL and bee information

### Firebase Service (`src/services/firebaseService.ts`)
- **Purpose**: Client-side Firebase integration
- **Functions**: Calls Cloud Function, handles responses

### Storage Rules (`storage.rules`)
- **Purpose**: Controls Firebase Storage access
- **Configuration**: Allows public read, admin-only write

### Tailwind Config (`tailwind.config.js`)
- **Purpose**: CSS framework configuration
- **Important**: Safelist prevents CSS purging issues

## API Keys Setup

### 1. Gemini AI (Google AI Studio)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create API key
3. Set in Firebase: `firebase functions:config:set gemini.api_key="YOUR_KEY"`

### 2. OpenWeatherMap
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get free API key
3. Set in Firebase: `firebase functions:config:set openweathermap.key="YOUR_KEY"`

### 3. Firebase Configuration
1. Go to Firebase Console
2. Project Settings → General
3. Copy web app configuration
4. Add to `.env` file

## Development Tips

### 1. Testing Image Generation
```bash
# Test with different locations
curl -X POST https://your-region-your-project.cloudfunctions.net/generateImageAndText \
  -H "Content-Type: application/json" \
  -d '{"zipcode": "90210"}'
```

### 2. Debugging CSS Issues
```bash
# Check if Tailwind classes are being purged
npm run build
grep -r "bg-gray-500" dist/
```

### 3. Monitoring Function Logs
```bash
# Real-time logs
firebase functions:log --only generateImageAndText

# Specific function logs
firebase functions:log --only generateImageAndText --limit 50
```

## Common Development Issues

### 1. Port Conflicts
```bash
# If port 3000 is in use
npm run dev -- --port 3001
```

### 2. Firebase Login Issues
```bash
# Re-authenticate
firebase logout
firebase login
```

### 3. Function Deployment Failures
```bash
# Check function logs
firebase functions:log

# Redeploy with force
firebase deploy --only functions --force
```

## Production Deployment

### 1. Pre-deployment Checklist
- [ ] All API keys configured
- [ ] Storage rules deployed
- [ ] Function tested locally
- [ ] Frontend builds successfully
- [ ] Environment variables set

### 2. Deployment Commands
```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only storage:rules
```

### 3. Post-deployment Verification
- [ ] App loads at hosting URL
- [ ] Function responds to calls
- [ ] Images upload to storage
- [ ] Public URLs work
- [ ] No console errors

## Git Workflow

### 1. Working on Features
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push branch
git push -u origin feature/new-feature
```

### 2. Merging Changes
```bash
# Switch to main branch
git checkout main

# Merge feature branch
git merge feature/new-feature

# Push to main
git push origin main
```

## Troubleshooting

### 1. Function Not Deploying
- Check Firebase CLI version: `firebase --version`
- Update if needed: `npm install -g firebase-tools@latest`
- Check function syntax and imports

### 2. Storage Access Issues
- Verify storage rules are deployed
- Check bucket permissions in Firebase console
- Test with public URL directly

### 3. Frontend Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors
- Verify all imports are correct

## Resources

### Documentation:
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev/guide/)

### APIs:
- [Gemini AI](https://ai.google.dev/docs)
- [OpenWeatherMap](https://openweathermap.org/api)
- [Zippopotam.us](http://www.zippopotam.us/)

### Support:
- Check `doc/troubleshooting-guide.md` for common issues
- Review function logs for errors
- Test with simple inputs first
