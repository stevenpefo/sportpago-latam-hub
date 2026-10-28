import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const path = (file) => new URL(`../${file}`, import.meta.url);
const text = (file) => readFileSync(path(file), 'utf8');

test('Staging branch must not track an .env file with live Colombia connection', () => {
  assert.equal(existsSync(path('.env')), false);
  assert.ok(text('.gitignore').includes('.env'));
  assert.ok(text('.env.example').includes('VITE_DEPLOY_TARGET=staging'));
});

test('Preview route and Supabase staging safeguards are in place', () => {
  const client = text('src/integrations/supabase/client.ts');
  const gate = text('scripts/assert-staging-env.mjs');
  assert.ok(client.includes('SportPago self-registration preview requires an isolated staging Supabase project'));
  assert.ok(gate.includes('Cannot use the Colombia production Supabase project'));
  assert.ok(gate.includes("assert.equal(env.VITE_DEPLOY_TARGET, 'staging'"));
  assert.ok(gate.includes("assert.equal(env.VITE_ENABLE_CLUB_INVITES, 'true'"));
});

test('Shareable enrollment route loads via SPA hosting fallback', () => {
  const config = JSON.parse(text('vercel.json'));
  assert.ok(config.rewrites.some((row) => row.source === '/(.*)' && row.destination === '/index.html'));
  assert.ok(text('src/App.tsx').includes('<Route path="/join/:token" element={<JoinClub />} />'));
});
