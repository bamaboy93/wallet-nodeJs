const Categories = require("../../repository/categories");

const { HttpCode, ResponseStatus } = require("../../config/constants");

const getCategories = async (req, res) => {
  const data = await Categories.listCategories();

  const outcomes = data.filter(({ isExpense }) => isExpense);
  const incomes = data.filter(({ isExpense }) => !isExpense);

  res.status(HttpCode.OK).json({
    status: ResponseStatus.SUCCESS,
    code: HttpCode.OK,
    data: { outcomes, incomes },
  });
};

module.exports = {
  getCategories,
};
