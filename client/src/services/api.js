const BASE_URL = '/api';

export function getAuthToken() {
  return localStorage.getItem('apex_auth_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('apex_auth_token', token);
  } else {
    localStorage.removeItem('apex_auth_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // If unauthorized, clear token if stored
    // localStorage.removeItem('apex_auth_token');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getCurrentUser: () => request('/auth/me'),
  getDemoUsers: () => request('/auth/demo-users'),

  // Complaints
  getComplaints: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/complaints${qs ? `?${qs}` : ''}`);
  },
  getComplaintDetail: (id) => request(`/complaints/${id}`),
  createComplaint: (complaintData) => request('/complaints', {
    method: 'POST',
    body: JSON.stringify(complaintData)
  }),
  updateStatus: (id, statusData) => request(`/complaints/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
  }),
  assignStaff: (id, staffData) => request(`/complaints/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify(staffData)
  }),
  reopenComplaint: (id, reopenData) => request(`/complaints/${id}/reopen`, {
    method: 'POST',
    body: JSON.stringify(reopenData)
  }),
  verifyComplaint: (id, verifyData) => request(`/complaints/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify(verifyData)
  }),

  // File Upload
  uploadImage: async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }
    return data;
  },

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Staff
  getStaff: () => request('/staff'),
  addStaff: (staffData) => request('/staff', {
    method: 'POST',
    body: JSON.stringify(staffData)
  }),
  updateStaffStatus: (id, status) => request(`/staff/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Export
  exportCsvUrl: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val && val !== 'All') searchParams.append(key, val);
    });
    return `${BASE_URL}/export/csv?${searchParams.toString()}`;
  }
};
