#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Gemurai local development environment...${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${BLUE}Installing pnpm...${NC}"
    npm install -g pnpm
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cat > .env << EOL
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/Gemurai_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/Gemurai_db?schema=public"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Email (SendGrid)
SENDGRID_API_KEY=""
FROM_EMAIL="noreply@Gemurai.rw"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOL
    echo -e "${GREEN}Created .env file${NC}"
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
pnpm install

# Generate Prisma client
echo -e "${BLUE}Generating Prisma client...${NC}"
pnpm prisma generate

echo -e "\n${GREEN}Setup complete! 🎉${NC}"
echo -e "\nNext steps:"
echo -e "1. Set up your PostgreSQL database"
echo -e "2. Update the DATABASE_URL in .env with your database credentials"
echo -e "3. Run 'pnpm prisma db push' to create the database schema"
echo -e "4. Run 'pnpm dev' to start the development server"
echo -e "\nOptional:"
echo -e "- Set up SendGrid API key for email functionality"
echo -e "- Set up Twilio credentials for SMS functionality" 