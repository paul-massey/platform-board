import { expect, it } from 'vitest';

it('PLANTED: diagnostic test intentionally fails', () => {
  // Required fixture for Vibe Coding's Testing page. Keep exactly one failure.
  expect('This is the deliberately planted failure').toBe('All checks are green');
});
