import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const path = (file) => new URL(`../${file}`, import.meta.url);
const text = (file) => readFileSync(path(file), 'utf8');

test('Preview branch must not commit any .env credentials', () => {
  assert.equal(existsSync(path('.env')), false);
  assert.ok(text('.gitignore').includes('.env'));
  assert.ok(text('.env.example').includes('VITE_DEPLOY_TARGET=preview-shared'));
});

test('Preview requires deliberate flag and exact existing Supabase backend', () => {
  const client = text('src/integrations/supabase/client.ts');
  const gate = text('scripts/assert-shared-preview-env.mjs');
  assert.ok(client.includes('approved shared-backend preview environment'));
  assert.ok(client.includes("import.meta.env.VITE_DEPLOY_TARGET === 'preview-shared'"));
  assert.ok(gate.includes("assert.equal(env.VITE_DEPLOY_TARGET, 'preview-shared'"));
  assert.ok(gate.includes("assert.equal(env.VITE_ENABLE_CLUB_INVITES, 'true'"));
  assert.ok(gate.includes("assert.equal(env.VITE_SUPABASE_PROJECT_ID, productionProject"));
  assert.ok(text('vercel.json').includes('node scripts/assert-shared-preview-env.mjs'));
});

test('New schema installation only adds club self-enrollment in one transaction', () => {
  const sql = text('docs/sql/04_ADD_CLUB_SELF_REGISTRATION_EXISTING_SUPABASE.sql');
  assert.ok(sql.includes("BEGIN;"));
  assert.ok(sql.includes("COMMIT;"));
  assert.ok(sql.includes("CREATE TABLE public.club_join_links"));
  assert.ok(sql.includes("CREATE TABLE public.athlete_join_requests"));
  assert.ok(sql.includes("ALTO: las tablas nuevas ya existen"));
  assert.ok(sql.includes("ENABLE ROW LEVEL SECURITY"));
  assert.ok(!/DROP TABLE|TRUNCATE|DELETE FROM public\.athletes|ALTER TABLE public\.athletes/i.test(sql));
});

test('Shareable enrollment URL loads from single page app hosting fallback', () => {
  const config = JSON.parse(text('vercel.json'));
  assert.ok(config.rewrites.some(row => row.source === '/(.*)' && row.destination === '/index.html'));
  assert.ok(text('src/App.tsx').includes('<Route path="/join/:token" element={<JoinClub />} />'));
});
