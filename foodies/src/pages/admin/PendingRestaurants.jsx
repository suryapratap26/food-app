import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import {
  getPendingRestaurants,
  updateRestaurantApproval,
} from "../../service/userService";

const PendingRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPendingRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getPendingRestaurants();
      setRestaurants(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load pending restaurants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRestaurants();
  }, []);

  const handleApproval = async (restaurantId, status) => {
    try {
      await updateRestaurantApproval(restaurantId, status);
      toast.success(
        status === "ACTIVE"
          ? "Restaurant approved successfully."
          : "Restaurant rejected."
      );
      setRestaurants((prev) => prev.filter((item) => item.id !== restaurantId));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update restaurant approval.");
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        <h2 className="fw-bold text-primary mb-4">Pending Restaurants</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-3">Loading pending restaurants...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="alert alert-info">No restaurants are waiting for approval.</div>
        ) : (
          <div className="table-responsive shadow-sm rounded-4">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>Restaurant</th>
                  <th>Owner Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td>{restaurant.restaurantProfile?.restaurantName || restaurant.name}</td>
                    <td>{restaurant.email}</td>
                    <td>{restaurant.phoneNumber || "N/A"}</td>
                    <td>
                      {[
                        restaurant.restaurantProfile?.address?.line1,
                        restaurant.restaurantProfile?.address?.city,
                        restaurant.restaurantProfile?.address?.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {restaurant.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApproval(restaurant.id, "ACTIVE")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleApproval(restaurant.id, "REJECTED")}
                        >
                          Reject
                        </button>
                      </div>
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

export default PendingRestaurants;
