import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFoodDetail } from "./../../service/foodService";
import { storeContext } from "./../../context/StoreContext";
import { toast } from "react-toastify";
import "./FoodDetails.css";

const FoodDetails = () => {
    const { increaseQty } = useContext(storeContext);
    const { id } = useParams();
    const [data, setData] = useState({});
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    const addToCart = () => {
        for (let i = 0; i < quantity; i++) {
            increaseQty(data.id);
        }
        toast.success(`${data.name} added to cart!`);
        navigate("/cart");
    };

    useEffect(() => {
        const loadFoodDetail = async (id) => {
            try {
                const response = await fetchFoodDetail(id);
                setData(response);
            } catch (error) {
                toast.error("Error fetching food details.");
            }
        };
        loadFoodDetail(id);
    }, [id]);

    const handleQuantityChange = (val) => {
        if (quantity + val >= 1) setQuantity(quantity + val);
    };

    return (
        <section className="food-details-section py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="row gx-4 gx-lg-5 align-items-center">
                    {/* Image */}
                    <div className="col-md-6 mb-4 mb-md-0">
                        <div className="card shadow-sm rounded-4 overflow-hidden">
                            <img
                                className="card-img-top food-img"
                                src={data.imageUrl}
                                alt={data.name}
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="col-md-6">
                        <div className="mb-2">
              <span className="badge bg-warning text-dark px-3 py-2">
                {data.category}
              </span>
                        </div>

                        <h1 className="display-5 fw-bolder mb-3">{data.name}</h1>

                        <div className="fs-4 text-primary fw-semibold mb-3">
                            ₹ {data.price}
                        </div>

                        <p className="lead mb-4">{data.description}</p>

                        <div className="d-flex align-items-center gap-3">
                            {/* Quantity Selector */}
                            <div className="input-group quantity-selector" style={{ maxWidth: "120px" }}>
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                >
                                    <i className="bi bi-dash"></i>
                                </button>
                                <input
                                    type="text"
                                    className="form-control text-center"
                                    value={quantity}
                                    readOnly
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                >
                                    <i className="bi bi-plus"></i>
                                </button>
                            </div>

                            {/* Add to Cart */}
                            <button
                                className="btn btn-primary btn-lg px-4 shadow-sm"
                                onClick={addToCart}
                            >
                                <i className="bi bi-cart-fill me-2"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FoodDetails;
