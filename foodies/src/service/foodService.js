import { apiClient, isManagerRole } from "./apiClient";

export const fetchFoodList = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/food", { params });
    return response.data;
  } catch (error) {
    console.error("fetchFoodList error:", error);
    throw error;
  }
};

export const fetchFoodDetail = async (id) => {
  try {
    const response = await apiClient.get(`/api/food/${id}`);
    return response.data;
  } catch (error) {
    console.error("fetchFoodDetail error:", error);
    throw error;
  }
};

export const submitFoodReview = async (id, reviewData) => {
  try {
    const response = await apiClient.post(`/api/food/${id}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error("submitFoodReview error:", error);
    throw error;
  }
};

// ✅ Admin-only
export const addFood = async (foodData, file) => {
  if (!isManagerRole()) {
    throw new Error("Access denied: only restaurant or admin accounts can add food.");
  }

  try {
    const payload =
      file && typeof file !== "string"
        ? (() => {
            const formData = new FormData();
            formData.append("food", JSON.stringify(foodData));
            formData.append("file", file);
            return formData;
          })()
        : { ...foodData, imageUrl: file || foodData.imageUrl || "" };

    const config =
      file && typeof file !== "string"
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;

    const response = await apiClient.post("/api/food", payload, config);
    return response.data;
  } catch (error) {
    console.error("addFood error:", error);
    throw error;
  }
};

// ✅ Admin-only
export const deleteFood = async (id) => {
  if (!isManagerRole()) {
    throw new Error("Access denied: only restaurant or admin accounts can delete food.");
  }

  try {
    await apiClient.delete(`/api/food/${id}`);
  } catch (error) {
    console.error("deleteFood error:", error);
    throw error;
  }
};
