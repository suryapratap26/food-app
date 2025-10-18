import { apiClient } from "./apiClient";

export const getCartItems = async () => {
    try {
        const response = await apiClient.get("/api/cart");
        return response.data; // Cart object
    } catch (error) {
        console.error("getCartItems error:", error);
        throw error;
    }
};

export const addToCart = async (foodId) => {
    try {
        const response = await apiClient.post("/api/cart", { foodId });
        return response.data;
    } catch (error) {
        console.error("addToCart error:", error);
        throw error;
    }
};

export const removeFromCart = async (foodId) => {
    try {
        const response = await apiClient.post("/api/cart/remove", { foodId });
        return response.data;
    } catch (error) {
        console.error("removeFromCart error:", error);
        throw error;
    }
};

export const clearCart = async () => {
    try {
        await apiClient.delete("/api/cart");
    } catch (error) {
        console.error("clearCart error:", error);
        throw error;
    }
};
