import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../../service/userService.js";
import { storeContext } from "../../context/StoreContext.jsx";
import "../login/Login.css";

const initialAddress = {
    firstName: "",
    lastName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    country: "IN",
    zipcode: "",
};

const Register = () => {
    const { setToken, loadProtectedData } = useContext(storeContext);
    const navigate = useNavigate();

    const [data, setData] = useState({
        role: "CUSTOMER",
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        location: { lat: "", lng: "" },
        restaurantProfile: {
            restaurantName: "",
            deliveryRadiusKm: 10,
            address: { ...initialAddress },
            location: { lat: "", lng: "" },
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const hasCapturedLocation =
        Boolean(data.location.lat && data.location.lng) ||
        Boolean(
            data.restaurantProfile.location.lat &&
                data.restaurantProfile.location.lng
        );

    const onChangeHandler = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("restaurantAddress.")) {
            const key = name.replace("restaurantAddress.", "");
            setData((prev) => ({
                ...prev,
                restaurantProfile: {
                    ...prev.restaurantProfile,
                    address: { ...prev.restaurantProfile.address, [key]: value },
                },
            }));
            return;
        }

        if (name.startsWith("restaurantLocation.")) {
            const key = name.replace("restaurantLocation.", "");
            setData((prev) => ({
                ...prev,
                restaurantProfile: {
                    ...prev.restaurantProfile,
                    location: { ...prev.restaurantProfile.location, [key]: value },
                },
            }));
            return;
        }

        if (name.startsWith("location.")) {
            const key = name.replace("location.", "");
            setData((prev) => ({
                ...prev,
                location: { ...prev.location, [key]: value },
            }));
            return;
        }

        if (name.startsWith("restaurantProfile.")) {
            const key = name.replace("restaurantProfile.", "");
            setData((prev) => ({
                ...prev,
                restaurantProfile: { ...prev.restaurantProfile, [key]: value },
            }));
            return;
        }

        setData((prev) => ({ ...prev, [name]: value }));
    };

    const fillCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported in this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const nextLocation = {
                    lat: coords.latitude.toFixed(6),
                    lng: coords.longitude.toFixed(6),
                };

                setData((prev) => ({
                    ...prev,
                    location: nextLocation,
                    restaurantProfile: {
                        ...prev.restaurantProfile,
                        location: nextLocation,
                    },
                }));
                toast.success("Current location added.");
            },
            () => toast.error("Unable to fetch your current location.")
        );
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (
                data.role === "RESTAURANT" &&
                (!data.restaurantProfile.location.lat ||
                    !data.restaurantProfile.location.lng)
            ) {
                toast.error("Please tap Use Current Location for the restaurant.");
                setIsLoading(false);
                return;
            }

            const payload =
                data.role === "RESTAURANT"
                    ? {
                          role: "RESTAURANT",
                          name: data.restaurantProfile.restaurantName || data.name,
                          email: data.email,
                          password: data.password,
                          phoneNumber: data.phoneNumber,
                          location: data.location,
                          restaurantProfile: data.restaurantProfile,
                      }
                    : {
                          role: "CUSTOMER",
                          name: data.name,
                          email: data.email,
                          password: data.password,
                          phoneNumber: data.phoneNumber,
                          location: data.location,
                      };

            const response = await registerUser(payload);

            if (response.status === 201 && response.data?.token) {
                const token = response.data.token;
                localStorage.setItem("token", token);
                localStorage.setItem("role", response.data.role || "CUSTOMER");
                localStorage.setItem("username", response.data.name || "User");
                setToken(token);
                await loadProtectedData();

                toast.success("Account created and logged in!");
                navigate(
                    response.data.role === "RESTAURANT"
                        ? "/admin"
                        : "/complete-address"
                );
            } else if (response.status === 201 && data.role === "RESTAURANT") {
                toast.success("Restaurant registered successfully. Please wait for admin approval before login.");
                navigate("/login");
            } else {
                toast.error("Unexpected server response. Please try again.");
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Registration failed.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onResetHandler = () => {
        setData({
            role: "CUSTOMER",
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            location: { lat: "", lng: "" },
            restaurantProfile: {
                restaurantName: "",
                deliveryRadiusKm: 10,
                address: { ...initialAddress },
                location: { lat: "", lng: "" },
            },
        });
    };

    return (
        <section className="login-page">
            <div className="login-page__glow login-page__glow--one"></div>
            <div className="login-page__glow login-page__glow--two"></div>

            <div className="container position-relative py-5">
                <div className="row justify-content-center align-items-center min-vh-100">
                    <div className="col-12 col-lg-10">
                        <div className="login-shell">
                            <div className="login-shell__content">
                                <span className="login-shell__eyebrow">Join Foodies</span>
                                <h1 className="login-shell__title">Create your food account</h1>
                                <p className="login-shell__text">
                                    Create a customer account in seconds, or
                                    register your restaurant to receive orders
                                    directly.
                                </p>

                                <div className="login-shell__highlights">
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-stars"></i>
                                        <span>Fresh daily picks</span>
                                    </div>
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-truck"></i>
                                        <span>Fast checkout setup</span>
                                    </div>
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-shop"></i>
                                        <span>Restaurant onboarding</span>
                                    </div>
                                </div>
                            </div>

                            <div className="login-card shadow-lg">
                                <div className="text-center mb-4">
                                    <div className="login-card__icon">
                                        <i className="bi bi-person-plus"></i>
                                    </div>
                                    <h3 className="fw-bold mt-3 mb-2">
                                        Create your account
                                    </h3>
                                    <p className="text-secondary mb-0">
                                        Start ordering or start selling.
                                    </p>
                                </div>

                                <form onSubmit={onSubmitHandler}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Account Type</label>
                                        <select
                                            className="form-select rounded-4"
                                            name="role"
                                            value={data.role}
                                            onChange={onChangeHandler}
                                            disabled={isLoading}
                                        >
                                            <option value="CUSTOMER">Customer</option>
                                            <option value="RESTAURANT">Restaurant</option>
                                        </select>
                                    </div>

                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type="text"
                                            className="form-control login-card__input ps-5 rounded-4"
                                            id="registerName"
                                            placeholder={data.role === "RESTAURANT" ? "Restaurant Owner" : "Full Name"}
                                            name="name"
                                            value={data.name}
                                            onChange={onChangeHandler}
                                            required
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="registerName">
                                            {data.role === "RESTAURANT" ? "Owner Name" : "Full Name"}
                                        </label>
                                        <i className="bi bi-person position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                    </div>

                                    {data.role === "RESTAURANT" && (
                                        <div className="form-floating mb-3 position-relative">
                                            <input
                                                type="text"
                                                className="form-control login-card__input ps-5 rounded-4"
                                                id="restaurantName"
                                                placeholder="Restaurant Name"
                                                name="restaurantProfile.restaurantName"
                                                value={data.restaurantProfile.restaurantName}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isLoading}
                                            />
                                            <label htmlFor="restaurantName">Restaurant Name</label>
                                            <i className="bi bi-shop position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                        </div>
                                    )}

                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type="email"
                                            className="form-control login-card__input ps-5 rounded-4"
                                            id="registerEmail"
                                            placeholder="name@example.com"
                                            name="email"
                                            value={data.email}
                                            onChange={onChangeHandler}
                                            required
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="registerEmail">Email address</label>
                                        <i className="bi bi-envelope position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                    </div>

                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type="tel"
                                            className="form-control login-card__input ps-5 rounded-4"
                                            id="registerPhone"
                                            placeholder="Phone Number"
                                            name="phoneNumber"
                                            value={data.phoneNumber}
                                            onChange={onChangeHandler}
                                            required
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="registerPhone">Phone Number</label>
                                        <i className="bi bi-telephone position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                    </div>

                                    <div className="form-floating mb-4 position-relative">
                                        <input
                                            type="password"
                                            className="form-control login-card__input ps-5 rounded-4"
                                            id="registerPassword"
                                            placeholder="Password"
                                            name="password"
                                            value={data.password}
                                            onChange={onChangeHandler}
                                            required
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="registerPassword">Password</label>
                                        <i className="bi bi-lock position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                    </div>

                                    {data.role === "CUSTOMER" ? null : (
                                        <>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0">Restaurant Address</h6>
                                                <div className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm rounded-pill"
                                                        onClick={fillCurrentLocation}
                                                        disabled={isLoading}
                                                    >
                                                        Use Current Location
                                                    </button>
                                                    {hasCapturedLocation && (
                                                        <div className="small text-success mt-1">
                                                            Current location captured
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="row g-3 mb-4">
                                                <div className="col-12">
                                                    <input className="form-control rounded-4" placeholder="Restaurant street address" name="restaurantAddress.line1" value={data.restaurantProfile.address.line1} onChange={onChangeHandler} required disabled={isLoading} />
                                                </div>
                                                <div className="col-md-4">
                                                    <input className="form-control rounded-4" placeholder="City" name="restaurantAddress.city" value={data.restaurantProfile.address.city} onChange={onChangeHandler} required disabled={isLoading} />
                                                </div>
                                                <div className="col-md-4">
                                                    <input className="form-control rounded-4" placeholder="State" name="restaurantAddress.state" value={data.restaurantProfile.address.state} onChange={onChangeHandler} required disabled={isLoading} />
                                                </div>
                                                <div className="col-md-4">
                                                    <input className="form-control rounded-4" placeholder="Zip" name="restaurantAddress.zipcode" value={data.restaurantProfile.address.zipcode} onChange={onChangeHandler} required disabled={isLoading} />
                                                </div>
                                                {!hasCapturedLocation && (
                                                    <div className="col-12">
                                                        <p className="small text-muted mb-0">
                                                            Use the current-location button so customers can discover this restaurant nearby.
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="col-12">
                                                    <input className="form-control rounded-4" placeholder="Delivery radius in km" name="restaurantProfile.deliveryRadiusKm" type="number" min="1" value={data.restaurantProfile.deliveryRadiusKm} onChange={onChangeHandler} required disabled={isLoading} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="d-grid gap-3">
                                        <button
                                            className="btn login-card__button btn-lg fw-semibold rounded-4"
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
                                                    Creating Account...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-person-check me-2"></i>
                                                    Sign Up
                                                </>
                                            )}
                                        </button>

                                        <button
                                            className="btn btn-outline-secondary btn-sm rounded-4"
                                            type="button"
                                            onClick={onResetHandler}
                                            disabled={isLoading}
                                        >
                                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                                            Reset
                                        </button>
                                    </div>

                                    <div className="mt-4 text-center small">
                                        Already have an account?{" "}
                                        <Link
                                            to="/login"
                                            className="text-decoration-none fw-semibold login-card__link"
                                        >
                                            Login here
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;
