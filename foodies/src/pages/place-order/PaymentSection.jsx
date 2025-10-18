// src/pages/place-order/PaymentSection.jsx
import React from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import initiateStripePayment from "./initiateStripePayment.js";
import OrderService from "../../service/OrderService.js";

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
        invalid: { color: "#9e2146" },
    },
    hidePostalCode: false, // show ZIP field
};

const PaymentSection = ({ data, orderData, token, cartItems, clearCart, navigate }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error("Stripe not initialized yet.");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }

        try {
            toast.info("Creating order and payment intent...");

            const responseData = await OrderService.createOrder(orderData, token);

            if (responseData?.stripeClientSecret) {
                toast.success("Payment intent created. Proceeding with payment...");
                await initiateStripePayment(responseData, elements, stripe, data, token, clearCart, navigate);
            } else {
                toast.error("No Stripe client secret received from server.");
            }
        } catch (error) {
            console.error("PaymentSection handleSubmit error:", error);
            const message = error.response?.data?.message || error.message || "Order creation failed.";
            toast.error(message);
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
                disabled={!stripe || !elements || cartItems.length === 0}
            >
                Place Order and Pay ₹{orderData.amount}
            </button>
        </form>
    );
};

export default PaymentSection;
