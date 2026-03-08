# Implementation Plan: Media Downloader SaaS

**Branch**: `001-media-downloader` | **Date**: 2026-02-27 | **Spec**: [specs/001-media-downloader/spec.md](file:///C:/Users/user/Desktop/downlouder/specs/001-media-downloader/spec.md)
**Input**: Feature specification from `/specs/001-media-downloader/spec.md`

## Summary

Build a freemium web application for extracting direct media links from major social platforms (YouTube, Facebook, Instagram, Twitter, TikTok) to allow users to download directly via their browser or IDM. Uses a Next.js frontend and an isolated Python/Celery backend for processing. Includes native `yt-dlp` and `Scrapling` for stealth extraction from strict platforms, along with Stripe monetization for bulk playlist downloading.

## Technical Context

**Language/Version**: TypeScript (Frontend) / Python 3.11+ (Worker)
**Primary Dependencies**: Next.js (App Router), Tailwind CSS, GSAP (`@gsap/react`), FastAPI, Celery, `python-socketio`, `yt-dlp`, `scrapling`, Supabase
**Storage**: Supabase, Redis (for Celery broker and result backend)
**Testing**: Vitest, React Testing Library, Playwright (E2E)
**Target Platform**: Web app (browser), Linux Server (Worker)
**Project Type**: web-app
**Performance Goals**: Initial JS payload < 100kb, high success extraction rate (95%)
**Constraints**: Direct client downloads only (no proxying files on server), Handle 403/429 errors from strict providers, GSAP memory safety with React strict-mode
**Scale/Scope**: Support 5 major platforms, differentiation between Free/Pro tiers

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

No constitution file found, assuming standard web app development principles apply.

## Project Structure

### Documentation (this feature)

```text
specs/001-media-downloader/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
# Option 2: Web application (frontend + isolated worker backend)
worker/
├── src/
│   ├── services/
│   │   ├── extractor_ytdlp.py
│   │   └── extractor_scrapling.py
│   ├── tasks/
│   │   └── download_tasks.py
│   ├── api/
│   │   └── main.py
│   └── utils/
│       └── parsers.py
├── requirements.txt
└── tests/
    └── unit/

frontend/

├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (auth)/
│   ├── components/
│   │   ├── DownloadInput.tsx
│   │   ├── Progress.tsx
│   │   └── PlaylistTable.tsx
│   └── lib/
│       ├── supabase.ts
│       └── socket.ts
└── tests/
    ├── unit/
    └── e2e/
```

**Structure Decision**: Separate Next.js frontend and Express/BullMQ worker backend to isolate heavy extraction I/O from the user interface serving.

## Complexity Tracking

| Violation                                 | Why Needed            | Simpler Alternative Rejected Because                                                                                   |
| ----------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Two Separate Projects (Frontend + Worker) | Heavy I/O blocking    | Running yt-dlp/scrapling inside Next.js serverless times out and hits memory limits                                    |
| Polyglot Architecture (TS + Python)       | Best tool for the job | yt-dlp and Scrapling are native Python libraries. Wrapping them in Node.js creates unnecessary overhead and fragility. |
