let AUTH_TOKEN = null;

export function setAuthToken(token) {
  AUTH_TOKEN = token;
}

export function clearAuthToken() {
  AUTH_TOKEN = null;
}

export function getApi(path, options = {}) {
  const headers = options.headers || {};
  if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  return fetch(path, { ...options, headers });
}
