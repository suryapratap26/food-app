import AdminLayout from "./AdminLayout";
import { useEffect, useState } from "react";
import orderService from "../../service/orderService";
import { fetchFoodList } from "../../service/foodService";

const AdminDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalFoods, setTotalFoods] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const orders = await orderService.getAllOrders();
        const foods = await fetchFoodList();
        setTotalOrders(orders.length);
        setTotalFoods(foods.length);
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      }
    };
    loadStats();
  }, []);

  return (
    <AdminLayout>
      <div className="container-fluid">
        <h2 className="fw-bold text-primary mb-4">Dashboard Overview</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
              <h5 className="text-muted mb-2">Total Orders</h5>
              <h2 className="text-primary fw-bold">{totalOrders}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
              <h5 className="text-muted mb-2">Total Foods</h5>
              <h2 className="text-success fw-bold">{totalFoods}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
              <h5 className="text-muted mb-2">Platform Status</h5>
              <h2 className="text-warning fw-bold">Active</h2>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
