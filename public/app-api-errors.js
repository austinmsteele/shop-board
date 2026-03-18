export function createApiRequestError(message, status) {
  const normalizedStatus = Number(status);
  const fallbackMessage = Number.isFinite(normalizedStatus)
    ? `Request failed (${normalizedStatus})`
    : 'Request failed.';
  const error = new Error(String(message || fallbackMessage));
  if (Number.isFinite(normalizedStatus)) {
    error.status = normalizedStatus;
  }
  if (normalizedStatus === 401) {
    error.code = 'auth_required';
    error.isAuthRequired = true;
  }
  return error;
}

export function isAuthRequiredApiError(error) {
  if (!error || typeof error !== 'object') return false;
  return error.isAuthRequired === true
    || error.code === 'auth_required'
    || Number(error.status) === 401;
}
