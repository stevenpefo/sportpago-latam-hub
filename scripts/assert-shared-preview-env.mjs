import assert from 'node:assert/strict';

// Web-only preview that shares an existing database with Colombia.
// Never use this configuration for the Lovable Colombia build.
const env = process.env;
const productionProject = 'myqrrmtubfqlnnqdoams';
const expectedUrl = `https://${productionProject}.supabase.co`;

assert.equal(env.VITE_DEPLOY_TARGET, 'preview-shared', 'Expected isolated frontend preview (VITE_DEPLOY_TARGET=preview-shared)');
assert.equal(env.VITE_ENABLE_CLUB_INVITES, 'true', 'Invitations must be explicitly enabled in this preview');
assert.equal(env.VITE_SUPABASE_PROJECT_ID, productionProject, 'Unexpected Supabase project ID');
assert.equal(env.VITE_SUPABASE_URL, expectedUrl, 'Unexpected Supabase URL');
assert.ok(env.VITE_SUPABASE_PUBLISHABLE_KEY && env.VITE_SUPABASE_PUBLISHABLE_KEY.length > 30
  && !env.VITE_SUPABASE_PUBLISHABLE_KEY.includes('YOUR_'),
  'Use the existing Supabase publishable/anon key, never a secret or service_role key');
assert.ok(!env.VITE_SUPABASE_PUBLISHABLE_KEY.startsWith('sb_secret_'),
  'Service-role/secret keys must never be used in the browser');

console.log('SportPago preview: approved existing backend, separate frontend, invitations explicitly enabled.');
