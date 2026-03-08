# Interface Contracts: Media Downloader SaaS

## Backend WebSocket Events (Socket.io)

### Client to Server

- `request_download`: Sent by the client to initiate a download.
  - Payload: `{ url: string, type: 'video' | 'audio', playlistItems?: string[] }`

### Server to Client

- `download_progress`: Sent by the server to update the client on extraction status.
  - Payload: `{ jobId: string, progress: number, status: 'pending' | 'processing' | 'completed' | 'failed', message?: string }`
- `download_complete`: Sent by the server when the extraction is complete.
  - Payload: `{ jobId: string, directUrl: string, fileName: string }`
- `download_error`: Sent by the server if the extraction fails.
  - Payload: `{ jobId: string, error: string }`

## Backend REST API (Worker)

### `GET /api/health`

Checks the worker status and queue length.

- Response: `200 OK` `{ status: 'ok', activeJobs: number, pendingJobs: number }`

### `POST /api/webhooks/stripe`

Handles Stripe subscription lifecycle events.

- Headers: `Stripe-Signature`
- Body: Stripe Event Object

## Frontend Next.js API Routes (Server Actions)

### `POST /api/auth/callback`

Supabase OAuth/Magic Link callback route.
