# Media Downloader SaaS - Architecture & Execution Blueprint

## 1. Project Overview
A freemium web application for downloading video, audio, and playlists from YouTube, Facebook, Instagram, X (Twitter), and TikTok. 
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, GSAP (`@gsap/react`).
- **Backend (Worker):** Node.js (Express), BullMQ, Socket.io, `yt-dlp-exec`, `fluent-ffmpeg`, Playwright.
- **Data & Auth:** Supabase (PostgreSQL).
- **Monetization:** Stripe (Pro Tier), Google AdSense (Free Tier).

## 2. Core Rules for the AI Developer
- **Strict Phasing:** Execute ONLY the phase requested by the user. Do not write code for future phases.
- **Resource Management:** Ensure all Playwright browser contexts are closed in `finally` blocks.
- **Memory Safety:** Use the `useGSAP` hook for all animations to prevent React strict-mode memory leaks.
- **File Management:** All generated media files must be temporary and subject to automated cleanup.
- **Performance First:** Use Next.js dynamic imports for heavy components (like GSAP animations or Ads) to keep the initial JS payload under 100kb.
- **Testing Standard:** Every phase must conclude with writing associated tests. Use Vitest for fast, local unit testing and Playwright for E2E user flows. 

## 3. SEO & GEO (Generative Engine Optimization) Standards
- **Semantic HTML:** Strict adherence to semantic tags (`<article>`, `<section>`, `<nav>`, `<main>`).
- **Next.js Metadata API:** Implement dynamic OpenGraph and Twitter cards for every route.
- **JSON-LD Structured Data:** Inject Schema.org `SoftwareApplication` and `FAQPage` JSON-LD scripts into the `layout.tsx` to optimize for AI search engine parsing (GEO).
- **High Information Density:** Ensure UI text directly answers common user queries (e.g., "How to download Instagram Reels in 4K") clearly and factually.

---

## 4. Execution Phases

### Phase 1: Frontend Scaffold, SEO & Supabase Setup
**Goal:** Establish the UI shell, authentication, and core discoverability.
- Initialize Next.js with Tailwind CSS and TypeScript. Configure the Next.js Metadata API for the root layout.
- Inject JSON-LD structured data (`SoftwareApplication`) for GEO.
- Install Supabase client and configure environment variables.
- Create the Supabase SQL schema for `users` and `user_subscriptions`.
- Build the Next.js Auth pages (Login/Signup).
- **Testing:** Write Vitest unit tests for the Supabase Auth utility functions.
- **Stop and wait for user review.**

### Phase 2: Core UI, Animation (GSAP) & Performance
**Goal:** Build the sleek, modern universal input interface with high performance.
- Implement the main URL input component.
- Integrate `@gsap/react`. Create a smooth layout transition that detects the platform from the URL. **Dynamically import** the GSAP components to preserve Core Web Vitals.
- Build the conditional AdSense placeholder component.
- **Testing:** Write React Testing Library tests to ensure the input component correctly identifies URL strings (YouTube vs. TikTok). Run a Lighthouse performance audit script.
- **Stop and wait for user review.**

### Phase 3: Backend Worker & Queue Infrastructure
**Goal:** Set up the isolated Node.js backend for heavy I/O.
- Initialize a separate Node.js Express project.
- Configure BullMQ with Redis to handle asynchronous `downloadJobs`.
- Set up Socket.io on the Express server.
- Create a `node-cron` job to purge the `/downloads` directory every 60 minutes.
- **Testing:** Write Vitest unit tests for the BullMQ job creation and the cron job scheduling logic.
- **Stop and wait for user review.**

### Phase 4: The Extraction Engine (Waterfall Strategy)
**Goal:** Implement the media downloading logic within the worker.
- Install `yt-dlp-exec`, `fluent-ffmpeg`, and `playwright`.
- Create the `YtDlpService` (primary) and `PlaywrightService` (fallback for 403/429 errors).
- Write the routing logic: Route Instagram Stories and TikTok links directly to `PlaywrightService`.
- **Testing:** Write unit tests mocking the `yt-dlp` response. Write a localized integration test for the fallback logic (simulate a 403 error to ensure Playwright triggers).
- **Stop and wait for user review.**

### Phase 5: System Integration, Playlist UI & E2E Testing
**Goal:** Connect the frontend to the backend worker and finalize user flows.
- Connect the frontend Socket.io client to listen for real-time progress events.
- Implement the Playlist UI with a selection table for Pro Tier users.
- **Testing:** Write Playwright E2E tests covering the complete user journey: pasting a link, waiting for the mock extraction, and validating the download button appears. Set up a GitHub Actions workflow file to run these Playwright tests in the cloud.
- **Stop and wait for user review.**