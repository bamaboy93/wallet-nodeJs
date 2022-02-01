const { Category } = require("../config/category");

const getAllCategories = () => {
  const data = Category.expenses;
  return data;
};

module.exports = {
  getAllCategories,
};
