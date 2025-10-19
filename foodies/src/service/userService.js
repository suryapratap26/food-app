import { apiClient } from "./apiClient";

export const loginUser = async (data) => {
    try {
        const response = await apiClient.post("/api/login", data);
        return response.data; 
    } catch (error) {
        console.error("loginUser error:", error);
        throw error;
    }
};

export const registerUser = async (data) => {
    try {
        const response = await apiClient.post("/api/register", data);
        
        if (response.data) {
           const loginResponse = await loginUser({ 
                email: data.email, 
                password: data.password 
            });
            
          return loginResponse; 
        } 
        
        return response.data; 
    } catch (error) {
        console.error("registerUser error:", error);
        throw error;
    }
};