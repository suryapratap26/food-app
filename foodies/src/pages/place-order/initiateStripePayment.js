import { toast } from "react-toastify";
import { CardElement } from "@stripe/react-stripe-js";
import orderService from "../../service/orderService";

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
    toast.error("Missing client secret. Cannot proceed with payment.");
    console.error("Stripe client secret missing in responseData:", responseData);
    return { success: false };
  }

  if (!stripe || !elements) {
    toast.error("Stripe not initialized. Please refresh the page.");
    console.error("Stripe or elements object is null:", { stripe, elements });
    return { success: false };
  }

  const cardElement = elements.getElement(CardElement);
  if (!cardElement) {
    toast.error("Card input not ready. Please refresh.");
    console.error("CardElement not found in elements:", elements);
    return { success: false };
  }

  try {
    toast.info("Processing payment...");

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
      console.error("Stripe Payment Error:", result.error);
      toast.error(
        result.error.message || `Payment failed (code: ${result.error.code})`
      );
      return { success: false, error: result.error };
    }

    const paymentIntent = result.paymentIntent;

    if (!paymentIntent) {
      toast.error("No payment result returned by Stripe.");
      console.error("PaymentIntent is null:", result);
      return { success: false };
    }

    if (["requires_action", "requires_source_action"].includes(paymentIntent.status)) {
      toast.info("Additional authentication required. Please follow the Stripe prompt.");
      console.log("Payment requires additional authentication:", paymentIntent);
      return { success: false, paymentIntent };
    }

    if (paymentIntent.status === "succeeded") {
      try {
        await orderService.verifyPayment({
          stripePaymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        });

        if (typeof clearCart === "function") {
          try {
            await clearCart();
          } catch (cartErr) {
            console.warn("Failed to clear cart after payment:", cartErr);
          }
        }

        toast.success("🎉 Payment successful! Order confirmed.");
        if (typeof navigate === "function") navigate("/myorders");

        return { success: true, paymentIntent };
      } catch (verifyErr) {
        console.error("Backend verification failed:", verifyErr);
        toast.error(
          "Payment succeeded, but server verification failed. Please check your orders."
        );
        return { success: false, paymentIntent };
      }
    }

    toast.info(`Payment status: ${paymentIntent.status}`);
    console.log("Unhandled paymentIntent status:", paymentIntent);
    return { success: false, paymentIntent };
  } catch (err) {
    console.error("Unexpected error in Stripe payment:", err);
    toast.error("An unexpected error occurred while confirming payment.");
    return { success: false, error: err };
  }
};

export default initiateStripePayment;
