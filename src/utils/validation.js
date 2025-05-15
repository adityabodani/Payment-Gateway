// Luhn algorithm for credit card validation
export const validateCardNumber = (cardNumber) => {
  // Remove spaces and non-digit characters
  const digitsOnly = cardNumber.replace(/\D/g, "");
  if (digitsOnly.length < 13 || digitsOnly.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Loop through the digits in reverse order
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

// Mask credit card number (show only last 4 digits)
export const maskCardNumber = (cardNumber) => {
  const digitsOnly = cardNumber.replace(/\D/g, "");
  const lastFourDigits = digitsOnly.slice(-4);
  const maskedSection = "•".repeat(digitsOnly.length - 4);

  // Format with spaces for readability
  return maskedSection + lastFourDigits;
};

// Generate a random order ID
export const generateOrderId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};
