# SubTracker — Agent Guide

SubTracker is a self-hosted subscription tracker. It runs as a single Docker container and lets users record recurring subscriptions, view monthly/yearly spending totals, and toggle dashboard summaries between EGP and USD.

## Project Overview

- **Purpose:** Track personal subscriptions with cost, currency, billing cycle, renewal date, category, notes, and active state.
- **Deployment model:** Single-container, self-hosted application. Node.js serves the React frontend static build and the JSON API from one process.
- **Authentication:** Session cookies with bcryptjs password hashing. Simple multi-user support — each user only sees their own subscriptions.
- **Currency support:** Subscriptions are stored in their original currency (EGP or USD). The dashboard converts totals server-side using a configurable USD→EGP exchange rate.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22 |
| Backend framework | Express 5 |
| Database | SQLite via `better-sqlite3` |
| Auth | `express-session` with a custom SQLite session store, `bcryptjs` |
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 + PostCSS/Autoprefixer |
| Container | Multi-stage Dockerfile; Node serves static build + API |
| Backend tests | Node.js built-in test runner + `supertest` |

## Repository Layout

```
subtracker/
├── backend/                  # Express API
│   ├── server.js             # App bootstrap, middleware, static SPA fallback
│   ├── db.js                 # SQLite database setup and schema creation
│   ├── session-store.js      # Custom SQLite-backed express-session store
│   ├── middleware/auth.js    # Password hashing and requireAuth middleware
│   ├── routes/               # Express routers
│   │   ├── auth.js           # /api/auth/*
│   │   ├── subscriptions.js  # /api/subscriptions/*
│   │   ├── dashboard.js      # /api/dashboard/*
│   │   └── settings.js       # /api/settings/*
│   ├── services/
│   │   └── currency.js       # USD/EGP rate fetch and conversion helpers
│   ├── tests/                # Backend test suite
│   │   ├── setup.js          # Test env (in-memory DB, test secret)
│   │   ├── helper.js         # Shared test helpers
│   │   ├── auth.test.js
│   │   ├── subscriptions.test.js
│   │   └── dashboard.test.js
│   └── data/                 # SQLite database file (gitignored)
├── frontend/                 # React SPA
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/               # PWA icons, manifest, service worker
│   └── src/
│       ├── main.jsx          # React entry
│       ├── App.jsx           # Router and auth gate
│       ├── api.js            # Fetch wrapper for /api
│       ├── auth.jsx          # Auth context/provider
│       └── components/       # UI components
├── data/                     # Docker Compose volume mount target
├── Dockerfile
├── docker-compose.yml
├── README.md
└── docs/superpowers/         # Design spec and implementation plan
```

> **Note:** The files under `docs/superpowers/` describe an earlier Python/FastAPI design. The actual implementation is Node.js/Express + React. Treat the code in the repository as the source of truth.

## Architecture & Runtime

- **Single-process server:** `backend/server.js` starts an Express app on port `8000` (default). It mounts API routers under `/api/*` and, when the built frontend exists at `frontend/dist`, serves static files and falls back to `index.html` for all non-API routes.
- **Database:** SQLite. `backend/db.js` creates `users`, `subscriptions`, and `settings` tables on startup if they do not exist. The DB path is controlled by `DATA_DIR` and `DATABASE_PATH`.
- **Sessions:** Sessions are stored in a `sessions` table managed by `backend/session-store.js`. Cookies are `httpOnly`, `sameSite: 'lax'`, last 7 days, and are **not** marked `secure` by default.
- **Exchange rate:** `services/currency.js` caches the USD→EGP rate in `settings` for 24 hours, fetching from `https://open.er-api.com/v6/latest/USD` when stale or missing. The default fallback is `50.0`.
- **PWA:** The frontend registers a simple service worker (`public/sw.js`) that caches the app shell.

## Configuration

Configuration is environment-variable driven:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `8000` | HTTP port the Express server listens on |
| `DATA_DIR` | `./backend/data` | Directory where `subtracker.db` is stored |
| `DATABASE_PATH` | `${DATA_DIR}/subtracker.db` | Full SQLite file path |
| `SECRET_KEY` | `dev-secret-change-in-production` | Session cookie secret |
| `NODE_ENV` | — | Set to `test` by the test suite to prevent the server from binding a port |

## Build & Run Commands

### Production (Docker)

