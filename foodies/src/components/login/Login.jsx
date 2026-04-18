import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { loginUser } from "../../service/userService.js";
import { toast } from "react-toastify";
import { storeContext } from "../../context/StoreContext.jsx";
import "./Login.css";

const Login = () => {
    const { setToken, loadProtectedData } = useContext(storeContext);
    const navigate = useNavigate();

    const [data, setData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await loginUser(data);

            if (response.token) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("role", response.role || "CUSTOMER");
                localStorage.setItem("username", response.username || "User");

                setToken(response.token);
                await loadProtectedData();

                toast.success("Login successful!");

                if (response.role === "ADMIN") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            } else {
                toast.error("Invalid login response from server");
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage =
                error?.response?.data?.message ||
                "Login failed. Please check your credentials and network.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onResetHandler = () => {
        setData({ email: "", password: "" });
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
                                <span className="login-shell__eyebrow">Foodies</span>
                                <h1 className="login-shell__title">Welcome back</h1>
                                <p className="login-shell__text">
                                    Sign in to track your favorite meals, manage
                                    your cart, and keep every craving one tap
                                    away.
                                </p>

                                <div className="login-shell__highlights">
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-lightning-charge-fill"></i>
                                        <span>Quick checkout</span>
                                    </div>
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-bag-check-fill"></i>
                                        <span>Live order updates</span>
                                    </div>
                                    <div className="login-shell__highlight">
                                        <i className="bi bi-heart-fill"></i>
                                        <span>Save your favorites</span>
                                    </div>
                                </div>
                            </div>

                            <div className="login-card shadow-lg">
                                <div className="text-center mb-4">
                                    <div className="login-card__icon">
                                        <i className="bi bi-person-circle"></i>
                                    </div>
                                    <h3 className="fw-bold mt-3 mb-2">
                                        Login to your account
                                    </h3>
                                    <p className="text-secondary mb-0">
                                        Your account is just a few seconds away.
                                    </p>
                                </div>

                                <form onSubmit={onSubmitHandler}>
                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type="email"
                                            className="form-control login-card__input ps-5 rounded-4"
                                            id="loginEmail"
                                            placeholder="name@example.com"
                                            name="email"
                                            value={data.email}
                                            onChange={onChangeHandler}
                                            required
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="loginEmail">Email address</label>
                                        <i className="bi bi-envelope position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                    </div>

                                    <div className="form-floating mb-4 position-relative">
                                        <input
                                            type="password"
                                            className="form-control login-card__input ps-5 rounded-4"
                                            id="loginPassword"
                                            placeholder="Password"
                                            name="password"
                                            value={data.password}
                                            onChange={onChangeHandler}
                                            required
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="loginPassword">Password</label>
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
                                                    Signing In...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                                    Sign In
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
                                        New user?{" "}
                                        <Link
                                            to="/register"
                                            className="text-decoration-none fw-semibold login-card__link"
                                        >
                                            Create an account
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

export default Login;
