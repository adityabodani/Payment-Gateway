import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="navbar">
      <div className="navbar-brand">
        <span className="icon">📊</span>
        <h2>AxiPay Payment Gateway</h2>
      </div>
      <div className="nav-items">
        <Link
          to="/checkout"
          className={`nav-item ${
            location.pathname === "/checkout" ? "active" : ""
          }`}
        >
          <span className="icon">🛒</span>
          Checkout
        </Link>
        <Link
          to="/history"
          className={`nav-item ${
            location.pathname === "/history" ? "active" : ""
          }`}
        >
          <span className="icon">🕒</span>
          Transaction History
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
