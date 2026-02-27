# Deployment Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Bare Metal Deployment](#bare-metal-deployment)
- [Docker Deployment](#docker-deployment)
- [Production Checklist](#production-checklist)
- [nginx Configuration](#nginx-configuration)
- [SSL with Let's Encrypt](#ssl-with-lets-encrypt)
- [PM2 Process Management](#pm2-process-management)
- [Updating](#updating)

## Prerequisites

| Dependency | Minimum Version | Purpose |
|-----------|----------------|---------|
| Node.js | 20+ | Runtime for API and build tools |
| PostgreSQL | 15+ | Primary database |
| Redis | 7+ | Cache, job queue, session store |
| FFmpeg | 5+ | Video transcoding |
| nginx | 1.18+ | Reverse proxy and static file serving |
| PM2 | 5+ | Process management (bare metal) |

## Bare Metal Deployment

This is the method used for the live deployment at `streamvault.thinkelution.com`.

### 1. Install System Dependencies

```bash
# Ubuntu/Debian
apt update
apt install -y postgresql redis-server ffmpeg nginx certbot python3-certbot-nginx

# Install Node.js 20+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2
```

### 2. Set Up PostgreSQL

```bash
sudo -u postgres psql -c "CREATE USER streamvault WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "CREATE DATABASE streamvault OWNER streamvault;"
```

### 3. Clone and Install

```bash
git clone git@github.com:Thinkelution/StreamVault.git
cd StreamVault
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=production
PORT=3200
DATABASE_URL=postgresql://streamvault:your_password@localhost:5432/streamvault
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate_a_random_64_char_string
BASE_URL=https://your-domain.com
MEDIA_URL=https://your-domain.com/media
```

### 5. Create Storage Directories

```bash
mkdir -p /var/www/streamvault/{uploads,transcoded,thumbnails,hls}
```

### 6. Set Up Database and Build

```bash
# Run Prisma migrations
cd apps/api
npx prisma migrate deploy

# Seed demo data
npx prisma db seed

# Build the API
npm run build

# Build the dashboard
cd ../dashboard
npm run build

# Copy dashboard to web root
mkdir -p /var/www/streamvault/dashboard
cp -r dist/* /var/www/streamvault/dashboard/
```

### 7. Start with PM2

```bash
cd /root/StreamVault/apps/api
pm2 start dist/main.js --name streamvault-api
pm2 save
pm2 startup  # generates system startup script
```

### 8. Configure nginx

See [nginx Configuration](#nginx-configuration) below.

### 9. Set Up SSL

```bash
certbot --nginx -d your-domain.com
```

## Docker Deployment

### 1. Clone the Repository

```bash
git clone git@github.com:Thinkelution/StreamVault.git
cd StreamVault/docker
```

### 2. Configure Environment

```bash
cp ../.env.example .env
# Edit .env with your settings
```

### 3. Start All Services

```bash
docker compose up -d
```

This starts:
- PostgreSQL 16 on port 5432
- Redis 7 on port 6379
- StreamVault API on port 3200
- Dashboard (nginx) on port 8080

### 4. Run Migrations and Seed

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

## Production Checklist

- [ ] Generate a strong `JWT_SECRET` (at least 64 random characters)
- [ ] Set a secure database password
- [ ] Enable SSL/TLS with a valid certificate
- [ ] Set `NODE_ENV=production`
- [ ] Configure firewall (only expose ports 80, 443, 22)
- [ ] Set up automated database backups
- [ ] Configure log rotation
- [ ] Set up monitoring (PM2 monitoring or external service)
- [ ] Test video upload and transcoding pipeline
- [ ] Verify MRSS feed output
- [ ] Restrict `/api/docs` (Swagger) in production if needed

## nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    client_max_body_size 10G;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3200/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_buffering off;
    }

    # Media files (HLS streams, thumbnails)
    location /media/ {
        alias /var/www/streamvault/;
        add_header Cache-Control "public, max-age=31536000";
        add_header Access-Control-Allow-Origin *;
    }

    # Dashboard SPA
    location / {
        root /var/www/streamvault/dashboard;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

## SSL with Let's Encrypt

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Obtain and install certificate
certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
# Verify with:
certbot renew --dry-run
```

## PM2 Process Management

```bash
# Start the API
pm2 start dist/main.js --name streamvault-api --cwd /path/to/StreamVault/apps/api

# View logs
pm2 logs streamvault-api

# Monitor resources
pm2 monit

# Restart
pm2 restart streamvault-api

# Stop
pm2 stop streamvault-api

# Set up system startup
pm2 startup
pm2 save
```

## Updating

```bash
cd /path/to/StreamVault
git pull origin main
npm install

# Rebuild API
cd apps/api
npx prisma migrate deploy
npm run build
pm2 restart streamvault-api

# Rebuild Dashboard
cd ../dashboard
npm run build
cp -r dist/* /var/www/streamvault/dashboard/
```
