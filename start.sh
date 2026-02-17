#!/usr/bin/env bash
# Render start script for SKOPE ERP

echo "=========================================="
echo "Starting SKOPE ERP Backend Server"
echo "=========================================="

cd backend

# Check if database exists, if not create it
if [ ! -f "skope_erp.db" ]; then
    echo "Database not found. Creating and seeding..."
    python setup_and_seed.py --reset
fi

# Start the FastAPI server
echo "Starting uvicorn server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
