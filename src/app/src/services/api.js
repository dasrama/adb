import { API_CONFIG } from '../constants/config';

export const todoApi = {
  async list() {
    const res = await fetch(API_CONFIG.BASE_URL);
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
    return res.json();
  },

  async create(task) {
    const res = await fetch(API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({ task })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async update(id, task) {
    const res = await fetch(`${API_CONFIG.BASE_URL}${id}/`, {
      method: 'PATCH',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({ task })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_CONFIG.BASE_URL}${id}/`, {
      method: 'DELETE',
      headers: API_CONFIG.HEADERS
    });
    if (!res.ok && res.status !== 204) throw new Error(await res.text());
    return true;
  }
};