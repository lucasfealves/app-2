#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database is ready!"

# Wait a bit more to ensure database is fully initialized
sleep 5

# Run database migrations
echo "Running database migrations..."
npx tsx migrate.ts

# Start the application
echo "Starting application..."
exec npm start