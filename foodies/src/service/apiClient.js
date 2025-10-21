import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

export const getUserRole = () => localStorage.getItem("role") || "CUSTOMER";

const token = localStorage.getItem("token");
if (token) setAuthToken(token);
