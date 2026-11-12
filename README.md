# CalorieSnap

Expo (TypeScript) app for scanning meals and tracking daily calories.

## Run locally

1. Install dependencies

```bash
npm install
```

2. Start Expo

```bash
npm run start
```

3. Open in Expo Go
- iOS: scan the QR code with the Camera app
- Android: scan the QR code with Expo Go

## Notes
- Camera requires permission on first use.
- Daily calories reset automatically at midnight (local device time).

## Supabase setup

After adding the values to `.env`, run the SQL migration
`supabase/migrations/20261112_fix_data_api_access.sql` in the Supabase SQL Editor.
Then restart Expo with:

```bash
npx expo start -c
```

The migration grants the Data API access required by the app and creates the
`meal-images` storage bucket used for meal photos.
