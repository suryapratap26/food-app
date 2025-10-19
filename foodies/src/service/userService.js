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

    if (response.status === 201) {
      // Automatically log in user after successful registration
      const loginResponse = await loginUser({
        email: data.email,
        password: data.password,
      });

      return { status: 201, data: loginResponse };
    }

    return response;
  } catch (error) {
    console.error("registerUser error:", error);
    throw error;
  }
};
