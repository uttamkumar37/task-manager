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
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn spring-boot:run
```

Backend: `http://localhost:8080`

### 2) Run frontend

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### 3) Frontend env

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Common Commands

### Backend

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn test
mvn clean package
```

### Frontend

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/frontend
npm run build
npm run preview
```

### Docker (optional)

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager

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

## Authentication

This project currently uses **session-based authentication**.

- Login creates a server session
- Browser stores `JSESSIONID` cookie
- Frontend sends cookie automatically (`withCredentials: true`)
- Protected endpoints require a valid session
- New users can self-register and access only their own tasks

Default credentials (unless overridden with env vars):
- Username: `admin`
- Password: `admin123`

Backend env overrides:

```bash
export TASK_MANAGER_AUTH_USERNAME="myuser"
export TASK_MANAGER_AUTH_PASSWORD="mypassword"
export TASK_MANAGER_AUTH_ROLE="USER"
```

Auth endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## API Endpoints

Task endpoints:
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

## Quick API Check (with session cookie)

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

curl -i -b cookies.txt http://localhost:8080/api/tasks
```

## Notes

- H2 console: `http://localhost:8080/h2-console`
- If frontend cannot call backend, verify `VITE_API_BASE_URL` and backend CORS settings in `backend/src/main/java/backend/security/SecurityConfig.java`
- Backend-specific details are in `backend/README.md`; frontend-specific details are in `frontend/README.md`
