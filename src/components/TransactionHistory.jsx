import { useState, useEffect } from "react";
import { useTransactions } from "../utils/TransactionContext";
import { maskCardNumber } from "../utils/validation";

const TransactionHistory = () => {
  const { transactions } = useTransactions();
  const [animatedItems, setAnimatedItems] = useState({});

  // Track status changes to animate them
  useEffect(() => {
    const newAnimatedItems = {};

    transactions.forEach((transaction) => {
      // If we haven't seen this transaction before or its status changed
      if (
        !animatedItems[transaction.orderId] ||
        animatedItems[transaction.orderId] !== transaction.status
      ) {
        newAnimatedItems[transaction.orderId] = transaction.status;
      }
    });

    if (Object.keys(newAnimatedItems).length > 0) {
      setAnimatedItems((prev) => ({ ...prev, ...newAnimatedItems }));
    }
  }, [transactions, animatedItems]);

  // Format date
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case "Success":
        return "success";
      case "Failed":
        return "failed";
      case "Pending":
        return "pending";
      default:
        return "";
    }
  };

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>
            No transactions yet. Complete a payment to see your transaction
            history.
          </p>
        </div>
      ) : (
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Cardholder</th>
                <th>Card Number</th>
                <th>Expiry</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.orderId}>
                  <td className="order-id">{transaction.orderId}</td>
                  <td>{transaction.cardHolderName}</td>
                  <td className="card-number">
                    {maskCardNumber(transaction.cardNumber)}
                  </td>
                  <td>
                    {transaction.expiryMonth}/
                    {transaction.expiryYear?.slice(-2) || "XX"}
                  </td>
                  <td className="amount">
                    {parseFloat(transaction.amount).toFixed(2)}{" "}
                    {transaction.currency}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        transaction.status
                      )} ${
                        animatedItems[transaction.orderId] ===
                        transaction.status
                          ? "animated"
                          : ""
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td>{formatDate(transaction.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
