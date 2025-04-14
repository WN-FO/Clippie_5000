# Clippie: AI-Powered Video Clip Creator

[![Deployment Status](https://img.shields.io/github/deployments/WN-FO/Clippie_5000/production?label=vercel&logo=vercel)](https://clippie-5000.vercel.app)

Clippie is a SaaS platform that helps content creators transform long-form videos into engaging short-form clips with AI-generated subtitles for social media.

> 🚀 **[Visit Clippie](https://clippie-5000.vercel.app)**  
> 🔄 **Last Updated:** April 14, 2024

## Implementation Details

### Core Features

- **Authentication**: Secure user authentication using Supabase Auth with email/password and social login options
- **Video Management**: Upload, store, and manage videos in Supabase Storage
- **Clip Creation**: Select segments from videos with an intuitive timeline interface
- **Transcription**: Automatic transcription using OpenAI's Whisper API
- **Subtitle Generation**: Create customizable subtitles for clips
- **Export Options**: Export clips in formats optimized for different social platforms
- **Subscription Management**: Tiered subscription plans with Stripe integration

### Technical Implementation

- **Frontend**: Next.js 14 with App Router, React components for video editing and preview
- **Authentication**: Supabase Auth with JWT and protected routes
- **Storage**: Supabase Storage buckets for videos, clips, and subtitles
- **Database**: PostgreSQL with Prisma ORM for type-safe queries
- **Video Processing**: FFmpeg for video clipping, format conversion, and subtitle embedding
- **API Integration**: OpenAI Whisper for transcription, Stripe for payments
- **Deployment**: Ready for deployment on Vercel

## Key Features

- **Video Management**: Upload videos, manage your library, and create clips
- **AI Transcription**: Automatically generate accurate transcriptions with OpenAI's Whisper
- **Clip Creation**: Select segments from your videos to create short-form clips
- **Subtitle Generation**: Add customizable subtitles to your clips
- **Export Options**: Export clips optimized for TikTok, Instagram, and YouTube Shorts
- **Subscription Plans**: Choose between Free, Creator, and Pro plans

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL), Prisma ORM
- **Authentication**: Supabase Auth
- **Video Processing**: FFmpeg
- **AI Transcription**: OpenAI Whisper API
- **Payment Processing**: Stripe

## Subscription Plans

### Free Plan
- 1 video/month (5 min)
- Basic transcription
- Watermarked exports
- 720p resolution
- 7-day storage

### Creator Plan ($29/month)
- 120 min/month
- Enhanced subtitles
- No watermark
- 1080p exports
- 365-day storage

### Pro Plan ($79/month)
- 300 min/month
- Priority rendering
- Advanced subtitle customization
- 4K exports
- 365-day storage

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure your environment variables
4. Run the application: `npm run dev`

### Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# URLs
NEXT_PUBLIC_APP_URL=
FRONTEND_URL=

# Stripe Configuration
STRIPE_CREATOR_PLAN_ID=
STRIPE_PRO_PLAN_ID=
STRIPE_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# OpenAI API Key
OPENAI_API_KEY=
```

## Database Setup

```bash
# Generate tables
npx prisma generate

# Push schema to db
npx prisma db push

# Open prisma studio on localhost
npx prisma studio
```

## Project Structure

- `/app`: Next.js app router pages and layouts
- `/components`: Reusable UI components
- `/lib`: Utilities for database, authentication, and API access
- `/prisma`: Database schema
- `/public`: Static assets

## License

This project is licensed under the [MIT License](LICENSE).
