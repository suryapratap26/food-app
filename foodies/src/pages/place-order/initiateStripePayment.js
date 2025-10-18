
import { toast } from "react-toastify";
import { CardElement } from "@stripe/react-stripe-js";
import OrderService from "../../service/OrderService.js";

const initiateStripePayment = async (responseData, elements, stripe, data, token, clearCart, navigate) => {
    const clientSecret = responseData?.stripeClientSecret;
    if (!clientSecret) {
        toast.error("Missing client secret. Cannot proceed.");
        return;
    }

    try {
        toast.info("Awaiting payment authorization...");

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            toast.error("Card input not ready.");
            return;
        }

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: `${data.firstName} ${data.lastName}`,
                    email: data.email,
                    address: {
                        line1: data.address,
                        city: data.city,
                        state: data.state,
                        postal_code: data.zipcode,
                        country: data.country,
                    },
                },
            },
        });

        if (error) {
            console.error("Stripe error:", error);
            toast.error(error.message || "Payment failed. Check your card details.");
            return;
        }

        if (paymentIntent?.status === "succeeded") {
            // ✅ Tell backend payment succeeded
            await OrderService.verifyPayment(
                { stripePaymentIntentId: paymentIntent.id, status: paymentIntent.status },
                token
            );

            // ✅ Clear frontend cart state and API cart
            if (typeof clearCart === "function") {
                await clearCart(); // <-- must clear context state too
            }

            toast.success("🎉 Payment Successful! Order confirmed and cart cleared.");
            if (typeof navigate === "function") navigate("/myorders");
        } else {
            toast.info(`Payment status: ${paymentIntent?.status}. Please complete any pending actions.`);
        }
    } catch (err) {
        console.error("Payment confirmation error:", err);
        toast.error("Unexpected error during payment confirmation.");
    }
};

export default initiateStripePayment;
