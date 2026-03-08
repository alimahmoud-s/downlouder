# Research and Technical Decisions: Media Downloader SaaS

## Technical Unknowns and Clarifications

### 1. Handling 403 / 429 Errors (Instagram/TikTok)

- **Problem**: Direct API/HTML scraping on strict platforms like Instagram and TikTok often results in 403 Forbidden or 429 Too Many Requests. `yt-dlp` frequency of failure on these platforms is high.
- **Decision**: Architect a fallback service using Scrapling (a Python stealth scraping library).
- **Rationale**: Scrapling uses adaptive stealth technology to bypass advanced anti-bot systems like those on TikTok and Instagram, outperforming raw Playwright. Since we migrated the worker to Python, we can utilize `yt-dlp` and `scrapling` as native Python dependencies, drastically simplifying architecture and improving reliability.
- **Alternatives Considered**: Bare Playwright (high block rate on strict platforms); Node.js wrapper for Scrapling (unnecessary overhead, better to use a native Python worker).

### 2. File Download Strategy (Client-Side Downloading)

- **Problem**: Downloading and proxying large video files through our server incurs massive bandwidth and storage costs.
- **Decision**: The extraction worker will only extract the _direct media URLs_ from the target platforms (using `yt-dlp` or Playwright) and return these URLs to the client. The client's browser or download manager (like IDM) will perform the actual file download directly from the source server.
- **Rationale**: Offloads bandwidth and storage requirements entirely to the client and the source platform. Completely eliminates the need for temporary server disk space and periodic cleanup jobs.
- **Alternatives Considered**: Proxying downloads through the server temporarily (rejected due to high infrastructure costs and legal/TOS risks of storing copyrighted material).

### 3. GSAP Integration in Next.js App Router

- **Problem**: Next.js App router with React 18 strict mode can cause GSAP memory leaks if animations are not cleaned up properly during component unmounts.
- **Decision**: Exclusively use the `@gsap/react` `useGSAP()` hook for all animations.
- **Rationale**: This hook automatically handles cleanup and context lifecycle within the React component lifecycle, preventing stale closures and memory leaks.
- **Alternatives Considered**: Manual `gsap.context()` management (prone to developer error).

### 4. Internationalization (i18n) - English and Arabic

- **Problem**: The system needs to support both Left-to-Right (English) and Right-to-Left (Arabic) layouts comprehensively.
- **Decision**: Utilize `next-intl` combined with Tailwind CSS logical properties (e.g., `ms-` for margin-start instead of `ml-`, `ps-` instead of `pl-`).
- **Rationale**: `next-intl` integrates natively with Next.js App Router middleware, and Tailwind logical properties prevent the need to write duplicate CSS rules for RTL vs LTR layouts.
- **Alternatives Considered**: `react-i18next` (heavier bundle size, slightly more complex App router integration).
