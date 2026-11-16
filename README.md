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

After adding the values to `.env`, run
`supabase/fix_save_error.sql` in the Supabase SQL Editor.
It includes the required table grants, RLS policies, and the private
`meal-images` bucket. Then restart Expo with:

```bash
npx expo start -c
```

It enables email/password authentication, links records to `auth.users`, and
restricts rows and images to the signed-in user. If email confirmation is
enabled in Supabase Auth, the user must confirm the email before completing the
profile setup.
