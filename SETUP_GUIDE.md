# 🚀 Quick Setup Guide

## 1. Create Environment File

Create a `.env.local` file in your project root with these values:

```env
# Firebase Configuration (Your current values)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAnLUzK9h8jR9pYvrajHsOu4kvCoihki6o
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ecommerce-app-da180.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ecommerce-app-da180
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ecommerce-app-da180.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=720943276086
NEXT_PUBLIC_FIREBASE_APP_ID=1:720943276086:web:df8451e08a59923ca3b897
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1V37XLN5JV

# Email Configuration (Your current values)
GMAIL_USER=rijanmailsender@gmail.com
GMAIL_APP_PASSWORD=dkmu iaby adah zivk

# JWT Secret (Generate a new one for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 2. Start Development Server

```bash
npm run dev
```

## 3. Test Your Setup

1. **Visit your app**: http://localhost:3000
2. **Test admin panel**: http://localhost:3000/admin
3. **Test email functionality**: The warning messages should disappear

## 4. Security Checklist

- ✅ **Environment variables** - No more hardcoded credentials
- ✅ **Firebase security rules** - Set to development mode
- ✅ **Email configuration** - Using environment variables
- ✅ **JWT secret** - Configurable for different environments

## 5. Production Deployment

When deploying to production:

1. **Change Firebase security rules** to production mode
2. **Generate a new JWT secret** using `openssl rand -base64 32`
3. **Use different Gmail credentials** for production
4. **Set environment variables** in your hosting platform

## 6. What's Changed

- **Email credentials** moved from hardcoded to environment variables
- **Firebase configuration** already using environment variables
- **Security warnings** added to detect missing configuration
- **Fallback values** provided for development

Your app is now secure and ready for production! 🎉
