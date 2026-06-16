# SubTracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-container, self-hosted subscription tracker with FastAPI backend, React frontend, SQLite database, session auth, and EGP/USD currency support.

**Architecture:** FastAPI serves a JSON API under `/api/*` and static React build files for all other routes. SQLite stores users, subscriptions, and settings. Tailwind CSS provides a dark refined, mobile-first UI.

**Tech Stack:** Python 3.12, FastAPI, SQLModel, SQLite, bcrypt, React 18, Vite, Tailwind CSS, Docker.

---

## File Structure

```
subtracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, static mount, catch-all
│   │   ├── database.py          # SQLite engine + session helper
│   │   ├── config.py            # settings (secret, db path, default rate)
│   │   ├── models.py            # User, Subscription, Setting SQLModel models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── auth.py              # password hashing + session cookie helpers
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # register/login/logout/me endpoints
│   │   │   ├── subscriptions.py # CRUD endpoints
│   │   │   └── dashboard.py     # dashboard summary endpoint
│   │   └── services/
│   │       └── currency.py      # conversion logic
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py          # test client + in-memory db fixture
│   │   ├── test_auth.py
│   │   ├── test_subscriptions.py
│   │   └── test_dashboard.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api.js               # axios/fetch wrapper
│   │   ├── auth.js              # auth context/provider
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubscriptionList.jsx
│   │   │   ├── SubscriptionForm.jsx
│   │   │   ├── CurrencyToggle.jsx
│   │   │   └── SummaryCards.jsx
│   │   └── index.css
│   └── Dockerfile (unused; backend Dockerfile builds both)
├── Dockerfile                   # single container build
├── docker-compose.yml
├── .dockerignore
├── .gitignore
└── README.md
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `backend/requirements.txt`
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `.gitignore`
- Create: `.dockerignore`

- [ ] **Step 1: Write backend requirements**

```txt
fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlmodel==0.0.19
bcrypt==4.1.3
python-multipart==0.0.9
pydantic-settings==2.3.4
pytest==8.2.2
httpx==0.27.0
```

- [ ] **Step 2: Write frontend package.json**

```json
{
  "name": "subtracker-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "axios": "^1.7.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1"
  }
}
```

- [ ] **Step 3: Write Vite config**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

- [ ] **Step 4: Write Tailwind config**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Write PostCSS config**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Write index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SubTracker</title>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write .gitignore**

```gitignore
__pycache__/
*.pyc
.env
venv/
node_modules/
frontend/dist/
backend/data/
*.db
.superpowers/
```

- [ ] **Step 8: Write .dockerignore**

```gitignore
node_modules
frontend/dist
__pycache__
*.pyc
.env
.git
.superpowers
```

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold project structure"
```

---

### Task 2: Backend Configuration & Database

**Files:**
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/app/database.py`

- [ ] **Step 1: Write config.py**

```python
import secrets
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

class Settings(BaseSettings):
    app_name: str = "SubTracker"
    secret_key: str = secrets.token_urlsafe(32)
    database_url: str = f"sqlite:///{DATA_DIR}/subtracker.db"
    session_cookie_name: str = "session_id"
    default_usd_to_egp: float = 50.0

settings = Settings()
```

- [ ] **Step 2: Write database.py**

```python
from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
```

- [ ] **Step 3: Run init check**

```bash
cd backend
python -c "from app.database import init_db; init_db()"
ls data/subtracker.db
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/config.py backend/app/database.py
git commit -m "feat: add backend config and sqlite database"
```

---

### Task 3: SQLModel Models

**Files:**
- Create: `backend/app/models.py`

- [ ] **Step 1: Write models.py**

```python
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship

class Currency(str, Enum):
    EGP = "EGP"
    USD = "USD"

