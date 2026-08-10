#!/bin/sh
set -e

# Sync database schema then start the app
echo "Syncing database schema..."
node node_modules/prisma/build/index.js db push --accept-data-loss

echo "Starting application..."
exec node server.js
