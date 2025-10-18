import { apiClient } from "./apiClient";

// ------------------- ORDER FUNCTIONS -------------------
const createOrder = async (orderData) => {
    try {
        const response = await apiClient.post("/api/orders/create", orderData);
        return response.data; // OrderResponse with stripeClientSecret
    } catch (error) {
        console.error("createOrder error:", error);
        throw error;
    }
};

const verifyPayment = async (verificationData) => {
    try {
        const response = await apiClient.post("/api/orders/verify", verificationData);
        return response.data; // success message
    } catch (error) {
        console.error("verifyPayment error:", error);
        throw error;
    }
};

const getUserOrders = async () => {
    try {
        const response = await apiClient.get("/api/orders");
        return response.data; // List<OrderResponse>
    } catch (error) {
        console.error("getUserOrders error:", error);
        throw error;
    }
};

const getAllOrders = async () => {
    try {
        const response = await apiClient.get("/api/orders/all");
        return response.data; // List<OrderResponse>
    } catch (error) {
        console.error("getAllOrders error:", error);
        throw error;
    }
};

const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await apiClient.put(`/api/orders/${orderId}`, status);
        return response.data;
    } catch (error) {
        console.error("updateOrderStatus error:", error);
        throw error;
    }
};

const removeOrder = async (orderId) => {
    try {
        await apiClient.delete(`/api/orders/${orderId}`);
    } catch (error) {
        console.error("removeOrder error:", error);
        throw error;
    }
};

const orderService = {
    createOrder,
    verifyPayment,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    removeOrder,
};

export default orderService;
