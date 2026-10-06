const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem('loanpulse_access_token');
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Token expired or invalid
        localStorage.removeItem('loanpulse_access_token');
        localStorage.removeItem('loanpulse_user');
        window.dispatchEvent(new Event('loanpulse_auth_expired'));
      }

      // Check if response is blob / file download
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        return await response.blob();
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || data?.detail || `Request failed with status ${response.status}`;
        const error = new Error(errorMsg);
        error.data = data;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `${endpoint}?${query}` : endpoint;
    return this.request(path, { method: 'GET' });
  }

  post(endpoint, data) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, data) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, data) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

export const accountAggregatorAPI = {
  connect: (data) => api.post('/risk/account-aggregator/connect/', data),
  getAnalyses: (params) => api.get('/risk/account-aggregator/analyses/', params),
  getDetail: (id) => api.get(`/risk/account-aggregator/analyses/${id}/`),
  uploadStatement: (formData) => api.post('/risk/account-aggregator/upload-statement/', formData),
};

export const sanctionLetterAPI = {
  getLetter: (appId) => api.get(`/loans/applications/${appId}/sanction-letter/`),
  esign: (appId) => api.post(`/loans/applications/${appId}/esign/`, {}),
};

export const mandateAPI = {
  register: (data) => api.post('/payments/mandates/register/', data),
  getMandates: (params) => api.get('/payments/mandates/', params),
};

export const healthAPI = {
  getDiagnostics: () => api.get('/health/'),
};

export const customerAPI = {
  create: (data) => api.post('/customers/', data),
  getList: (params) => api.get('/customers/', params),
  getDetail: (id) => api.get(`/customers/${id}/`),
  updateProfile: (data) => api.put('/customers/me/', data),
  getProfile: () => api.get('/customers/me/'),
};

