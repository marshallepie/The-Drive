#!/bin/bash

# Setup script for initializing the database

set -e

echo "Starting database setup..."

# Start Docker containers
echo "Starting PostgreSQL and Redis containers..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U drive_user -d drive_db > /dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready!"

# Run migrations
echo "Running database migrations..."
cd apps/api
npm run migrate up

echo ""
echo "Database setup complete!"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: drive_db"
echo "  User: drive_user"
echo "  Password: drive_password"
echo ""
echo "Update your apps/api/.env file with:"
echo "DATABASE_URL=postgresql://drive_user:drive_password@localhost:5432/drive_db"
