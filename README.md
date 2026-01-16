# Inspector API

> ⚠️ **Work In Progress** - This project is currently under active development.

A REST API for inspecting and logging webhooks. This service captures incoming webhook requests and stores their details (method, headers, body, query params, etc.) for later inspection and debugging.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL 17
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Documentation**: Swagger (via @fastify/swagger) + Scalar
- **Code Quality**: Biome (linting & formatting)
- **Containerization**: Docker Compose

## Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

## Getting Started

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Start the development server (automatically starts PostgreSQL via Docker):

```bash
pnpm dev
```

4. Run database migrations:

```bash
pnpm db:migrate
```

The API will be available at `http://localhost:3333` and documentation at `http://localhost:3333/docs`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot-reload (auto-starts PostgreSQL) |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate new database migrations |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Drizzle Studio for database management |
| `pnpm lint` | Run linter |
| `pnpm lint:fix` | Run linter and fix issues |
| `pnpm format` | Check code formatting |
| `pnpm format:fix` | Fix code formatting |
| `pnpm check` | Run all Biome checks |
| `pnpm check:fix` | Run all Biome checks and fix issues |
| `pnpm check:type` | Run TypeScript type checking |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3333` |
| `CLIENT_URL` | CORS allowed origin | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `DATABASE_USERNAME` | PostgreSQL username | `postgres` |
| `DATABASE_PASSWORD` | PostgreSQL password | `postgres` |
| `DATABASE_NAME` | PostgreSQL database name | `inspector_api` |

## API Endpoints

### Webhooks

- `GET /api/webhooks` - List all captured webhooks

## Project Structure

```
src/
├── db/
│   ├── migrations/     # Database migrations
│   └── schema/         # Drizzle schema definitions
├── http/
│   ├── plugins/        # Fastify plugins (cors, swagger, zod)
│   └── routes/         # API route handlers
├── env.ts              # Environment validation
└── server.ts           # Application entry point
```