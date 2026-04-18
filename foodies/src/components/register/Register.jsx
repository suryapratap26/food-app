import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../../service/userService.js";
import { storeContext } from "../../context/StoreContext.jsx";
import "../login/Login.css";

const Register = () => {
    const { setToken, loadProtectedData } = useContext(storeContext);
    const navigate = useNavigate();

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await registerUser(data);

            if (response.status === 201 && response.data?.token) {
                const token = response.data.token;
                localStorage.setItem("token", token);
                setToken(token);
                await loadProtectedData();

                toast.success("Account created and logged in!");
                setData({ name: "", email: "", password: "" });
                navigate("/");
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
        setData({ name: "", email: "", password: "" });
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
                                    Build your account to save favorites, place
                                    orders faster, and stay connected with every
                                    hot and fresh delivery.
                                </p>

                                <div className="login-shell__highlights">
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-stars"></i>
                                        <span>Fresh daily picks</span>
                                    </div>
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-truck"></i>
                                        <span>Fast doorstep delivery</span>
                                    </div>
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-gift-fill"></i>
                                        <span>Offers for members</span>
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
                                        Start ordering with the red and yellow food vibe.
                                    </p>
                                </div>

                                <form onSubmit={onSubmitHandler}>
                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type="text"
                                            className="form-control login-card__input ps-5 rounded-4"
                                            id="registerName"
                                            placeholder="Full Name"
                                            name="name"
                                            value={data.name}
                                            onChange={onChangeHandler}
                                            required
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="registerName">Full Name</label>
                                        <i className="bi bi-person position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                    </div>

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
