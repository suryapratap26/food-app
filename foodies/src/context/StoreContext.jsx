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
import { getUserProfile, updateUserProfile } from "../service/userService";

export const storeContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [token, setToken] = useState("");
    const [orders, setOrders] = useState([]);
    const [backendError, setBackendError] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    const syncCurrentLocation = () => {
        const role = localStorage.getItem("role");
        if (role !== "CUSTOMER" || !navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const location = {
                    lat: Number(coords.latitude.toFixed(6)),
                    lng: Number(coords.longitude.toFixed(6)),
                };

                setUserProfile((prev) =>
                    prev ? { ...prev, location } : prev
                );

                try {
                    await updateUserProfile({ location });
                } catch (error) {
                    console.error("syncCurrentLocation error:", error);
                }
            },
            () => {},
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    };

    const loadUserProfile = async () => {
        if (!token) {
            setUserProfile(null);
            return null;
        }

        setIsProfileLoading(true);
        try {
            const profile = await getUserProfile();
            setUserProfile(profile);
            localStorage.setItem("profile", JSON.stringify(profile));
            return profile;
        } finally {
            setIsProfileLoading(false);
        }
    };

    const loadProtectedData = async () => {
        try {
            if (token) {
                const cart = await getCartItems();
                setQuantities(cart.items || {});

                const profile = await loadUserProfile();
                const userOrders = await orderService.getUserOrders();
                setOrders(userOrders || []);

                if (profile?.role === "CUSTOMER") {
                    syncCurrentLocation();
                }
            }
        } catch (error) {
            console.error("loadProtectedData failed (Cart/Orders/Profile):", error);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const foods = await fetchFoodList();
                setFoodList(foods);
                setBackendError("");

                const savedToken = localStorage.getItem("token");
                if (savedToken) {
                    setToken(savedToken);
                    setAuthToken(savedToken);
                } else {
                    setAuthToken(null);
                }
            } catch (error) {
                setFoodList([]);
                setBackendError(
                    "We couldn't connect to the food server. Please make sure the backend is running."
                );
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
            setUserProfile(null);
        }
    }, [token]);

    const increaseQty = async (foodId) => {
        if (!token) {
            return;
        }

        setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
        try {
            await addToCart(foodId);
        } catch (error) {
            console.error("increaseQty error:", error);
            setQuantities((prev) => ({
                ...prev,
                [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0,
            }));
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
            throw error;
        }
    };

    const verifyPayment = async (verificationData) => {
        try {
            return await orderService.verifyPayment(verificationData);
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
            throw error;
        }
    };

    const saveUserProfile = async (profileData) => {
        const updatedProfile = await updateUserProfile(profileData);
        setUserProfile(updatedProfile);
        localStorage.setItem("profile", JSON.stringify(updatedProfile));
        return updatedProfile;
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
        backendError,
        userProfile,
        saveUserProfile,
        loadUserProfile,
        isProfileLoading,
    };

    return (
        <storeContext.Provider value={contextValue}>
            {children}
        </storeContext.Provider>
    );
};
