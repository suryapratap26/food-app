import { apiClient, isManagerRole } from "./apiClient";

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Server error";
  const err = new Error(message);
  err.origin = error;
  throw err;
};

export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post("/api/orders/create", orderData);
    return response.data;
  } catch (error) {
    console.error("createOrder error:", error);
    handleError(error);
  }
};

export const verifyPayment = async (verificationData) => {
  try {
    const response = await apiClient.post("/api/orders/verify", verificationData);
    return response.data;
  } catch (error) {
    console.error("verifyPayment error:", error);
    handleError(error);
  }
};

export const getUserOrders = async () => {
  try {
    const response = await apiClient.get("/api/orders");
    return response.data;
  } catch (error) {
    console.error("getUserOrders error:", error);
    handleError(error);
  }
};

export const getAllOrders = async () => {
  if (!isManagerRole()) {
    throw new Error("Access denied: only restaurant or admin accounts can view orders.");
  }

  try {
    const response = await apiClient.get("/api/orders/all");
    return response.data;
  } catch (error) {
    console.error("getAllOrders error:", error);
    handleError(error);
  }
};

export const getRestaurantEarningsSummary = async () => {
  if (localStorage.getItem("role") !== "RESTAURANT") {
    throw new Error("Access denied: only restaurant accounts can view payout summary.");
  }

  try {
    const response = await apiClient.get("/api/orders/restaurant/earnings");
    return response.data;
  } catch (error) {
    console.error("getRestaurantEarningsSummary error:", error);
    handleError(error);
  }
};

export const claimRestaurantEarnings = async () => {
  if (localStorage.getItem("role") !== "RESTAURANT") {
    throw new Error("Access denied: only restaurant accounts can claim earnings.");
  }

  try {
    const response = await apiClient.post("/api/orders/restaurant/claim");
    return response.data;
  } catch (error) {
    console.error("claimRestaurantEarnings error:", error);
    handleError(error);
  }
};

export const updateOrderStatus = async (orderId, status) => {
  if (!isManagerRole()) {
    throw new Error("Access denied: only restaurant or admin accounts can update orders.");
  }

  try {
    const response = await apiClient.put(`/api/orders/${orderId}`, { orderStatus: status });
    return response.data;
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    handleError(error);
  }
};

export const removeOrder = async (orderId) => {
  try {
    const response = await apiClient.delete(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("removeOrder error:", error);
    handleError(error);
  }
};

const orderService = {
  createOrder,
  verifyPayment,
  getUserOrders,
  getAllOrders,
  getRestaurantEarningsSummary,
  claimRestaurantEarnings,
  updateOrderStatus,
  removeOrder,
};

export default orderService;
