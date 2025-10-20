#!/bin/bash

# Redis Setup Script for TCP App
# This script helps set up Redis for the application

echo "🚀 Setting up Redis for TCP App..."

# Check if Redis is already installed
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is already installed"
else
    echo "📦 Installing Redis..."
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install redis
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y redis-server
        elif command -v yum &> /dev/null; then
            sudo yum install -y redis
        else
            echo "❌ Package manager not found. Please install Redis manually."
            exit 1
        fi
    else
        echo "❌ Unsupported OS. Please install Redis manually."
        exit 1
    fi
fi

# Start Redis service
echo "🔧 Starting Redis service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start redis
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start redis
    sudo systemctl enable redis
fi

# Wait for Redis to start
echo "⏳ Waiting for Redis to start..."
sleep 3

# Test Redis connection
if redis-cli ping &> /dev/null; then
    echo "✅ Redis is running successfully!"
else
    echo "❌ Redis failed to start. Please check the installation."
    exit 1
fi

# Create .env file with Redis configuration if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with Redis configuration..."
    cat > .env << EOF
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/tcp_app"

# Other configurations...
EOF
    echo "✅ .env file created with Redis configuration"
else
    echo "📝 .env file already exists. Please add Redis configuration manually:"
    echo "   REDIS_HOST=localhost"
    echo "   REDIS_PORT=6379"
    echo "   REDIS_PASSWORD="
    echo "   REDIS_DB=0"
fi

# Test Redis connection from Node.js
echo "🧪 Testing Redis connection from Node.js..."
node -e "
const Redis = require('ioredis');
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  lazyConnect: true
});

redis.on('connect', () => {
  console.log('✅ Node.js Redis connection successful!');
  redis.quit();
});

redis.on('error', (err) => {
  console.log('❌ Node.js Redis connection failed:', err.message);
  process.exit(1);
});
"

echo ""
echo "🎉 Redis setup completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure Redis is running: redis-cli ping"
echo "   2. Start your application: pnpm dev"
echo "   3. Test cache functionality by visiting /api/redis/health"
echo ""
echo "🔧 Useful Redis commands:"
echo "   - Check Redis status: redis-cli ping"
echo "   - Monitor Redis: redis-cli monitor"
echo "   - Check Redis info: redis-cli info"
echo "   - Clear all data: redis-cli flushall"
echo "" 