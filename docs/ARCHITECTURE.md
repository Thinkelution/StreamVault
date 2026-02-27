# Architecture Overview

## System Design

StreamVault follows a **layered monolith** architecture that separates concerns cleanly while remaining simple to deploy. The system can be decomposed into microservices as scale requires.

```
┌─────────────────────────────────────────────────────────────┐
│                     nginx (Reverse Proxy)                     │
│              SSL termination, static file serving             │
├──────────────────────┬──────────────────────────────────────┤
│   React Dashboard    │         NestJS API Server             │
│   (Static SPA)       │         (Port 3200)                   │
│                      ├──────────────────────────────────────┤
│                      │  Auth │ Videos │ Feeds │ Transcoding  │
│                      │  Users│ Tags   │ Cats  │ Analytics    │
│                      │  Playlists │ Webhooks │ Settings      │
├──────────────────────┴──────────────────────────────────────┤
│                     Prisma ORM Layer                          │
├─────────────────────────┬───────────────────────────────────┤
│     PostgreSQL 16       │         Redis 7                    │
│  (Structured Data)      │  (Cache, Job Queue, Sessions)      │
├─────────────────────────┴───────────────────────────────────┤
│              File System / Object Storage                     │
│    uploads/ │ transcoded/ │ hls/ │ thumbnails/                │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### API Server (NestJS)

The API server is the core of the system. It handles all business logic, authentication, and data access.

| Module | Responsibility |
|--------|---------------|
| **Auth** | JWT token issuance, password verification, role-based guards |
| **Videos** | CRUD operations, file upload handling, slug generation, status management |
| **Feeds** | Feed CRUD, MRSS/JSON/Atom rendering, feed item management |
| **Transcoding** | BullMQ job queue, FFmpeg process spawning, HLS generation |
| **Categories** | Hierarchical category tree with parent-child relationships |
| **Tags** | Flat taxonomy with merge and rename support |
| **Playlists** | Manual playlists with ordered video items |
| **Analytics** | View tracking, aggregation queries, dashboard metrics |
| **Users** | User CRUD, role assignment, password management |
| **Webhooks** | Event registration, HMAC-signed HTTP dispatch |
| **Audit** | Write operation logging with user, action, resource tracking |
| **Settings** | Key-value system configuration store |
| **Health** | Database and Redis connectivity check |

### Dashboard (React)

The React dashboard is a single-page application served as static files. It communicates exclusively with the API via REST endpoints.

**State Management:**
- **Zustand** — Client state (auth, UI preferences)
- **TanStack Query** — Server state (videos, feeds, users, etc.) with automatic caching, refetching, and optimistic updates

**Key Pages:**
- Dashboard home with metric cards and charts
- Video library with search, filters, and bulk actions
- Video detail editor with tabbed interface
- Drag-and-drop video upload with progress tracking
- Visual feed builder with live MRSS preview
- Analytics dashboard with charts
- User management (admin only)

### Transcoding Pipeline

```
Upload → Redis Queue (BullMQ) → FFmpeg Worker → HLS Output
                                     │
                                     ├── 360p  (640×360,  800kbps)
                                     ├── 480p  (854×480,  1.5Mbps)
                                     ├── 720p  (1280×720, 3Mbps)
                                     └── 1080p (1920×1080, 6Mbps)
                                     │
                                     └── Thumbnail (JPEG at 10s mark)
```

1. User uploads a video file via the dashboard or API
2. The API saves the source file and creates a `TranscodingJob` record per profile
3. Jobs are added to the BullMQ `transcoding` queue backed by Redis
4. The transcoding processor picks up jobs and spawns FFmpeg processes
5. FFmpeg generates HLS segments (m3u8 + ts files) for each quality level
6. A master m3u8 playlist is created referencing all quality variants
7. Thumbnail is extracted at the 10-second mark
8. Video record is updated with HLS URL and thumbnail URL
9. Video status transitions from `processing` to `published` (or `failed`)

### Feed Engine

The MRSS feed engine generates compliant XML feeds for downstream consumption.

**Feed Types:**
- **MRSS** — Media RSS 1.5.1 with `media:content`, `media:thumbnail`, `media:category`
- **JSON Feed** — jsonfeed.org v1.1 specification
- **Atom** — RFC 4287 Atom Syndication Format

**Feed Population:**
- **Manual** — Admin picks specific videos and orders them
- **Smart Rules** — Auto-populate based on filters (category, tag, status, date range)
- **Hybrid** — Combine manual picks with smart rules

## Data Flow

### Video Upload Flow
```
Client → nginx → API (multer) → Save to disk → Create DB record
                                      │
                                      └→ Queue transcoding jobs
                                              │
                                              └→ BullMQ → FFmpeg → HLS files
                                                               │
                                                               └→ Update DB with URLs
```

### Feed Render Flow
```
Consumer → nginx → API → Check Redis cache
                              │
                         Cache hit → Return cached XML/JSON
                              │
                         Cache miss → Query DB for feed rules
                                          │
                                          └→ Fetch matching videos
                                               │
                                               └→ Render MRSS/JSON/Atom
                                                    │
                                                    └→ Store in Redis cache
                                                         │
                                                         └→ Return to consumer
```

## Database Schema

The database uses PostgreSQL with Prisma ORM. Key entities:

- **users** — Authentication and role management
- **videos** — Core content with rich metadata
- **renditions** — Transcoded output files per video
- **captions** — Subtitle/caption tracks per video
- **feeds** — Feed definitions with filter rules
- **feed_items** — Many-to-many link between feeds and videos
- **categories** — Self-referencing hierarchical tree
- **tags** — Flat taxonomy with many-to-many video links
- **playlists** — Manual/smart playlists with ordered items
- **transcoding_jobs** — Job status tracking per video per profile
- **webhooks** — Subscriber endpoint registrations
- **audit_logs** — Immutable write operation log
- **settings** — Key-value system configuration
- **video_analytics** — Aggregated view statistics

## Security

- JWT-based authentication with refresh token rotation
- bcrypt password hashing (12 rounds)
- Role-based access control at the route level
- Input validation on all endpoints via class-validator
- CORS allowlisting
- SQL injection prevention via Prisma parameterized queries
- Audit trail for all write operations
