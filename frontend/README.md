# Task Manager Frontend

Production-ready React (Vite) frontend for the Spring Boot backend in this repository.

## Features

- Session-based authentication (`withCredentials: true`)
- Login page with loading and error states
- Protected dashboard route
- Task CRUD (create, edit, delete)
- Status filter (`ALL`, `PENDING`, `DONE`)
- Global Axios error handling via interceptors

## Tech Stack

- React + Vite
- React Router
- Axios
- Hooks + functional components

## Environment

Create `.env` in this folder (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:8080
```

Production example:

```env
VITE_API_URL=https://<your-backend>.onrender.com
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

