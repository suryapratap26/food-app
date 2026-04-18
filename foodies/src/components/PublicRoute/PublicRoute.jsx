import { Navigate } from "react-router-dom";

const PublicRoute = ({ element: Component }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
        return <Navigate to={role === "ADMIN" ? "/admin" : "/"} replace />;
    }

    return <Component />;
};

export default PublicRoute;
