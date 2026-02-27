# API Reference

Base URL: `https://streamvault.thinkelution.com/api/v1`

Interactive Swagger documentation: [https://streamvault.thinkelution.com/api/docs](https://streamvault.thinkelution.com/api/docs)

## Authentication

StreamVault uses JWT (JSON Web Token) authentication. Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "demo@streamvault.io",
  "password": "StreamVault2026!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

The access token expires after 24 hours. Use the refresh token to obtain a new access token.

### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbG..."
}
```

### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

## Videos

### List Videos

```http
GET /api/v1/videos?page=1&limit=20&status=published&search=tutorial
Authorization: Bearer <token>
```

Query parameters:
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20, max: 100)
- `status` — Filter by status (draft, processing, published, archived)
- `search` — Search by title
- `categoryId` — Filter by category ID
- `tagId` — Filter by tag ID
- `sortBy` — Sort field (createdAt, title, publishedAt, duration)
- `sortOrder` — Sort direction (asc, desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Getting Started with StreamVault",
        "slug": "getting-started-with-streamvault",
        "description": "A comprehensive guide...",
        "status": "published",
        "duration": 325.5,
        "resolution": "1920x1080",
        "thumbnailUrl": "https://streamvault.thinkelution.com/media/thumbnails/uuid.jpg",
        "hlsUrl": "https://streamvault.thinkelution.com/media/hls/uuid/master.m3u8",
        "publishedAt": "2026-02-27T12:00:00Z",
        "createdAt": "2026-02-27T10:00:00Z"
      }
    ],
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### Upload Video

```http
POST /api/v1/videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <video_file>
title: My Video Title
description: Optional description
categoryIds: ["uuid1", "uuid2"]
tagIds: ["uuid1"]
```

Supported formats: MP4, MOV, MKV, AVI, WebM, MPEG-TS, FLV, WMV.

After upload, transcoding jobs are automatically created and queued.

### Get Video

```http
GET /api/v1/videos/:id
Authorization: Bearer <token>
```

### Update Video

```http
PUT /api/v1/videos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "published",
  "categoryIds": ["uuid1"],
  "tagIds": ["uuid1", "uuid2"]
}
```

### Delete Video

```http
DELETE /api/v1/videos/:id
Authorization: Bearer <token>
```

## Feeds

### List Feeds

```http
GET /api/v1/feeds
Authorization: Bearer <token>
```

### Create Feed

```http
POST /api/v1/feeds
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sports Highlights",
  "type": "mrss",
  "description": "Latest sports highlights",
  "filterRules": {
    "categories": ["sports-uuid"],
    "tags": ["highlights-uuid"],
    "status": "published",
    "maxAge": 7
  },
  "sortOrder": "newest",
  "itemLimit": 50,
  "language": "en"
}
```

### Render Feed

Render the feed in its configured format (MRSS, JSON, or Atom):

```http
GET /api/v1/feeds/:id/render
```

This endpoint is public (no auth required for feed consumption). It returns the feed content with appropriate Content-Type header:

- MRSS: `application/rss+xml`
- JSON Feed: `application/feed+json`
- Atom: `application/atom+xml`

**Example MRSS Output:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dcterms="http://purl.org/dc/terms/">
  <channel>
    <title>Sports Highlights</title>
    <link>https://streamvault.thinkelution.com</link>
    <description>Latest sports highlights</description>
    <language>en</language>
    <lastBuildDate>Thu, 27 Feb 2026 12:00:00 GMT</lastBuildDate>
    <item>
      <title>Championship Finals Recap</title>
      <guid isPermaLink="false">video-uuid</guid>
      <pubDate>Thu, 27 Feb 2026 10:00:00 GMT</pubDate>
      <description>Full recap of the championship finals...</description>
      <media:content
        url="https://streamvault.thinkelution.com/media/hls/uuid/master.m3u8"
        type="application/x-mpegURL"
        duration="325" />
      <media:thumbnail
        url="https://streamvault.thinkelution.com/media/thumbnails/uuid.jpg"
        width="1920"
        height="1080" />
      <media:category>Sports</media:category>
    </item>
  </channel>
</rss>
```

## Categories

### List Categories

```http
GET /api/v1/categories
Authorization: Bearer <token>
```

Returns a flat list. Use `parentId` to build the tree client-side.

### Create Category

```http
POST /api/v1/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sports",
  "parentId": null
}
```

## Tags

### List Tags

```http
GET /api/v1/tags
Authorization: Bearer <token>
```

### Create Tag

```http
POST /api/v1/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "trending"
}
```

## Playlists

### List Playlists

```http
GET /api/v1/playlists
Authorization: Bearer <token>
```

### Create Playlist

```http
POST /api/v1/playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Featured Videos",
  "description": "Hand-picked featured content",
  "type": "manual",
  "isPublic": true
}
```

### Add Video to Playlist

```http
POST /api/v1/playlists/:id/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "video-uuid",
  "position": 0
}
```

## Users (Admin Only)

### List Users

```http
GET /api/v1/users
Authorization: Bearer <admin_token>
```

### Create User

```http
POST /api/v1/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "name": "New User",
  "role": "editor"
}
```

## Analytics

### Overview

```http
GET /api/v1/analytics/overview?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer <token>
```

### Video Analytics

```http
GET /api/v1/analytics/videos/:videoId
Authorization: Bearer <token>
```

## Webhooks (Admin Only)

### Register Webhook

```http
POST /api/v1/webhooks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["video.published", "feed.updated"],
  "secret": "your_webhook_secret"
}
```

**Available Events:**
- `video.created`
- `video.published`
- `video.transcoded`
- `feed.updated`
- `user.invited`

## Health Check

```http
GET /api/v1/health
```

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-02-27T12:00:00Z",
    "services": {
      "database": { "status": "up" },
      "redis": { "status": "up" }
    }
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `400` — Validation error
- `401` — Missing or invalid authentication
- `403` — Insufficient permissions
- `404` — Resource not found
- `409` — Conflict (duplicate slug, etc.)
- `500` — Internal server error
