#!/usr/bin/env sh

set -eu

echo "Starting migrations..."
npm run migration up || {
	echo "Migration failed!"
	exit 1
}
echo "Migrations completed successfully"

echo "Starting server..."
exec /sbin/tini -s -- node ./api/server.js
