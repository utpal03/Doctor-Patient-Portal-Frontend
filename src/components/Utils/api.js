export const API_BASE_URL = "http://localhost:8080";

export const endpoints = {
  loginDoctor: `${API_BASE_URL}/login/doctor`,
  loginPatient: `${API_BASE_URL}/login/patient`,
  signupDoctor: `${API_BASE_URL}/auth/signup/doctor`,
  signupPatient: `${API_BASE_URL}/auth/signup/patient`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  bookAppointment: `${API_BASE_URL}/appointments/book`,
  viewAppointments: `${API_BASE_URL}/appointments/doctor`,
};

export const login = async (credentials, loginType) => {
  const endpoint =
    loginType === "doctor" ? endpoints.loginDoctor : endpoints.loginPatient;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
};

export const signup = async (type, data) => {
  const endpoint = type === "doctor" ? endpoints.signupDoctor : endpoints.signupPatient;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const forgotPassword = async (email) => {
  const response = await fetch(endpoints.forgotPassword, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

export const bookAppointment = async (data) => {
  const response = await fetch(endpoints.bookAppointment, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const viewAppointments = async (doctorId) => {
  const response = await fetch(`${endpoints.viewAppointments}/${doctorId}`);
  return response.json();
};
