import "./menubar.css";
import { Link, useNavigate } from "react-router-dom";
import { asset } from "./../../assets/asset";
import { useContext, useState } from "react";
import { storeContext } from "../../context/StoreContext";

const Menubar = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState("home");
    const { quantities, setQuantities, token, setToken } =
        useContext(storeContext);
    const uniqueItemsInCart = Object.values(quantities).filter(
        (qty) => qty > 0
    ).length;

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setQuantities({});
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-2 menubar">
            <div className="container">
            
                <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
                    <img
                        src={asset.logo}
                        height={42}
                        width={42}
                        alt="App logo"
                        className="rounded-circle"
                    />
                    <span className="fw-bold text-primary fs-5">FoodHaven</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMenu"
                    aria-controls="navbarMenu"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Nav Links */}
                <div className="collapse navbar-collapse" id="navbarMenu">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                        <li className="nav-item">
                            <Link
                                className={
                                    active === "home" ? "nav-link active fw-semibold" : "nav-link"
                                }
                                to="/"
                                onClick={() => setActive("home")}
                            >
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={
                                    active === "explore"
                                        ? "nav-link active fw-semibold"
                                        : "nav-link"
                                }
                                to="/explore"
                                onClick={() => setActive("explore")}
                            >
                                Explore
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={
                                    active === "contact"
                                        ? "nav-link active fw-semibold"
                                        : "nav-link"
                                }
                                to="/contact"
                                onClick={() => setActive("contact")}
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>

                   
                    <div className="d-flex align-items-center gap-3">
                       
                        <Link to="/cart" className="position-relative">
                            <img
                                src={asset.cart}
                                height={36}
                                width={36}
                                alt="Cart icon"
                                className="cart-icon"
                            />
                            {uniqueItemsInCart > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {uniqueItemsInCart}
                </span>
                            )}
                        </Link>

                       
                        {!token ? (
                            <>
                                <button
                                    className="btn btn-outline-primary rounded-3 px-3"
                                    onClick={() => navigate("/login")}
                                >
                                    Login
                                </button>
                                <button
                                    className="btn btn-primary rounded-3 px-3"
                                    onClick={() => navigate("/register")}
                                >
                                    Register
                                </button>
                            </>
                        ) : (
                            <div className="dropdown text-end">
                                <a
                                    href="#"
                                    className="d-block link-dark text-decoration-none dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <img
                                        src={asset.profile}
                                        alt="profile"
                                        height={36}
                                        width={36}
                                        className="rounded-circle border border-2 border-primary"
                                    />
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end text-small shadow">
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => navigate("/myorders")}
                                        >
                                            <i className="bi bi-bag-check me-2"></i> Orders
                                        </button>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={logout}>
                                            <i className="bi bi-box-arrow-right me-2"></i> Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Menubar;
