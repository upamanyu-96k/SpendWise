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
  let res;
  try {
    res = await fetch(`/api${path}${qs}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not reach the server. Check that it is running and try again.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // A 401 on a logged-in request means the session ended; wrong passwords on profile actions are 400s
    if (res.status === 401 && token) window.dispatchEvent(new Event('spendwise:unauthorized'));
    throw new Error(data.message || 'Request failed. Please try again.');
  }
  return data;
}

async function download(path, filename) {
  const res = await fetch(`/api${path}`, { headers: { Authorization: `Bearer ${tokenStore.get()}` } });
  if (!res.ok) throw new Error('Export failed. Please try again.');
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PATCH', body }),
  changePassword: (body) => request('/auth/change-password', { method: 'POST', body }),
  deleteAccount: (body) => request('/auth/account', { method: 'DELETE', body }),
  exportTransactions: () => download('/transactions/export', 'spendwise-transactions.csv'),
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
