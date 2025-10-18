import { useContext } from "react";
import "./cart.css";
import { Link, useNavigate } from "react-router-dom";
import { storeContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../utils/cartUtils";

const Cart = () => {
  const { foodList, decreaseQty, increaseQty, quantities, removeFromCart, token } =
    useContext(storeContext);
  const navigate = useNavigate();

  // ✅ Define cartItems first
  const cartItems = foodList.filter((food) => quantities[food.id] > 0);
  const isReadyForCheckout = cartItems.length > 0 && token;

  const { subTotal, shipping, tax, total } = calculateCartTotals(
    cartItems,
    quantities
  );

  const safeItemTotal = (price, qty) => {
    const p = Number(price) || 0;
    const q = Number(qty) || 0;
    return (p * q).toFixed(2);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-5">Your Shopping Cart</h1>
      <div className="row">
        <div className="col-lg-8">
          {cartItems.length === 0 ? (
            <p className="text-muted">Your cart is empty.</p>
          ) : (
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                {cartItems.map((food) => (
                  <div
                    className="row cart-item align-items-center mb-3"
                    key={food.id}
                  >
                    <div className="col-md-3">
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="img-fluid rounded"
                      />
                    </div>
                    <div className="col-md-5">
                      <h5 className="card-title">{food.name}</h5>
                      <p className="text-muted small mb-0">
                        Category: {food.category}
                      </p>
                    </div>
                    <div className="col-md-2">
                      <div className="input-group quantity-selector">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          type="button"
                          onClick={() => decreaseQty(food.id)}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center quantity-input"
                          value={quantities[food.id] || 0}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          type="button"
                          onClick={() => increaseQty(food.id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="col-md-2 text-end">
                      <p className="fw-bold mb-1">
                        &#8377;{safeItemTotal(food.price, quantities[food.id])}
                      </p>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(food.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    <hr className="mt-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-start mb-4">
            <Link to="/explore" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>Continue Shopping
            </Link>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card cart-summary shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal</span>
                <span>&#8377;{subTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping</span>
                <span>&#8377;{shipping.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Tax</span>
                <span>&#8377;{tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                <span>Total</span>
                <span>&#8377;{total.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-primary w-100"
                disabled={!isReadyForCheckout}
                onClick={() => navigate(token ? "/order" : "/login")}
              >
                {token ? "Proceed to Checkout" : "Login to Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
