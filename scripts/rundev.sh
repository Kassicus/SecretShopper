#!/bin/bash

# Exit on error
set -e

echo "🚀 Secret Shopper - Development Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
fi

# Check if NEXTAUTH_SECRET needs to be generated
if grep -q "replaceme-generate-with-openssl-rand-base64-32\|generate-random-secret-with-openssl-rand-base64-32" .env; then
    echo "🔐 Generating NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)

    # Replace the placeholder secret in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|g" .env
    else
        # Linux
        sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|g" .env
    fi
    echo "✓ Generated and saved NEXTAUTH_SECRET"
    echo ""
fi

# Install dependencies if node_modules doesn't exist or package.json changed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
    echo ""
else
    echo "✓ Dependencies already installed"
    echo ""
fi

# Check if Prisma Client needs to be generated
if [ ! -d "node_modules/.prisma/client" ]; then
    echo "🔧 Generating Prisma Client..."
    npm run prisma:generate
    echo "✓ Prisma Client generated"
    echo ""
else
    echo "✓ Prisma Client already generated"
    echo ""
fi

# Start Prisma dev database if using local Prisma Postgres
if grep -q "prisma+postgres://localhost" .env; then
    echo "🗄️  Starting Prisma Postgres..."
    echo "   (This will run in the background)"

    # Check if prisma dev is already running
    if ! pgrep -f "prisma dev" > /dev/null; then
        npx prisma dev &
        PRISMA_PID=$!
        echo "✓ Prisma Postgres started (PID: $PRISMA_PID)"
        echo "   Waiting 5 seconds for database to be ready..."
        sleep 5
    else
        echo "✓ Prisma Postgres already running"
    fi
    echo ""
fi

# Ensure Prisma Client is up to date
echo "🔄 Ensuring Prisma Client is up to date..."
npm run prisma:generate
echo "✓ Prisma Client ready"
echo ""

echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "Starting development server..."
echo "Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================"
echo ""

# Start the development server
npm run dev
