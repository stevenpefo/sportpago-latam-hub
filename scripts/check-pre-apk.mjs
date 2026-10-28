import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const load = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const languages = ['es', 'en', 'fr', 'pt'];
const flatten = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, item]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return item && typeof item === 'object' && !Array.isArray(item)
      ? flatten(item, fullKey)
      : [[fullKey, item]];
  });

const translations = Object.fromEntries(
  languages.map((language) => [
    language,
    JSON.parse(load(`src/i18n/locales/${language}.json`)),
  ]),
);

test('Translations have the same keys in all four languages', () => {
  const reference = flatten(translations.es).map(([key]) => key).sort();
  for (const language of languages) {
    const entries = flatten(translations[language]);
    assert.deepEqual(entries.map(([key]) => key).sort(), reference, `Keys in ${language} do not match Spanish`);
    for (const [key, value] of entries) {
      assert.equal(typeof value, 'string', `${language}:${key} must be text`);
      assert.ok(value.trim(), `${language}:${key} cannot be empty`);
    }
  }
});

test('Global introduction and action text exists for every language', () => {
  for (const language of languages) {
    assert.ok(translations[language].login.tagline, `Missing ${language} tagline`);
    assert.ok(translations[language].login.explore, `Missing ${language} explore CTA`);
  }
});

test('Public product overview is reachable from the authentication screen', () => {
  const routes = load('src/App.tsx');
  const authentication = load('src/pages/Auth.tsx');
  assert.ok(routes.includes('<Route path="/explore" element={<Explore />} />'), 'Missing /explore route');
  assert.ok(authentication.includes('to="/explore"'), 'Auth screen lacks overview link');
  assert.ok(authentication.includes('searchParams.get(\'tab\')'), 'Signup link cannot select registration tab');
});

test('Assistant PIN is masked on the authentication screen', () => {
  const authentication = load('src/pages/Auth.tsx');
  const pinInput = authentication.match(/<Input\s+id="staff-pin"[\s\S]*?\/>/);
  assert.ok(pinInput, 'Assistant PIN input not found');
  assert.ok(pinInput[0].includes('type="password"'), 'Assistant PIN should not be shown in plaintext');
});
