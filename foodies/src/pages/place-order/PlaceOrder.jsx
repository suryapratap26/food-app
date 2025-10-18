// src/pages/place-order/PlaceOrder.jsx
import { useContext, useState } from "react";
import { asset } from "../../assets/asset";
import { storeContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../utils/cartUtils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import PaymentSection from "./PaymentSection";

// Load Stripe Public Key securely
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

// Add default values for props for safety (though navigate/clearCart are expected)
const PlaceOrder = ({ clearCart = () => {}, navigate = () => {} }) => {
    // Add default values for safer context access
    const { foodList = [], quantities = {}, token } = useContext(storeContext);

    // Initialize state with default country selected to avoid Stripe validation error
    const [data, setData] = useState({
        firstName: "", lastName: "", email: "", phone: "", address: "", state: "",
        country: "IN", // Set default to avoid empty string error
        city: "", zipcode: "",
    });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = (e) => {
        e.preventDefault();
        toast.info("Please fill out the payment section below.");
    };

    const cartItems = foodList.filter((f) => quantities[f.id] > 0);
    const { subTotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);

    const createOrderData = () => ({
        // The address string sent to your server
        userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.city}, ${data.state}, ${data.country}, ${data.zipcode}`,
        phoneNumber: data.phone,
        email: data.email,
        orderItems: cartItems.map((item) => ({
            foodId: item.id,
            quantity: quantities[item.id],
            price: item.price * quantities[item.id],
            category: item.category,
            imageUrl: item.imageUrl,
            description: item.description,
            name: item.name,
        })),
        amount: Number(total).toFixed(2),
        orderStatus: "preparing",

        // Pass essential billing details separately for PaymentSection's use
        name: `${data.firstName} ${data.lastName}`.trim(),
        countryCode: data.country, // Use this for the specific country code in the billing details
    });

    return (
        <div className="container mt-4">
            <main>
                <div className="py-5 text-center">
                    <img className="d-block mx-auto" src={asset.logo} alt="logo" width="98" height="98" />
                    <h2 className="mt-3 fw-bold text-primary">Checkout</h2>
                </div>

                <div className="row g-5">
                    {/* Order Summary */}
                    <div className="col-md-5 col-lg-4 order-md-last">
                        <h4 className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-primary">Order Summary</span>
                            <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
                        </h4>

                        <ul className="list-group mb-3 shadow-sm rounded-4">
                            {cartItems.map((food) => (
                                <li key={food.id} className="list-group-item d-flex justify-content-between lh-sm">
                                    <div>
                                        <h6 className="my-0">{food.name}</h6>
                                        <small className="text-muted">Qty: {quantities[food.id]}</small>
                                    </div>
                                    <span className="text-muted">
                    &#8377;{(food.price * quantities[food.id]).toFixed(2)}
                  </span>
                                </li>
                            ))}

                            <li className="list-group-item d-flex justify-content-between">
                                <span>Shipping</span>
                                <span className="text-muted">{subTotal === 0 ? "0.00" : shipping.toFixed(2)}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Tax (10%)</span>
                                <span className="text-muted">{tax.toFixed(2)}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Total (INR)</span>
                                <strong>&#8377;{total.toFixed(2)}</strong>
                            </li>
                        </ul>
                    </div>

                    {/* Billing and Payment */}
                    <div className="col-md-7 col-lg-8">
                        <h4 className="mb-3">Billing Address</h4>
                        <form className="needs-validation" onSubmit={onSubmitHandler}>
                            <div className="row g-3">
                                {/* First Name, Last Name, Email, Phone, Address, City, State, Zipcode inputs remain the same... */}

                                {/* ------------------------- */}
                                {/* Country Select (FIXED) */}
                                {/* ------------------------- */}
                                <div className="col-sm-6">
                                    <label className="form-label">First Name</label>
                                    <input type="text" className="form-control" name="firstName" value={data.firstName} onChange={onChangeHandler} required />
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label">Last Name</label>
                                    <input type="text" className="form-control" name="lastName" value={data.lastName} onChange={onChangeHandler} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" name="email" value={data.email} onChange={onChangeHandler} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Phone</label>
                                    <input type="tel" className="form-control" name="phone" value={data.phone} onChange={onChangeHandler} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Address</label>
                                    <input type="text" className="form-control" name="address" value={data.address} onChange={onChangeHandler} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">City</label>
                                    <input type="text" className="form-control" name="city" value={data.city} onChange={onChangeHandler} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">State</label>
                                    <input type="text" className="form-control" name="state" value={data.state} onChange={onChangeHandler} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Zip</label>
                                    <input type="text" className="form-control" name="zipcode" value={data.zipcode} onChange={onChangeHandler} required />
                                </div>
                                <div className="col-md-12">
                                    <label htmlFor="country" className="form-label">Country</label>
                                    <select
                                        className="form-select"
                                        id="country"
                                        name="country"
                                        value={data.country}
                                        onChange={onChangeHandler}
                                        required
                                    >
                                        <option value="IN">India</option> {/* Set initial selected option and value */}
                                        <option value="US">United States</option>
                                        <option value="GB">United Kingdom</option>
                                        {/* Add other countries as needed */}
                                    </select>
                                </div>
                            </div>
                        </form>

                        <hr className="my-4" />

                        {stripePromise ? (
                            <Elements stripe={stripePromise}>
                                <PaymentSection
                                    orderData={createOrderData()}
                                    token={token}
                                    cartItems={cartItems}
                                    data={data}
                                    clearCart={clearCart}
                                    navigate={navigate}
                                />
                            </Elements>
                        ) : (
                            <p className="text-danger">Missing Stripe public key configuration.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlaceOrder;