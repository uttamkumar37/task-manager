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

## Full Docker workflow (single container)

Use this flow when you want to run only backend as one Docker container.

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend

# Optional fresh cleanup (DANGER: removes unused Docker resources)
docker system prune -a

# Build jar and image
mvn clean package -DskipTests
docker build -t task-manager .

# Start container
docker run -d -p 8080:8080 --name task-manager task-manager

# Verify and inspect
docker ps
docker logs -f task-manager
curl http://localhost:8080/api/tasks

# Stop and remove
docker stop task-manager
docker rm task-manager

# Rebuild loop after code changes
mvn clean package -DskipTests
docker build -t task-manager .
docker rm -f task-manager
docker run -d -p 8080:8080 --name task-manager task-manager

# Debug helpers
docker logs task-manager
docker ps -a
docker images
```

Flow: `Code -> Maven Build -> JAR -> Docker Build -> Container Run -> Logs -> Test`

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

## IntelliJ Spring Boot workflow (backend)

1. Open IntelliJ IDEA and open folder: `backend`.
2. Reload Maven: right-click `pom.xml` -> **Reload Maven Project**.
3. Build once from terminal:

```bash
cd /Users/uttamkumar/uttam-all-data/01_github-projects/task-manager/backend
mvn clean package -DskipTests
```

4. Open `TaskManagerApplication.java` and click **Run**.
5. Verify startup in IntelliJ console (`Tomcat started on port(s): 8080`).
6. Test API:

```bash
curl http://localhost:8080/api/tasks
```

7. Stop app with IntelliJ **Stop** button.
8. After code changes, run build again and start with **Run**.
9. Use **Debug** for breakpoints and variable inspection.
10. Check IntelliJ console for compile/runtime errors and fix before rerun.

If Docker is already using `8080`, set a different port in `src/main/resources/application.properties`:

```bash
server.port=8081
```

Daily short flow: `Open backend -> Run -> Test -> Stop`

Flow summary: `Code -> IntelliJ Run -> Spring Boot Start -> API -> Test`

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

