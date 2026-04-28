import { NavLink } from "react-router-dom";
import { asset } from "./../../assets/asset";

const getNavLinkClass = ({ isActive }) =>
  `admin-shell__nav-link ${isActive ? "active fw-semibold" : ""}`;

const AdminSidebar = () => {
  const role = localStorage.getItem("role");
  const isRestaurant = role === "RESTAURANT";
  const roleLabel = isRestaurant ? "Restaurant" : "Admin";

  return (
    <aside className="admin-shell__sidebar">
      <div className="admin-shell__brand">
        <img src={asset.logo} height={42} width={42} alt="KSPK Foods logo" />
        <div>
          <div className="fw-bold text-white">KSPK Foods</div>
          <div className="admin-shell__role-chip">
            <i className="bi bi-shield-check"></i>
            {roleLabel}
          </div>
        </div>
      </div>

      <ul className="nav flex-column admin-shell__nav">
        <li>
          <NavLink to="/admin" end className={getNavLinkClass}>
            <i className="bi bi-speedometer2 me-2"></i>
            {isRestaurant ? "Restaurant" : "Dashboard"}
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/manage-food" className={getNavLinkClass}>
            <i className="bi bi-basket me-2"></i> Manage Food
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/orders" className={getNavLinkClass}>
            <i className="bi bi-receipt me-2"></i>
            {isRestaurant ? "Restaurant Orders" : "All Orders"}
          </NavLink>
        </li>
        {isRestaurant && (
          <li>
            <NavLink to="/admin/addfood" className={getNavLinkClass}>
              <i className="bi bi-upload me-2"></i> Add Food
            </NavLink>
          </li>
        )}
        {role === "ADMIN" && (
          <li>
            <NavLink to="/admin/createadmin" className={getNavLinkClass}>
              <i className="bi bi-person-plus me-2"></i>Create Admin
            </NavLink>
          </li>
        )}
        {role === "ADMIN" && (
          <li>
            <NavLink to="/admin/pending-restaurants" className={getNavLinkClass}>
              <i className="bi bi-shop-window me-2"></i>Pending Restaurants
            </NavLink>
          </li>
        )}
      </ul>

      <div className="admin-shell__sidebar-note">
        <div className="small text-uppercase fw-semibold mb-2">Control Center</div>
        <p className="mb-0 small">
          {isRestaurant
            ? "Track incoming orders, update your menu, and keep service moving."
            : "Monitor platform activity, manage menus, and approve restaurant partners."}
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
