import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Feature is disabled by default unless explicitly enabled for staging', () => {
  const coach = source('src/components/athletes/ClubSelfRegistration.tsx');
  assert.ok(coach.includes("import.meta.env.VITE_ENABLE_CLUB_INVITES === 'true'"));
  assert.ok(coach.includes('if (!CLUB_JOIN_ENABLED) return null'));
});

test('Public invitation form has its own route and does not require login', () => {
  const routes = source('src/App.tsx');
  const form = source('src/pages/JoinClub.tsx');
  assert.ok(routes.includes('<Route path="/join/:token" element={<JoinClub />} />'));
  assert.ok(form.includes('submit_club_join_request'));
  assert.ok(form.includes('get_club_join_info'));
});

test('Registration is staged for coach approval, never inserted directly as an athlete', () => {
  const migration = source('supabase/migrations/20261028120000_club_self_enrollment.sql');
  const form = source('src/pages/JoinClub.tsx');
  assert.ok(migration.includes('CREATE TABLE public.athlete_join_requests'));
  assert.ok(migration.includes("estado text NOT NULL DEFAULT 'pending'"));
  assert.ok(migration.includes("CREATE OR REPLACE FUNCTION public.review_club_join_request"));
  assert.ok(form.includes('p_acepta_privacidad: values.accepted'));
  assert.equal(form.includes("from('athletes')"), false);
});

test('Only the club owner may review requests or create links', () => {
  const migration = source('supabase/migrations/20261028120000_club_self_enrollment.sql');
  assert.ok(migration.includes('e.admin_id = (SELECT auth.uid())'));
  assert.ok(migration.includes('GRANT EXECUTE ON FUNCTION public.review_club_join_request(uuid,boolean,numeric,integer) TO authenticated'));
  assert.ok(migration.includes('GRANT EXECUTE ON FUNCTION public.submit_club_join_request(text,text,text,text,text,text,boolean,boolean) TO anon, authenticated'));
});

test('Manual athlete entry remains available alongside invitation requests', () => {
  const athletes = source('src/pages/Athletes.tsx');
  assert.ok(athletes.includes('setAddModalOpen(true)'));
  assert.ok(athletes.includes('<ClubSelfRegistration establecimientoId={establecimiento.id} />'));
});
