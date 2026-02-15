import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("tracksys_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setToken(token) {
  localStorage.setItem("tracksys_token", token);
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function getToken() {
  return localStorage.getItem("tracksys_token");
}

export function clearToken() {
  localStorage.removeItem("tracksys_token");
  delete API.defaults.headers.common["Authorization"];
}

// Optional but production-correct
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;
