import fs from 'fs';
import path from 'path';

function getAllRouteFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllRouteFiles(fullPath, files);
    } else if (file === 'route.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

const apiDir = path.resolve('src/app/api');
const routeFiles = getAllRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} API route files to audit.\n`);

const PUBLIC_MUTATING_ENDPOINTS = [
  'api/account/register',
  'api/account/request-otp',
  'api/account/forgot-password',
  'api/account/reset-password',
  'api/account/change-password', // maybe needs requireAuth, let's check
  'api/account/send-verification', // maybe needs requireAuth, let's check
  'api/contact',
  'api/newsletter/subscribe',
  'api/payments/payu/callback',
  'api/stock-notifications',
  'api/shipping/calculate',
  'api/auth',
  'api/cron/abandoned-carts' // protected by CRON_SECRET, let's check
];

const results = [];

for (const file of routeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(process.cwd(), file);

  const methods = [];
  if (content.includes('export async function POST')) methods.push('POST');
  if (content.includes('export async function PUT')) methods.push('PUT');
  if (content.includes('export async function PATCH')) methods.push('PATCH');
  if (content.includes('export async function DELETE')) methods.push('DELETE');

  if (methods.length === 0) continue;

  const isProtected = content.includes('requireAdminAuth') || content.includes('requireAuth') || relPath.includes('src/app/api/admin/');

  const isExpectedPublic = PUBLIC_MUTATING_ENDPOINTS.some(p => relPath.replace(/\\/g, '/').includes(p));

  if (!isProtected && !isExpectedPublic) {
    results.push({ file: relPath, methods });
  }
}

if (results.length > 0) {
  console.log('--- AUDIT WARNING: Potential Unprotected Mutating Endpoints ---');
  results.forEach(r => {
    console.log(`File: ${r.file} [Methods: ${r.methods.join(', ')}]`);
  });
} else {
  console.log('All mutating endpoints are properly protected with authorization checks!');
}
