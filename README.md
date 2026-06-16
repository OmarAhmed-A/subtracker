# SubTracker

A clean, simple subscription tracker. Self-hosted in one Docker container.

## Features
- Track subscriptions with cost, currency (EGP/USD), cycle, and renewal date
- Dashboard with monthly/yearly totals
- Toggle dashboard summaries between EGP and USD
- Dark refined, mobile-first UI
- Simple multi-user support

## Run with Docker Compose

```bash
docker compose up -d
```

Then open http://localhost:8000 and register an account.

## Run with Docker

```bash
docker build -t subtracker .
docker run -d -p 8000:8000 -v subtracker-data:/app/data subtracker
```

## Development

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Configuration

- `SECRET_KEY`: session secret (set in production)
- `DATA_DIR`: where the SQLite database is stored (default `./backend/data`)
