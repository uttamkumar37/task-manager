# Commands Reference

Quick-copy commands for day-to-day development on this project.

---

## Table of contents

- [Version checks](#version-checks)
- [Git — setup](#git--setup)
- [Git — daily workflow](#git--daily-workflow)
- [Git — push & pull](#git--push--pull)
- [Git — branch](#git--branch)
- [Git — reset & undo](#git--reset--undo)
- [Git — log & diff](#git--log--diff)
- [Git — stash](#git--stash)
- [Git — tag](#git--tag)
- [Maven — build & test](#maven--build--test)
- [IntelliJ IDEA — Spring Boot workflow (backend)](#intellij-idea--spring-boot-workflow-backend)
- [Docker — full backend workflow (Spring Boot)](#docker--full-backend-workflow-spring-boot)
- [Docker — image](#docker--image)
- [Docker — container](#docker--container)
- [Docker Compose — start & stop project](#docker-compose--start--stop-project)
- [Project — run locally (no Docker)](#project--run-locally-no-docker)

---

## Version checks

```bash
java -version          # OpenJDK 17.0.18
mvn -version           # Apache Maven 3.9.12
node -v                # v20.20.2
npm -v                 # 10.8.2
git --version          # git version 2.39.5 (Apple Git-154)
docker --version       # Docker 29.3.1
docker compose version # Docker Compose v5.1.1
```

---

## Git — setup

```bash
# Show current identity
git config --global user.name
git config --global user.email

# Set identity
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"

# Initialise a new repo
git init

# Clone an existing repo
git clone https://github.com/<user>/<repo>.git
git clone https://github.com/<user>/<repo>.git <folder-name>
```

---

## Git — daily workflow

```bash
# Check working tree status
git status

# Stage files
git add .                    # all changes
git add <file>               # specific file
git add src/                 # specific folder

# Commit
git commit -m "feat: your message"
git commit --amend -m "updated message"   # fix last commit message (before push)

# Show what is staged vs committed
git diff --staged
```

---

## Git — push & pull

```bash
# Push to remote
git push
git push origin main
git push -u origin <branch>   # set upstream and push

# Pull latest changes
git pull
git pull origin main

# Fetch without merging
git fetch origin

# Pull with rebase (cleaner history)
git pull --rebase origin main
```

---

## Git — branch

```bash
# List branches
git branch            # local
git branch -r         # remote
git branch -a         # all

# Create and switch to new branch
git checkout -b <branch-name>
git switch -c <branch-name>   # modern equivalent

# Switch branch
git checkout <branch-name>
git switch <branch-name>

# Rename current branch
git branch -m <new-name>

# Delete branch (local)
git branch -d <branch-name>   # safe (only if merged)
git branch -D <branch-name>   # force

# Delete branch (remote)
git push origin --delete <branch-name>

# Merge branch into current
git merge <branch-name>

# Rebase current branch onto target
git rebase <branch-name>
```

---

## Git — reset & undo

```bash
# Unstage a file (keep changes in working tree)
git restore --staged <file>

# Discard changes in working tree
git restore <file>

# Soft reset — move HEAD back, keep changes staged
git reset --soft HEAD~1

# Mixed reset (default) — move HEAD back, unstage changes
git reset HEAD~1
git reset --mixed HEAD~1

# Hard reset — discard all changes and go back N commits
git reset --hard HEAD~1
git reset --hard HEAD~3

# Hard reset to match remote (DANGER — local changes lost)
git reset --hard origin/main

# Revert a commit (safe, creates new undo commit)
git revert <commit-hash>

# Clean untracked files
git clean -n             # dry run — see what would be removed
git clean -fd            # force delete untracked files and dirs
```

---

## Git — log & diff

```bash
# Commit history
git log
git log --oneline
git log --oneline --graph --all   # visual branch tree

# Show a specific commit
git show <commit-hash>

# Diff between working tree and last commit
git diff

# Diff between two branches
git diff main..<branch-name>

# Diff between two commits
git diff <hash-a> <hash-b>
```

---

## Git — stash

```bash
# Save current changes aside
git stash
git stash push -m "wip: description"

# List stashes
git stash list

# Apply latest stash (keep in stash list)
git stash apply

# Apply and remove from stash list
git stash pop

# Apply a specific stash
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

---

## Git — tag

```bash
# List tags
git tag

# Create lightweight tag
git tag v1.0.0

# Create annotated tag (recommended for releases)
git tag -a v1.0.0 -m "Release v1.0.0"

# Push tags to remote
git push origin v1.0.0
git push origin --tags   # all tags

# Delete tag locally
git tag -d v1.0.0

# Delete tag on remote
git push origin --delete v1.0.0
```

---

## Maven — build & test

```bash
# Check version
mvn -version

# Compile
mvn compile

# Run tests
mvn test

# Package jar (skipping tests)
mvn clean package -DskipTests

# Package jar (running tests)
mvn clean package

# Run Spring Boot app
cd backend
mvn spring-boot:run

# Run on a different port
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081

# Clean build output
mvn clean
```

---

## IntelliJ IDEA — Spring Boot workflow (backend)

```bash
# 1) Open project in IntelliJ
# Open folder: backend

# 2) Reload Maven project
# Right-click pom.xml -> Reload Maven Project

# 3) Build from terminal (optional but recommended)
cd backend
mvn clean package -DskipTests

# 4) Run app in IntelliJ
# Open TaskManagerApplication.java and click Run

# 5) Verify app started
# Check console: Tomcat started on port(s): 8080

# 6) Test API
curl http://localhost:8080/api/tasks

# 7) Stop app
# Click Stop in IntelliJ

# 8) Rebuild after code changes
cd backend
mvn clean package -DskipTests
# Run again from IntelliJ

# 9) Debug mode
# Click Debug, place breakpoints, inspect variables

# 10) Check errors
# Review IntelliJ Run/Debug console for compile/runtime errors
```

If Docker is already using `8080`, set backend port in `backend/src/main/resources/application.properties`:

```bash
server.port=8081
```

Daily short flow: `Open backend -> Run -> Test -> Stop`

Flow summary: `Code -> IntelliJ Run -> Spring Boot Start -> API -> Test`

---

## Docker — full backend workflow (Spring Boot)

```bash
# Go to backend
cd backend

# Optional fresh cleanup (DANGER: removes unused images/containers/networks)
docker system prune -a

# Build jar
mvn clean package -DskipTests

# Build image
docker build -t task-manager .

# Run container
docker run -d -p 8080:8080 --name task-manager task-manager

# Verify running
docker ps

# Follow logs
docker logs -f task-manager

# Quick test
curl http://localhost:8080/api/tasks

# Stop + remove container
docker stop task-manager
docker rm task-manager

# Rebuild after code change
mvn clean package -DskipTests
docker build -t task-manager .
docker rm -f task-manager
docker run -d -p 8080:8080 --name task-manager task-manager

# Optional cleanup image
docker rmi task-manager

# Debug helpers
docker logs task-manager
docker ps -a
docker images
```

Flow: `Code -> Maven Build -> JAR -> Docker Build -> Container Run -> Logs -> Test`

---

## Docker — image

```bash
# Check version
docker --version

# Build image from backend Dockerfile (package jar first)
cd backend && mvn clean package && cd ..
docker build -t task-manager-backend:latest ./backend

# List images
docker images

# Remove an image
docker rmi task-manager-backend:latest

# Remove all unused images
docker image prune -a   # DANGER: removes all unused local images
```

---

## Docker — container

```bash
# Run backend container
docker run --rm -p 8080:8080 task-manager-backend:latest

# Run in background (detached)
docker run -d --name task-manager-backend -p 8080:8080 task-manager-backend:latest

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs task-manager-backend
docker logs -f task-manager-backend   # follow / live tail

# Stop a running container
docker stop task-manager-backend

# Remove a stopped container
docker rm task-manager-backend

# Stop and remove in one step
docker rm -f task-manager-backend

# Open a shell inside a running container
docker exec -it task-manager-backend sh

# Remove all stopped containers
docker container prune
```

---

## Docker Compose — start & stop project

```bash
# ── START ──────────────────────────────────────────────
# Package jar first (Dockerfile copies the jar)
cd backend && mvn clean package && cd ..

# Build images and start all services
docker compose up --build

# Start in background (detached)
docker compose up --build -d

# ── LOGS ───────────────────────────────────────────────
docker compose logs
docker compose logs -f           # live follow
docker compose logs -f backend   # backend service only

# ── STATUS ─────────────────────────────────────────────
docker compose ps

# ── STOP ───────────────────────────────────────────────
# Stop containers (keep volumes/networks)
docker compose stop

# Stop and remove containers + networks
docker compose down

# Stop and remove containers + networks + volumes
docker compose down -v

# Stop and remove containers + networks + images
docker compose down --rmi all
```

API available at: `http://localhost:8080/api/tasks`

---

## Project — run locally (no Docker)

```bash
# ── START ──────────────────────────────────────────────
cd backend
mvn spring-boot:run

# ── STOP ───────────────────────────────────────────────
# Press Ctrl + C in the terminal running the app

# ── BUILD CHECK (compile + test) ───────────────────────
cd backend
mvn test
```

API available at: `http://localhost:8080/api/tasks`
H2 console at: `http://localhost:8080/h2-console`

