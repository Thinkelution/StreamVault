# Feed Specification

StreamVault generates industry-standard syndication feeds for multi-platform video distribution. Feeds are designed to power OTT app backends, smart TV catalogue ingestion (Roku, Fire TV, Apple TV), podcast video feeds, and third-party syndication partnerships.

## Supported Feed Formats

| Format | Content-Type | Specification |
|--------|-------------|--------------|
| MRSS | `application/rss+xml` | [Media RSS 1.5.1](http://www.rssboard.org/media-rss) |
| JSON Feed | `application/feed+json` | [JSON Feed v1.1](https://jsonfeed.org/version/1.1) |
| Atom | `application/atom+xml` | [RFC 4287](https://tools.ietf.org/html/rfc4287) |

## Feed Access

Each feed has a unique URL for consumption:

```
GET /api/v1/feeds/:feedId/render
```

This endpoint is **public** — no authentication required for feed consumers. Optionally, feeds can be protected with an API key query parameter.

## MRSS Feed Structure

StreamVault generates MRSS feeds compliant with the Media RSS specification, including the following XML namespaces:

- `media` — `http://search.yahoo.com/mrss/`
- `dcterms` — `http://purl.org/dc/terms/`

### Feed-Level Elements

| Element | Description |
|---------|-------------|
| `<title>` | Feed name |
| `<link>` | Base URL of the StreamVault instance |
| `<description>` | Feed description |
| `<language>` | ISO 639-1 language code |
| `<lastBuildDate>` | RFC 2822 timestamp of last feed update |
| `<copyright>` | Copyright notice (if configured) |
| `<image>` | Feed cover image (if configured) |

### Item-Level Elements

| Element | Description |
|---------|-------------|
| `<title>` | Video title |
| `<guid>` | Unique video identifier (UUID, non-permalink) |
| `<pubDate>` | Video publish date (RFC 2822) |
| `<description>` | Video description |
| `<link>` | Video page URL |
| `<media:content>` | HLS stream URL with type, duration, bitrate, dimensions |
| `<media:thumbnail>` | Thumbnail image URL with dimensions |
| `<media:category>` | Video categories |
| `<media:description>` | Video description (media namespace) |
| `<dcterms:valid>` | Content validity period |

### Example MRSS Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dcterms="http://purl.org/dc/terms/">
  <channel>
    <title>StreamVault Main Feed</title>
    <link>https://streamvault.thinkelution.com</link>
    <description>Primary content feed</description>
    <language>en</language>
    <lastBuildDate>Thu, 27 Feb 2026 12:00:00 GMT</lastBuildDate>

    <item>
      <title>Introduction to Video Streaming</title>
      <guid isPermaLink="false">a1b2c3d4-e5f6-7890-abcd-ef1234567890</guid>
      <pubDate>Wed, 26 Feb 2026 15:30:00 GMT</pubDate>
      <description>Learn the fundamentals of adaptive bitrate streaming...</description>
      <link>https://streamvault.thinkelution.com/videos/a1b2c3d4</link>
      <media:content
        url="https://streamvault.thinkelution.com/media/hls/a1b2c3d4/master.m3u8"
        type="application/x-mpegURL"
        duration="425"
        width="1920"
        height="1080" />
      <media:thumbnail
        url="https://streamvault.thinkelution.com/media/thumbnails/a1b2c3d4.jpg"
        width="1920"
        height="1080" />
      <media:category>Technology</media:category>
      <media:category>Education</media:category>
    </item>

  </channel>
</rss>
```

## JSON Feed Structure

JSON Feed output follows the [JSON Feed v1.1](https://jsonfeed.org/version/1.1) specification.

### Example JSON Feed Output

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "StreamVault Main Feed",
  "home_page_url": "https://streamvault.thinkelution.com",
  "description": "Primary content feed",
  "language": "en",
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Introduction to Video Streaming",
      "url": "https://streamvault.thinkelution.com/videos/a1b2c3d4",
      "content_text": "Learn the fundamentals of adaptive bitrate streaming...",
      "date_published": "2026-02-26T15:30:00Z",
      "image": "https://streamvault.thinkelution.com/media/thumbnails/a1b2c3d4.jpg",
      "attachments": [
        {
          "url": "https://streamvault.thinkelution.com/media/hls/a1b2c3d4/master.m3u8",
          "mime_type": "application/x-mpegURL",
          "duration_in_seconds": 425
        }
      ],
      "tags": ["Technology", "Education"]
    }
  ]
}
```

## Atom Feed Structure

Atom output follows [RFC 4287](https://tools.ietf.org/html/rfc4287).

### Example Atom Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>StreamVault Main Feed</title>
  <link href="https://streamvault.thinkelution.com" rel="alternate" />
  <link href="https://streamvault.thinkelution.com/api/v1/feeds/uuid/render" rel="self" />
  <id>urn:uuid:feed-uuid</id>
  <updated>2026-02-27T12:00:00Z</updated>

  <entry>
    <title>Introduction to Video Streaming</title>
    <id>urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890</id>
    <published>2026-02-26T15:30:00Z</published>
    <updated>2026-02-26T15:30:00Z</updated>
    <summary>Learn the fundamentals of adaptive bitrate streaming...</summary>
    <link href="https://streamvault.thinkelution.com/media/hls/a1b2c3d4/master.m3u8"
          rel="enclosure" type="application/x-mpegURL" />
    <category term="Technology" />
    <category term="Education" />
  </entry>
</feed>
```

## Feed Configuration

### Filter Rules

Feeds can be configured with filter rules to automatically include matching videos:

```json
{
  "categories": ["category-uuid-1", "category-uuid-2"],
  "tags": ["tag-uuid-1"],
  "status": "published",
  "maxAge": 30,
  "minDuration": 60,
  "maxDuration": 3600
}
```

| Rule | Type | Description |
|------|------|-------------|
| `categories` | string[] | Include videos in these categories |
| `tags` | string[] | Include videos with these tags |
| `status` | string | Only include videos with this status |
| `maxAge` | number | Maximum age in days |
| `minDuration` | number | Minimum duration in seconds |
| `maxDuration` | number | Maximum duration in seconds |

### Sort Orders

| Value | Description |
|-------|-------------|
| `newest` | Most recently published first |
| `oldest` | Oldest published first |
| `manual` | Manual ordering via feed_items.position |
| `most_viewed` | Highest view count first |

### Caching

Feed output is cached in Redis with a configurable TTL (default: 300 seconds / 5 minutes). The cache is automatically invalidated when feed configuration changes or when videos matching the feed rules are updated.

## Platform Integration

### Roku

Roku Direct Publisher and Roku Channels consume MRSS feeds. StreamVault's MRSS output is compatible with Roku's feed specification.

### Apple Podcasts (Video)

Use the Atom feed format with video enclosures for Apple Podcast directory submission.

### Google Video Sitemap

Feeds can be adapted for Google Video Sitemap format to improve SEO discoverability.

### General OTT / Smart TV

MRSS feeds work with most OTT middleware platforms (Samsung TV Plus, Pluto TV, Xumo, etc.) that accept standard Media RSS input.
