# Task Manager

Monorepo-style project with separate backend and frontend apps.

## Project structure

```text
task-manager/
├── .github/
│   └── workflows/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/backend/
│       │   │   ├── controller/
│       │   │   ├── dto/
│       │   │   ├── model/
│       │   │   ├── repository/
│       │   │   ├── service/
│       │   │   └── TaskManagerApplication.java
│       │   └── resources/
│       └── test/
│           ├── java/
│           └── resources/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       └── services/
├── docker-compose.yml
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

