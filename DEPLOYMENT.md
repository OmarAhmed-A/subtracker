# SubTracker Deployment Guide

This guide covers deploying SubTracker to a VPS and exposing it through a Cloudflare Tunnel.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Docker Deployment](#local-docker-deployment)
- [VPS Deployment](#vps-deployment)
  - [Option A: Build on VPS](#option-a-build-on-vps)
  - [Option B: Build Locally and Transfer Image](#option-b-build-locally-and-transfer-image)
- [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
- [Updating the Deployment](#updating-the-deployment)
- [Migrating the Database](#migrating-the-database)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- A server with Docker and Docker Compose installed
- A Cloudflare account with a domain managed by Cloudflare
- (Optional) SSH access to the server

## Local Docker Deployment

The simplest way to run SubTracker locally:

```bash
docker compose up -d
```

The app will be available at http://localhost:8000.

Data is persisted in a bind-mounted `./data` directory relative to `docker-compose.yml`.

To stop:

```bash
docker compose down
```

## VPS Deployment

### Option A: Build on VPS

Use this if your VPS has reliable internet access and can pull from npm/GitHub.

1. SSH into the server:

   ```bash
   ssh user@vps
   ```

2. Clone the repository:

   ```bash
   git clone https://github.com/OmarAhmed-A/subtracker.git
   cd subtracker
   ```

3. Set a strong secret in `docker-compose.yml` or an `.env` file:

   ```yaml
   environment:
     - SECRET_KEY=your-random-secret-here
   ```

4. Build and start:

   ```bash
   docker compose up -d
   ```

### Option B: Build Locally and Transfer Image

Use this if the VPS has limited internet access (e.g., no IPv4 connectivity to npm/GitHub).

1. Build the image on your local machine:

   ```bash
   docker build -t subtracker-subtracker:latest .
   ```

2. Save the image to a tar file:

   ```bash
   docker save subtracker-subtracker:latest -o subtracker-image.tar
   ```

3. Transfer the tar to the VPS:

   ```bash
   rsync -avz --partial --progress subtracker-image.tar user@vps:~/subtracker-image.tar
   ```

4. SSH into the VPS and load the image:

   ```bash
   ssh user@vps
   docker load -i subtracker-image.tar
   ```

5. Copy the project files (excluding `node_modules`, `.git`, etc.) to the VPS so `docker-compose.yml` is available:

   ```bash
   rsync -avz --exclude='.git' --exclude='node_modules' \
     --exclude='backend/data' --exclude='frontend/dist' \
     ./ user@vps:~/subtracker/
   ```

6. Start the container without rebuilding:

   ```bash
   cd ~/subtracker
   docker compose up -d --no-build
   ```

### Production Checklist

- Set a strong `SECRET_KEY`
- Ensure the `./data` directory is persisted (bind-mounted by default)
- If serving over HTTPS, set `cookie.secure = true` in `backend/server.js`
- Consider automating backups of `./data/subtracker.db`

## Cloudflare Tunnel Setup

1. Install `cloudflared` on the VPS:

   ```bash
   # Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
   # Example for Debian/Ubuntu:
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. Authenticate and create a tunnel:

   ```bash
   cloudflared tunnel login
   cloudflared tunnel create subtracker
   ```

3. Configure the tunnel public hostname to point to the local SubTracker instance:

   ```yaml
   # /etc/cloudflared/config.yml
   tunnel: <tunnel-id>
   credentials-file: /etc/cloudflared/<tunnel-id>.json

   ingress:
     - hostname: fin.yourdomain.com
       service: http://localhost:8000
     - service: http_status:404
   ```

4. Run the tunnel:

   ```bash
   cloudflared tunnel run subtracker
   ```

   Or set it up as a systemd service:

   ```bash
   sudo cloudflared service install
   sudo systemctl start cloudflared
   ```

5. Create a DNS record in Cloudflare pointing `fin.yourdomain.com` to the tunnel.

6. Open `https://fin.yourdomain.com` in a browser.

## Updating the Deployment

### With internet access on VPS

```bash
ssh user@vps
cd ~/subtracker
git pull
docker compose down
docker compose up -d --build
```

### Without internet access on VPS (image transfer method)

On your local machine:

```bash
docker build -t subtracker-subtracker:latest .
docker save subtracker-subtracker:latest -o subtracker-image.tar
rsync -avz --partial --progress subtracker-image.tar user@vps:~/subtracker-image.tar
```

On the VPS:

```bash
cd ~/subtracker
docker compose down
docker load -i ~/subtracker-image.tar
docker compose up -d --no-build
```

## Migrating the Database

The SQLite database lives at `./data/subtracker.db` on the host (mounted into `/app/data/subtracker.db` in the container).

### Back up the database

```bash
cp data/subtracker.db data/subtracker.db.backup.$(date +%Y%m%d)
```

### Copy a local database to the VPS

1. Stop the VPS container:

   ```bash
   ssh user@vps
cd ~/subtracker
   docker compose down
   ```

2. Copy the local database:

   ```bash
   scp data/subtracker.db user@vps:~/subtracker/data/subtracker.db
   ```

3. Start the container:

   ```bash
   ssh user@vps 'cd ~/subtracker && docker compose up -d'
   ```

### Copy the VPS database locally

```bash
scp user@vps:~/subtracker/data/subtracker.db ./data/subtracker.db
```

## Troubleshooting

### `docker: command not found`

Install Docker on the VPS. On Ubuntu/Debian:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### `npm ci` fails during build

If the VPS cannot reach npm/GitHub, build the image locally and transfer it as described in Option B.

### Sessions are lost after container restart

Ensure you are running an image that uses the SQLite session store (`backend/session-store.js`). Older images used `MemoryStore`, which loses sessions on restart.

### `monthly_total is null` error in browser

This happens when the dashboard response contains `null` for totals (caused by `NaN` being serialized to JSON). It has been fixed by validating subscription costs and guarding against `NaN` in the dashboard endpoint. Update to the latest image.

### Port 8000 is already in use

Find and stop the existing process:

```bash
sudo ss -tlnp | grep 8000
sudo kill <pid>
```

Or change the host port in `docker-compose.yml`:

```yaml
ports:
  - "8080:8000"
```

### Cloudflare beacon/script errors in browser console

Cloudflare may inject an analytics beacon at the edge. These errors are harmless and do not affect app functionality. They can be disabled in the Cloudflare dashboard under **Speed → Optimization** or by disabling Cloudflare Web Analytics.
