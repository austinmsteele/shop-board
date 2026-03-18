import test from 'node:test';
import assert from 'node:assert/strict';

import { createApiRequestError, isAuthRequiredApiError } from '../public/app-api-errors.js';

test('createApiRequestError marks 401 responses as auth-required', () => {
  const error = createApiRequestError('Authentication required.', 401);

  assert.equal(error.message, 'Authentication required.');
  assert.equal(error.status, 401);
  assert.equal(error.code, 'auth_required');
  assert.equal(error.isAuthRequired, true);
  assert.equal(isAuthRequiredApiError(error), true);
});

test('isAuthRequiredApiError ignores non-auth API failures', () => {
  const error = createApiRequestError('Server exploded.', 500);

  assert.equal(error.status, 500);
  assert.equal(isAuthRequiredApiError(error), false);
});
