#!/usr/bin/env bash
# Render build script for SKOPE ERP

echo "=========================================="
echo "Starting SKOPE ERP Build Process"
echo "=========================================="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Create data directory for SQLite database (persistent storage)
echo "Creating data directory..."
mkdir -p /opt/render/project/src/data

# Set up database
echo "Setting up database..."
cd backend

# Run database setup and seed script
python setup_and_seed.py --reset

echo "=========================================="
echo "Build Complete!"
echo "=========================================="
