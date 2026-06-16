# SubTracker

A clean, simple, self-hosted subscription tracker. Track recurring subscriptions, see monthly/yearly spending, and toggle summaries between EGP and USD. Built as a single Docker container with a dark, mobile-first UI and PWA support.

## Features

- **Subscription tracking**: name, cost, currency (EGP/USD), billing cycle, renewal date, category, notes, active/paused state
- **Dashboard**: monthly and yearly totals, active subscription count, upcoming renewal
- **Currency toggle**: view summaries in EGP or USD with live exchange rates from ExchangeRate-API
- **Manual exchange rate override**: set your own USD→EGP rate in Settings
- **Simple multi-user support**: each user sees only their own subscriptions
- **PWA**: installable on mobile/desktop with offline caching of the app shell
- **Dark refined UI**: mobile-first responsive design
- **Single Docker container**: one command to self-host

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22 |
| Backend | Express 5 |
| Database | SQLite via `better-sqlite3` |
| Auth | `express-session` with SQLite session store, `bcryptjs` |
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Container | Multi-stage Dockerfile |

## Quick Start

```bash
docker compose up -d
```

Then open http://localhost:8000 and register an account.

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `8000` | HTTP port |
| `DATA_DIR` | `./backend/data` | SQLite directory |
| `DATABASE_PATH` | `${DATA_DIR}/subtracker.db` | Full DB file path |
| `SECRET_KEY` | `dev-secret-change-in-production` | Session cookie secret |

Set `SECRET_KEY` in production via `docker-compose.yml` or an `.env` file.

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `localhost:8000`.

### Tests

```bash
cd backend
npm test
```

## Project Structure

```
subtracker/
├── backend/              # Express API
│   ├── server.js         # App bootstrap and static SPA fallback
│   ├── db.js             # SQLite schema
│   ├── session-store.js  # SQLite-backed session store
│   ├── routes/           # API routes
│   ├── services/         # Exchange rate service
│   └── tests/            # Backend tests
├── frontend/             # React SPA
│   ├── public/           # PWA icons, manifest, service worker
│   └── src/              # Components and app logic
├── data/                 # Docker Compose bind mount for SQLite
├── Dockerfile
├── docker-compose.yml
├── README.md
└── DEPLOYMENT.md         # Detailed deployment guide
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions, including VPS setup with Docker and Cloudflare Tunnel.

## License

MIT
