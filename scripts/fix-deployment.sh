#!/bin/bash

echo "🔍 Diagnosing deployment issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
else
    print_status "Node.js is installed: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
else
    print_status "npm is installed: $(npm --version)"
fi

# Check if the application directory exists
if [ ! -d "/path/to/your/app" ]; then
    print_error "Application directory not found. Please update the path in this script."
    exit 1
fi

cd /path/to/your/app

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Check if .next directory exists
if [ ! -d ".next" ]; then
    print_warning ".next directory not found. Building application..."
    npm run build
fi

# Check if any Node.js processes are running
if pgrep -f "next" > /dev/null; then
    print_status "Next.js process is running"
    echo "Process details:"
    ps aux | grep next | grep -v grep
else
    print_warning "No Next.js process found. Starting application..."
    
    # Check if PM2 is installed
    if command -v pm2 &> /dev/null; then
        print_status "Using PM2 to start application..."
        pm2 start npm --name "tcp-app" -- start
        pm2 save
        pm2 startup
    else
        print_status "Starting application with npm..."
        nohup npm start > app.log 2>&1 &
        echo "Application started. Check app.log for details."
    fi
fi

# Check if port 3000 is listening
if netstat -tlnp | grep :3000 > /dev/null; then
    print_status "Application is listening on port 3000"
else
    print_error "Application is not listening on port 3000"
fi

# Check Nginx status (if installed)
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        print_status "Nginx is running"
        
        # Test Nginx configuration
        if nginx -t > /dev/null 2>&1; then
            print_status "Nginx configuration is valid"
        else
            print_error "Nginx configuration has errors"
            nginx -t
        fi
    else
        print_warning "Nginx is not running. Starting Nginx..."
        sudo systemctl start nginx
        sudo systemctl enable nginx
    fi
fi

# Check firewall status
if command -v ufw &> /dev/null; then
    echo "Firewall status:"
    sudo ufw status
fi

# Test local access
echo "Testing local access..."
if curl -s http://localhost:3000 > /dev/null; then
    print_status "Application is accessible locally"
else
    print_error "Application is not accessible locally"
fi

# Check system resources
echo "System resources:"
echo "Memory usage:"
free -h
echo "Disk usage:"
df -h
echo "CPU usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

print_status "Diagnosis complete!"
echo "If issues persist, check the logs:"
echo "- Application logs: tail -f app.log"
echo "- Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "- System logs: sudo journalctl -f"
