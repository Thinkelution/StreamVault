# StreamVault

**Open-source Video Content Management System with MRSS Feed Support**

StreamVault is a self-hosted, production-grade Video CMS built with NestJS and React. It handles video ingestion, adaptive bitrate transcoding, metadata management, and generates industry-standard MRSS feeds for multi-platform video distribution.

## Live Demo

| | URL |
|---|---|
| **Dashboard** | [https://streamvault.thinkelution.com](https://streamvault.thinkelution.com) |
| **API Health** | [https://streamvault.thinkelution.com/api/v1/health](https://streamvault.thinkelution.com/api/v1/health) |
| **API Docs (Swagger)** | [https://streamvault.thinkelution.com/api/docs](https://streamvault.thinkelution.com/api/docs) |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `demo@streamvault.io` | `StreamVault2026!` |
| **Editor** | `editor@streamvault.io` | `Editor2026!` |

## Features

- **Video Management** — Upload, transcode, and manage video content with rich metadata
- **Adaptive Bitrate Transcoding** — Automatic HLS output at 360p, 480p, 720p, and 1080p via FFmpeg
- **MRSS Feed Engine** — Generate compliant Media RSS feeds for OTT apps, smart TVs, and syndication partners
- **Multiple Feed Formats** — MRSS, JSON Feed, and Atom output with live preview and validation
- **Role-Based Access Control** — Super Admin, Admin, Editor, Reviewer, and Viewer roles with granular permissions
- **Content Workflow** — Draft → Processing → In Review → Published → Archived lifecycle management
- **Playlists & Collections** — Manual and smart playlists with drag-and-drop ordering
- **Categories & Tags** — Hierarchical categories with unlimited depth and flat tag taxonomy
- **Analytics Dashboard** — Views, watch time, device breakdown, and geographic data
- **Audit Logging** — Full trail of all user actions for compliance and debugging
- **Webhook System** — Event-driven notifications for video and feed changes
- **REST API** — Comprehensive API with Swagger documentation
- **Dark Mode UI** — Modern, responsive admin dashboard built with React and TailwindCSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Back-End | NestJS, TypeScript, Prisma ORM |
| Front-End | React 19, Vite, TailwindCSS v4, TanStack Query, Zustand |
| Database | PostgreSQL 16 |
| Cache & Queue | Redis 7, BullMQ |
| Transcoding | FFmpeg (H.264 adaptive bitrate HLS) |
| Search | Built-in PostgreSQL full-text search |
| Auth | JWT with bcrypt password hashing |
| Monorepo | Turborepo with npm workspaces |
| Process Manager | PM2 |
| Reverse Proxy | nginx with Let's Encrypt SSL |

## Project Structure

```
StreamVault/
├── apps/
│   ├── api/                  # NestJS API server (port 3200)
│   │   ├── prisma/           # Database schema and migrations
│   │   └── src/
│   │       ├── auth/         # JWT authentication and RBAC
│   │       ├── videos/       # Video CRUD and upload
│   │       ├── feeds/        # MRSS/JSON/Atom feed engine
│   │       ├── transcoding/  # FFmpeg pipeline (BullMQ workers)
│   │       ├── categories/   # Hierarchical categories
│   │       ├── tags/         # Tag management
│   │       ├── playlists/    # Playlist management
│   │       ├── analytics/    # View tracking and reporting
│   │       ├── users/        # User management
│   │       ├── webhooks/     # Event notifications
│   │       ├── audit/        # Audit logging
│   │       ├── settings/     # System configuration
│   │       └── health/       # Health check endpoint
│   └── dashboard/            # React admin dashboard
│       └── src/
│           ├── pages/        # 14 dashboard pages
│           ├── components/   # Reusable UI components
│           ├── hooks/        # TanStack Query hooks
│           ├── stores/       # Zustand state management
│           └── api/          # API client with auth interceptors
├── packages/
│   └── shared/               # Shared TypeScript types and enums
├── docker/                   # Docker Compose and Dockerfiles
├── docs/                     # Architecture and deployment docs
├── turbo.json                # Turborepo configuration
└── .env.example              # Environment variable template
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- FFmpeg

### 1. Clone and Install

```bash
git clone git@github.com:Thinkelution/StreamVault.git
cd StreamVault
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials, JWT secret, etc.
```

### 3. Set Up Database

```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

### 4. Build and Run

```bash
# Build all packages
npm run build

# Start the API server
cd apps/api && node dist/main.js

# Or use PM2 for production
pm2 start dist/main.js --name streamvault-api --cwd apps/api
```

### 5. Build Dashboard

```bash
cd apps/dashboard
npm run build
# Serve dist/ with nginx or any static file server
```

### Docker Deployment

```bash
cd docker
cp ../.env.example .env
# Edit .env with your settings
docker compose up -d
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## API Endpoints

All endpoints are prefixed with `/api/v1/`.

| Resource | Endpoints | Auth |
|----------|-----------|------|
| Auth | `POST /auth/login`, `/auth/register`, `/auth/refresh`, `GET /auth/me` | Public / Protected |
| Videos | `GET/POST /videos`, `GET/PUT/DELETE /videos/:id`, `POST /videos/upload` | Editor+ |
| Feeds | `GET/POST /feeds`, `GET/PUT/DELETE /feeds/:id`, `GET /feeds/:id/render` | Editor+ |
| Categories | Full CRUD `/categories` | Editor+ |
| Tags | Full CRUD `/tags` | Editor+ |
| Playlists | Full CRUD `/playlists` | Editor+ |
| Users | Full CRUD `/users` | Admin only |
| Analytics | `GET /analytics/overview`, `/analytics/videos/:id` | Viewer+ |
| Settings | `GET/PUT /settings` | Admin only |
| Webhooks | Full CRUD `/webhooks` | Admin only |
| Health | `GET /health` | Public |

Full interactive API documentation is available at `/api/docs` (Swagger UI).

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) — System design, data flow, and component responsibilities
- [Deployment Guide](docs/DEPLOYMENT.md) — Step-by-step deployment for bare metal, Docker, and production
- [API Reference](docs/API.md) — Detailed endpoint documentation and examples
- [Feed Specification](docs/FEEDS.md) — MRSS, JSON Feed, and Atom format details
- [Contributing](docs/CONTRIBUTING.md) — Development setup, code style, and PR process

## License

[MIT](LICENSE)
