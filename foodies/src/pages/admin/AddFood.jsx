import { useState } from 'react';
import { asset } from './../../assets/asset';
import { addFood } from '../../service/foodService';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const initialDataState = {
    name: '',
    category: 'Select a category', // Initialize with the disabled placeholder value
    description: '',
    price: ''
};

const AddFood = () => {
    // image state will hold the File object
    const [image, setImage] = useState(false); 
    const [data, setData] = useState(initialDataState);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Please upload an image.');
            return;
        }
        
        // CRITICAL FIX 1: Validate category selection
        if (data.category === 'Select a category' || data.category === '') {
            toast.error('Please select a valid food category.');
            return;
        }

        try {
            // The addFood service function expects the food data object and the File object
            await addFood(data, image); 
            toast.success("Food added successfully");
            
            // Correctly reset both states on success
            setData(initialDataState);
            setImage(false); 
        } catch (error) {
            console.error("Error adding food:", error);
            // Provide a general error message from the frontend
            const errorMessage = error.response?.data?.message || "Error adding food. Please check network/server response.";
            toast.error(errorMessage);
        }
    };

    return (
       <AdminLayout>
         <div className="mx-2 mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6 card shadow-sm p-4">
                    <form onSubmit={onSubmitHandler}>
                        <h2 className="text-center mb-4">Add Food</h2>
                        
                        {/* Image Upload Section */}
                        <div className="mb-3">
                            <label htmlFor="image" className="form-label d-block fw-bold">Image Preview</label>
                            <label htmlFor="image" className="cursor-pointer">
                                {/* Displays file preview or upload icon */}
                                <img 
                                    src={image ? URL.createObjectURL(image) : asset.upload} 
                                    alt="Upload" 
                                    width={90} 
                                    className="rounded border p-1"
                                />
                            </label>
                            {/* Sets the image state to the File object */}
                            <input 
                                type="file" 
                                className="form-control" 
                                id="image" 
                                hidden 
                                accept="image/*" // Restrict to image files
                                onChange={(e) => setImage(e.target.files[0])} 
                            />
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
                            <textarea // Changed to textarea for multi-line input
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
                            <label htmlFor="price" className="form-label fw-bold">Price (₹)</label>
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
                        
                        {/* Category Select (FIXED options) */}
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
                                {/* CRITICAL FIX 2: Updated categories based on your provided list */}
                                <option value="biryani">Biryani</option>
                                <option value="burger">Burger</option>
                                <option value="cakes">Cakes</option>
                                <option option="icecreame">Ice Cream</option>
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