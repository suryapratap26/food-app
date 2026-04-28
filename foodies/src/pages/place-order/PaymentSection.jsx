import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import initiateStripePayment from "./initiateStripePayment";
import orderService from "../../service/orderService";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
    invalid: { color: "#9e2146" },
  },
  hidePostalCode: false,
};

const PaymentSection = ({
  billingData,
  orderData,
  cartItems,
  clearCart,
  navigate,
  stripeError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const validateBilling = () => {
    if (!billingData) return "Missing billing information.";
    if (!billingData.firstName || !billingData.lastName) return "Full name required.";
    if (!billingData.email) return "Email required.";
    if (!billingData.address) return "Address required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingData.email)) return "Invalid email address.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items.");
      setIsProcessing(false);
      return;
    }

    const validationError = validateBilling();
    if (validationError) {
      toast.error(validationError);
      setIsProcessing(false);
      return;
    }

    const payload = {
      ...orderData,
      paymentMethod,
    };

    try {
      if (paymentMethod === "COD") {
        const responseData = await orderService.createOrder(payload);

        if (typeof clearCart === "function") {
          await clearCart();
        }

        toast.success("Order placed with Cash on Delivery.");
        if (typeof navigate === "function") navigate("/myorders");
        return responseData;
      }

      if (!stripe || !elements) {
        toast.error(stripeError || "Card payments are not ready yet.");
        return;
      }

      toast.info("Creating order and securing payment intent...");
      const responseData = await orderService.createOrder(payload);

      if (!responseData?.stripeClientSecret) {
        toast.error("Order created but missing payment secret. Please contact support.");
        return;
      }

      toast.success("Payment intent received. Confirming payment...");
      await initiateStripePayment(responseData, elements, stripe, billingData, clearCart, navigate);
    } catch (error) {
      console.error("PaymentSection handleSubmit error:", error);
      const message =
        error?.response?.data?.message || error?.message || "Order creation failed. Please try again.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="checkout-card__title mb-2 mt-4">Payment Method</h4>
      <p className="checkout-card__subtitle mb-3">
        Choose cash on delivery or pay with card.
      </p>

      <div className="checkout-payment-options mb-4">
        <label className={`checkout-payment-option ${paymentMethod === "COD" ? "is-active" : ""}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={(event) => setPaymentMethod(event.target.value)}
          />
          <span>
            <strong>Cash on Delivery</strong>
            <small className="d-block text-muted">Pay when your order arrives.</small>
          </span>
        </label>

        <label className={`checkout-payment-option ${paymentMethod === "CARD" ? "is-active" : ""}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="CARD"
            checked={paymentMethod === "CARD"}
            onChange={(event) => setPaymentMethod(event.target.value)}
          />
          <span>
            <strong>Card Payment</strong>
            <small className="d-block text-muted">Pay securely with Stripe.</small>
          </span>
        </label>
      </div>

      {paymentMethod === "CARD" && (
        <>
          {stripeError && <p className="text-danger small mb-3">{stripeError}</p>}
          <div className="checkout-payment-card p-3 mb-4">
            <CardElement id="card" options={CARD_ELEMENT_OPTIONS} />
          </div>
        </>
      )}

      <hr className="my-4" />

      <button className="w-100 btn btn-primary btn-lg rounded-pill" type="submit" disabled={isProcessing}>
        {isProcessing
          ? "Processing..."
          : paymentMethod === "CARD"
          ? `Place Order and Pay Rs ${Number(orderData.amount).toFixed(2)}`
          : `Place COD Order Rs ${Number(orderData.amount).toFixed(2)}`}
      </button>
    </form>
  );
};

export default PaymentSection;
