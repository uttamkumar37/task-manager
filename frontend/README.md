# Task Manager Frontend

Production-ready React (Vite) frontend for the Spring Boot backend in this repository.

## Features

- JWT authentication with `Authorization: Bearer <token>`
- Login page with loading and error states
- Protected dashboard route
- Task CRUD (create, edit, delete, quick status updates)
- Professional task statuses (`TODO`, `IN_PROGRESS`, `BLOCKED`, `WAITING_REVIEW`, `COMPLETED`, `CANCELLED`)
- Priority and optional due date fields
- Client-side search plus status, overdue, and high-priority filters
- Global Axios error handling via interceptors

## Tech Stack

- React + Vite
- React Router
- Axios
- Hooks + functional components

## Environment

Create `.env` in this folder (or copy from `.env.example`):

```env
VITE_API_BASE_URL=https://task-manager-backend-51pf.onrender.com
```

To override for local development:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Run

```bash
cd frontend
npm install
npm run dev
```

## Build Check

```bash
cd frontend
npm run build
```

## Default Local Auth User

Based on backend defaults in `backend/src/main/java/backend/security/SecurityConfig.java` and `application.properties`:

- Username: `admin`
- Password: `admin123`
