# 🐳 Docker Setup Guide

This guide will help you run the Rotkehlchen backend using Docker, which handles all dependencies automatically.

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Build and run the backend**:
   ```bash
   docker-compose up --build
   ```

2. **Run in background**:
   ```bash
   docker-compose up -d --build
   ```

3. **Stop the backend**:
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker Commands

1. **Build the image**:
   ```bash
   docker build -t rotkehlchen-backend .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name rotkehlchen-backend \
     -p 4242:4242 \
     -v $(pwd)/data:/data \
     -v $(pwd)/logs:/logs \
     -e CORS_ORIGIN=http://localhost:3000 \
     rotkehlchen-backend
   ```

## 🔧 Configuration

### Environment Variables

- `API_HOST`: Host to bind to (default: `0.0.0.0`)
- `API_PORT`: Port to run on (default: `4242`)
- `DATA_DIR`: Data directory (default: `/data`)
- `CORS_ORIGIN`: CORS origin for frontend (default: `http://localhost:3000`)

### Volumes

- `./data:/data` - Persistent storage for blockchain data, databases, etc.
- `./logs:/logs` - Log files

## 🌐 API Access

Once running, the API will be available at:
- **Base URL**: `http://localhost:4242/api/1/`
- **Health Check**: `http://localhost:4242/api/1/ping`
- **Version Info**: `http://localhost:4242/api/1/version`

## 🧪 Testing the Backend

Test if the backend is running correctly:

```bash
# Health check
curl http://localhost:4242/api/1/ping

# Version info
curl http://localhost:4242/api/1/version

# Check running containers
docker ps

# View logs
docker-compose logs -f rotkehlchen-backend
```

## 🛠️ Development

### Rebuilding After Changes

```bash
# Rebuild and restart
docker-compose up --build

# Force rebuild (no cache)
docker-compose build --no-cache
docker-compose up
```

### Debugging

```bash
# View logs
docker-compose logs -f

# Execute into container
docker-compose exec rotkehlchen-backend bash

# Stop and remove everything
docker-compose down --volumes --remove-orphans
```

## 📁 Directory Structure

After running, you'll have:
```
Backend/
├── data/           # Blockchain data, databases (persistent)
├── logs/           # Application logs
├── docker-compose.yml
└── Dockerfile
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 4242
lsof -i :4242

# Kill process using the port
kill $(lsof -ti:4242)
```

### Container Won't Start
```bash
# Check container logs
docker-compose logs rotkehlchen-backend

# Remove and rebuild
docker-compose down
docker-compose up --build
```

### Reset Everything
```bash
# Stop and remove containers, volumes, and images
docker-compose down --volumes --remove-orphans
docker system prune -a
```

## 🔒 Production Considerations

For production deployment:

1. **Use environment variables** for sensitive configuration
2. **Set up proper reverse proxy** (nginx/traefik)
3. **Configure SSL/TLS** certificates
4. **Set up log rotation**
5. **Monitor container health**
6. **Backup data directory** regularly

## ✅ Success!

If everything is working, you should see:
- Container running: `docker ps` shows the backend container
- Health check passing: `curl http://localhost:4242/api/1/ping` returns `{"result": "pong"}`
- Logs showing successful startup in `docker-compose logs`

Your backend is now ready for frontend integration! 🎉 