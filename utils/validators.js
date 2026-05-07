// helper function to validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// check password has minimum length
const validatePassword = (password) => {
  return password.length >= 6;
};

// check amount is positive number
const validateAmount = (amount) => {
  return amount > 0 && typeof amount === "number";
};

// check type is income or expense
const validateType = (type) => {
  return type === "income" || type === "expense";
};

// check date is valid
const validateDate = (date) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

module.exports = {
  validateEmail,
  validatePassword,
  validateAmount,
  validateType,
  validateDate,
};
