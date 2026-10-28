import assert from 'node:assert/strict';

const env = process.env;
const url = env.VITE_SUPABASE_URL || '';
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const expectedProject = env.VITE_SUPABASE_PROJECT_ID || '';
const productionProject = 'chklvnjudaschthbqgsc';

assert.equal(env.VITE_DEPLOY_TARGET, 'staging', 'Expected VITE_DEPLOY_TARGET=staging');
assert.equal(env.VITE_ENABLE_CLUB_INVITES, 'true', 'Self-enrollment must be enabled deliberately in staging');
assert.ok(url && key && expectedProject, 'Missing Supabase staging connection');
assert.match(expectedProject, /^[a-z0-9]{20}$/, 'Invalid Supabase staging project ID');
assert.notEqual(expectedProject, productionProject, 'Cannot use the Colombia production Supabase project');
assert.equal(url, `https://${expectedProject}.supabase.co`, 'Supabase URL does not match expected staging project');
assert.ok(key.length > 30 && !key.includes('YOUR_'), 'Missing real staging publishable key');

console.log('Isolated SportPago staging environment validated. No production project detected.');
