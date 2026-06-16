# SubTracker Design Spec

## 1. Overview & Scope

SubTracker is a single-user (with simple multi-user support) web application for tracking recurring subscriptions and their cost impact. It is designed to be self-hosted on a VPS in a single Docker container with minimal setup.

### In Scope
- User registration and login (session-based auth)
- Add, edit, delete subscriptions
- Subscription fields: name, cost, currency (EGP/USD), billing cycle, next renewal date, category, notes, active state
- Dashboard with monthly and yearly aggregates
- Currency toggle to view dashboard summaries in EGP or USD
- Dark refined, mobile-first responsive UI
- Single-container Docker deployment with SQLite

### Out of Scope
- Email or push renewal reminders
- Payment integrations
- Import/export
- Admin roles or permissions beyond simple account isolation

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.12 + FastAPI + SQLModel |
| Database | SQLite (single file, persisted via Docker volume) |
| Frontend | React 18 + Vite |
| Auth | Session cookies with bcrypt password hashing |
| Container | Single Dockerfile; Python serves static build + API |
| Styling | Tailwind CSS + custom CSS variables |

## 3. Data Model

### User
- `id`: integer primary key
- `username`: string, unique, required
- `hashed_password`: string, required
- `created_at`: datetime

### Subscription
- `id`: integer primary key
- `user_id`: foreign key to User
- `name`: string, required
- `cost`: decimal, required
- `currency`: enum (`EGP`, `USD`), required
- `cycle`: enum (`weekly`, `monthly`, `yearly`), required
- `next_renewal`: date, required
- `category`: string (e.g., Entertainment, Software, Utilities)
- `notes`: optional text
- `active`: boolean, default true
- `created_at`: datetime
- `updated_at`: datetime

## 4. API Endpoints

### Auth
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — start session
- `POST /api/auth/logout` — end session
- `GET /api/auth/me` — current user

### Subscriptions
- `GET /api/subscriptions` — list user's subscriptions
- `POST /api/subscriptions` — create subscription
- `GET /api/subscriptions/{id}` — get one subscription
- `PUT /api/subscriptions/{id}` — update subscription
- `DELETE /api/subscriptions/{id}` — delete subscription

### Dashboard
- `GET /api/dashboard?currency=EGP|USD` — totals and upcoming renewals in the requested currency

## 5. Currency Handling

- Each subscription is stored with its original currency.
- Dashboard converts all subscriptions to the selected view currency using a configurable exchange rate.
- Exchange rate stored in a simple `Settings` table (key-value) and editable from the UI.
- Default rate: 1 USD = 50 EGP.
- Conversion happens server-side so totals are accurate and consistent.

## 6. UI/UX Design

### Visual Direction
Dark refined theme: deep slate/navy background (`#0f172a`), light text (`#f8fafc`), muted secondary text (`#94a3b8`), and soft accent colors per category.

### Pages
1. **Login / Register** — centered card, toggle between modes, minimal inputs.
2. **Dashboard** —
   - Header with app name, logout, and currency toggle (EGP/USD).
   - Summary cards: monthly total, yearly total, active subscription count.
   - Upcoming renewal card showing the next subscription due.
   - Filterable subscription list grouped by category or sorted by next renewal.
   - Floating action button to add a new subscription.
3. **Add / Edit Subscription** — full-screen or slide-over form with all subscription fields.

### Mobile Considerations
- Touch-friendly list items.
- Bottom-aligned primary actions where appropriate.
- Responsive summary cards that stack on narrow screens.
- Form inputs use native mobile keyboards (numeric for cost, date picker for renewal).

## 7. Docker & Deployment

### Dockerfile
- Multi-stage build:
  1. Node stage builds the React frontend.
  2. Python stage installs dependencies and copies the built frontend.
- FastAPI serves the API at `/api/*` and static files at `/`.
- SQLite database file stored at `/app/data/subtracker.db`.

### Running
```bash
docker build -t subtracker .
docker run -d -p 8000:8000 -v subtracker-data:/app/data subtracker
```

### docker-compose.yml (optional)
Provided for convenience with volume persistence.

## 8. Error Handling

- Invalid credentials return 401 with a clear message.
- Unauthenticated requests redirect or return 401; frontend redirects to login.
- Form validation errors return 422 with field-level messages.
- Server errors return 500 with a friendly message and are logged.

## 9. Testing

- Backend: pytest with an in-memory SQLite database for unit tests on endpoints and currency conversion.
- Frontend: basic Vitest tests for utility functions (e.g., currency formatting).
- Manual smoke test: build and run the Docker container, register, add subscriptions, toggle currency.
