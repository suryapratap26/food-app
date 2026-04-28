import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { storeContext } from "../../context/StoreContext";
import { logoutUser } from "../../service/userService";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { setToken, setQuantities } = useContext(storeContext);
  const adminName = localStorage.getItem("username") || "Admin";
  const role = localStorage.getItem("role");
  const panelTitle = role === "RESTAURANT" ? "Restaurant Command" : "Admin Command";
  const panelSubtitle =
    role === "RESTAURANT"
      ? "Manage menu updates, active orders, and store performance."
      : "Oversee operations, approvals, and marketplace health.";

  const handleLogout = () => {
    logoutUser();
    setToken("");
    setQuantities({});
    navigate("/login");
  };

  return (
    <nav className="admin-shell__navbar">
      <div>
        <h1 className="admin-shell__navbar-title h4">{panelTitle}</h1>
        <p className="admin-shell__navbar-subtitle">{panelSubtitle}</p>
      </div>
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <div className="admin-shell__user-pill">
          <span className="admin-shell__avatar">
            {adminName.charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="fw-semibold">{adminName}</div>
            <div className="small text-muted">{role === "RESTAURANT" ? "Restaurant Manager" : "Platform Admin"}</div>
          </div>
        </div>
        <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
