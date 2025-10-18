import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { login } from "../../service/AppService.js";
import { toast } from "react-toastify";
import { storeContext } from "../../context/StoreContext.jsx";

const Login = () => {
    const { setToken, loadCartData } = useContext(storeContext);
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
            const response = await login(data);
            if (response.status === 200) {
                setToken(response.data.token);
                await loadCartData(response.data.token);
                localStorage.setItem("token", response.data.token);
                toast.success("Login successful!");
                navigate("/");
            } else {
                toast.error(response.statusText);
            }
        } catch {
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center min-vh-100"
            style={{
                background: "linear-gradient(135deg, #6610f2, #0d6efd)",
            }}
        >
            <div className="col-10 col-sm-8 col-md-6 col-lg-4">
                <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white bg-opacity-75 backdrop-blur fade-in">
                    <div className="text-center mb-4">
                        <i className="bi bi-person-circle text-primary display-3"></i>
                        <h3 className="fw-bold mt-3 text-primary">Welcome Back</h3>
                        <p className="text-muted small">Sign in to continue</p>
                    </div>

                    <form onSubmit={onSubmitHandler}>
                        <div className="form-floating mb-3 position-relative">
                            <input
                                type="email"
                                className="form-control ps-5 rounded-3"
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
                                className="form-control ps-5 rounded-3"
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
                                className="btn btn-primary btn-lg fw-semibold shadow-sm rounded-3"
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
                                        <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                                    </>
                                )}
                            </button>

                            <button
                                className="btn btn-outline-secondary btn-sm rounded-3"
                                type="reset"
                                disabled={isLoading}
                            >
                                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                            </button>
                        </div>

                        <div className="mt-4 text-center small">
                            New user?{" "}
                            <Link
                                to="/register"
                                className="text-decoration-none text-primary fw-semibold"
                            >
                                Create an account
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
