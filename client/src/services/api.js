const TOKEN_KEY = 'spendwise_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, params } = {}) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString()
    : '';
  const token = tokenStore.get();
  const res = await fetch(`/api${path}${qs}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('spendwise:unauthorized'));
    throw new Error(data.message || 'Request failed. Please try again.');
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
  summary: (month) => request('/dashboard/summary', { params: { month } }),
  monthly: (months) => request('/analytics/monthly', { params: { months } }),
  transactions: (params) => request('/transactions', { params }),
  createTransaction: (body) => request('/transactions', { method: 'POST', body }),
  updateTransaction: (id, body) => request(`/transactions/${id}`, { method: 'PATCH', body }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  budgets: (month) => request('/budgets', { params: { month } }),
  saveBudget: (body) => request('/budgets', { method: 'POST', body }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),
};
