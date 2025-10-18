import { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import {
    addToCart,
    clearCart,
    removeFromCart as removeCartItem,
    getCartItems,
} from "../service/cartService";
import OrderService from "../service/orderService";
import { setAuthToken } from "../service/apiClient";

export const storeContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
    // ------------------- STATE -------------------
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [token, setToken] = useState("");
    const [orders, setOrders] = useState([]);

    // ------------------- TOKEN HANDLING -------------------
    useEffect(() => {
        setAuthToken(token);
        if (token) {
            loadCartData();
            loadUserOrders();
        }
    }, [token]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const foods = await fetchFoodList();
                setFoodList(foods);

                const savedToken = localStorage.getItem("token");
                if (savedToken) setToken(savedToken);
            } catch (error) {
                console.error("loadData error:", error);
            }
        };
        loadData();
    }, []);

    // ------------------- CART FUNCTIONS -------------------
    const increaseQty = async (foodId) => {
        try {
            setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
            await addToCart(foodId);
        } catch (error) {
            console.error("increaseQty error:", error);
        }
    };

    const decreaseQty = async (foodId) => {
        try {
            setQuantities((prev) => ({
                ...prev,
                [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0,
            }));
            await removeCartItem(foodId);
        } catch (error) {
            console.error("decreaseQty error:", error);
        }
    };

    const removeFromCart = async (foodId) => {
        try {
            await removeCartItem(foodId);
            setQuantities((prev) => {
                const updated = { ...prev };
                delete updated[foodId];
                return updated;
            });
        } catch (error) {
            console.error("removeFromCart error:", error);
        }
    };

    const clearAllCart = async () => {
        try {
            await clearCart();
            setQuantities({});
        } catch (error) {
            console.error("clearAllCart error:", error);
        }
    };

    const loadCartData = async () => {
        try {
            const cart = await getCartItems();
            setQuantities(cart.items || {});
        } catch (error) {
            console.error("loadCartData error:", error);
        }
    };

    // ------------------- ORDER FUNCTIONS -------------------
    const createOrder = async (orderData) => {
        try {
            const order = await OrderService.createOrder(orderData);
            await clearAllCart(); // Clear cart after successful order
            setOrders((prev) => [...prev, order]);
            return order;
        } catch (error) {
            console.error("createOrder error:", error);
            throw error;
        }
    };

    const verifyPayment = async (verificationData) => {
        try {
            const result = await OrderService.verifyPayment(verificationData);
            return result;
        } catch (error) {
            console.error("verifyPayment error:", error);
            throw error;
        }
    };

    const loadUserOrders = async () => {
        try {
            const userOrders = await OrderService.getUserOrders();
            setOrders(userOrders || []);
        } catch (error) {
            console.error("loadUserOrders error:", error);
        }
    };

    const removeOrder = async (orderId) => {
        try {
            await OrderService.removeOrder(orderId);
            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        } catch (error) {
            console.error("removeOrder error:", error);
        }
    };

    // ------------------- CONTEXT VALUE -------------------
    const contextValue = {
        foodList,
        quantities,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearAllCart,
        orders,
        createOrder,
        verifyPayment,
        removeOrder,
        setQuantities,
        token,
        setToken,
    };

    return <storeContext.Provider value={contextValue}>{children}</storeContext.Provider>;
};
