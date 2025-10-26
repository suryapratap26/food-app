import { NavLink } from "react-router-dom";
import {asset} from "./../../assets/asset"
const getNavLinkClass = ({ isActive }) =>
  `nav-link ${isActive ? "active fw-semibold text-primary" : "text-dark"}`;

const AdminSidebar = () => {
  return (
    <div className="bg-light border-end vh-100 p-3 shadow-sm">
      <h4 className="text-primary fw-bold mb-4">
        <img src={asset.logo} height={34} />
      </h4>
      <ul className="nav flex-column gap-2">
        <li>
          <NavLink
            to="/admin"
            end // Ensure it only matches exactly "/admin"
            className={getNavLinkClass}
          >
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/manage-food"
            className={getNavLinkClass}
          >
            <i className="bi bi-basket me-2"></i> Manage Food
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/orders"
            className={getNavLinkClass}
          >
            <i className="bi bi-receipt me-2"></i> All Orders
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/addfood"
            className={getNavLinkClass}
          >
            <i className="bi bi-upload me-2"></i> Add Food
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/createadmin"
            className={getNavLinkClass}
          >
            <i className="bi bi-receipt me-2"></i>Create Admin
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;