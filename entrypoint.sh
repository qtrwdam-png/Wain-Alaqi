#!/bin/sh

# Try to sync DB schema; don't block app startup if DB isn't ready yet
echo "Syncing database schema..."
node node_modules/prisma/build/index.js db push 2>&1 || echo "WARNING: DB sync failed — the app will start anyway and retry on requests."

echo "Starting application..."
exec node server.js
