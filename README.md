# Patment Gateway
A secure payment processing simulator that demonstrates different payment integration methods with a focus on security and best practices.
## Project Overview
Patment Gateway is a React-based application that demonstrates various payment integration methods, including iframe-based payments and server-to-server payment processing.
## Features
1. Multiple Payment Methods
- **Iframe Payment**: Secure payment processing through an isolated iframe
- **Server-to-Server Payment**: Direct API integration for payment processing
2. See all transaction history


## Project Structure
patment gateway/
├── src/
│   ├── components/
│   │   ├── IframePayment.jsx
│   │   ├── ServerToServerForm.jsx
│   │   └── TransactionHistory.jsx
│   ├── utils/
│   │   ├── TransactionContext.jsx
│   │   ├── validation.js
│   │   └── paymentService.js
│   ├── App.jsx
│   └── main.jsx
├── public/
└── package.json

## Getting Started

### Prerequisites
- Node.js (v14 or higher)

### Installation
# Clone the repository
git clone https://github.com/yourusername/Payment-Gateway.git

# Navigate to project directory
cd patment gateway

# Install dependencies
npm install

# Start development server
npm run dev
