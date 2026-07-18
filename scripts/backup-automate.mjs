#!/usr/bin/env node
/**
 * Automated database backup helper (audit 5.1).
 *
 * Triggers the existing GET /api/admin/backup export and writes the JSON to
 * a local backups/ directory with timestamped + rotated files.
 *
 * This script only performs the EXPORT half of the backup process. It does not
 * run on a schedule by itself — wire it into cron / a CI job / a systemd timer:
 *
 *   # Daily at 2am
 *   0 2 * * *  curl -H "Authorization: Bearer $BACKUP_TOKEN" https://your-site/api/admin/backup -o /dev/null
 *   # or run this script directly:
 *   node scripts/backup-automate.mjs
 *
 * Requires env:
 *   - BACKUP_URL      (default: http://localhost:3000/api/admin/backup)
 *   - BACKUP_TOKEN    (admin bearer token; the endpoint requires admin auth)
 *   - BACKUP_DIR      (default: ./backups)
 *   - BACKUP_KEEP     (number of files to retain, default: 30)
 */

import { mkdir, writeFile, readdir, unlink, stat } from 'node:fs/promises';
import { join } from 'node:path';

const BACKUP_URL = process.env.BACKUP_URL || 'http://localhost:3000/api/admin/backup';
const BACKUP_TOKEN = process.env.BACKUP_TOKEN || '';
const BACKUP_DIR = process.env.BACKUP_DIR || join(process.cwd(), 'backups');
const BACKUP_KEEP = parseInt(process.env.BACKUP_KEEP || '30', 10);

async function main() {
  await mkdir(BACKUP_DIR, { recursive: true });

  const headers = { Accept: 'application/json' };
  if (BACKUP_TOKEN) headers.Authorization = `Bearer ${BACKUP_TOKEN}`;

  const res = await fetch(BACKUP_URL, { headers, redirect: 'manual' });
  if (!res.ok) {
    throw new Error(`Backup endpoint returned ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  // Validate it is JSON before persisting
  JSON.parse(text);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = join(BACKUP_DIR, `backup-${stamp}.json`);
  await writeFile(file, text, 'utf8');
  console.log(`[backup] wrote ${file} (${text.length} bytes)`);

  await rotate();
}

async function rotate() {
  const files = (await readdir(BACKUP_DIR))
    .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
    .map((f) => join(BACKUP_DIR, f));

  const metas = [];
  for (const f of files) {
    const s = await stat(f);
    metas.push({ f, mtime: s.mtimeMs });
  }
  metas.sort((a, b) => b.mtime - a.mtime);

  const toDelete = metas.slice(BACKUP_KEEP);
  for (const { f } of toDelete) {
    await unlink(f);
    console.log(`[backup] rotated (removed) ${f}`);
  }
}

main().catch((err) => {
  console.error('[backup] FAILED:', err.message);
  process.exit(1);
});
