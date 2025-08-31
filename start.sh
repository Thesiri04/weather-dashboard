#!/bin/bash

echo "=== Starting Weather Dashboard ==="

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check if MongoDB container is running
if ! docker ps | grep -q mongodb; then
    echo "MongoDB container is not running. Starting it..."
    if docker ps -a | grep -q mongodb; then
        docker start mongodb
    else
        echo "MongoDB container not found. Please run setup.sh first."
        exit 1
    fi
    
    echo "Waiting for MongoDB to be ready..."
    sleep 5
fi

# Kill any existing processes on our ports
echo "Checking for existing processes..."
if check_port 5000; then
    echo "Port 5000 is available for backend"
else
    echo "Stopping process on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if check_port 3000; then
    echo "Port 3000 is available for frontend"
else
    echo "Stopping process on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start backend in background
echo "Starting backend server on port 5000..."
cd backend
npm start &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

# Wait a moment for frontend to start
sleep 3

echo ""
echo "=== Weather Dashboard Started Successfully! ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo "MongoDB: Running in Docker container"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "Services stopped."
    exit 0
}

# Set trap to cleanup on script termination
trap cleanup SIGINT SIGTERM

# Keep script running and show logs
echo "=== Application Logs ==="
echo "Watching for requests... (Press Ctrl+C to stop)"

# Wait for processes to finish
wait
