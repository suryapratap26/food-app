import { useState } from 'react';
import { asset } from './../../assets/asset';
import { addFood } from '../../service/foodService';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const initialDataState = {
  name: '',
  category: 'Select a category',
  description: '',
  price: '',
  imageUrl: ''
};

const AddFood = () => {
  const role = localStorage.getItem("role");
  const [data, setData] = useState(initialDataState);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!data.imageUrl.trim()) {
      toast.error('Please enter an image string or image URL.');
      return;
    }

    if (data.category === 'Select a category' || data.category === '') {
      toast.error('Please select a valid food category.');
      return;
    }

    try {
      await addFood(
        {
          ...data,
          imageUrl: data.imageUrl.trim(),
        },
        data.imageUrl.trim()
      );
      toast.success("Food added successfully");
      setData(initialDataState);
    } catch (error) {
      console.error("Error adding food:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error adding food. Please check network/server response.";
      toast.error(errorMessage);
    }
  };

  const previewImage = data.imageUrl.trim() || asset.upload;

  return (
    <AdminLayout>
      <div className="mx-2 mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 card shadow-sm p-4">
            <form onSubmit={onSubmitHandler}>
              <h2 className="text-center mb-4">
                {role === "RESTAURANT" ? "Add Food For Your Restaurant" : "Add Food"}
              </h2>

              <div className="mb-3">
                <label htmlFor="imageUrl" className="form-label d-block fw-bold">
                  Image Preview
                </label>
                <img
                  src={previewImage}
                  alt="Food preview"
                  width={90}
                  className="rounded border p-1 mb-3"
                  onError={(e) => {
                    e.currentTarget.src = asset.upload;
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="Paste temporary image string or image URL"
                  value={data.imageUrl}
                  onChange={onChangeHandler}
                  required
                />
                <small className="text-muted">
                  Temporary mode: use a plain string image path or full URL instead of file upload.
                </small>
              </div>

              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-bold">Food Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  required
                  name="name"
                  onChange={onChangeHandler}
                  value={data.name}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label fw-bold">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  required
                  name="description"
                  onChange={onChangeHandler}
                  value={data.description}
                  rows="3"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="price" className="form-label fw-bold">Price (Rs)</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  required
                  name="price"
                  onChange={onChangeHandler}
                  value={data.price}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label fw-bold">Category</label>
                <select
                  name="category"
                  id="category"
                  className="form-control"
                  onChange={onChangeHandler}
                  value={data.category}
                  required
                >
                  <option value="Select a category" disabled>Select a category</option>
                  <option value="biryani">Biryani</option>
                  <option value="burger">Burger</option>
                  <option value="cakes">Cakes</option>
                  <option value="icecreame">Ice Cream</option>
                  <option value="pizza">Pizza</option>
                  <option value="rolls">Rolls</option>
                  <option value="salad">Salad</option>
                </select>
              </div>

              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary btn-lg">Add Food Item</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddFood;
