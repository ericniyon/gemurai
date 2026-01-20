#!/bin/bash

# Script to apply all SQL migrations directly
# Usage: ./scripts/apply-all-sql-migrations.sh
# Or: bash scripts/apply-all-sql-migrations.sh

set -e  # Exit on error

echo "🔄 Starting SQL migration process..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Make sure DATABASE_URL is set."
    echo ""
fi

# Check if psql is available (PostgreSQL client)
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found."
    echo "   Please install PostgreSQL client tools or use: npm run apply-sql-migrations"
    exit 1
fi

# Get DATABASE_URL from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set in environment or .env file"
    exit 1
fi

MIGRATIONS_DIR="prisma/migrations"
TEMP_SQL_FILE="/tmp/all_migrations.sql"

# Create temporary SQL file with all migrations
echo "-- Combined SQL migrations" > "$TEMP_SQL_FILE"
echo "-- Generated on $(date)" >> "$TEMP_SQL_FILE"
echo "" >> "$TEMP_SQL_FILE"

# Find and sort all migration SQL files
find "$MIGRATIONS_DIR" -name "migration.sql" -type f | sort | while read -r file; do
    echo "-- Migration: $(basename $(dirname "$file"))" >> "$TEMP_SQL_FILE"
    echo "" >> "$TEMP_SQL_FILE"
    cat "$file" >> "$TEMP_SQL_FILE"
    echo "" >> "$TEMP_SQL_FILE"
    echo "-- End of migration: $(basename $(dirname "$file"))" >> "$TEMP_SQL_FILE"
    echo "" >> "$TEMP_SQL_FILE"
done

# Also include standalone SQL files
find "$MIGRATIONS_DIR" -maxdepth 1 -name "*.sql" -type f | sort | while read -r file; do
    echo "-- Standalone SQL: $(basename "$file")" >> "$TEMP_SQL_FILE"
    echo "" >> "$TEMP_SQL_FILE"
    cat "$file" >> "$TEMP_SQL_FILE"
    echo "" >> "$TEMP_SQL_FILE"
done

echo "📦 Combined all migrations into: $TEMP_SQL_FILE"
echo "🚀 Executing SQL migrations..."
echo ""

# Execute the combined SQL file
psql "$DATABASE_URL" -f "$TEMP_SQL_FILE" || {
    echo ""
    echo "❌ Migration failed. You can review the SQL file at: $TEMP_SQL_FILE"
    exit 1
}

echo ""
echo "✅ All migrations applied successfully!"
echo ""
echo "💡 Tip: You can also use: npm run apply-sql-migrations (TypeScript version)"
echo ""
