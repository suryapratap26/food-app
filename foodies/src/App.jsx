import { Routes, Route, useLocation } from "react-router-dom";
import Menubar from "./components/Menubar/Menubar";
import Footer from "./components/footer/Footer";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import ExploreFood from "./pages/explore food/ExploreFood";
import ContactUs from "./pages/contact/Contact";
import FoodDetails from "./pages/FoodDetails/FoodDetails";
import Cart from "./pages/cart/Cart";
import PlaceOrder from "./pages/place-order/PlaceOrder";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import MyOrder from "./pages/MyOrder/MyOrder";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageFood from "./pages/admin/ManageFood";
import AllOrders from "./pages/admin/AllOrders";
import AddFood from "./pages/admin/AddFood";
import CreateAdmin from "./pages/admin/CreateAdmin";

const App = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div>
     {!isAdminRoute && <Menubar />}
      
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreFood />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/cart" element={<ProtectedRoute element={Cart} />} />
        <Route path="/order" element={<ProtectedRoute element={PlaceOrder} />} />
        <Route path="/myorders" element={<ProtectedRoute element={MyOrder} />} />

        <Route path="/admin" element={<ProtectedRoute element={AdminDashboard} requiredRole="ADMIN" />} />
         <Route path="/admin/createAdmin" element={<ProtectedRoute element={CreateAdmin} requiredRole="ADMIN" />} />
       <Route path="/admin/manage-food" element={<ProtectedRoute element={ManageFood} requiredRole="ADMIN" />} />
        <Route path="/admin/orders" element={<ProtectedRoute element={AllOrders} requiredRole="ADMIN" />} />
        <Route path="/admin/addfood" element={<ProtectedRoute element={AddFood} requiredRole="ADMIN" />} />
      </Routes>
      
      {/* Show Footer only if the current path is NOT an admin route */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;