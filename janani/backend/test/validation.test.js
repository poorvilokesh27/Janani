import test from 'node:test';
import assert from 'node:assert/strict';
import { coordinates, date, email, radius, requiredText } from '../src/validation.js';

test('validates bounded account and date fields', () => {
  assert.equal(email('person@example.com'), true);
  assert.equal(email('not-an-email'), false);
  assert.equal(requiredText('Ananya', 10), true);
  assert.equal(requiredText('too long', 3), false);
  assert.equal(date('2026-10-06'), true);
  assert.equal(date('06-10-2026'), false);
});

test('bounds facility location filters', () => {
  assert.equal(coordinates(12.9, 77.6), true);
  assert.equal(coordinates(95, 77.6), false);
  assert.equal(radius(25), true);
  assert.equal(radius(101), false);
});
