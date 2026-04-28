import "./menubar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { asset } from "./../../assets/asset";
import { useContext, useRef } from "react";
import { storeContext } from "../../context/StoreContext";
import { logoutUser } from "../../service/userService";

const Menubar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);
    const { quantities, setQuantities, token, setToken, userProfile } =
        useContext(storeContext);
    const role = localStorage.getItem("role");
    const isManager = role === "ADMIN" || role === "RESTAURANT";
    const uniqueItemsInCart = Object.values(quantities).filter(
        (qty) => qty > 0
    ).length;

    const isActive = (path) => location.pathname === path;

    const closeNavbarMenu = () => {
        if (window.innerWidth >= 992 || !menuRef.current) {
            return;
        }

        const collapseInstance = window.bootstrap?.Collapse.getOrCreateInstance(
            menuRef.current
        );
        collapseInstance?.hide();
    };

    const logout = () => {
        logoutUser();
        setToken("");
        setQuantities({});
        closeNavbarMenu();
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light sticky-top py-2 menubar">
            <div className="container">
                <Link
                    to="/"
                    className="navbar-brand d-flex align-items-center gap-2"
                    onClick={closeNavbarMenu}
                >
                    <img
                        src={asset.logo}
                        height={42}
                        width={42}
                        alt="App logo"
                        className="rounded-circle"
                    />
                    <span className="fw-bold menubar-brand-text fs-5">KSPK Foods</span>
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

                <div className="collapse navbar-collapse" id="navbarMenu" ref={menuRef}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                        <li className="nav-item">
                            <Link
                                className={
                                    isActive("/") ? "nav-link active fw-semibold" : "nav-link"
                                }
                                to="/"
                                onClick={closeNavbarMenu}
                            >
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={
                                    isActive("/explore")
                                        ? "nav-link active fw-semibold"
                                        : "nav-link"
                                }
                                to="/explore"
                                onClick={closeNavbarMenu}
                            >
                                Explore
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={
                                    isActive("/contact")
                                        ? "nav-link active fw-semibold"
                                        : "nav-link"
                                }
                                to="/contact"
                                onClick={closeNavbarMenu}
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        {!isManager && (
                            <Link
                                to="/cart"
                                className="position-relative"
                                onClick={closeNavbarMenu}
                            >
                                <img
                                    src={asset.cart}
                                    height={36}
                                    width={36}
                                    alt="Cart icon"
                                    className="cart-icon"
                                />
                                {uniqueItemsInCart > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill menubar-badge">
                                        {uniqueItemsInCart}
                                    </span>
                                )}
                            </Link>
                        )}

                        {!token ? (
                            <>
                                <button
                                    className="btn btn-outline-primary rounded-pill px-3"
                                    onClick={() => {
                                        closeNavbarMenu();
                                        navigate("/login");
                                    }}
                                >
                                    Login
                                </button>
                                <button
                                    className="btn btn-primary rounded-pill px-3"
                                    onClick={() => {
                                        closeNavbarMenu();
                                        navigate("/register");
                                    }}
                                >
                                    Register
                                </button>
                            </>
                        ) : (
                            <div className="dropdown text-end">
                                <a
                                    href="#"
                                    className="d-block menubar-profile-toggle text-decoration-none dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <img
                                        src={asset.profile}
                                        alt="profile"
                                        height={36}
                                        width={36}
                                        className="rounded-circle border border-2 menubar-profile"
                                    />
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end text-small shadow">
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                closeNavbarMenu();
                                                navigate(isManager ? "/admin" : "/myorders");
                                            }}
                                        >
                                            <i className="bi bi-bag-check me-2"></i>
                                            {isManager ? "Dashboard" : "Orders"}
                                        </button>
                                    </li>
                                    {!isManager && (
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => {
                                                    closeNavbarMenu();
                                                    navigate("/profile");
                                                }}
                                            >
                                                <i className="bi bi-person-gear me-2"></i>
                                                Profile
                                            </button>
                                        </li>
                                    )}
                                    {!isManager && userProfile?.savedAddress?.city && (
                                        <li className="dropdown-item-text small text-muted">
                                            Delivering near {userProfile.savedAddress.city}
                                        </li>
                                    )}
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
