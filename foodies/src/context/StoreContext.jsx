import { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import {
    addToCart,
    clearCart,
    removeFromCart as removeCartItem,
    getCartItems,
} from "../service/cartService";
import orderService from "../service/orderService";
import { setAuthToken } from "../service/apiClient"; // Import setAuthToken

export const storeContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [token, setToken] = useState("");
    const [orders, setOrders] = useState([]);

    // --- Core Data Loading Function (Protected Routes) ---
    // This function encapsulates loading data that requires authentication.
    const loadProtectedData = async () => {
        try {
            if (token) {
                // Load Cart Data
                const cart = await getCartItems();
                setQuantities(cart.items || {});
                
                // Load User Orders
                const userOrders = await orderService.getUserOrders();
                setOrders(userOrders || []);
            }
        } catch (error) {
            // Log 401 Unauthorized errors gracefully
            console.error("loadProtectedData failed (Cart/Orders):", error);
            // Optionally, force logout if a persistent token is rejected
        }
    };

    // --- Initial Load Effect (Unprotected and Token Setup) ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Load Food List (Unprotected)
                const foods = await fetchFoodList();
                setFoodList(foods);

                // 2. Load Token from storage
                const savedToken = localStorage.getItem("token");
                if (savedToken) {
                    setToken(savedToken);
                    setAuthToken(savedToken); // Set Auth Header immediately for first requests
                } else {
                    setAuthToken(null);
                }
            } catch (error) {
                console.error("loadInitialData error:", error);
            }
        };
        loadInitialData();
    }, []); // Runs only on mount

    // --- Token Change Effect (Handles Login/Logout) ---
    // This effect runs whenever the 'token' state changes (i.e., user logs in or out).
    useEffect(() => {
        if (token) {
            // Set header for all subsequent API calls
            setAuthToken(token);
            // Load protected data immediately after token is set
            loadProtectedData();
        } else {
            // Clear header on logout
            setAuthToken(null);
            setQuantities({}); // Clear quantities on logout
            setOrders([]);     // Clear orders on logout
        }
    }, [token]);

    // ------------------- CART FUNCTIONS (A-sync with local state update) -------------------
    
    // Note: The structure of increaseQty/decreaseQty is generally correct (optimistic local update followed by API call).
    const increaseQty = async (foodId) => {
        if (!token) {
             console.log("User not logged in. Cannot add to cart.");
             return; // Prevent API call if not logged in
        }
        setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
        try {
            await addToCart(foodId);
        } catch (error) {
            console.error("increaseQty error:", error);
            // Revert optimistic update on failure
            setQuantities((prev) => ({ ...prev, [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0 }));
        }
    };
    
    const decreaseQty = async (foodId) => {
        if (!token) return;
        const currentQty = quantities[foodId] || 0;
        if (currentQty <= 0) return;

        // Optimistic update
        setQuantities((prev) => ({
            ...prev,
            [foodId]: currentQty - 1,
        }));
        
        try {
            await removeCartItem(foodId);
        } catch (error) {
            console.error("decreaseQty error:", error);
            // Revert optimistic update on failure
            setQuantities((prev) => ({ ...prev, [foodId]: currentQty }));
        }
    };
    
    const removeFromCart = async (foodId) => {
        if (!token) return;
        
        // Optimistic update
        setQuantities((prev) => {
            const updated = { ...prev };
            delete updated[foodId];
            return updated;
        });

        try {
            await removeCartItem(foodId);
        } catch (error) {
            console.error("removeFromCart error:", error);
            // Re-load the correct cart state on failure
            loadProtectedData(); 
        }
    };

    const clearAllCart = async () => {
        if (!token) return;
        
        // Optimistic update
        const originalQuantities = quantities;
        setQuantities({});

        try {
            await clearCart();
        } catch (error) {
            console.error("clearAllCart error:", error);
            // Revert on failure
            setQuantities(originalQuantities);
        }
    };

    // ------------------- ORDER FUNCTIONS -------------------
    // Removed the redundant loadUserOrders function as it's now part of loadProtectedData

    const createOrder = async (orderData) => {
        try {
            const order = await orderService.createOrder(orderData);
            // Clear cart logic moved here for direct sequencing
            await clearAllCart(); 
            // Update state with new order
            setOrders((prev) => [order, ...prev]); 
            return order;
        } catch (error) {
            console.error("createOrder error:", error);
            throw error; // Re-throw so component can handle payment error
        }
    };

    const verifyPayment = async (verificationData) => {
        try {
            const result = await orderService.verifyPayment(verificationData);
            return result;
        } catch (error) {
            console.error("verifyPayment error:", error);
            throw error;
        }
    };

    const removeOrder = async (orderId) => {
        try {
            await orderService.removeOrder(orderId);
            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        } catch (error) {
            console.error("removeOrder error:", error);
        }
    };

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
        loadProtectedData, // Expose for use in Login/Register
    };

    return (
        <storeContext.Provider value={contextValue}>
            {children}
        </storeContext.Provider>
    );
};