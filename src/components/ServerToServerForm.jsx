import { useState } from "react";
import { validateCardNumber, generateOrderId } from "../utils/validation";
import { processPayment } from "../utils/paymentService";
import { useTransactions } from "../utils/TransactionContext";

const ServerToServerForm = () => {
  const { addTransaction, updateTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [formData, setFormData] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardCVC: "",
    amount: "",
    currency: "USD",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Clear payment status when user starts modifying form
    if (paymentStatus) {
      setPaymentStatus(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = "Cardholder name is required";
    }

    if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = "Expiry date is required";
    }

    if (!formData.cardCVC || formData.cardCVC.length < 3) {
      newErrors.cardCVC = "Please enter a valid CVC";
    }

    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Please enter a valid amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setPaymentStatus(null);

    try {
      const orderId = generateOrderId();
      console.log("Generated order ID:", orderId);

      // Add to transaction history as pending
      addTransaction({
        ...formData,
        orderId,
        status: "Pending",
      });

      console.log("Added pending transaction");

      // Call the payment API which will handle the redirect flow
      console.log("Calling payment API...");
      const result = await processPayment({
        ...formData,
        orderId,
      });

      console.log("Complete payment result:", result);

      // Set payment status for UI display
      setPaymentStatus({
        status: result.status || "Failed",
        message: result.message,
        redirectUrl: result.redirectUrl,
        orderId: result.orderId || orderId,
        error: result.error,
        isMockResponse: result.isMockResponse,
      });

      // Update transaction status in our store
      updateTransaction(orderId, {
        status: result.status || "Failed",
      });

      console.log("Updated transaction status to:", result.status || "Failed");

      // Reset form if successful
      if (result.status === "Success") {
        setFormData({
          cardHolderName: "",
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
          cardCVC: "",
          amount: "",
          currency: "USD",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);

      // Set error status for UI
      setPaymentStatus({
        status: "Failed",
        error: error.message || "An unexpected error occurred",
        message: "Payment processing failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <h2>Server-to-Server Payment</h2>
      <p className="form-subtitle">
        Enter card details. Sensitive data is sent securely to the server.
      </p>

      {paymentStatus && (
        <div className={`payment-status ${paymentStatus.status.toLowerCase()}`}>
          <div className="status-icon">
            {paymentStatus.status === "Success"
              ? "✅"
              : paymentStatus.status === "Failed"
              ? "❌"
              : "⏳"}
          </div>
          <div className="status-text">
            <h3>Payment {paymentStatus.status}</h3>
            {paymentStatus.message && <p>Message: {paymentStatus.message}</p>}
            {paymentStatus.redirectUrl && (
              <p>Redirect URL: {paymentStatus.redirectUrl}</p>
            )}
            {paymentStatus.orderId && <p>Order ID: {paymentStatus.orderId}</p>}
            {paymentStatus.error && (
              <p className="error-message">Error: {paymentStatus.error}</p>
            )}
            {paymentStatus.isMockResponse && (
              <p className="mock-notice">
                <small>
                  (Using mock response for testing - API might be unavailable)
                </small>
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="cardHolderName">Cardholder Name</label>
          <input
            type="text"
            id="cardHolderName"
            name="cardHolderName"
            value={formData.cardHolderName}
            onChange={handleChange}
            className={errors.cardHolderName ? "error" : ""}
            placeholder="John Doe"
          />
          {errors.cardHolderName && (
            <span className="error-message">{errors.cardHolderName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            className={errors.cardNumber ? "error" : ""}
            placeholder="•••• •••• •••• ••••"
            maxLength="19"
          />
          {errors.cardNumber && (
            <span className="error-message">{errors.cardNumber}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="expiryMonth">Expiry Month</label>
            <select
              id="expiryMonth"
              name="expiryMonth"
              value={formData.expiryMonth}
              onChange={handleChange}
              className={errors.expiry ? "error" : ""}
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month.toString().padStart(2, "0")}>
                  {month.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group half">
            <label htmlFor="expiryYear">Expiry Year</label>
            <select
              id="expiryYear"
              name="expiryYear"
              value={formData.expiryYear}
              onChange={handleChange}
              className={errors.expiry ? "error" : ""}
            >
              <option value="">YYYY</option>
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.expiry && (
          <span className="error-message">{errors.expiry}</span>
        )}

        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="cardCVC">CVV</label>
            <input
              type="text"
              id="cardCVC"
              name="cardCVC"
              value={formData.cardCVC}
              onChange={handleChange}
              className={errors.cardCVC ? "error" : ""}
              placeholder="•••"
              maxLength="4"
            />
            {errors.cardCVC && (
              <span className="error-message">{errors.cardCVC}</span>
            )}
          </div>

          <div className="form-group half">
            <label htmlFor="amount">Amount</label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={errors.amount ? "error" : ""}
              placeholder="100.00"
            />
            {errors.amount && (
              <span className="error-message">{errors.amount}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? "Processing..." : "Pay Securely"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServerToServerForm;
