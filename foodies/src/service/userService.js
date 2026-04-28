import { apiClient, setAuthToken } from "./apiClient";

export const loginUser = async (data) => {
	try {
		const response = await apiClient.post("/api/login", data);
		const userData = response.data;

		localStorage.setItem("token", userData.token);
		localStorage.setItem("role", userData.role || "CUSTOMER");
		localStorage.setItem("username", userData.name || "User");
		if (userData.profile) {
			localStorage.setItem("profile", JSON.stringify(userData.profile));
		}

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

		if (response.status === 201 && data.role !== "RESTAURANT") {
			const loginResponse = await loginUser({
				email: data.email,
				password: data.password,
			});
			return { status: 201, data: loginResponse };
		}

		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("registerUser error:", error);
		throw error;
	}
};

export const logoutUser = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("role");
	localStorage.removeItem("username");
	localStorage.removeItem("profile");
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

export const getUserProfile = async () => {
	try {
		const response = await apiClient.get("/api/profile");
		return response.data;
	} catch (error) {
		console.error("getUserProfile error:", error);
		throw error;
	}
};

export const updateUserProfile = async (data) => {
	try {
		const response = await apiClient.put("/api/profile", data);
		return response.data;
	} catch (error) {
		console.error("updateUserProfile error:", error);
		throw error;
	}
};

export const getPendingRestaurants = async () => {
	try {
		const response = await apiClient.get("/api/admin/restaurants/pending");
		return response.data;
	} catch (error) {
		console.error("getPendingRestaurants error:", error);
		throw error;
	}
};

export const updateRestaurantApproval = async (restaurantId, status) => {
	try {
		const response = await apiClient.put(
			`/api/admin/restaurants/${restaurantId}/approval`,
			{ status }
		);
		return response.data;
	} catch (error) {
		console.error("updateRestaurantApproval error:", error);
		throw error;
	}
};
