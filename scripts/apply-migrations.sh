#!/bin/bash

# Script to apply all Prisma migrations
# Usage: ./scripts/apply-migrations.sh
# Or: bash scripts/apply-migrations.sh

set -e  # Exit on error

echo "🔄 Starting migration process..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Make sure DATABASE_URL is set."
    echo ""
fi

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated successfully"
echo ""

# Step 2: Apply all migrations
echo "🚀 Step 2: Applying all migrations..."

# Check if we're in production mode
if [ "$NODE_ENV" = "production" ]; then
    echo "   Using: prisma migrate deploy (production mode)"
    npx prisma migrate deploy
else
    echo "   Using: prisma migrate dev (development mode)"
    npx prisma migrate dev
fi

echo "✅ All migrations applied successfully"
echo ""

echo "🎉 Migration process completed successfully!"
echo ""
echo "📊 Next steps:"
echo "   - Run: npm run db:studio (to view your database)"
echo "   - Run: npm run db:seed (to seed initial data if available)"
echo ""
