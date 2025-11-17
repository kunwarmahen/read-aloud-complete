#!/bin/bash

# Read Aloud Cloud - Quick Start Script
# This script helps you get started quickly

set -e

echo "🚀 Read Aloud Cloud - Quick Start"
echo "=================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi
echo "✅ Python 3 found"

# Check MongoDB
if ! command -v mongod &> /dev/null && ! command -v podman &> /dev/null; then
    echo "⚠️  MongoDB not found. You'll need either:"
    echo "   1. MongoDB installed locally"
    echo "   2. Podman to run MongoDB container"
    echo "   3. MongoDB Atlas connection string"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB/Podman found"
fi

# cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Setup .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Setting up configuration..."
    cp .env.example .env
    
    # Generate secret key
    SECRET_KEY=$(openssl rand -hex 32)
    
    # Update .env
    sed -i "s/your-secret-key-here-generate-with-openssl/$SECRET_KEY/" .env
    
    echo "✅ Created .env file with generated secret key"
    echo ""
    echo "📝 Please review .env and update:"
    echo "   - MONGODB_URL (if using remote MongoDB)"
    echo "   - TTS_SERVER_URL (if different from localhost:5000)"
    echo ""
    read -p "Press Enter to continue..."
fi

# Start MongoDB with Podman if available
if command -v podman &> /dev/null; then
    if ! podman ps | grep -q mongodb; then
        echo ""
        read -p "🐳 Start MongoDB with Podman? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            podman run -d -p 27017:27017 --name mongodb \
                -v mongodb_data:/data/db \
                mongo:latest
            echo "✅ MongoDB started in Podman"
            sleep 2
        fi
    else
        echo "✅ MongoDB already running in Podman"
    fi
fi

# Create audio storage
mkdir -p audio_storage
echo "✅ Created audio storage directory"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start TTS server (in another terminal):"
echo "      cd ../read-aloud-extension"
echo "      python3 combined_server.py"
echo ""
echo "   2. Start this API server:"
echo "      python main.py"
echo ""
echo "   3. Visit: http://localhost:8000/docs"
echo ""
read -p "Start API server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting API server..."
    echo "   API: http://localhost:8000"
    echo "   Docs: http://localhost:8000/docs"
    echo ""
    python main.py
fi
