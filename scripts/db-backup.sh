#!/bin/bash
# WCommerce database backup helper (run on the VPS).
# Dumps the Postgres volume to backups/backup-YYYY-MM-DD.sql.gz and keeps
# the last 7 backups.
#
# Usage:
#   bash scripts/db-backup.sh
#
# Optional: schedule with cron (adjust path):
#   0 3 * * * cd /path/to/repo && bash scripts/db-backup.sh >> /var/log/wcommerce-backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "ERROR: .env not found - run from the project directory" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

POSTGRES_DB="${POSTGRES_DB:-wcommerce}"
POSTGRES_USER="${POSTGRES_USER:-wcommerce}"

BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%F_%H%M%S)"
OUT_FILE="$BACKUP_DIR/backup-$STAMP.sql.gz"

echo "Backing up $POSTGRES_DB -> $OUT_FILE"
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$OUT_FILE"

# Keep the 7 most recent backups
ls -1t "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm -f

echo "Done. Backup size: $(du -h "$OUT_FILE" | cut -f1)"
