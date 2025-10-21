import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import orderService from "../../service/orderService";
import { toast } from "react-toastify";

// Helper function to render a colored badge for order status
const getStatusBadge = (status) => {
  let badgeClass = "bg-secondary";
  switch (status) {
    case "PROCESSING":
    case "PREPARING":
      badgeClass = "bg-warning text-dark";
      break;
    case "DELIVERED":
      badgeClass = "bg-success";
      break;
    case "CANCELLED":
    case "PAYMENT_FAILED":
      badgeClass = "bg-danger";
      break;
    case "PLACED":
      badgeClass = "bg-info text-dark";
      break;
    default:
      badgeClass = "bg-secondary";
  }
  return <span className={`badge ${badgeClass}`}>{status}</span>;
};

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch all orders (Admin only)
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      // Ensure orders are sorted by date, e.g., newest first (assuming createdAt is available)
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      // Use the Error object message if available
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update order status
  const updateStatus = async (orderId, newStatus) => {
    // ⚠️ Prevent unnecessary update if status hasn't changed
    const currentOrder = orders.find(o => o.id === orderId);
    if (currentOrder && currentOrder.orderStatus === newStatus) return;

    // ✅ Optimistic update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, orderStatus: newStatus } : order
      )
    );

    try {
      // ✅ Sync with backend
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated!");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(error.message || "Failed to update order status");
      // ❌ Rollback by reloading data from the server on failure
      loadOrders(); 
    }
  };

  useEffect(() => {
    loadOrders();
  }, []); // Run only once on mount

  return (
    <AdminLayout>
      <div className="container-fluid">
        <h2 className="fw-bold text-primary mb-4">All Orders</h2>

        {/* --- Conditional Rendering (Loading/Empty/Data) --- */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="alert alert-info text-center">No orders found.</div>
        ) : (
          /* --- Orders Table --- */
          <div className="table-responsive shadow-sm rounded-4">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    {/* Display first 8 characters of ID */}
                    <td>{order.id.substring(0, 8)}...</td>
                    <td>{order.email || order.userEmail || "N/A"}</td> 
                    <td>₹{order.amount.toFixed(2)}</td>
                    
                    {/* Status Dropdown with current value */}
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        // Optionally disable if order is final (e.g., DELIVERED/CANCELLED)
                        // disabled={['DELIVERED', 'CANCELLED'].includes(order.orderStatus)}
                      >
                        {/* Ensure your options match the backend enum values (PROCESSING is often a good initial state) */}
                        <option value="PLACED">PLACED</option> 
                        <option value="PROCESSING">PROCESSING</option> 
                        <option value="PREPARING">PREPARING</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    {/* Payment Status Badge */}
                    <td>
                      <span
                        className={`badge ${
                          order.paymentStatus === "SUCCESS"
                            ? "bg-success"
                            : order.paymentStatus === "FAILED"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Date Formatting for better user experience */}
                    <td>
                      {/* Use a robust date format that includes time, as orders are time-sensitive */}
                      {new Date(order.createdAt || order.id).toLocaleString("en-IN", {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllOrders;