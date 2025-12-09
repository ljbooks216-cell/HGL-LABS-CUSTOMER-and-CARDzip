# HGL Labs Mobile App

## Overview
A mobile application for Hindustan Gemological Laboratory (HGL) - a jewelry testing lab system. Built with React Native Expo, the app supports iOS, Android, and web platforms.

## Features
- **Customer Entry**: Record customer information and jewelry items given for testing
- **Card Generator**: Create certificates with QR codes and photos for jewelry items
- **Records View**: Display all customer and card records with pull-to-refresh

## Project Structure
```
hgl-labs-app/
├── App.js                    # Main navigation setup with bottom tabs
├── package.json              # Dependencies and scripts
├── app.json                  # Expo configuration
├── screens/
│   ├── CustomerEntryScreen.js   # Customer intake form
│   ├── CardGeneratorScreen.js   # Certificate generation with QR
│   └── RecordsScreen.js         # Records display with tabs
└── utils/
    └── storage.js            # AsyncStorage helpers for data persistence
```

## Running the App
The app runs on port 5000 with the command:
```bash
cd hgl-labs-app && npm run web
```

## Key Dependencies
- react-native / expo - Cross-platform mobile framework
- @react-navigation - Navigation between screens
- expo-image-picker - Camera/gallery photo selection
- react-native-qrcode-svg - QR code generation
- @react-native-async-storage - Local data persistence

## Data Storage
Uses AsyncStorage with the following keys:
- `hgl_customers` - Customer records array
- `hgl_cards` - Card/certificate records array
- `hgl_job_counter` - Auto-incrementing job number

## Branding
- Primary color: #b8860b (Gold/Dark Goldenrod)
- Logo text: "Hindustan Gemological Laboratory"
- Job number format: HGL00001, HGL00002, etc.
