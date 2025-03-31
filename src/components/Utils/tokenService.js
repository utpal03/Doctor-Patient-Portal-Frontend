export const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem("token", accessToken);
};

export const getAccessToken = () => {
  return localStorage.getItem("token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

export const removeTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};
