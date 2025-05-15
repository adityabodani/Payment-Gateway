import axios from "axios";
import { generateOrderId } from "./validation";

const PAY_API_URL = "https://api.vancipay.com/pay";

// Process a server-to-server payment
export const processPayment = async (paymentData) => {
  try {
    // Generate an order ID if not provided
    const orderId = paymentData.orderId || generateOrderId();

    const requestBody = {
      orderId,
      cardHolderName: paymentData.cardHolderName,
      cardNumber: paymentData.cardNumber,
      expiryMonth: paymentData.expiryMonth,
      expiryYear: paymentData.expiryYear,
      cardCVC: paymentData.cardCVC,
      amount: parseFloat(paymentData.amount),
      currency: paymentData.currency,
    };

    console.log("Processing payment with API:", PAY_API_URL);

    // Step 1: Make the initial payment API call
    const payResponse = await axios.post(PAY_API_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Payment API response:", payResponse.data);

    // Step 2: Extract the redirect_url from the response
    const redirectUrl = payResponse.data.redirect_url;

    if (!redirectUrl) {
      throw new Error("No redirect URL provided in the payment response");
    }

    console.log("Fetching status from redirect URL:", redirectUrl);

    // Step 3: Make the GET request to the redirect_url
    const redirectResponse = await axios.get(
      `${redirectUrl}?orderId=${orderId}`
    );
    console.log("Redirect API response:", redirectResponse.data);

    // Step 4: Extract the status from the redirect response
    const status = redirectResponse.data.status;

    if (!status) {
      throw new Error("No status provided in the redirect response");
    }

    // Return the combined result
    return {
      status,
      message: redirectResponse.data.message,
      redirectUrl,
      orderId,
    };
  } catch (error) {
    console.error("Payment processing error:", error);

    // For demo purposes only - in a real app, we'd return the actual error
    // This allows testing without the real API endpoints
    if (process.env.NODE_ENV !== "production") {
      console.log("Development mode: Using mock responses for testing");

      // Only in development/testing, simulate a response
      const mockSuccess = Math.random() > 0.5;

      return {
        status: mockSuccess ? "Success" : "Failed",
        message: mockSuccess
          ? "Payment processed successfully (mock)"
          : "Payment failed (mock)",
        redirectUrl: "https://api.vancipay.com/redirect (mock)",
        orderId: paymentData.orderId,
        isMockResponse: true,
      };
    }

    return {
      status: "Failed",
      message: error.message || "Payment processing failed",
      error: error.message,
    };
  }
};
