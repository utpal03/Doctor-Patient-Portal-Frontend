import {
  getAccessToken,
  getRefreshToken,
  storeTokens,
  removeTokens,
} from "../../components/Utils/tokenService";

export const API_BASE_URL = "http://localhost:8080";

export const endpoints = {
  loginDoctor: `${API_BASE_URL}/login/doctor`,
  loginPatient: `${API_BASE_URL}/login/patient`,
  signupDoctor: `${API_BASE_URL}/signup/doctor`,
  signupPatient: `${API_BASE_URL}/signup/patient`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  bookAppointment: `${API_BASE_URL}/appointments/book`,
  viewAppointments: `${API_BASE_URL}/appointments/doctor`,
};


export const fetchWithTokenRefresh = async (url, options = {}) => {
  try {
    let accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    let headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    let response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && refreshToken) {
      const refreshResponse = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newAccessToken = data.accessToken;

        storeTokens(newAccessToken, getRefreshToken()); 
        headers["Authorization"] = `Bearer ${newAccessToken}`;
        response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        });
      } else {
        removeTokens();
        window.location.href = "/login";
      }
    }

    return response;
  } catch (err) {
    console.error("Fetch with token refresh failed:", err);
    throw err;
  }
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
  const endpoint =
    type === "doctor" ? endpoints.signupDoctor : endpoints.signupPatient;
  const response = await fetch(endpoint, {
    method: "POST",
    body: data,
  });
  if (!response.ok) {
    throw new Error("Signup failed");
  }
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

export const logout = async () => {
  const refreshToken = getRefreshToken();
  const response = await fetch(`/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (response.ok) {
    removeTokens();
    window.location.href = "/login";
  } else {
    console.error("Logout failed:", await response.text());
  }
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
