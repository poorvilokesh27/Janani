const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(path, options = {}) {
  const token = window.localStorage.getItem('janani_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the JANANI API. Make sure the backend is running and reload the page.');
  }
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.localStorage.removeItem('janani_token');
    window.localStorage.removeItem('janani_user');
    window.dispatchEvent(new Event('janani-auth-expired'));
    throw new Error('Your session expired. Please sign in again.');
  }
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body;
}

const normalizeIndianMobile = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  return `+${digits}`;
};

export const requestOtp = (identifier, method = 'mobile', intent = 'signup', password, contactMobile) => apiRequest('/auth/otp/request', {
  method: 'POST',
  body: JSON.stringify(method === 'mobile' ? { mobile: normalizeIndianMobile(identifier), method, intent } : { email: identifier, method, intent, password, ...(contactMobile ? { mobile: normalizeIndianMobile(contactMobile) } : {}) }),
});
export const resendOtp = (identifier, method = 'mobile', password, contactMobile) => requestOtp(identifier, method, 'signup', password, contactMobile);
export const verifyOtp = (identifier, code, name, method = 'mobile', password, contactMobile) => apiRequest('/auth/otp/verify', {
  method: 'POST',
  body: JSON.stringify(method === 'mobile' ? { mobile: normalizeIndianMobile(identifier), method, code, name } : { email: identifier, method, code, name, password, ...(contactMobile ? { mobile: normalizeIndianMobile(contactMobile) } : {}) }),
});
export const signInWithPassword = (email, password) => apiRequest('/auth/password/signin', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
export const savePregnancyMonth = (month) => apiRequest('/pregnancy', {
  method: 'POST',
  body: JSON.stringify({ month }),
});
export const saveProfileMobile = (mobile) => apiRequest('/users/mobile', {
  method: 'PUT',
  body: JSON.stringify({ mobile: normalizeIndianMobile(mobile) }),
});
export const getCycleLogs = () => apiRequest('/cycles');
export const saveCycleLog = (cycleDate, cycleLength, notes) => apiRequest('/cycles', {
  method: 'POST',
  body: JSON.stringify({ cycleDate, cycleLength: Number(cycleLength), notes }),
});
