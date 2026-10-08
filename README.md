# Notes App

A simple full-stack notes application running with Docker Compose.

The application includes a static frontend served by Nginx, a Node.js and Express backend API, and a MySQL database for persistent storage.

## Features

- View saved notes
- Add notes up to 280 characters
- Delete notes
- Display API and database status
- Persist database data with a Docker volume
- Proxy `/api/` requests through Nginx
- Run the complete stack with one Compose command

## Application architecture

```text
Browser
  │
  │ http://localhost:8080
  ▼
Frontend container
Nginx serves the UI and proxies /api/
  │
  ▼
Backend container
Node.js and Express API
  │
  ▼
MySQL container
Persistent notes database
```

The browser uses relative API paths such as `/api/notes`. Nginx forwards those requests to the backend service over the Docker network.

## Tech stack

- HTML, CSS, and JavaScript
- Nginx
- Node.js 20
- Express
- MySQL 8.0
- Docker
- Docker Compose
- Docker Hub

## Prerequisites

Install the following before starting:

- Git
- Docker Engine with Docker Compose, or Docker Desktop
- A Docker Hub account is not required because the published application images are public

Verify the installations:

```bash
git --version
docker --version
docker compose version
```

## Clone the repository

```bash
git clone https://github.com/Habeebwasif/notes-app.git
```

Navigate into the project:

```bash
cd notes-app
```

If you downloaded the repository as a ZIP file, extract it and open a terminal in the extracted project directory.

## Configure environment variables

Create a `.env` file in the same directory as `docker-compose.yml`.

Linux or macOS:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

If `.env.example` is not included, create `.env` manually:

```env
FRONTEND_PORT=8080
DB_HOST=mysql
DB_PORT=3306
DB_NAME=notesdb
DB_USER=notesuser
DB_PASSWORD=change-this-password
MYSQL_ROOT_PASSWORD=change-this-root-password
```

### Environment variables

| Variable | Required | Description | Example |
|---|---:|---|---|
| `FRONTEND_PORT` | Yes | Host port for the frontend | `8080` |
| `DB_HOST` | Yes | MySQL Compose service name | `mysql` |
| `DB_PORT` | Yes | MySQL port inside the network | `3306` |
| `DB_NAME` | Yes | Application database name | `notesdb` |
| `DB_USER` | Yes | Application database user | `notesuser` |
| `DB_PASSWORD` | Yes | Application database password | `change-this-password` |
| `MYSQL_ROOT_PASSWORD` | Yes | MySQL root password | `change-this-root-password` |

Use different, strong passwords for real deployments. Do not commit `.env` to GitHub.

## Run the application

The Compose file uses the public Docker Hub images:

```text
habeebwasif/notes-frontend:latest
habeebwasif/notes-api:latest
mysql:8.0
```

Pull the images and start the services in the background:

```bash
docker compose up --pull always -d
```

The `--pull always` option checks for the latest image versions before starting the services.

Check the service status:

```bash
docker compose ps
```

The frontend, backend, and MySQL services should be running. The backend and MySQL services should become healthy.

Open the application:

```text
http://localhost:8080
```

## Verify that it works

### Check the frontend

```bash
curl http://localhost:8080/
```

The response should contain the frontend HTML.

### Check the API through Nginx

```bash
curl http://localhost:8080/api/notes
```

An empty database returns:

```json
[]
```

### Check the API and database health

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{"status":"ok","db":"up"}
```

### Add a note

Linux or macOS:

```bash
curl -i -X POST http://localhost:8080/api/notes \
  -H 'Content-Type: application/json' \
  --data '{"text":"Test note"}'
```

PowerShell:

```powershell
$body = @{ text = "Test note" } | ConvertTo-Json
Invoke-WebRequest `
  -UseBasicParsing `
  -Uri http://localhost:8080/api/notes `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

A successful request returns HTTP `201 Created`.

### Delete a note

Replace `NOTE_ID` with the ID returned when the note was created:

```bash
curl -i -X DELETE http://localhost:8080/api/notes/NOTE_ID
```

A successful request returns HTTP `204 No Content`.

You can also add and delete notes directly from the browser interface.

## Useful Docker Compose commands

View logs for all services:

```bash
docker compose logs -f
```

View backend logs:

```bash
docker compose logs -f backend
```

View service status:

```bash
docker compose ps
```

Stop containers while retaining database data:

```bash
docker compose down
```

Restart the application:

```bash
docker compose up --pull always -d
```

Stop containers and delete the MySQL volume:

```bash
docker compose down -v
```

The `-v` option permanently deletes the stored database data.

## Docker Hub images

Backend image:

```text
https://hub.docker.com/r/habeebwasif/notes-api
```

Frontend image:

```text
https://hub.docker.com/r/habeebwasif/notes-frontend
```

Pull the images directly:

```bash
docker pull habeebwasif/notes-api:latest
docker pull habeebwasif/notes-frontend:latest
docker pull mysql:8.0
```

## Fresh deployment test

To test the application using only the published images:

```bash
docker compose down -v --remove-orphans
docker image rm -f habeebwasif/notes-api:latest habeebwasif/notes-frontend:latest mysql:8.0
docker compose up --pull always -d
```

Verify the result:

```bash
docker compose ps
curl http://localhost:8080/health
curl http://localhost:8080/api/notes
```

The application should start without any local Dockerfile build. The database starts empty after `down -v` and creates its schema when the backend starts.

## Docker best practices used

- Use small Alpine-based runtime images.
- Use a multi-stage build for the Node.js backend.
- Install production dependencies only with `npm ci --omit=dev`.
- Run the backend as the non-root `node` user.
- Copy dependency files before source files to improve build caching.
- Exclude unnecessary files with `.dockerignore`.
- Keep secrets out of Dockerfiles and images.
- Use environment variables for database configuration.
- Use a persistent named volume for MySQL data.
- Use a custom Docker network for service communication.
- Add healthchecks for the frontend, backend, and database.
- Wait for a healthy database before starting the backend.
- Serve static assets with Nginx instead of running a Node.js development server.
- Use relative frontend API paths to avoid hard-coded hostnames.
- Use public, versioned image repositories for repeatable deployments.

## What you will learn

After completing this project, you will understand how to:

- Write a production-oriented Dockerfile.
- Use multi-stage Docker builds.
- Run a container as a non-root user.
- Optimize Docker build caching.
- Create a useful `.dockerignore` file.
- Serve static files with Nginx.
- Configure an Nginx reverse proxy.
- Connect services over a Docker Compose network.
- Configure a Node.js API with environment variables.
- Run MySQL with persistent storage.
- Add and use container healthchecks.
- Control startup order with `depends_on` conditions.
- Publish images to Docker Hub.
- Run an application from Docker Hub without source code.
- Test a complete multi-container application from a clean Docker state.

## Security notes

- Never commit `.env` or real passwords to GitHub.
- Use strong, unique database passwords.
- Avoid exposing MySQL port `3306` publicly.
- In production, expose only the frontend port publicly.
- Pin image versions or digests for stricter release reproducibility.
- Keep Docker and base images updated.


