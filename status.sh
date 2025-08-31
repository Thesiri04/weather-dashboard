#!/bin/bash

echo "=== Weather Dashboard Status ==="
echo ""

# Check MongoDB container
echo "📦 MongoDB Container:"
if docker ps | grep -q mongodb; then
    echo "  ✅ Running"
    docker ps | grep mongodb | awk '{print "  📍 Container:", $1, $2}'
else
    echo "  ❌ Not running"
    if docker ps -a | grep -q mongodb; then
        echo "  ⚠️  Container exists but stopped"
    else
        echo "  ❌ Container doesn't exist"
    fi
fi

echo ""

# Check backend process
echo "🖥️  Backend Server (Port 5000):"
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ✅ Running"
    PID=$(lsof -ti:5000)
    echo "  📍 PID: $PID"
else
    echo "  ❌ Not running"
fi

echo ""

# Check frontend process
echo "🌐 Frontend Server (Port 3000):"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ✅ Running"
    PID=$(lsof -ti:3000)
    echo "  📍 PID: $PID"
    echo "  🔗 URL: http://localhost:3000"
else
    echo "  ❌ Not running"
fi

echo ""

# Check Node.js
echo "⚙️  Environment:"
if command -v node &> /dev/null; then
    echo "  ✅ Node.js: $(node --version)"
else
    echo "  ❌ Node.js not found"
fi

if command -v npm &> /dev/null; then
    echo "  ✅ NPM: $(npm --version)"
else
    echo "  ❌ NPM not found"
fi

if command -v docker &> /dev/null; then
    echo "  ✅ Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
else
    echo "  ❌ Docker not found"
fi

echo ""

# Quick connectivity test
echo "🔗 Connectivity:"
if curl -s http://localhost:5000 >/dev/null 2>&1; then
    echo "  ✅ Backend API reachable"
else
    echo "  ❌ Backend API not reachable"
fi

if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "  ✅ Frontend reachable"
else
    echo "  ❌ Frontend not reachable"
fi

echo ""
echo "=== End Status Check ==="
