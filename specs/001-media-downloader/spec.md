# Feature Specification: Media Downloader SaaS

**Feature Branch**: `001-media-downloader`
**Created**: 2026-02-27
**Status**: Draft

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Download Public Media (Priority: P1)

Users can paste a public video link from supported platforms (like YouTube) and download the file.

**Why this priority**: Core value proposition. Without this, the application has no basic utility.

**Independent Test**: Can be fully tested by pasting a public video URL, waiting for the extraction process, and verifying the download button yields the correct media file.

**Acceptance Scenarios**:

1. **Given** a user on the main input UI, **When** they paste a valid public URL and submit, **Then** the backend processes the download and the UI displays real-time progress.
2. **Given** the extraction is complete, **When** the real-time progress reaches 100%, **Then** a functional download button appears.

---

### User Story 2 - Fallback Extraction for Restricted Media (Priority: P2)

Users pasting links from stricter platforms (Instagram Stories, TikTok) rely on an alternative browser-based extraction fallback when the primary engine is blocked.

**Why this priority**: Ensures broad platform compatibility which is a primary differentiator.

**Independent Test**: Can be tested by simulating a block from the primary extraction engine and verifying the system successfully routes the request to the alternative fallback service.

**Acceptance Scenarios**:

1. **Given** a strict platform link is submitted, **When** the primary extraction engine is blocked or throws an error, **Then** the fallback service is initiated automatically to fetch the media.

---

### User Story 3 - Pro Tier Playlist Downloading (Priority: P3)

Subscribed users (Pro Tier) can input playlist URLs and select multiple media items for bulk downloading.

**Why this priority**: Drives the primary monetization strategy for the business.

**Independent Test**: Can be tested by authenticating as a Pro user, pasting a playlist URL, and verifying the playlist selection UI renders correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated Pro Tier user, **When** they paste a playlist URL, **Then** the interface renders a selection table for all playlist items.
2. **Given** a Free Tier user, **When** they paste a playlist URL, **Then** they are prompted to upgrade and are shown external ad placements.

### Edge Cases

- What happens when a user submits an unsupported URL format?
- How does the system handle concurrent downloads that exceed queue limits?
- What happens if a Free user tries to bypass the playlist restriction?
- How are unexpected network timeouts from the target media platforms handled?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST accept URLs from YouTube, Facebook, Instagram, X (Twitter), and TikTok.
- **FR-002**: System MUST render different UI states based on user tier (Pro vs. Free).
- **FR-003**: System MUST isolate the extraction processes in a background queue and provide real-time status updates to the client.
- **FR-004**: System MUST securely authenticate users and verify Pro Tier status via the designated payment provider.
- **FR-005**: System MUST automatically purge downloaded files every 60 minutes to manage storage.
- **FR-006**: System MUST serve structured data to optimize for AI search engine parsing (GEO).
- **FR-007**: System MUST support internationalization (i18n) with UI explicitly provided in both English and Arabic.

### Key Entities

- **User**: Represents end-users, tracking basic profile data and authentication state.
- **UserSubscription**: Tracks monetization, mapping users to Free or Pro tiers.
- **DownloadJob**: Represents an asynchronous piece of work in the queue including source URL, status, and file metadata.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: System successfully extracts media from all 5 supported platforms in 95% of attempts.
- **SC-002**: Initial frontend load size remains extremely small (e.g., under 100kb) to ensure fast rendering.
- **SC-003**: System successfully routes failed extractions to the fallback service without crashing, recovering at least 90% of blocked requests.
- **SC-004**: Downloaded temporary files are confirmed deleted within the 60-minute window 100% of the time, maintaining memory safety.
- **SC-005**: All UI elements, including dynamic progress states, render correctly in both LTR (English) and RTL (Arabic) contexts.
