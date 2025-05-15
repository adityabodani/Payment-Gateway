import { useState } from "react";
import ServerToServerForm from "./ServerToServerForm";
import IframePayment from "./IframePayment";

const Checkout = () => {
  const [activeTab, setActiveTab] = useState("server");

  return (
    <div className="checkout-container">
      <h1>Payment Checkout </h1>

      <div className="checkout-tabs">
        <div
          className={`tab ${activeTab === "server" ? "active" : ""}`}
          onClick={() => setActiveTab("server")}
        >
          <span className="icon">🔒</span>
          Server-to-Server
        </div>
        <div
          className={`tab ${activeTab === "iframe" ? "active" : ""}`}
          onClick={() => setActiveTab("iframe")}
        >
          <span className="icon">📋</span>
          Iframe
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "server" ? <ServerToServerForm /> : <IframePayment />}
      </div>
    </div>
  );
};

export default Checkout;
