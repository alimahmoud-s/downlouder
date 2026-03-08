---
description: "Task list for Media Downloader SaaS implementation"
---

# Tasks: Media Downloader SaaS

**Input**: Design documents from `/specs/001-media-downloader/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 16.1.6 App Router project in `frontend/` with TypeScript and Tailwind CSS
- [x] T002 Initialize Python 3.11+ FastAPI project in `worker/` with `requirements.txt`
- [x] T003 [P] Configure Vitest and React Testing Library in `frontend/`
- [x] T004 [P] Configure Pytest and pytest-asyncio in `worker/`
- [x] T005 [P] Setup Supabase local testing environment with defined schema

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T006 Setup Supabase SQL schema for `users`, `user_subscriptions`, and `download_jobs`
- [x] T007 [P] Implement Supabase Auth UI (Login/Signup) in `frontend/src/app/(auth)/`
- [x] T008 [P] Configure Celery worker and Redis broker connection in `worker/src/tasks/`
- [x] T009 [P] Setup Socket.io server within FastAPI in `worker/src/api/main.py`
- [x] T010 [P] Setup Socket.io client provider in Next.js `frontend/src/lib/socket.ts`
- [x] T011 Configure base `next-intl` setup for explicit LTR/RTL support in `frontend/`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Download Public Media (Priority: P1) 🎯 MVP

**Goal**: Users can paste a public video link from supported platforms (like YouTube) and download the file.

**Independent Test**: Can be fully tested by pasting a public video URL, waiting for the extraction process, and verifying the download button yields the correct media file.

### Tests for User Story 1 ⚠️

- [ ] T012 [P] [US1] Unit test `extractor_ytdlp.py` with mock YouTube URL
- [ ] T013 [P] [US1] Integration test the `request_download` socket event

### Implementation for User Story 1

- [x] T014 [US1] Implement URL input component with GSAP in `frontend/src/components/DownloadInput.tsx`
- [x] T015 [US1] Implement primary extraction logic using `yt-dlp` in `worker/src/services/extractor_ytdlp.py`
- [x] T016 [US1] Create the base Celery task `process_download` in `worker/src/tasks/download_tasks.py`
- [x] T017 [US1] Connect frontend form submission to the Socket.io `request_download` event
- [x] T018 [US1] Connect frontend state to listen to `download_progress` and `download_complete`
- [x] T019 [US1] Implement dynamic progress bar UI in `frontend/src/components/Progress.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Fallback Extraction for Restricted Media (Priority: P2)

**Goal**: Users pasting links from stricter platforms rely on an alternative extraction fallback when the primary engine is blocked.

**Independent Test**: Can be tested by simulating a block from the primary extraction engine and verifying the system successfully routes the request to the alternative fallback service.

### Tests for User Story 2 ⚠️

- [ ] T020 [P] [US2] Mock a 403 error from `yt-dlp` and test the fallback routing logic

### Implementation for User Story 2

- [x] T021 [US2] Implement fallback stealth extraction using `Scrapling` in `worker/src/services/extractor_scrapling.py`
- [x] T022 [US2] Update `process_download` in `worker/src/tasks/download_tasks.py` to route to T021 upon a 403/429 error
- [x] T023 [US2] Map TikTok and Instagram specific logic within the new Scrapling service

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Pro Tier Playlist Downloading (Priority: P3)

**Goal**: Subscribed users (Pro Tier) can input playlist URLs and select multiple media items for bulk downloading.

**Independent Test**: Can be tested by authenticating as a Pro user, pasting a playlist URL, and verifying the playlist selection UI renders correctly.

### Tests for User Story 3 ⚠️

- [ ] T024 [P] [US3] Unit test the Stripe webhook signature verification

### Implementation for User Story 3

- [ ] T025 [US3] Implement Stripe webhook handler in `worker/src/api/main.py`
- [ ] T026 [US3] Update Next.js API routes or Supabase triggers to sync Subscription tier to database
- [ ] T027 [US3] Implement Playlist UI selection table in `frontend/src/components/PlaylistTable.tsx`
- [ ] T028 [US3] Build the conditional AdSense placeholder component for Free Tier users
- [ ] T029 [US3] Add validation in `worker/src/tasks/download_tasks.py` to reject playlist requests from Free users

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T030 Add structured JSON-LD data to Next.js layouts for GEO optimization
- [ ] T031 Test and refine RTL/Arabic layout styles across all components using Tailwind block logic
- [ ] T032 Write Playwright E2E tests for the "happy path" download flow in `frontend/tests/e2e/`
- [ ] T033 Set up a GitHub Actions workflow to run the Playwright E2E tests in the cloud
- [ ] T034 Verify Next.js JS payload stays under 100kb with dynamic imports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all user stories being complete