```bash
# Build and run with Docker Compose
docker compose up -d

# Or build and run manually
docker build -t subtracker .
docker run -d -p 8000:8000 -v subtracker-data:/app/data subtracker
```

The container exposes port `8000` and persists SQLite data in `/app/data`.

### Development

Backend:

```bash
cd backend
npm install
npm run dev        # node --watch server.js
```

Frontend:

```bash
cd frontend
npm install
npm run dev        # vite dev server on port 5173, proxies /api to localhost:8000
```

Then open the frontend dev URL (usually `http://localhost:5173`). The Vite dev proxy forwards `/api` requests to the backend on `localhost:8000`.

### Production build (local)

```bash
cd frontend
npm run build      # outputs to frontend/dist

cd ../backend
npm start          # serves API + built frontend
```

## Testing

Only backend tests exist. They use the Node.js built-in test runner (`node:test`) and `supertest`.

```bash
cd backend
npm test           # node --test
```

Test behavior:

- `tests/setup.js` forces an in-memory SQLite database (`DATABASE_PATH=:memory:`), a test session secret, and `NODE_ENV=test`.
- `tests/helper.js` exports `app`, `db`, `createAgent()`, and `registerUser()`.
- Tests cover auth (register, login, me, invalid credentials), subscription CRUD, and dashboard currency conversion. They are isolated by using separate agents/users per test.

No frontend unit tests are configured. Manual smoke testing or Playwright/E2E can be added if needed.

## Code Style & Conventions

- **Language:** JavaScript (ES modules). All `package.json` files set `"type": "module"`.
- **Backend style:**
  - Plain Express routers, synchronous `better-sqlite3` statements, and manual request validation.
  - API errors return JSON with a `detail` string, e.g. `{ detail: 'Not found' }`.
  - Status codes: `201` on creation, `400` for validation errors, `401` for auth failures, `404` for missing resources, `500` for unexpected errors.
  - Boolean `active` column is stored as `INTEGER` (`0`/`1`) and converted to `Boolean()` in responses.
- **Frontend style:**
  - Functional React components with hooks.
  - `api.js` is the single place for backend requests; it redirects to `/login` on `401`.
  - Tailwind utility classes only; custom styles live in `src/index.css`.
  - The app uses a custom in-memory router (`App.jsx`) rather than `react-router-dom`.
- **Naming:** Backend files are lowercase; frontend component files use PascalCase. Imports include `.js`/`.jsx` extensions because ES modules are used.
- **Environment defaults:** Development defaults are insecure by design (e.g., `secure: false` cookies, hardcoded dev secret). Production deployments must set `SECRET_KEY`.

## Security Considerations

- **Session secret:** Always set `SECRET_KEY` in production. The Dockerfile and `docker-compose.yml` default to `change-me-in-production`.
- **HTTPS / secure cookies:** `cookie.secure` is `false` so the app works over plain HTTP. If deploying behind HTTPS, set `cookie.secure = true` in `backend/server.js`.
- **SameSite:** Cookies use `sameSite: 'lax'`. Adjust if the app is embedded or cross-origin.
- **Password storage:** Passwords are hashed with bcryptjs (cost factor `10`).
- **SQL injection:** Queries use `better-sqlite3` parameterized statements (`?` placeholders). Avoid concatenating user input into SQL strings.
- **Authorization:** Routes under `/api/subscriptions`, `/api/dashboard`, and `/api/settings` use `requireAuth`. Subscription endpoints check `user_id` on every read/write.
- **Exchange rate API:** The backend calls an external HTTP endpoint (`open.er-api.com`) and falls back to a cached/default rate on failure.

## Deployment Checklist

1. Build the Docker image or use `docker compose up -d`.
2. Set a strong `SECRET_KEY` environment variable.
3. Ensure the data volume persists `/app/data`.
4. If serving over HTTPS, update the session cookie `secure` flag in `backend/server.js`.
5. Verify `http://localhost:8000` loads the UI and you can register an account.

## Notes for Agents

- Do not rely on `docs/superpowers/` for implementation details; the real stack is Node/Express + React.
- When adding backend routes, register them in `backend/server.js` and use `requireAuth` where needed.
- When changing the DB schema, update `backend/db.js` and consider migration logic for existing SQLite files.
- Keep the frontend build in sync: after modifying frontend code, run `npm run build` in `frontend/` before testing the Docker image.
