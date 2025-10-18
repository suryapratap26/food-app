import { apiClient } from "./apiClient";

export const fetchFoodList = async () => {
    try {
        const response = await apiClient.get("/api/food");
        return response.data; 
    } catch (error) {
        console.error("fetchFoodList error:", error);
        throw error;
    }
};

export const fetchFoodDetail = async (id) => {
    try {
        const response = await apiClient.get(`/api/food/${id}`);
        return response.data; // FoodResponse
    } catch (error) {
        console.error("fetchFoodDetail error:", error);
        throw error;
    }
};

export const addFood = async (foodData, file) => {
    try {
        const formData = new FormData();
        formData.append("food", JSON.stringify(foodData));
        formData.append("file", file);

        const response = await apiClient.post("/api/food", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data; // FoodResponse
    } catch (error) {
        console.error("addFood error:", error);
        throw error;
    }
};

export const deleteFood = async (id) => {
    try {
        await apiClient.delete(`/api/food/${id}`);
    } catch (error) {
        console.error("deleteFood error:", error);
        throw error;
    }
};
