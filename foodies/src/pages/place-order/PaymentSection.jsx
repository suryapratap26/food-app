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

const PaymentSection = ({ billingData, orderData, token, cartItems, clearCart, navigate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const validateBilling = () => {
    if (!billingData) return "Missing billing information.";
    if (!billingData.firstName || !billingData.lastName) return "Full name required.";
    if (!billingData.email) return "Email required.";
    if (!billingData.address) return "Address required.";
    // simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingData.email)) return "Invalid email address.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);

    if (!stripe || !elements) {
      toast.error("Stripe not initialized.");
      setIsProcessing(false);
      return;
    }

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

    try {
      toast.info("Creating order and securing payment intent...");

      // Create order (apiClient handles token globally)
      const responseData = await orderService.createOrder(orderData);

      if (!responseData?.stripeClientSecret) {
        toast.error("Order created but missing payment secret. Please contact support.");
        setIsProcessing(false);
        return;
      }

      toast.success("Payment intent received. Confirming payment...");
      await initiateStripePayment(responseData, elements, stripe, billingData, clearCart, navigate);
    } catch (error) {
      console.error("PaymentSection handleSubmit error:", error);
      const message = error?.message || "Order creation failed. Please try again.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-3 mt-4">Payment Method</h4>

      <div className="border p-3 mb-4 rounded-3">
        <CardElement id="card" options={CARD_ELEMENT_OPTIONS} />
      </div>

      <hr className="my-4" />

      <button
        className="w-100 btn btn-primary btn-lg"
        type="submit"
        disabled={!stripe || !elements || isProcessing || !cartItems || cartItems.length === 0}
      >
        {isProcessing ? "Processing..." : `Place Order and Pay ₹${Number(orderData.amount).toFixed(2)}`}
      </button>
    </form>
  );
};

export default PaymentSection;
