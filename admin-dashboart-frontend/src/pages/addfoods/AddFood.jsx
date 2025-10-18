import { useState } from 'react';
import { asset } from './../../assets/asset';
import { addFood } from '../../services/foodService';
import { toast } from 'react-toastify';

const initialDataState = {
    name: '',
    category: 'Select a category',
    description: '',
    price: ''
};

const AddFood = () => {
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

        try {
            await addFood(data, image);
            toast.success("Food added successfully");
            
            // Correct way to reset both states
            setData(initialDataState);
            setImage(false); // Correctly call the state update function
        } catch (error) {
            console.error("Error adding food:", error);
            toast.error("Error in adding food");
        }
    };

    return (
        <div className="mx-2 mt-4">
            <div className="row justify-content-center">
                <div className="col-md-4 card col-lg-6">
                    <form className="cardbody" onSubmit={onSubmitHandler}>
                        <h2 className="text-center mb-4">Add Food</h2>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input type="text" className="form-control" id="name" required name="name" onChange={onChangeHandler} value={data.name} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <input type="text" className="form-control" id="description" required name="description" onChange={onChangeHandler} value={data.description} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="price" className="form-label">Price</label>
                            <input type="number" className="form-control" id="price" required name="price" onChange={onChangeHandler} value={data.price} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="image" className="form-label">
                                <img src={image ? URL.createObjectURL(image) : asset.upload} alt="Upload" width={90} />
                            </label>
                            <input type="file" className="form-control" id="image" hidden onChange={(e) => setImage(e.target.files[0])} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select name="category" id="category" className="form-control" onChange={onChangeHandler} value={data.category}>
                                <option value="" disabled>Select a category</option>
                                <option value="dal-roti">Pizzas</option>
                                <option value="burger">Burger</option>
                                <option value="cake">Sides</option>
                                <option value="pizza">Desserts</option>
                                <option value="coffee">Drinks</option>
                            </select>
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary btn-lg">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddFood;