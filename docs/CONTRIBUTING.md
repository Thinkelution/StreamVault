# Contributing to StreamVault

Thank you for your interest in contributing to StreamVault! This guide covers the development setup, code style, and pull request process.

## Development Setup

### 1. Fork and Clone

```bash
git clone git@github.com:YOUR_USERNAME/StreamVault.git
cd StreamVault
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Local Services

You need PostgreSQL and Redis running locally:

```bash
# macOS (Homebrew)
brew install postgresql@16 redis ffmpeg
brew services start postgresql@16
brew services start redis

# Ubuntu/Debian
apt install postgresql redis-server ffmpeg
systemctl start postgresql redis-server
```

### 4. Create Database

```bash
sudo -u postgres psql -c "CREATE USER streamvault WITH PASSWORD 'dev_password';"
sudo -u postgres psql -c "CREATE DATABASE streamvault OWNER streamvault;"
```

### 5. Configure Environment

```bash
cp .env.example .env
# Edit .env with your local database credentials
```

### 6. Run Migrations and Seed

```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

### 7. Start Development

```bash
# From the repo root — starts API and dashboard in watch mode
npm run dev
```

The API runs at `http://localhost:3200` and the dashboard at `http://localhost:5173`.

## Project Structure

| Directory | Description |
|-----------|-------------|
| `apps/api/` | NestJS API server |
| `apps/dashboard/` | React dashboard |
| `packages/shared/` | Shared TypeScript types and utilities |
| `docker/` | Docker Compose and Dockerfiles |
| `docs/` | Documentation |

## Code Style

- **TypeScript** — Strict mode enabled in all packages
- **Formatting** — Use your editor's default formatter (Prettier recommended)
- **Naming** — camelCase for variables/functions, PascalCase for classes/components, SCREAMING_SNAKE for constants
- **Imports** — Group by: external packages, internal modules, relative imports
- **Comments** — Only for non-obvious logic; code should be self-documenting

### API Conventions

- All routes prefixed with `/api/v1/`
- Consistent response format: `{ success: boolean, data?: T, error?: string }`
- Use DTOs with class-validator for input validation
- Use Prisma for all database access
- Log audit events for all write operations

### Dashboard Conventions

- Functional components only
- TanStack Query for all server state
- Zustand for client-only state
- TailwindCSS utility classes for styling
- Lucide React for icons

## Pull Request Process

1. Create a feature branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes with clear, focused commits
3. Ensure the build succeeds: `npm run build`
4. Push your branch and open a PR against `main`
5. Fill in the PR template with a description of changes and testing done
6. Wait for review — maintainers aim to review within 48 hours

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add video thumbnail generation
fix: correct feed pagination offset
docs: update API reference for feeds
refactor: extract transcoding profiles to config
```

## Reporting Issues

Open an issue on GitHub with:
- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, browser)
- Logs or screenshots if applicable

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
