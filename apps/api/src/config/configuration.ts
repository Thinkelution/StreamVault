export default () => ({
  port: parseInt(process.env.PORT || '3200', 10),
  baseUrl: process.env.BASE_URL || 'https://streamvault.thinkelution.com',
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  storage: {
    uploads: process.env.UPLOAD_DIR || '/var/www/streamvault/uploads',
    transcoded: process.env.TRANSCODED_DIR || '/var/www/streamvault/transcoded',
    thumbnails: process.env.THUMBNAIL_DIR || '/var/www/streamvault/thumbnails',
    hls: process.env.HLS_DIR || '/var/www/streamvault/hls',
  },
  ffmpeg: {
    path: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://streamvault.thinkelution.com',
  },
});
