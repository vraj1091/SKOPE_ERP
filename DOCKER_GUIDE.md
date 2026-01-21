# 🐳 Docker Deployment Guide for SKOPE ERP

This guide will help you deploy the SKOPE ERP Store Management System using Docker.

## 📋 Prerequisites

- Docker Desktop installed (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0 or higher
- At least 4GB of available RAM
- 10GB of free disk space

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vraj1091/SKOPE_ERP.git
cd SKOPE_ERP
```

### 2. Configure Environment Variables

Copy the example environment file and customize it:

```bash
copy .env.example .env
```

Edit `.env` file and update the following:
- `SECRET_KEY`: Use a strong random string (generate with: `openssl rand -hex 32`)
- `POSTGRES_PASSWORD`: Set a strong database password
- Other configuration as needed

### 3. Build and Start Services

**For Production:**

```bash
docker-compose up -d
```

**For Development (with hot reload):**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Initialize the Database

Run database migrations and seed initial data:

```bash
# Access the backend container
docker exec -it skope_erp_backend bash

# Inside the container, run:
python init_db.py
python seed_data.py
python setup_complete_database.py

# Exit the container
exit
```

### 5. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

## 🛠️ Docker Commands Reference

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start with logs visible
docker-compose up
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f backend
```

### Rebuilding Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build
```

### Accessing Containers

```bash
# Access backend container
docker exec -it skope_erp_backend bash

# Access database container
docker exec -it skope_erp_db psql -U skope_user -d skope_erp

# Access frontend container
docker exec -it skope_erp_frontend sh
```

## 📊 Database Management

### Backup Database

```bash
# Create backup
docker exec skope_erp_db pg_dump -U skope_user skope_erp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
cat backup_file.sql | docker exec -i skope_erp_db psql -U skope_user -d skope_erp
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm store_management_postgres_data

# Restart services
docker-compose up -d

# Re-initialize database
docker exec -it skope_erp_backend python init_db.py
docker exec -it skope_erp_backend python setup_complete_database.py
```

## 🔧 Troubleshooting

### Container Won't Start

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service_name]

# Check resource usage
docker stats
```

### Database Connection Issues

```bash
# Check if database is ready
docker exec skope_erp_db pg_isready -U skope_user

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Port Already in Use

If you get "port already in use" errors, modify the ports in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 80 to 8080 or any available port
  
  backend:
    ports:
      - "8001:8000"  # Change 8000 to 8001 or any available port
```

### Clear Everything and Start Fresh

```bash
# Stop all containers
docker-compose down

# Remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start
docker-compose up -d --build
```

## 🌐 Production Deployment

### Using PostgreSQL in Production

The Docker setup uses PostgreSQL by default. For production:

1. **Set strong passwords** in `.env`
2. **Use environment-specific secrets**
3. **Enable SSL/TLS** for database connections
4. **Regular backups** (see Database Management section)

### Environment Variables for Production

```env
SECRET_KEY=<generate-strong-random-key>
POSTGRES_PASSWORD=<strong-database-password>
DATABASE_URL=postgresql://skope_user:<password>@db:5432/skope_erp
```

### Scaling Services

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3
```

### Using Docker Swarm (Advanced)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml skope_erp

# View services
docker service ls

# Scale service
docker service scale skope_erp_backend=3
```

## 📦 Volume Management

### List Volumes

```bash
docker volume ls
```

### Inspect Volume

```bash
docker volume inspect store_management_postgres_data
```

### Backup Volume

```bash
docker run --rm -v store_management_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for database and secret keys
3. **Keep Docker images updated**: `docker-compose pull`
4. **Limit container resources** in docker-compose.yml
5. **Use Docker secrets** for sensitive data in production
6. **Enable firewall rules** to restrict access
7. **Regular security updates**: `docker-compose build --pull`

## 📈 Monitoring

### Health Checks

All services have health checks configured. View status:

```bash
docker-compose ps
```

### Resource Usage

```bash
# View real-time stats
docker stats

# View specific container
docker stats skope_erp_backend
```

## 🆘 Getting Help

- Check logs: `docker-compose logs`
- Verify health: `docker-compose ps`
- Restart services: `docker-compose restart`
- Full reset: `docker-compose down -v && docker-compose up -d --build`

## 📝 Default Credentials

After running `setup_complete_database.py`:

- **Admin**: admin@example.com / admin123
- **Manager**: manager@example.com / manager123
- **Staff**: staff@example.com / staff123

**⚠️ Change these credentials immediately in production!**

## 🎯 Next Steps

1. Access the application at http://localhost
2. Login with default credentials
3. Change default passwords
4. Configure marketing integrations (optional)
5. Upload your store data
6. Start managing your retail operations!

---

**Need help?** Check the main README.md or create an issue on GitHub.
