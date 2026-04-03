# Backend (Spring Boot)

Minimal runnable backend for Task Manager.

## Prerequisites

| Tool   | Version used    |
|--------|-----------------|
| Java   | OpenJDK 17.0.18 |
| Maven  | 3.9.12          |
| Docker | 29.3.1          |

## Docker image

The backend includes a `Dockerfile` that runs the packaged Spring Boot jar.

Build jar + Docker image:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn clean package
docker build -t task-manager-backend:latest .
```

Run container:

```bash
docker run --rm -p 8080:8080 task-manager-backend:latest
```

API base URL: `http://localhost:8080/api/tasks`.

## Docker Compose (from repo root)

The repo-level `docker-compose.yml` includes a `backend` service that builds this Docker image.

Package the jar first (required by current `Dockerfile`):

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn clean package
```

Run with Compose:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager
docker compose up --build
```

## Canonical backend layout

```text
backend/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/backend/
    │   │   ├── controller/
    │   │   ├── dto/
    │   │   ├── model/
    │   │   ├── repository/
    │   │   ├── service/
    │   │   └── TaskManagerApplication.java
    │   └── resources/
    └── test/
        ├── java/
        └── resources/
```

## Run

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn spring-boot:run
```

Server starts at `http://localhost:8080`.

If `8080` is in use, run on `8081`:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

## Build check

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn test
```

## API endpoints

```text
POST    /api/tasks
GET     /api/tasks
GET     /api/tasks/{id}
PUT     /api/tasks/{id}
DELETE  /api/tasks/{id}

PATCH   /api/tasks/{id}/complete
PATCH   /api/tasks/{id}/pending

GET     /api/tasks/search?keyword={keyword}
GET     /api/tasks?status={status}

GET     /api/tasks/stats
```

## Quick API test with curl

```bash
curl -i -X POST http://localhost:8080/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Learn Spring","description":"Build task APIs","status":"PENDING"}'

curl -i http://localhost:8080/api/tasks

curl -i http://localhost:8080/api/tasks/1

curl -i -X PUT http://localhost:8080/api/tasks/1 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Learn Spring Boot","description":"CRUD done","status":"DONE"}'

curl -i -X PATCH http://localhost:8080/api/tasks/1/complete

curl -i -X PATCH http://localhost:8080/api/tasks/1/pending

curl -i "http://localhost:8080/api/tasks/search?keyword=spring"

curl -i "http://localhost:8080/api/tasks?status=PENDING"

curl -i http://localhost:8080/api/tasks/stats

curl -i -X DELETE http://localhost:8080/api/tasks/1
```

