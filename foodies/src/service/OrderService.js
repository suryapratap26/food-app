import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/orders`;

const OrderService = {
    createOrder: async (orderData, token) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const response = await axios.post(`${API_BASE_URL}/create`, orderData, config);

            // Handle both possible structures
            const payload = response.data?.data || response.data;
            if (payload && payload.stripeClientSecret) {
                return payload;
            }
            console.error("Invalid order creation response:", response.data);
            throw new Error("Missing order/payment data from server.");
        } catch (error) {
            console.error("OrderService.createOrder error:", error);
            throw error;
        }
    },

    verifyPayment: async (verificationData, token) => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };
        try {
            const response = await axios.post(`${API_BASE_URL}/verify`, verificationData, config);
            return response.data;
        } catch (error) {
            console.error("OrderService.verifyPayment error:", error);
            throw error;
        }
    },

    getUserOrders: async (token) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(API_BASE_URL, config);
        return response.data;
    },
};

export default OrderService;
