import { createContext, useState, useContext, useEffect } from "react";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  // Simulate loading from localStorage on first render
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Add a new transaction
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: transaction.orderId || `order-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction.id;
  };

  // Update an existing transaction
  const updateTransaction = (orderId, updates) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.orderId === orderId
          ? { ...transaction, ...updates }
          : transaction
      )
    );
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
