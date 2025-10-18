import { toast } from "react-toastify";
import { CardElement } from "@stripe/react-stripe-js";
import orderService from "../../service/orderService";

/**
 * Confirms the Stripe PaymentIntent client-side and verifies the payment with backend.
 *
 * - responseData: { stripeClientSecret }
 * - elements: stripe elements instance
 * - stripe: stripe instance
 * - billingData: object with firstName, lastName, email, address, city, state, zipcode, country
 * - clearCart: async fn to clear frontend cart state
 * - navigate: optional navigate fn
 *
 * Returns: { success: boolean, paymentIntent?: object }
 */
const initiateStripePayment = async (
  responseData,
  elements,
  stripe,
  billingData,
  clearCart,
  navigate
) => {
  const clientSecret = responseData?.stripeClientSecret;
  if (!clientSecret) {
    toast.error("Missing client secret. Cannot proceed.");
    return { success: false };
  }

  try {
    toast.info("Awaiting payment authorization...");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card input not ready. Please refresh.");
      return { success: false };
    }

    // Confirm card payment with billing details
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${billingData.firstName || ""} ${billingData.lastName || ""}`.trim(),
          email: billingData.email,
          address: {
            line1: billingData.address || undefined,
            city: billingData.city || undefined,
            state: billingData.state || undefined,
            postal_code: billingData.zipcode || undefined,
            country: billingData.country || undefined,
          },
        },
      },
    });

    if (result.error) {
      // Common errors: card declined, validation, authentication required, etc.
      console.error("Stripe error:", result.error);
      toast.error(result.error.message || "Payment failed. Check card details and address.");
      return { success: false };
    }

    const paymentIntent = result.paymentIntent;
    if (!paymentIntent) {
      toast.error("No payment result received from Stripe.");
      return { success: false };
    }

    // If requires_action or other statuses, let user know
    if (paymentIntent.status === "requires_action" || paymentIntent.status === "requires_source_action") {
      toast.info("Additional authentication required. Please follow the prompt.");
      return { success: false, paymentIntent };
    }

    if (paymentIntent.status === "succeeded") {
      // Verify with backend to mark order as paid & store payment details
      try {
        await orderService.verifyPayment({
          stripePaymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        });

        // If backend verified, clear cart and navigate
        if (typeof clearCart === "function") await clearCart();
        toast.success("🎉 Payment Successful! Order confirmed and cart cleared.");
        if (typeof navigate === "function") navigate("/myorders");
        return { success: true, paymentIntent };
      } catch (verifyErr) {
        // Backend verification failed. This is critical to surface.
        console.error("Backend verification failed:", verifyErr);
        toast.error(
          "Payment succeeded, but we couldn't verify it on the server. Please check your orders page or contact support."
        );
        return { success: false, paymentIntent };
      }
    }

    // Other statuses
    toast.info(`Payment status: ${paymentIntent.status}.`);
    return { success: false, paymentIntent };
  } catch (err) {
    console.error("Payment confirmation error:", err);
    toast.error("An unexpected error occurred while confirming payment.");
    return { success: false };
  }
};

export default initiateStripePayment;
