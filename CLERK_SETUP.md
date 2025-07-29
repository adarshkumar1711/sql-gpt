# Clerk Authentication Setup

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_from_dashboard
CLERK_SECRET_KEY=your_clerk_secret_key_from_dashboard

# Clerk URLs (optional, defaults work fine)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Getting Your Clerk Keys

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Select your app (app_30VPILawm3kBFT9yl5mLoL3ZP2X)
3. Go to "API Keys" in the sidebar
4. Copy the "Publishable key" and "Secret key"
5. Add them to your `.env.local` file

## Database Migration

Since you're switching from Supabase Auth to Clerk, you'll need to run the database schema:

1. Open Supabase SQL Editor
2. Run the `schema.sql` file to set up the database with schema-per-session support
3. The app will now use Clerk for authentication and Supabase only for data storage

## What Changed

- ✅ Replaced Supabase Auth with Clerk Auth
- ✅ Added schema-per-session support
- ✅ Modern, professional UI matching ChatGPT style
- ✅ Auto-scroll functionality
- ✅ Larger chat input area
- ✅ Dark theme authentication pages

## Ready to Test!

1. Add your Clerk keys to `.env.local`
2. Run `npm run dev`
3. Visit your app and test the new authentication flow 