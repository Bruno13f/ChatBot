#!/usr/bin/env bash
set -euo pipefail

# Read URIs from environment variables
SOURCE_URI="${MONGO_LOCAL_URI:-}"
DEST_URI="${MONGO_LOCAL_BACKUP_URI:-}"

# Validate required environment variables
if [[ -z "$SOURCE_URI" ]]; then
  echo "Error: MONGO_URI environment variable is required"
  exit 1
fi

if [[ -z "$DEST_URI" ]]; then
  echo "Error: MONGO_BACKUP_URI environment variable is required"
  exit 1
fi

BACKUP_DIR="/dumps"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE="$BACKUP_DIR/dump_$TIMESTAMP.archive.gz"

mkdir -p "$BACKUP_DIR"

echo "[`date`] → dumping from source…"
mongodump \
  --uri="$SOURCE_URI" \
  --archive="$ARCHIVE" \
  --gzip

echo "[`date`] → restoring to destination…"
mongorestore \
  --uri="$DEST_URI" \
  --archive="$ARCHIVE" \
  --gzip \
  --drop

# Keep only last 7 days of dumps
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "[`date`] → done. backup file: $ARCHIVE"