import axios from "axios";

const API_URL = "http://localhost:8080/";

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

// Set or remove Authorization token dynamically
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common["Authorization"];
    }
};
