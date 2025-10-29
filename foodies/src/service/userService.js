import { apiClient, setAuthToken } from "./apiClient";

export const loginUser = async (data) => {
	try {
		const response = await apiClient.post("/api/login", data);
		const userData = response.data;

		localStorage.setItem("token", userData.token);
		localStorage.setItem("role", userData.role || "CUSTOMER");

		setAuthToken(userData.token);
		return userData;
	} catch (error) {
		console.error("loginUser error:", error);
		throw error;
	}
};

export const registerUser = async (data) => {
	try {
		const response = await apiClient.post("/api/register", data);

		if (response.status === 201) {
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

export const logoutUser = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("role");
	setAuthToken(null);
};

export const createAdmin = async (data) => {
	try {
		const response = await apiClient.post("/api/admin/create", data);
		return response.data;
	} catch (error) {
		console.error("createAdmin error:", error);
		throw error;
	}
};

export const sendContactMessage = async (data) => {
	try {
		const response = await apiClient.post("/api/contact", data);
		return response.data;
	} catch (error) {
		console.error("sendContactMessage error:", error);
		throw error;
	}
};
