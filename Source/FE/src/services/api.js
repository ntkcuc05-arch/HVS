const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const _request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return null;
  }
};

export const api = {
  getSystems: () => _request("/api/systems").then(data => data || []),

  getSystemDetail: (id) => _request(`/api/systems/${id}`),

  createSystem: (formData) => _request("/api/systems", {
    method: "POST",
    body: formData, // FormData handles its own Content-Type
  }),

  updateSystem: (id, formData) => _request(`/api/systems/${id}`, {
    method: "PUT",
    body: formData,
  }),

  deleteSystem: (id) => _request(`/api/systems/${id}`, {
    method: "DELETE",
  }),

  updateSystemPosition: (id, position) => _request(`/api/systems/${id}/position`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(position),
  }),

  getStaticUrl: (path) => path ? (path.startsWith('http') ? path : `${API_BASE_URL}${path}`) : null,
};
