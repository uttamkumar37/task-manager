# Task Manager

Simple full-stack task manager with:
- Spring Boot backend (`backend/`)
- React + Vite frontend (`frontend/`)

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- npm 9+

## Quick Start

### 1) Run backend

```bash
cd backend
mvn spring-boot:run
```

Backend: `http://localhost:8080`

If backend startup fails with `FATAL: role "postgres" does not exist`, run this one-time local PostgreSQL setup:

```bash
psql -h localhost -p 5432 -d postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres123';"
createdb -h localhost -p 5432 -O postgres taskdb
```

Then start backend again:

```bash
cd backend
mvn spring-boot:run
```

### 2) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### 3) Frontend env

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For production (Vercel), set:

```env
VITE_API_BASE_URL=https://<your-backend>.onrender.com
```

## Common Commands

### Backend

```bash
cd backend
mvn test
mvn clean package
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Docker (optional)

```bash
# first-time setup
cp .env.example .env
# edit placeholder values in .env before production use

# backend change
cd backend
mvn clean package -DskipTests
cd ..
docker compose up -d --build backend

# frontend change
cd frontend
npm run build
cd ..
docker compose up -d --build frontend

# full rebuild
docker compose up -d --build

# verify
docker ps

# debug if needed
docker compose logs -f

# just restart
docker compose down && docker compose up -d

# stop
docker compose down
```

Root `.env` values used by Compose:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `BACKEND_PORT`, `FRONTEND_PORT`
- `TASK_MANAGER_AUTH_USERNAME`, `TASK_MANAGER_AUTH_PASSWORD`, `TASK_MANAGER_AUTH_ROLE`
- `TASK_MANAGER_CORS_ALLOWED_ORIGINS`
- `VITE_API_BASE_URL` (baked into frontend image at build time)
- `JWT_SECRET`, `JWT_EXPIRATION_MS` (optional)

## Continuous Integration

GitHub Actions runs CI on pushes and pull requests to `main`.

The workflow validates:
- Backend tests with `mvn test`
- Frontend install/build with `npm ci` and `npm run build`
- Docker Compose configuration with `docker compose config`

CI uses safe dummy environment values for Compose validation and does not require real secrets or a local PostgreSQL server. Backend tests use the repository test configuration, so `mvn test` remains self-contained.

`npm audit` currently reports known moderate dev-tooling vulnerabilities in Vite/esbuild. They are tracked separately because the available npm fix requires a breaking major Vite upgrade.

## Authentication

This project uses **stateless JWT authentication**.

- `POST /api/auth/register` creates a new user with `ROLE_USER`.
- `POST /api/auth/login` validates credentials and returns a JWT in the response body as `token`.
- The frontend stores that JWT in `localStorage`.
- Axios attaches the token to API requests as `Authorization: Bearer <token>`.
- Protected endpoints require a valid bearer token.
- New users can self-register and access only their own tasks.
- `POST /api/auth/logout` is client-side cleanup for JWT auth; the frontend removes the stored token.

Default credentials (unless overridden with env vars):
- Username: `admin`
- Password: `admin123`

Backend env overrides:

```bash
export TASK_MANAGER_AUTH_USERNAME="myuser"
export TASK_MANAGER_AUTH_PASSWORD="mypassword"
export TASK_MANAGER_AUTH_ROLE="USER"
export TASK_MANAGER_CORS_ALLOWED_ORIGINS="https://task-manager-ashen-nu-54.vercel.app"
```

Auth endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## API Endpoints

Task endpoints require `Authorization: Bearer <token>`:
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `GET /api/tasks?status={status}`
- `GET /api/tasks/search?keyword={keyword}`
- `GET /api/tasks/stats`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/complete`
- `PATCH /api/tasks/{id}/pending`
- `DELETE /api/tasks/{id}`

Public/social endpoints:
- `GET /api/public/visitors`
- `POST /api/public/visitors/register`
- `POST /api/public/messages`

Authenticated message endpoint:
- `GET /api/messages` (admin sees all messages; regular users see messages submitted while authenticated as themselves)

## Quick API Check (with JWT)

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

curl -i http://localhost:8080/api/tasks \
  -H "Authorization: Bearer ${TOKEN}"
```

## Notes

- Database: PostgreSQL only (configured in `docker-compose.yml` and backend `application.properties`)
- Frontend API backend: `https://task-manager-backend-51pf.onrender.com` (set `VITE_API_BASE_URL` in `.env` to override)
- If frontend cannot call backend, verify `VITE_API_BASE_URL` and backend CORS settings in `backend/src/main/java/backend/security/SecurityConfig.java`
- Backend-specific details are in `backend/README.md`; frontend-specific details are in `frontend/README.md`
