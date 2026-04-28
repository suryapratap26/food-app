import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import "./AdminShell.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="d-flex admin-shell">
      <AdminSidebar />
      <div className="flex-grow-1 admin-shell__main">
        <AdminNavbar />
        <div className="admin-shell__content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
