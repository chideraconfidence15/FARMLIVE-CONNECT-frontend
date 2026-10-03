/**
 * FARMLIVE REST Framework API Client
 * Replaces Appwrite cloud with local Express REST backend
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach session/auth token if user exists in localStorage
  try {
    const savedUser = localStorage.getItem('farmlive_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch {
    // Ignore JSON parse errors from localStorage
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      const nestedMessage = errorData?.error?.message || errorData?.error || errorData?.message;
      errorMessage = nestedMessage || errorMessage;
    } catch {
      // Non-JSON response
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
}

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return request(url, { method: 'GET' });
  },

  post: (endpoint, data) => request(endpoint, { method: 'POST', body: data }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: data }),
  patch: (endpoint, data) => request(endpoint, { method: 'PATCH', body: data }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};

/**
 * File upload helper for local previews and base64 storage
 */
export async function uploadFileHelper(file) {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
