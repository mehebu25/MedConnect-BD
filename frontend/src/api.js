function getDefaultBase() {
  const { protocol, hostname, port } = window.location;

  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // When React runs on localhost:3000, the PHP backend is usually served by Apache on localhost.
  if (port === '3000') {
    return `${protocol}//${hostname}/medconnect/backend/api`;
  }

  // When frontend is served from Apache too, use the same host.
  return `${protocol}//${hostname}/medconnect/backend/api`;
}

const BASE = getDefaultBase();

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });
  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const htmlHint = text.includes('<br') || text.includes('<b>') || text.includes('<html');
    throw new Error(htmlHint ? `Backend error at ${endpoint}. Check XAMPP/PHP output for this endpoint.` : `Invalid response from ${endpoint}`);
  }

  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

const api = {
  register: (body) => request('/auth/register.php', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login.php', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout.php', { method: 'POST' }),
  getProfile: () => request('/auth/profile.php'),
  updateProfile: (body) => request('/auth/profile.php', { method: 'PUT', body: JSON.stringify(body) }),

  getDoctors: (params = '') => request(`/doctors/index.php${params}`),
  getDoctor: (id) => request(`/doctors/show.php?id=${id}`),
  getDoctorSlots: (id, date) => request(`/doctors/slots.php?doctor_id=${id}&date=${date}`),
  getDoctorSchedule: () => request('/doctors/schedule.php'),
  updateDoctorSchedule: (body) => request('/doctors/schedule.php', { method: 'PUT', body: JSON.stringify(body) }),

  bookAppointment: (body) => request('/appointments/store.php', { method: 'POST', body: JSON.stringify(body) }),
  getAppointments: () => request('/appointments/index.php'),
  cancelAppointment: (id) => request('/appointments/cancel.php', { method: 'POST', body: JSON.stringify({ id }) }),
  updateAppointment: (body) => request('/appointments/update.php', { method: 'PUT', body: JSON.stringify(body) }),

  getPrescriptions: () => request('/prescriptions/index.php'),
  getPrescription: (id) => request(`/prescriptions/show.php?id=${id}`),
  createPrescription: (body) => request('/prescriptions/store.php', { method: 'POST', body: JSON.stringify(body) }),

  getRecords: () => request('/records/index.php'),
  uploadRecord: async (form) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE}/records/store.php`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    });
    const text = await res.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Backend error at /records/store.php. Check XAMPP/PHP output for this endpoint.');
    }



    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  },

  adminStats: () => request('/admin/stats.php'),
  adminUsers: (role = '') => request(`/admin/users.php${role ? `?role=${encodeURIComponent(role)}` : ''}`),
  adminVerifyDoctor: (id, status) => request('/admin/verify_doctor.php', { method: 'POST', body: JSON.stringify({ id, status }) }),

  contactSubmit: (body) => request('/contact/store.php', { method: 'POST', body: JSON.stringify(body) }),
};

export default api;
