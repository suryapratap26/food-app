import React, { useContext, useState, useMemo, useEffect } from "react";
import { asset } from "../../assets/asset";
import { storeContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../utils/cartUtils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PaymentSection from "./PaymentSection";
import "./PlaceOrder.css";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { foodList, quantities, token, clearAllCart, userProfile, saveUserProfile } =
    useContext(storeContext);
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeError, setStripeError] = useState("");

  const cartItems = useMemo(
    () => foodList.filter((f) => quantities[f.id] && quantities[f.id] > 0),
    [foodList, quantities]
  );

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to proceed with the order.");
      navigate("/login");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      toast.warn("Your cart is empty. Redirecting to cart.");
      navigate("/cart");
    }
  }, [cartItems.length, token, navigate]);

  useEffect(() => {
    let isMounted = true;

    if (!STRIPE_PUBLIC_KEY) {
      setStripeError("Card payments are unavailable right now.");
      setStripePromise(null);
      return undefined;
    }

    setStripeError("");
    loadStripe(STRIPE_PUBLIC_KEY)
      .then((stripeInstance) => {
        if (!isMounted) return;
        if (!stripeInstance) {
          setStripeError("Stripe failed to initialize. Please try again.");
          return;
        }
        setStripePromise(Promise.resolve(stripeInstance));
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Stripe initialization error:", error);
        setStripeError(
          "Unable to load card payments right now. You can still place a cash on delivery order."
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    country: "IN",
    city: "",
    zipcode: "",
  });

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    setData((prev) => ({
      ...prev,
      firstName: userProfile.savedAddress?.firstName || prev.firstName,
      lastName: userProfile.savedAddress?.lastName || prev.lastName,
      email: userProfile.email || prev.email,
      phone: userProfile.savedAddress?.phone || userProfile.phoneNumber || prev.phone,
      address: userProfile.savedAddress?.line1 || prev.address,
      state: userProfile.savedAddress?.state || prev.state,
      country: userProfile.savedAddress?.country || prev.country,
      city: userProfile.savedAddress?.city || prev.city,
      zipcode: userProfile.savedAddress?.zipcode || prev.zipcode,
    }));
  }, [userProfile]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
  };

  const { subTotal, shipping, tax, total } = useMemo(
    () => calculateCartTotals(cartItems, quantities),
    [cartItems, quantities]
  );

  const memoizedOrderData = useMemo(() => {
    return {
      userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.city}, ${data.state}, ${data.country}, ${data.zipcode}`,
      customerAddress: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        line1: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipcode: data.zipcode,
      },
      phoneNumber: data.phone,
      email: data.email,
      orderItems: cartItems.map((item) => ({
        foodId: item.id,
        quantity: quantities[item.id],
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        name: item.name,
      })),
      amount: parseFloat(Number(total).toFixed(2)),
      orderStatus: "preparing",
      paymentMethod: "CARD",
    };
  }, [data, total, cartItems, quantities]);

  const handleSaveAddress = async () => {
    try {
      await saveUserProfile({
        phoneNumber: data.phone,
        savedAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          line1: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zipcode: data.zipcode,
        },
      });
      toast.success("Delivery address saved to your account.");
    } catch (error) {
      console.error("handleSaveAddress error:", error);
      toast.error("Could not save your address.");
    }
  };

  if (!token || !cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mt-4 checkout-page">
      <main>
        <div className="py-5 text-center checkout-hero">
          <img
            className="d-block mx-auto checkout-hero__logo"
            src={asset.logo}
            alt="logo"
            width="98"
            height="98"
          />
          <h2 className="mt-3 fw-bold text-primary">Checkout</h2>
        </div>

        <div className="row g-5">
          <div className="col-md-5 col-lg-4 order-md-last">
            <div className="checkout-card p-4">
              <div className="checkout-card__header">
                <h4 className="checkout-card__title">Order Summary</h4>
                <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
              </div>

              <ul className="list-group mb-0 shadow-sm rounded-4 checkout-summary-list">
                {cartItems.map((food) => (
                  <li key={food.id} className="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                      <h6 className="my-0">{food.name}</h6>
                      <small className="text-muted">
                        {food.restaurantName} . Qty: {quantities[food.id]}
                      </small>
                    </div>
                    <span className="text-muted">
                      &#8377;{((food.price || 0) * (quantities[food.id] || 0)).toFixed(2)}
                    </span>
                  </li>
                ))}

                <li className="list-group-item d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span className="text-muted">&#8377;{subTotal.toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Shipping</span>
                  <span className="text-muted">&#8377;{shipping.toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Tax (10%)</span>
                  <span className="text-muted">&#8377;{tax.toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total (INR)</span>
                  <strong>&#8377;{total.toFixed(2)}</strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-7 col-lg-8">
            <div className="checkout-card p-4 p-lg-5">
              <div className="checkout-card__header">
                <div>
                  <h4 className="checkout-card__title">Billing Address</h4>
                  <p className="checkout-card__subtitle">
                    Your saved delivery address is loaded automatically and reused for future orders.
                  </p>
                </div>
              </div>

              <form className="needs-validation" onSubmit={onSubmitHandler}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="checkout-form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control checkout-input"
                      name="firstName"
                      value={data.firstName}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="checkout-form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control checkout-input"
                      name="lastName"
                      value={data.lastName}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="checkout-form-label">Email</label>
                    <input
                      type="email"
                      className="form-control checkout-input"
                      name="email"
                      value={data.email}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="checkout-form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control checkout-input"
                      name="phone"
                      value={data.phone}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="checkout-form-label">Address</label>
                    <input
                      type="text"
                      className="form-control checkout-input"
                      name="address"
                      value={data.address}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-form-label">City</label>
                    <input
                      type="text"
                      className="form-control checkout-input"
                      name="city"
                      value={data.city}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-form-label">State</label>
                    <input
                      type="text"
                      className="form-control checkout-input"
                      name="state"
                      value={data.state}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-form-label">Zip</label>
                    <input
                      type="text"
                      className="form-control checkout-input"
                      name="zipcode"
                      value={data.zipcode}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <label htmlFor="country" className="checkout-form-label">
                      Country
                    </label>
                    <select
                      className="form-select checkout-select"
                      id="country"
                      name="country"
                      value={data.country}
                      onChange={onChangeHandler}
                      required
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-outline-primary rounded-pill"
                      onClick={handleSaveAddress}
                    >
                      Save This Address
                    </button>
                  </div>
                </div>
              </form>

              <hr className="my-4" />

              <Elements stripe={stripePromise}>
                <PaymentSection
                  orderData={memoizedOrderData}
                  billingData={data}
                  token={token}
                  cartItems={cartItems}
                  clearCart={clearAllCart}
                  navigate={navigate}
                  stripeError={stripeError}
                />
              </Elements>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrder;
