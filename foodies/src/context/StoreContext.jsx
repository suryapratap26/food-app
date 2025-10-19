import { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import {
    addToCart,
    clearCart,
    removeFromCart as removeCartItem,
    getCartItems,
} from "../service/cartService";
import orderService from "../service/orderService";
import { setAuthToken } from "../service/apiClient"; 
export const storeContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [token, setToken] = useState("");
    const [orders, setOrders] = useState([]);

     const loadProtectedData = async () => {
        try {
            if (token) {
                const cart = await getCartItems();
                setQuantities(cart.items || {});
                
                 const userOrders = await orderService.getUserOrders();
                setOrders(userOrders || []);
            }
        } catch (error) {
            console.error("loadProtectedData failed (Cart/Orders):", error);
         }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const foods = await fetchFoodList();
                setFoodList(foods);

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
    }, []); 

    useEffect(() => {
        if (token) {
            setAuthToken(token);
            loadProtectedData();
        } else {
            setAuthToken(null);
            setQuantities({});
            setOrders([]);     
        }
    }, [token]);

    const increaseQty = async (foodId) => {
        if (!token) {
             console.log("User not logged in. Cannot add to cart.");
             return; 
        }
        setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
        try {
            await addToCart(foodId);
        } catch (error) {
            console.error("increaseQty error:", error);
            setQuantities((prev) => ({ ...prev, [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0 }));
        }
    };
    
    const decreaseQty = async (foodId) => {
        if (!token) return;
        const currentQty = quantities[foodId] || 0;
        if (currentQty <= 0) return;

        setQuantities((prev) => ({
            ...prev,
            [foodId]: currentQty - 1,
        }));
        
        try {
            await removeCartItem(foodId);
        } catch (error) {
            console.error("decreaseQty error:", error);
            setQuantities((prev) => ({ ...prev, [foodId]: currentQty }));
        }
    };
    
    const removeFromCart = async (foodId) => {
        if (!token) return;
        
        setQuantities((prev) => {
            const updated = { ...prev };
            delete updated[foodId];
            return updated;
        });

        try {
            await removeCartItem(foodId);
        } catch (error) {
            console.error("removeFromCart error:", error);
            loadProtectedData(); 
        }
    };

    const clearAllCart = async () => {
        if (!token) return;
        
        const originalQuantities = quantities;
        setQuantities({});

        try {
            await clearCart();
        } catch (error) {
            console.error("clearAllCart error:", error);
            setQuantities(originalQuantities);
        }
    };

   const createOrder = async (orderData) => {
        try {
            const order = await orderService.createOrder(orderData);
            await clearAllCart(); 
            setOrders((prev) => [order, ...prev]); 
            return order;
        } catch (error) {
            console.error("createOrder error:", error);
            throw error;     }
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
        loadProtectedData, 
    };

    return (
        <storeContext.Provider value={contextValue}>
            {children}
        </storeContext.Provider>
    );
};