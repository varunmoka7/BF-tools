# Waste Management BI Dashboard

A modern, responsive dashboard built with Next.js 14+ for tracking and analyzing waste management operations.

## Features

- **Real-time Analytics**: Track waste metrics, cost savings, and environmental impact
- **Company Management**: Monitor multiple companies and their waste data
- **Interactive Dashboard**: Modern UI with responsive design
- **Supabase Integration**: Real-time database with automatic sync
- **TypeScript**: Full type safety and developer experience

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **State Management**: React hooks

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions and configs
├── services/           # API services and business logic
└── types/              # TypeScript type definitions
```

## Development

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Type checking**: `npm run type-check`
- **Linting**: `npm run lint`

## Deployment

This project is ready to deploy on Vercel, Netlify, or any platform supporting Next.js.

Built for rapid prototyping and production-ready scaling.
