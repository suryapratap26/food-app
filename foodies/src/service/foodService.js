import { apiClient, getUserRole } from "./apiClient";

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
    return response.data;
  } catch (error) {
    console.error("fetchFoodDetail error:", error);
    throw error;
  }
};

// ✅ Admin-only
export const addFood = async (foodData, file) => {
  if (getUserRole() !== "ADMIN") {
    throw new Error("Access denied: only admins can add food.");
  }

  try {
    const formData = new FormData();
    formData.append("food", JSON.stringify(foodData));
    formData.append("file", file);

    const response = await apiClient.post("/api/food", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("addFood error:", error);
    throw error;
  }
};

// ✅ Admin-only
export const deleteFood = async (id) => {
  if (getUserRole() !== "ADMIN") {
    throw new Error("Access denied: only admins can delete food.");
  }

  try {
    await apiClient.delete(`/api/food/${id}`);
  } catch (error) {
    console.error("deleteFood error:", error);
    throw error;
  }
};