class BillingCycle(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    subscriptions: list["Subscription"] = Relationship(back_populates="user")

class Subscription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str
    cost: Decimal = Field(decimal_places=2)
    currency: Currency
    cycle: BillingCycle
    next_renewal: date
    category: str = Field(default="Uncategorized")
    notes: Optional[str] = None
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user: User = Relationship(back_populates="subscriptions")

class Setting(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str
```

- [ ] **Step 2: Update database init and verify tables**

Run:
```bash
cd backend
python -c "from app.database import init_db; init_db()"
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/models.py
git commit -m "feat: add user, subscription, and setting models"
```

---

### Task 4: Password Hashing & Session Helpers

**Files:**
- Create: `backend/app/auth.py`

- [ ] **Step 1: Write auth.py**

```python
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import Request, Response, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

sessions = {}

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_session(user_id: int) -> str:
    session_id = uuid.uuid4().hex
    sessions[session_id] = {"user_id": user_id, "expires": datetime.utcnow() + timedelta(days=7)}
    return session_id

def get_session_user(request: Request, db: Session = Depends(get_session)) -> User:
    session_id = request.cookies.get(settings.session_cookie_name)
    if not session_id or session_id not in sessions:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    session_data = sessions[session_id]
    if session_data["expires"] < datetime.utcnow():
        del sessions[session_id]
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    user = db.get(User, session_data["user_id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def login_user(response: Response, user_id: int):
    session_id = create_session(user_id)
    response.set_cookie(settings.session_cookie_name, session_id, httponly=True, samesite="lax")

def logout_user(request: Request, response: Response):
    session_id = request.cookies.get(settings.session_cookie_name)
    if session_id and session_id in sessions:
        del sessions[session_id]
    response.delete_cookie(settings.session_cookie_name)
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/auth.py
git commit -m "feat: add password hashing and session helpers"
```

---

### Task 5: Auth Router

**Files:**
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/auth.py`
- Create: `backend/app/schemas.py`

- [ ] **Step 1: Write schemas.py**

```python
from pydantic import BaseModel

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
```

- [ ] **Step 2: Write auth router**

```python
from fastapi import APIRouter, Response, Request, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
from app.auth import hash_password, verify_password, login_user, logout_user, get_session_user
from app.schemas import UserRegister, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(data: UserRegister, response: Response, db: Session = Depends(get_session)):
    existing = db.exec(select(User).where(User.username == data.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(username=data.username, hashed_password=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    login_user(response, user.id)
    return user

@router.post("/login")
def login(data: UserLogin, response: Response, db: Session = Depends(get_session)):
    user = db.exec(select(User).where(User.username == data.username)).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    login_user(response, user.id)
    return {"message": "Logged in"}

@router.post("/logout")
def logout(request: Request, response: Response):
    logout_user(request, response)
    return {"message": "Logged out"}

@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_session_user)):
    return user
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas.py backend/app/routers/auth.py
git commit -m "feat: add auth endpoints"
```

---

### Task 6: Subscriptions Router

**Files:**
- Modify: `backend/app/schemas.py`
- Create: `backend/app/routers/subscriptions.py`

- [ ] **Step 1: Add subscription schemas**

Append to `backend/app/schemas.py`:

```python
from datetime import date
from decimal import Decimal
from typing import Optional
from app.models import Currency, BillingCycle

class SubscriptionCreate(BaseModel):
    name: str
    cost: Decimal
    currency: Currency
    cycle: BillingCycle
    next_renewal: date
    category: Optional[str] = "Uncategorized"
    notes: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    cost: Optional[Decimal] = None
    currency: Optional[Currency] = None
    cycle: Optional[BillingCycle] = None
    next_renewal: Optional[date] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    active: Optional[bool] = None

class SubscriptionResponse(BaseModel):
    id: int
    name: str
    cost: Decimal
    currency: Currency
    cycle: BillingCycle
    next_renewal: date
    category: str
    notes: Optional[str]
    active: bool
```

- [ ] **Step 2: Write subscriptions router**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Subscription, User
from app.auth import get_session_user
from app.schemas import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

@router.get("", response_model=list[SubscriptionResponse])
def list_subscriptions(user: User = Depends(get_session_user), db: Session = Depends(get_session)):
    return db.exec(select(Subscription).where(Subscription.user_id == user.id)).all()

@router.post("", response_model=SubscriptionResponse)
def create(data: SubscriptionCreate, user: User = Depends(get_session_user), db: Session = Depends(get_session)):
    sub = Subscription(**data.model_dump(), user_id=user.id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.get("/{sub_id}", response_model=SubscriptionResponse)
def get(sub_id: int, user: User = Depends(get_session_user), db: Session = Depends(get_session)):
    sub = db.get(Subscription, sub_id)
    if not sub or sub.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    return sub

@router.put("/{sub_id}", response_model=SubscriptionResponse)
def update(sub_id: int, data: SubscriptionUpdate, user: User = Depends(get_session_user), db: Session = Depends(get_session)):
    sub = db.get(Subscription, sub_id)
    if not sub or sub.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sub, key, value)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.delete("/{sub_id}")
def delete(sub_id: int, user: User = Depends(get_session_user), db: Session = Depends(get_session)):
    sub = db.get(Subscription, sub_id)
    if not sub or sub.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(sub)
    db.commit()
    return {"message": "Deleted"}
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas.py backend/app/routers/subscriptions.py
git commit -m "feat: add subscription crud endpoints"
```

---

### Task 7: Currency Service & Settings

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/currency.py`

- [ ] **Step 1: Write currency service**

```python
from decimal import Decimal
from sqlmodel import Session, select
from app.models import Setting, Currency

USD_TO_EGP_KEY = "usd_to_egp"

def get_rate(db: Session) -> Decimal:
    row = db.get(Setting, USD_TO_EGP_KEY)
    if row:
        return Decimal(row.value)
    from app.config import settings
    return Decimal(str(settings.default_usd_to_egp))

def set_rate(db: Session, rate: Decimal):
    row = db.get(Setting, USD_TO_EGP_KEY)
    if row:
        row.value = str(rate)
    else:
        row = Setting(key=USD_TO_EGP_KEY, value=str(rate))
    db.add(row)
    db.commit()

def convert(amount: Decimal, from_currency: Currency, to_currency: Currency, rate: Decimal) -> Decimal:
    if from_currency == to_currency:
        return amount
    if from_currency == Currency.USD and to_currency == Currency.EGP:
        return amount * rate
    if from_currency == Currency.EGP and to_currency == Currency.USD:
        return amount / rate
    raise ValueError("Unsupported currency conversion")
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/currency.py
git commit -m "feat: add currency conversion service"
```

---

### Task 8: Dashboard Router

**Files:**
- Create: `backend/app/routers/dashboard.py`
- Modify: `backend/app/schemas.py`

- [ ] **Step 1: Add dashboard schema**

Append to `backend/app/schemas.py`:

```python
from pydantic import BaseModel

class DashboardResponse(BaseModel):
    monthly_total: float
    yearly_total: float
    active_count: int
    upcoming: SubscriptionResponse | None
    currency: str
```

- [ ] **Step 2: Write dashboard router**

```python
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from datetime import date
from app.database import get_session
from app.auth import get_session_user
from app.models import Subscription, User, Currency, BillingCycle
from app.services.currency import get_rate, convert
from app.schemas import DashboardResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

CYCLE_MULTIPLIERS = {
    BillingCycle.WEEKLY: 52 / 12,
    BillingCycle.MONTHLY: 1,
    BillingCycle.YEARLY: 1 / 12,
}

@router.get("", response_model=DashboardResponse)
def dashboard(
    currency: Currency = Query(default=Currency.USD),
    user: User = Depends(get_session_user),
    db: Session = Depends(get_session),
):
    rate = get_rate(db)
    subs = db.exec(select(Subscription).where(Subscription.user_id == user.id, Subscription.active == True)).all()
    monthly_total = sum(
        convert(sub.cost, sub.currency, currency, rate) * CYCLE_MULTIPLIERS[sub.cycle]
        for sub in subs
    )
    upcoming = min(
        (sub for sub in subs if sub.next_renewal >= date.today()),
        key=lambda s: s.next_renewal,
        default=None,
    )
    return DashboardResponse(
        monthly_total=float(monthly_total.quantize(Decimal("0.01"))),
        yearly_total=float((monthly_total * 12).quantize(Decimal("0.01"))),
        active_count=len(subs),
        upcoming=upcoming,
        currency=currency.value,
    )
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/routers/dashboard.py backend/app/schemas.py
git commit -m "feat: add dashboard endpoint with currency toggle"
```

---

### Task 9: FastAPI Main App

**Files:**
- Create: `backend/app/main.py`

- [ ] **Step 1: Write main.py**

```python
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import init_db
from app.routers import auth, subscriptions, dashboard

app = FastAPI(title="SubTracker")

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth.router)
app.include_router(subscriptions.router)
app.include_router(dashboard.router)

static_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    if static_dir.exists():
        index = static_dir / "index.html"
        if index.exists():
            return FileResponse(index)
    return {"message": "SubTracker API is running"}
```

- [ ] **Step 2: Test backend starts**

```bash
cd backend
uvicorn app.main:app --reload --port 8000 &
curl http://localhost:8000/
kill %1
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: wire up fastapi app with static spa fallback"
```

---

### Task 10: Backend Tests

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_auth.py`
- Create: `backend/tests/test_subscriptions.py`
- Create: `backend/tests/test_dashboard.py`

- [ ] **Step 1: Write conftest.py**

```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from app.main import app
from app.database import get_session

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

@pytest.fixture
def client():
    SQLModel.metadata.create_all(engine)
    def override_get_session():
        with Session(engine) as session:
            yield session
    app.dependency_overrides[get_session] = override_get_session
    yield TestClient(app)
    app.dependency_overrides.clear()
```

- [ ] **Step 2: Write test_auth.py**

```python
def test_register_and_login(client):
    r = client.post("/api/auth/register", json={"username": "alice", "password": "secret"})
    assert r.status_code == 200
    assert r.json()["username"] == "alice"

    r = client.post("/api/auth/login", json={"username": "alice", "password": "secret"})
    assert r.status_code == 200

    r = client.get("/api/auth/me")
    assert r.status_code == 200
    assert r.json()["username"] == "alice"

def test_wrong_password(client):
    client.post("/api/auth/register", json={"username": "bob", "password": "secret"})
    r = client.post("/api/auth/login", json={"username": "bob", "password": "wrong"})
    assert r.status_code == 401
```

- [ ] **Step 3: Write test_subscriptions.py**

```python
from datetime import date, timedelta

def test_subscription_crud(client):
    client.post("/api/auth/register", json={"username": "u1", "password": "p"})
    sub = {
        "name": "Netflix",
        "cost": "15.49",
        "currency": "USD",
        "cycle": "monthly",
        "next_renewal": str(date.today() + timedelta(days=5)),
        "category": "Entertainment",
    }
    r = client.post("/api/subscriptions", json=sub)
    assert r.status_code == 200
    assert r.json()["name"] == "Netflix"

    r = client.get("/api/subscriptions")
    assert len(r.json()) == 1

    sub_id = r.json()[0]["id"]
    r = client.put(f"/api/subscriptions/{sub_id}", json={"cost": "17.00"})
    assert r.json()["cost"] == "17.00"

    r = client.delete(f"/api/subscriptions/{sub_id}")
    assert r.status_code == 200
```

- [ ] **Step 4: Write test_dashboard.py**

```python
from datetime import date, timedelta

def test_dashboard_currency_toggle(client):
    client.post("/api/auth/register", json={"username": "u2", "password": "p"})
    client.post("/api/subscriptions", json={
        "name": "Spotify",
        "cost": "10",
        "currency": "USD",
        "cycle": "monthly",
        "next_renewal": str(date.today() + timedelta(days=10)),
    })
    r = client.get("/api/dashboard?currency=USD")
    assert r.status_code == 200
    assert r.json()["monthly_total"] == 10.0

    r = client.get("/api/dashboard?currency=EGP")
    assert r.json()["monthly_total"] == 500.0
```

- [ ] **Step 5: Run tests**

```bash
cd backend
pytest -v
```

- [ ] **Step 6: Commit**

```bash
git add backend/tests/
git commit -m "test: add backend tests for auth, subscriptions, dashboard"
```

---

### Task 11: Frontend Base & Auth

**Files:**
- Create: `frontend/src/index.css`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/api.js`
- Create: `frontend/src/auth.js`
- Create: `frontend/src/components/Layout.jsx`
- Create: `frontend/src/components/Login.jsx`
- Create: `frontend/src/components/Register.jsx`

- [ ] **Step 1: Write index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-950 text-slate-100;
  }
}
```

- [ ] **Step 2: Write api.js**

```js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
```

- [ ] **Step 3: Write auth.js**

```js
import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    await api.post('/auth/login', { username, password })
    const res = await api.get('/auth/me')
    setUser(res.data)
  }

  const register = async (username, password) => {
    await api.post('/auth/register', { username, password })
    const res = await api.get('/auth/me')
    setUser(res.data)
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

- [ ] **Step 4: Write Layout.jsx**

```jsx
import { useAuth } from '../auth'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight">SubTracker</h1>
          {user && (
            <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-100">
              Logout
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 5: Write Login.jsx**

```jsx
import { useState } from 'react'
import { useAuth } from '../auth'

export default function Login({ onToggle }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await login(username, password)
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-6 text-2xl font-bold">Welcome back</h2>
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <label className="mb-2 block text-sm text-slate-400">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" required />
        <label className="mb-2 block text-sm text-slate-400">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" required />
        <button className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500">Log in</button>
        <p className="mt-4 text-center text-sm text-slate-400">
          No account? <button type="button" onClick={onToggle} className="text-sky-400 hover:underline">Register</button>
        </p>
      </form>
    </div>
  )
}
```

- [ ] **Step 6: Write Register.jsx**

```jsx
import { useState } from 'react'
import { useAuth } from '../auth'

export default function Register({ onToggle }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await register(username, password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-6 text-2xl font-bold">Create account</h2>
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <label className="mb-2 block text-sm text-slate-400">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" required />
        <label className="mb-2 block text-sm text-slate-400">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" required />
        <button className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500">Register</button>
        <p className="mt-4 text-center text-sm text-slate-400">
          Have an account? <button type="button" onClick={onToggle} className="text-sky-400 hover:underline">Log in</button>
        </p>
      </form>
    </div>
  )
}
```

- [ ] **Step 7: Write App.jsx**

```jsx
import { useState } from 'react'
import { AuthProvider, useAuth } from './auth'
import Layout from './components/Layout'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

function Router() {
  const { user, loading } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>
  if (!user) return (
    <Layout>
      {isLogin ? <Login onToggle={() => setIsLogin(false)} /> : <Register onToggle={() => setIsLogin(true)} />}
    </Layout>
  )
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
```

- [ ] **Step 8: Write main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/
git commit -m "feat: add frontend auth and layout"
```

---

### Task 12: Dashboard Components

**Files:**
- Create: `frontend/src/components/CurrencyToggle.jsx`
- Create: `frontend/src/components/SummaryCards.jsx`
- Create: `frontend/src/components/SubscriptionList.jsx`
- Create: `frontend/src/components/SubscriptionForm.jsx`
- Create: `frontend/src/components/Dashboard.jsx`

- [ ] **Step 1: Write CurrencyToggle.jsx**

```jsx
export default function CurrencyToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
      {['EGP', 'USD'].map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`rounded-lg px-4 py-1 text-sm font-medium transition ${
            value === c ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Write SummaryCards.jsx**

```jsx
export default function SummaryCards({ dashboard, currency }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="text-sm text-slate-400">Monthly</div>
        <div className="mt-1 text-2xl font-bold">{dashboard.monthly_total.toFixed(2)} {currency}</div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="text-sm text-slate-400">Yearly</div>
        <div className="mt-1 text-2xl font-bold">{dashboard.yearly_total.toFixed(2)} {currency}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write SubscriptionList.jsx**

```jsx
import { CYCLE_LABELS } from './SubscriptionForm'

const COLORS = ['bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

function colorFor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function SubscriptionList({ subscriptions, onEdit, onDelete }) {
  if (!subscriptions.length) return <p className="text-center text-slate-500">No subscriptions yet.</p>
  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => (
        <div key={sub.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${colorFor(sub.name)}`}>
              {sub.name[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{sub.name}</div>
              <div className="text-xs text-slate-400">{sub.category} • {CYCLE_LABELS[sub.cycle]} • Next: {sub.next_renewal}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{parseFloat(sub.cost).toFixed(2)} {sub.currency}</div>
            <div className="mt-1 flex gap-2 text-xs">
              <button onClick={() => onEdit(sub)} className="text-sky-400 hover:underline">Edit</button>
              <button onClick={() => onDelete(sub.id)} className="text-rose-400 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Write SubscriptionForm.jsx**

```jsx
import { useEffect, useState } from 'react'

export const CYCLE_LABELS = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }

export default function SubscriptionForm({ subscription, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    cost: '',
    currency: 'USD',
    cycle: 'monthly',
    next_renewal: '',
    category: 'Entertainment',
    notes: '',
  })

  useEffect(() => {
    if (subscription) {
      setForm({
        name: subscription.name,
        cost: subscription.cost,
        currency: subscription.currency,
        cycle: subscription.cycle,
        next_renewal: subscription.next_renewal,
        category: subscription.category,
        notes: subscription.notes || '',
      })
    }
  }, [subscription])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/60 sm:items-center sm:justify-center">
      <form onSubmit={submit} className="h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-slate-900 p-6 sm:h-auto sm:max-w-md sm:rounded-3xl">
        <h2 className="mb-6 text-xl font-bold">{subscription ? 'Edit' : 'Add'} subscription</h2>
        <label className="mb-2 block text-sm text-slate-400">Name</label>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" required />

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Cost</label>
            <input type="number" step="0.01" value={form.cost} onChange={(e) => update('cost', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-400">Currency</label>
            <select value={form.currency} onChange={(e) => update('currency', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500">
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Cycle</label>
            <select value={form.cycle} onChange={(e) => update('cycle', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-400">Next renewal</label>
            <input type="date" value={form.next_renewal} onChange={(e) => update('next_renewal', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" required />
          </div>
        </div>

        <label className="mb-2 block text-sm text-slate-400">Category</label>
        <input value={form.category} onChange={(e) => update('category', e.target.value)} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" />

        <label className="mb-2 block text-sm text-slate-400">Notes</label>
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="mb-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" rows={3} />

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-slate-700 py-3 font-medium text-slate-300 hover:bg-slate-800">Cancel</button>
          <button type="submit" className="flex-1 rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500">Save</button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Write Dashboard.jsx**

```jsx
import { useEffect, useState } from 'react'
import api from '../api'
import CurrencyToggle from './CurrencyToggle'
import SummaryCards from './SummaryCards'
import SubscriptionList from './SubscriptionList'
import SubscriptionForm from './SubscriptionForm'

export default function Dashboard() {
  const [subs, setSubs] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [currency, setCurrency] = useState('USD')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const [subsRes, dashRes] = await Promise.all([
      api.get('/subscriptions'),
      api.get(`/dashboard?currency=${currency}`),
    ])
    setSubs(subsRes.data)
    setDashboard(dashRes.data)
  }

  useEffect(() => {
    load()
  }, [currency])

  const handleSave = async (form) => {
    if (editing) {
      await api.put(`/subscriptions/${editing.id}`, form)
    } else {
      await api.post('/subscriptions', form)
    }
    setShowForm(false)
    setEditing(null)
    await load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this subscription?')) return
    await api.delete(`/subscriptions/${id}`)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <CurrencyToggle value={currency} onChange={setCurrency} />
      </div>

      {dashboard && <SummaryCards dashboard={dashboard} currency={currency} />}

      {dashboard?.upcoming && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-sm text-slate-400">Upcoming renewal</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-semibold">{dashboard.upcoming.name}</span>
            <span className="text-sm text-sky-400">{dashboard.upcoming.next_renewal}</span>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-400">Subscriptions</h3>
        <SubscriptionList subscriptions={subs} onEdit={(sub) => { setEditing(sub); setShowForm(true) }} onDelete={handleDelete} />
      </div>

      <button onClick={() => { setEditing(null); setShowForm(true) }} className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-2xl text-white shadow-lg hover:bg-sky-500">
        +
      </button>

      {showForm && <SubscriptionForm subscription={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />}
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add dashboard, list, form, and currency toggle"
```

---

### Task 13: Docker & Deployment

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `README.md`

- [ ] **Step 1: Write Dockerfile**

```dockerfile
# Stage 1: Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY --from=frontend /app/frontend/dist ./frontend/dist

ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=sqlite:////app/data/subtracker.db

EXPOSE 8000

VOLUME ["/app/data"]

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 2: Write docker-compose.yml**

```yaml
services:
  subtracker:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - subtracker-data:/app/data
    environment:
      - SECRET_KEY=${SECRET_KEY:-change-me-in-production}
    restart: unless-stopped

volumes:
  subtracker-data:
```

- [ ] **Step 3: Write README.md**

```markdown
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
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Configuration

- `SECRET_KEY`: session secret
- `DEFAULT_USD_TO_EGP`: default exchange rate (default 50)
```

- [ ] **Step 4: Build Docker image**

```bash
docker build -t subtracker .
```

- [ ] **Step 5: Run smoke test**

```bash
docker run -d --name subtracker-test -p 8000:8000 subtracker
curl -s http://localhost:8000/ | head -c 200
docker stop subtracker-test && docker rm subtracker-test
```

- [ ] **Step 6: Commit**

```bash
git add Dockerfile docker-compose.yml README.md
git commit -m "feat: add docker setup and readme"
```

---

## Self-Review

**Spec coverage:**
- Single/multi-user auth: Tasks 4, 5
- Subscription CRUD: Task 6
- EGP/USD input and dashboard toggle: Tasks 7, 8, 12
- Dark refined mobile UI: Tasks 11, 12
- Single Docker container: Task 13
- SQLite: Tasks 2, 3
- Tests: Task 10

**Placeholder scan:** No TBD/TODO placeholders found. Every step includes concrete code or commands.

**Type consistency:**
- `SubscriptionResponse` reused across subscription router and dashboard schema.
- `Currency` enum used in models, schemas, and routers.
- Frontend form field names match backend schema fields.
