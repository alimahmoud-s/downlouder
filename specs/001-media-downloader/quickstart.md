# Quickstart: Media Downloader SaaS

## Prerequisites

- Node.js LTS (v20+)
- Redis installed and running locally
- PostgreSQL running locally or via a Supabase project

## Getting Started

1. **Clone and Install**

   ```bash
   git clone [repository-url]
   cd media-downloader
   cd frontend && npm install
   cd ../worker && pip install -r requirements.txt
   ```

2. **Environment Variables**
   Duplicate `.env.example` to `.env` in both `/frontend` and `/worker` and fill in the values for Supabase, Stripe, and Redis.

3. **Database Setup**
   Ensure you have Supabase CLI installed.

   ```bash
   npx supabase start
   npx supabase db push
   ```

4. **Run the Application Locally**
   Start the Next.js frontend:

   ```bash
   cd frontend && npm run dev
   ```

   Start the Python worker API and Celery queue:

   ```bash
   cd worker
   uvicorn src.api.main:app --reload
   celery -A src.tasks.download_tasks worker --loglevel=info
   ```

## Development Commands

- `npm run dev`: Starts the Next.js frontend.
- `npm run test`: Runs Vitest unit tests in frontend / Pytest in worker.
- `npm run test:e2e`: Runs Playwright E2E tests for the downloading workflows.

## System Architecture Overview

The application uses a separated architecture to prevent heavy I/O tasks from blocking UI rendering.

- `frontend/`: The Next.js 14 App Router serving the main React (GSAP) interface. Communicates with both Supabase directly and the worker via Socket.io.
- `worker/`: A Python FastAPI server orchestrating Celery jobs. It handles the actual media extraction using native `yt-dlp`, falling back to `Scrapling` for stealth scraping of platforms with high blocking rates (Instagram Stories, TikTok).
