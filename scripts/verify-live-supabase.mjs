// GitHub Actions live smoke checks. Only safe invalid-token + permission calls.
// No valid enrollment tokens, clubs, athletes or payments are created.
import assert from 'node:assert/strict';
import { test } from 'node:test';

const projectRef = 'myqrrmtubfqlnnqdoams';
const host = `https://${projectRef}.supabase.co`;
const apiKey = process.env.SPORTPAGO_SUPABASE_ANON_KEY;
assert.ok(apiKey && apiKey.length > 30 && !apiKey.includes('YOUR_'),
  'Set GitHub Actions secret SPORTPAGO_SUPABASE_ANON_KEY (anon/publishable, NOT service_role).');
assert.ok(!apiKey.startsWith('sb_secret_'), 'Do not use secret/service-role credentials for QA');

function requestHeaders() {
  const result = { apikey: apiKey, 'Content-Type': 'application/json' };
  if (apiKey.split('.').length === 3) result.Authorization = `Bearer ${apiKey}`;
  return result;
}
async function rpc(name, body) {
  const response = await fetch(`${host}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: requestHeaders(), body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  return { response, text: await response.text() };
}
async function directRead(table) {
  const response = await fetch(`${host}/rest/v1/${table}?select=id&limit=1`, {
    headers: requestHeaders(), signal: AbortSignal.timeout(15000),
  });
  return { response, text: await response.text() };
}
function expectDenied(res, label) {
  assert.ok([401, 403].includes(res.response.status),
    `${label}: must return 401/403, got ${res.response.status}. Stop rollout.`);
}

test('Public RPC returns null for an invalid invite, without leaking club information', async () => {
  const { response, text } = await rpc('get_club_join_info', { p_token: 'not-a-valid-token' });
  assert.equal(response.status, 200, `Unexpected RPC status: ${response.status}; response=${text.slice(0,350)}`);
  assert.equal(JSON.parse(text), null);
});

test('Anonymous account cannot generate a club invitation', async () => {
  expectDenied(await rpc('ensure_club_join_link', {
    p_club_id: '00000000-0000-0000-0000-000000000001',
  }), 'ensure_club_join_link');
});

test('Anonymous account cannot rotate a club invitation', async () => {
  expectDenied(await rpc('rotate_club_join_link', {
    p_club_id: '00000000-0000-0000-0000-000000000001',
  }), 'rotate_club_join_link');
});

test('Anonymous account cannot approve a join request', async () => {
  expectDenied(await rpc('review_club_join_request', {
    p_request_id: '00000000-0000-0000-0000-000000000001', p_approve: true,
  }), 'review_club_join_request');
});

test('Nonexistent invitation rejects an enrollment without any new record', async () => {
  const { response } = await rpc('submit_club_join_request', {
    p_token: '0000000000000000000000000000000000000000000000000000000000000000',
    p_nombre: 'QA INVALID TOKEN', p_deporte: 'Soccer',
    p_contacto_nombre: 'QA PARENT',
    p_contacto_email: 'qa-invalid-token@example.invalid',
    p_contacto_telefono: '', p_es_acudiente: true, p_acepta_privacidad: true,
  });
  assert.ok([400, 401, 403, 404, 422].includes(response.status),
    `An invalid token must not be accepted. Received ${response.status}`);
});

test('Visitors cannot directly read invitation tokens or personal applications', async () => {
  expectDenied(await directRead('club_join_links'), 'club_join_links SELECT');
  expectDenied(await directRead('athlete_join_requests'), 'athlete_join_requests SELECT');
});
