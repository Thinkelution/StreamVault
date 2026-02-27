interface MrssVideo {
  title: string;
  slug: string;
  description?: string | null;
  duration?: number | null;
  hlsUrl?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
  renditions?: Array<{
    url: string;
    codec: string;
    bitrate: number;
    width: number;
    height: number;
    fileSize?: bigint | null;
  }>;
  captions?: Array<{
    language: string;
    url: string;
    format: string;
  }>;
}

interface MrssFeed {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  copyright?: string | null;
  language: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderMrss(feed: MrssFeed, videos: MrssVideo[], baseUrl: string): string {
  const items = videos
    .map((v) => {
      const pubDate = (v.publishedAt || v.createdAt).toUTCString();
      const link = `${baseUrl}/videos/${v.slug}`;

      let mediaContent = '';
      if (v.hlsUrl) {
        mediaContent += `      <media:content url="${escapeXml(v.hlsUrl)}" type="application/x-mpegURL"`;
        if (v.duration) mediaContent += ` duration="${Math.round(v.duration)}"`;
        mediaContent += ` isDefault="true" />\n`;
      }

      if (v.renditions) {
        for (const r of v.renditions) {
          mediaContent += `      <media:content url="${escapeXml(r.url)}" type="video/mp4"`;
          mediaContent += ` bitrate="${r.bitrate}" width="${r.width}" height="${r.height}"`;
          if (v.duration) mediaContent += ` duration="${Math.round(v.duration)}"`;
          if (r.fileSize) mediaContent += ` fileSize="${r.fileSize}"`;
          mediaContent += ` />\n`;
        }
      }

      let thumbnail = '';
      if (v.thumbnailUrl) {
        thumbnail = `      <media:thumbnail url="${escapeXml(v.thumbnailUrl)}" />\n`;
      }

      let subtitles = '';
      if (v.captions) {
        for (const c of v.captions) {
          subtitles += `      <media:subTitle type="${c.format === 'vtt' ? 'text/vtt' : 'application/x-subrip'}" lang="${escapeXml(c.language)}" href="${escapeXml(c.url)}" />\n`;
        }
      }

      return `    <item>
      <title>${escapeXml(v.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(v.description || '')}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${v.slug}</guid>
${mediaContent}${thumbnail}${subtitles}    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feed.name)}</title>
    <description>${escapeXml(feed.description || '')}</description>
    <language>${escapeXml(feed.language)}</language>
${feed.copyright ? `    <copyright>${escapeXml(feed.copyright)}</copyright>\n` : ''}${feed.imageUrl ? `    <image>\n      <url>${escapeXml(feed.imageUrl)}</url>\n      <title>${escapeXml(feed.name)}</title>\n    </image>\n` : ''}${items}
  </channel>
</rss>`;
}

export function renderJsonFeed(feed: MrssFeed, videos: MrssVideo[], baseUrl: string) {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: feed.name,
    description: feed.description || '',
    language: feed.language,
    items: videos.map((v) => ({
      id: v.slug,
      title: v.title,
      url: `${baseUrl}/videos/${v.slug}`,
      summary: v.description || '',
      date_published: (v.publishedAt || v.createdAt).toISOString(),
      attachments: [
        ...(v.hlsUrl
          ? [{ url: v.hlsUrl, mime_type: 'application/x-mpegURL', duration_in_seconds: v.duration }]
          : []),
        ...(v.renditions || []).map((r) => ({
          url: r.url,
          mime_type: 'video/mp4',
          size_in_bytes: r.fileSize ? Number(r.fileSize) : undefined,
        })),
      ],
      _thumbnail: v.thumbnailUrl || undefined,
    })),
  };
}

export function renderAtom(feed: MrssFeed, videos: MrssVideo[], baseUrl: string): string {
  const updated = videos.length > 0
    ? (videos[0].publishedAt || videos[0].createdAt).toISOString()
    : new Date().toISOString();

  const entries = videos
    .map((v) => {
      const pub = (v.publishedAt || v.createdAt).toISOString();
      return `  <entry>
    <title>${escapeXml(v.title)}</title>
    <id>${baseUrl}/videos/${v.slug}</id>
    <link href="${baseUrl}/videos/${v.slug}" />
    <updated>${pub}</updated>
    <summary>${escapeXml(v.description || '')}</summary>
${v.hlsUrl ? `    <link rel="enclosure" href="${escapeXml(v.hlsUrl)}" type="application/x-mpegURL" />\n` : ''}  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(feed.name)}</title>
  <subtitle>${escapeXml(feed.description || '')}</subtitle>
  <id>${baseUrl}/feeds</id>
  <updated>${updated}</updated>
${entries}
</feed>`;
}
