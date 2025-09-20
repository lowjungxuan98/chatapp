#!/bin/sh
set -eu

: "${POSTGRES_PRISMA_URL:?POSTGRES_PRISMA_URL is required}"

# Retry prisma migrate until DB is ready (max ~60s)
echo "⏳ Waiting for DB + applying migrations..."
i=0
until npx prisma migrate deploy >/dev/null 2>&1; do
  i=$((i+1))
  if [ "$i" -ge 30 ]; then
    echo "❌ Database not ready after retries."
    npx prisma migrate deploy   # one last time to show error
    exit 1
  fi
  sleep 2
done
echo "✅ Migrations applied (or already up-to-date)."

# Optional seed
if [ "${SEED:-0}" = "1" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️ Seed skipped/failed"
fi

exec "$@"