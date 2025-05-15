import { useState, useEffect, useRef } from "react";
import { useTransactions } from "../utils/TransactionContext";
import { generateOrderId } from "../utils/validation";

const IframePayment = () => {
  const iframeRef = useRef(null);
  const { addTransaction, updateTransaction } = useTransactions();
  const [iframeReady, setIframeReady] = useState(false);

  const [form, setForm] = useState({
    cardholder: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    amount: "",
    currency: "USD",
  });
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState(""); // ← local UI status
  const [iframeError, setIframeError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);

  // Listen for all postMessage events
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("🛰 postMessage received:", {
        origin: event.origin,
        data: event.data,
      });

      // Only handle our PAYMENT_RESULT broadcasts
      if (
        event.data &&
        event.data.type === "PAYMENT_RESULT" &&
        event.data.orderId === orderId
      ) {
        const newStatus = event.data.status;
        console.log("👉 PAYMENT_RESULT matched:", newStatus);

        // Update context with status and preserve all transaction data
        updateTransaction(orderId, {
          status: newStatus,
          cardholder: form.cardholder,
          cardNumber: form.cardNumber,
          expiryDate: form.expiryDate,
          cvc: form.cvc,
          amount: form.amount,
          currency: form.currency,
        });
        // Update local UI
        setStatus(newStatus);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [orderId, updateTransaction, form]);

  const handleIframeLoad = () => {
    console.log("✅ Iframe loaded");
    setLoading(false);
    setIframeReady(true);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSent(false);
    setStatus(""); // reset UI status if user edits form
  };

  const validateForm = () => {
    if (!form.cardholder.trim()) return "Cardholder name is required";
    if (!form.cardNumber.trim()) return "Card number is required";
    if (!form.expiryDate) return "Expiry date is required";
    if (!form.cvc) return "CVC is required";
    if (!form.amount) return "Amount is required";
    return "";
  };

  const handleSendToIframe = () => {
    if (sent) return;

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setIframeError(validationError);
      return;
    }

    // Clear any previous errors
    setIframeError(null);

    // 1️⃣ Generate a new order
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);
    setStatus("Pending"); // local pending

    // 2️⃣ Register the transaction with all form data
    const transactionData = {
      orderId: newOrderId,
      cardholder: form.cardholder,
      cardNumber: form.cardNumber,
      expiryDate: form.expiryDate,
      cvc: form.cvc,
      amount: form.amount,
      currency: form.currency,
      status: "Pending",
      timestamp: new Date().toISOString(),
    };

    addTransaction(transactionData);

    // 3️⃣ Post message into the iframe
    const payload = {
      orderId: newOrderId,
      ...form,
      showForm: 1,
    };

    // Wait for iframe to be ready before sending message
    if (iframeReady && iframeRef.current) {
      try {
        iframeRef.current.contentWindow.postMessage(payload, "*");
        console.log("📤 Sent to iframe:", payload);
        setSent(true);
      } catch (err) {
        console.error("⚠️ postMessage error:", err);
        setIframeError("Failed to send data to payment iframe.");
      }
    } else {
      // If iframe is not ready, set sent to true to show the iframe
      setSent(true);
      // The message will be sent when the iframe loads
      setTimeout(() => {
        if (iframeRef.current) {
          try {
            iframeRef.current.contentWindow.postMessage(payload, "*");
            console.log("📤 Sent to iframe after delay:", payload);
          } catch (err) {
            console.error("⚠️ postMessage error after delay:", err);
            setIframeError("Failed to send data to payment iframe.");
          }
        }
      }, 1000); // Wait 1 second for iframe to load
    }
  };

  return (
    <div className="payment-form-container">
      <h2>Secure Iframe Payment</h2>

      {/* Payment Form Inputs */}

      <div className="form-group">
        <label htmlFor="cardholder">Cardholder Name</label>
        <input
          type="text"
          id="cardholder"
          name="cardholder"
          value={form.cardholder}
          onChange={handleChange}
          placeholder="John Doe"
        />
      </div>

      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={form.cardNumber}
          onChange={handleChange}
          placeholder="•••• •••• •••• ••••"
        />
      </div>

      <div className="form-group">
        <label htmlFor="expiryDate">Expiry Date</label>
        <input
          type="text"
          id="expiryDate"
          name="expiryDate"
          value={form.expiryDate}
          onChange={handleChange}
          placeholder="MM/YY"
        />
      </div>

      <div className="form-row">
        <div className="form-group" style={{ flex: 1, marginRight: "0.5rem" }}>
          <label htmlFor="cvc">CVV</label>
          <input
            type="text"
            id="cvc"
            name="cvc"
            value={form.cvc}
            onChange={handleChange}
            placeholder="•••"
          />
        </div>

        <div className="form-group" style={{ flex: 1, marginLeft: "0.5rem" }}>
          <label htmlFor="amount">Amount</label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="100.00"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="currency">Currency</label>
        <select
          id="currency"
          name="currency"
          value={form.currency}
          onChange={handleChange}
        >
          <option value="USD">USD</option>
          <option value="INR">INR</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      {iframeError && (
        <div
          className="error-message"
          style={{ color: "red", marginTop: "1rem" }}
        >
          {iframeError}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button className="button primary" onClick={handleSendToIframe}>
          Pay Securely
        </button>
      </div>

      {/* Display Order ID & Real-Time Status */}
      {orderId && (
        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <strong>Order ID:</strong> {orderId} <br />
          <strong>Status:</strong>{" "}
          <span style={{ textTransform: "capitalize" }}>{status || "—"}</span>
        </div>
      )}

      {/* Iframe Container - only show after form is submitted */}
      {sent && (
        <div className="iframe-payment-container">
          {iframeError ? (
            <div className="iframe-error">
              <div className="error-icon">❌</div>
              <p>{iframeError}</p>
              <p>Try the Server-to-Server method instead.</p>
            </div>
          ) : (
            <div className="iframe-wrapper">
              {loading && (
                <div className="loading-spinner">Loading payment form...</div>
              )}
              <iframe
                ref={iframeRef}
                src="https://celalios.com/"
                title="Payment Form"
                className="payment-iframe"
                onLoad={handleIframeLoad}
                onError={() =>
                  setIframeError("Failed to load payment iframe. Try again.")
                }
                sandbox="allow-forms allow-scripts allow-same-origin"
                style={{ width: "100%", height: "500px", border: "none" }}
              />
            </div>
          )}
        </div>
      )}

      <p className="iframe-note">
        Note: All sensitive data is handled securely within the iframe.
      </p>
    </div>
  );
};

export default IframePayment;
