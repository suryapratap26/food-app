import { apiClient } from "./apiClient";

export const registerUser = async (data) => {
    try {
        const response = await apiClient.post("/api/register", data);
        return response.data; // UserResponse
    } catch (error) {
        console.error("registerUser error:", error);
        throw error;
    }
};

export const loginUser = async (data) => {
    try {
        const response = await apiClient.post("/api/login", data);
        return response.data; // AuthenticationResponse
    } catch (error) {
        console.error("loginUser error:", error);
        throw error;
    }
};
