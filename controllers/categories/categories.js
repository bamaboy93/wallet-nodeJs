const Categories = require("../../repository/categories");
const { HttpCode } = require("../../config/constants");

const getAllCategories = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const categories = await Categories.getAllCategories({
      ...req.body,
      owner: userId,
    });

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.OK,
      data: { categories: categories },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
};
