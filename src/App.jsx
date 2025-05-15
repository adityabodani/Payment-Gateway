import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { TransactionProvider } from "./utils/TransactionContext";
import Navbar from "./components/Navbar";
import Checkout from "./components/Checkout";
import TransactionHistory from "./components/TransactionHistory";
import "./App.css";

function App() {
  return (
    <TransactionProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="content-container">
            <Routes>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/history" element={<TransactionHistory />} />
              <Route path="*" element={<Navigate to="/checkout" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TransactionProvider>
  );
}

export default App;
