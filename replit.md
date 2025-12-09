# HGL Labs Mobile App

## Overview
A professional mobile application for Hindustan Gemological Laboratory (HGL) - a jewelry testing and hallmarking lab system. Built with React Native Expo, the app supports iOS, Android, and web platforms.

## Features
- **Customer Entry**: Record customer information, jewelry items for testing, with workflow status tracking
- **Card Generator**: Create professional certificates with QR codes, photos, and PDF export
- **Records View**: Dashboard with statistics, search/filter, PDF and CSV export capabilities
- **Professional Branding**: Company logo, gold theme, modern card-based UI

## Project Structure
```
hgl-labs-app/
├── App.js                       # Main navigation setup with bottom tabs
├── package.json                 # Dependencies and scripts
├── app.json                     # Expo configuration
├── assets/
│   └── logo.jpg                 # Company logo
├── components/
│   └── Header.js                # Reusable header with logo
├── screens/
│   ├── CustomerEntryScreen.js   # Customer intake form with status tracking
│   ├── CardGeneratorScreen.js   # Certificate generation with QR and PDF export
│   └── RecordsScreen.js         # Records display with dashboard, search, export
└── utils/
    ├── storage.js               # AsyncStorage helpers for data persistence
    └── exportUtils.js           # PDF and CSV export utilities
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
- expo-print - PDF generation
- expo-sharing - File sharing
- expo-file-system - File system access for exports

## Data Storage
Uses AsyncStorage with the following keys:
- `hglcustomers` - Customer records array
- `hglcards` - Card/certificate records array
- `hgljob` - Auto-incrementing job number counter

## Workflow Status Options
- Received - Item received for testing
- Testing - Currently being tested
- Marking - Hallmark being applied
- Ready - Ready for pickup
- Delivered - Returned to customer

## Export Features
- **PDF Export**: Professional reports for customers and cards with HGL branding
- **CSV Export**: Spreadsheet-compatible data export
- **Certificate PDF**: Individual certificate export with QR code

## Branding
- Primary color: #b8860b (Gold/Dark Goldenrod)
- Secondary color: #0066b3 (Blue)
- Logo: HGL with tagline "Accurate. Confidential. Integrity"
- Website: https://hgl-labs.com/
- Job number format: HGL00001, HGL00002, etc.
