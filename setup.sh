#!/bin/bash

echo "=== Weather Dashboard Setup ==="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    echo "You can install it using:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies  
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed or not in PATH."
    echo "Please make sure Docker is installed and running."
    echo "You can install Docker using: sudo apt-get install docker.io"
    exit 1
fi

echo "Docker version: $(docker --version)"

# Check if MongoDB container is running
if ! docker ps | grep -q mongodb; then
    echo "MongoDB container is not running."
    echo "Starting MongoDB container..."
    
    # Check if container exists but is stopped
    if docker ps -a | grep -q mongodb; then
        echo "Starting existing MongoDB container..."
        docker start mongodb
    else
        echo "Creating new MongoDB container..."
        docker run -d \
            --name mongodb \
            -p 27017:27017 \
            -v "$(pwd)/mongodb/data:/data/db" \
            mongo:latest
    fi
    
    # Wait for MongoDB to be ready
    echo "Waiting for MongoDB to be ready..."
    sleep 10
    
    # Check if MongoDB is accessible
    if docker exec mongodb mongosh --eval "db.runCommand('ping').ok" &> /dev/null; then
        echo "MongoDB is ready!"
    else
        echo "MongoDB might still be starting up. This is normal for the first run."
    fi
else
    echo "MongoDB container is already running!"
fi

echo "Setup completed!"
echo ""
echo "To start the application:"
echo "1. Run: ./start.sh"
echo "2. Open your browser to http://localhost:3000"
echo ""
echo "MongoDB container info:"
docker ps | grep mongodb || echo "MongoDB container not found"
