# Task Manager

Monorepo-style project with separate backend and frontend apps.

## Prerequisites

| Tool   | Version used          |
|--------|-----------------------|
| Java   | OpenJDK 17.0.18       |
| Maven  | 3.9.12                |
| Node   | 24.13.1               |
| NPM    | 11.8.0                |
| Docker | 29.3.1                |

## Docker image (backend)

Build and run the backend as a Docker image:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn clean package
docker build -t task-manager-backend:latest .
docker run --rm -p 8080:8080 task-manager-backend:latest
```

Backend API will be available at `http://localhost:8080/api/tasks`.

## Docker Compose

`docker-compose.yml` now includes a `backend` service.

Because `backend/Dockerfile` copies `target/task-manager-backend-0.0.1-SNAPSHOT.jar`, build the jar first:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn clean package
```

Then start the service from project root:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager
docker compose up --build
```

Stop and remove compose resources:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager
docker compose down
```

## Commands reference

See **[COMMANDS.md](COMMANDS.md)** for a full copy-paste reference covering:
- Version checks (Java, Maven, Node, NPM, Docker)
- Git setup, commit, push, pull, branch, reset, stash, tag
- Maven build and test
- Docker image and container lifecycle
- Docker Compose start / stop / logs
- Local (no-Docker) project start and stop

## Project structure

```text
task-manager/
│
├── .github/
│   └── workflows/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/backend/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── TaskManagerApplication.java
│   │   │   └── resources/
│   │   └── test/
│   │       ├── java/
│   │       └── resources/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
├── COMMANDS.md
└── README.md
```

## Backend run

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn spring-boot:run
```

If port `8080` is busy:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

## Frontend

`frontend/` is prepared with a standard folder layout and is ready for React/Vite or Next.js scaffolding.

