import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../../service/userService.js";
import { storeContext } from "../../context/StoreContext.jsx";

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
      // registerUser now auto-logs in (as defined in userService.js)
      const response = await registerUser(data);

      if (response.status === 201 && response.data?.token) {
        const token = response.data.token;

        // Store token and update global state
        localStorage.setItem("token", token);
        setToken(token);

        // Load any protected data (like user profile)
        await loadProtectedData();

        toast.success("Account created and logged in!");
        setData({ name: "", email: "", password: "" });
        navigate("/");
      } else {
        toast.error("Unexpected server response. Please try again.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Registration failed.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetHandler = () => {
    setData({ name: "", email: "", password: "" });
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
            <i className="bi bi-person-plus text-primary display-3"></i>
            <h3 className="fw-bold mt-3 text-primary">Create Account</h3>
            <p className="text-muted small">Join us to get started</p>
          </div>

          <form onSubmit={onSubmitHandler}>
            <div className="form-floating mb-3 position-relative">
              <input
                type="text"
                className="form-control ps-5 rounded-3"
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
                className="form-control ps-5 rounded-3"
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
                className="form-control ps-5 rounded-3"
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check me-2"></i> Sign Up
                  </>
                )}
              </button>

              <button
                className="btn btn-outline-secondary btn-sm rounded-3"
                type="button"
                onClick={onResetHandler}
                disabled={isLoading}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
              </button>
            </div>

            <div className="mt-4 text-center small">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-decoration-none text-primary fw-semibold"
              >
                Login here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
