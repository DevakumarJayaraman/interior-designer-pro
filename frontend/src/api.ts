const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:7001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Clients
  listClients: () => request('/api/clients'),
  createClient: (body: any) => request('/api/clients', { method: 'POST', body: JSON.stringify(body) }),
  updateClient: (id: number, body: any) => request(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteClient: (id: number) => request(`/api/clients/${id}`, { method: 'DELETE' }),

  // Projects
  listProjects: (clientId?: number) => request(`/api/projects${clientId ? `?clientId=${clientId}` : ''}`),
  createProject: (clientId: number, body: any) => request(`/api/projects?clientId=${clientId}`, { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id: number, body: any) => request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Areas
  listAreas: (projectId: number) => request(`/api/areas?projectId=${projectId}`),
  createArea: (projectId: number, body: any) => request(`/api/areas?projectId=${projectId}`, { method: 'POST', body: JSON.stringify(body) }),
  updateArea: (id: number, body: any) => request(`/api/areas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteArea: (id: number) => request(`/api/areas/${id}`, { method: 'DELETE' }),

  // Products
  listProducts: () => request('/api/products'),
  createProduct: (body: any) => request('/api/products', { method: 'POST', body: JSON.stringify(body) }),

  // Quotes
  loadDraft: (projectId: number) => request(`/api/quotes/draft?projectId=${projectId}`, { method: 'POST' }),
  listQuotes: (projectId: number) => request(`/api/quotes?projectId=${projectId}`),
  listQuoteItems: (quoteId: number) => request(`/api/quotes/${quoteId}/items`),
  addQuoteItem: (quoteId: number, areaId: number, productId: number, body: any) =>
    request(`/api/quotes/${quoteId}/items?areaId=${areaId}&productId=${productId}`, { method: 'POST', body: JSON.stringify(body) }),
  updateQuoteItem: (itemId: number, body: any) => request(`/api/quotes/items/${itemId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteQuoteItem: (itemId: number) => request(`/api/quotes/items/${itemId}`, { method: 'DELETE' }),
  recalcQuote: (quoteId: number) => request(`/api/quotes/${quoteId}/recalc`, { method: 'POST' }),
  submitQuote: (quoteId: number) => request(`/api/quotes/${quoteId}/submit`, { method: 'POST' }),

  // Cutlist + material
  generateCutlist: (quoteId: number) => request(`/api/quotes/${quoteId}/cutlist/generate`, { method: 'POST' }),
  listCutlist: (quoteId: number) => request(`/api/quotes/${quoteId}/cutlist`),
  materialSummary: (quoteId: number) => request(`/api/quotes/${quoteId}/material-summary`)
};
