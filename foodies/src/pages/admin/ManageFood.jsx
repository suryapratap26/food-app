import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { fetchFoodList, deleteFood } from "../../service/foodService";
import { toast } from "react-toastify";

const ManageFood = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFoods = async () => {
    try {
      const data = await fetchFoodList();
      setFoods(data);
    } catch (err) {
      toast.error("Failed to fetch food items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        await deleteFood(id);
        toast.success("Food deleted successfully!");
        loadFoods();
      } catch (err) {
        toast.error("Error deleting food");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        <h2 className="fw-bold text-primary mb-4">Manage Food Items</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-3">Loading food items...</p>
          </div>
        ) : foods.length === 0 ? (
          <p>No food items found.</p>
        ) : (
          <table className="table table-hover">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food.id}>
                  <td>{food.id}</td>
                  <td>
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      width="50"
                      className="rounded"
                    />
                  </td>
                  <td>{food.name}</td>
                  <td>{food.category}</td>
                  <td>₹{food.price}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(food.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageFood;
