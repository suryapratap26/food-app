import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-light bg-white border-bottom px-4 py-3 shadow-sm">
      <span className="navbar-brand mb-0 h5 text-primary fw-bold">
        🍽️ Food Delivery Admin
      </span>
      <div className="d-flex align-items-center">
        <span className="me-3 text-muted">Welcome, {adminName}</span>
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
