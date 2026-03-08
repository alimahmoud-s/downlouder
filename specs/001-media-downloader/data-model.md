# Data Model: Media Downloader SaaS

## Entities

### `users`

Represents the authenticated end-user of the system.

- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `user_subscriptions`

Tracks the monetization tier of the user (Free vs. Pro).

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `users`)
- `status`: String/Enum (e.g., `active`, `canceled`, `past_due`)
- `tier`: String/Enum (`free`, `pro`)
- `stripe_customer_id`: String (Nullable)
- `stripe_subscription_id`: String (Nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `download_jobs` (Redis/BullMQ & Supabase for persistence)

Represents a queued download task.

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `users`, Nullable for anonymous/free uses)
- `url`: String (The source URL)
- `status`: String/Enum (`pending`, `processing`, `completed`, `failed`)
- `progress`: Integer (0-100)
- `download_url`: String (The extracted direct URL to the media)
- `file_type`: String (e.g., `video/mp4`, `audio/mp3`)
- `error_message`: String (Nullable)
- `created_at`: Timestamp
- `expires_at`: Timestamp (When the extracted direct URL expires from the source platform)

## Validation Rules

- `download_jobs.url` must be a valid URI string matching supported platform domains (youtube.com, facebook.com, instagram.com, twitter.com/x.com, tiktok.com).
- Anonymous users (no `user_id` on `download_jobs`) are restricted from processing playlist URLs.

## State Transitions (Download Jobs)

- `pending` -> `processing`: When the BullMQ worker picks up the job.
- `processing` -> `completed`: When extraction finishes and the file is ready.
- `processing` -> `failed`: If extraction throws an unrecoverable error (after Playwright fallback attempts).
