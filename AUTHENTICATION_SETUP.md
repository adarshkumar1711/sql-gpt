# SqlGPT Authentication Setup Guide

This guide will help you set up email/password authentication with Supabase and Google Gemini integration for your SqlGPT application.

## 🔧 Installation

First, install the required Supabase dependencies:

```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

## 🔑 Supabase Configuration

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Create a new project
4. Wait for the project to be set up

### 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on the "Settings" icon in the sidebar
3. Select "API" from the settings menu
4. Copy your:
   - Project URL
   - Anon (public) key

### 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqDVqU
```

### 4. Configure Email Authentication

The app now uses **email/password authentication** instead of OAuth:

1. In your Supabase dashboard, go to "Authentication" → "Settings"
2. Configure email settings:
   - **Site URL**: Set to your domain (e.g., `http://localhost:3000` for development)
   - **Redirect URLs**: Add your domains
3. Customize email templates in "Authentication" → "Email Templates" if needed

## 🤖 Google Gemini Setup

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API Key"** in the left sidebar
4. Create a new API key
5. Copy the API key and add it to your `.env.local`

### 2. API Usage

The app uses:
- **Model**: `gemini-1.5-flash` (fast and cost-effective)
- **Safety Settings**: Enabled for content filtering
- **Rate Limits**: 15 requests/minute, 1,500 requests/day (free tier)

## 🚀 Usage

Once configured, the authentication flow works as follows:

1. **Landing Page**: Users see the "Try SqlGPT Free" button
2. **Auth Modal**: Clicking opens a modal with email/password form
3. **Email/Password**: Users can sign up or sign in
4. **Email Verification**: New users receive verification email
5. **Dashboard Access**: Authenticated users access the main application
6. **Session Persistence**: Users stay logged in across browser sessions

## 🔄 Development vs Production

The current implementation supports both environments:

- **Development**: Use `http://localhost:3000` in your Supabase settings
- **Production**: Use your actual domain (e.g., `https://yourdomain.com`)

## 🛠️ Code Structure

### Authentication Context (`src/lib/auth-context.tsx`)
- Manages global authentication state
- Handles sign-in/sign-up operations with email/password
- Provides user session management

### Auth Modal (`src/components/AuthModal.tsx`)
- Beautiful modal with email/password form
- Toggle between sign-in and sign-up modes
- Form validation and error handling
- Loading states and success feedback

### Route Protection
- Landing page redirects authenticated users to dashboard
- Dashboard redirects unauthenticated users to landing page
- Persistent session checking across page refreshes

### Supabase Client (`src/lib/supabase.ts`)
- Configured Supabase client
- Email/password authentication functions
- Session management utilities

### Gemini Integration (`src/lib/gemini.ts`)
- Google Gemini API integration
- SQL query generation from natural language
- Custom system prompt for SQL expertise
- Error handling and response parsing

## 🎨 Features

✅ **Email/Password Authentication**
✅ **Modal-based sign-in with responsive design**
✅ **Automatic redirects for authenticated users**
✅ **Session persistence across browser sessions**
✅ **Form validation and error handling**
✅ **Email verification for new accounts**
✅ **Professional UI matching app design**
✅ **Google Gemini AI integration**

## 🔒 Security Notes

- Environment variables are properly scoped with `NEXT_PUBLIC_` prefix
- Supabase handles all authentication security
- Row Level Security (RLS) policies protect user data
- Automatic token refresh handled by Supabase
- Content safety filters enabled in Gemini
- Input validation prevents malicious schema injection

## 🐛 Troubleshooting

### Common Issues:

1. **"Gemini API key not configured"**: Make sure your API key is properly set in `.env.local`
2. **Environment variables not working**: Restart your development server after adding `.env.local`
3. **Email verification issues**: Check your Supabase email settings and spam folder
4. **Authentication errors**: Verify your Supabase URL and anon key are correct

### Development Tips:

- Use Supabase's built-in auth debugging tools
- Check browser console for authentication errors
- Verify environment variables are loaded correctly using `console.log()`
- Test email verification in development mode

## 📝 Next Steps

After setting up authentication:

1. Test the full authentication flow (sign up → verify email → sign in)
2. Set up your database schema using the provided SQL
3. Test the Gemini integration with sample queries
4. Customize the user interface as needed
5. Deploy to production with proper environment variables

## 🤝 Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs/guides/auth)
2. Review the [Google AI Studio documentation](https://ai.google.dev/)
3. Verify all configuration steps above
4. Check browser console for error messages

---

**Note**: Make sure to replace all placeholder values with your actual project credentials and URLs. 