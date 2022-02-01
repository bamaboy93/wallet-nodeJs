const Joi = require("joi");
const { HttpCode } = require("../../config/constants");

const shemaTransactionAdd = Joi.object({
  type: Joi.string.required(),
  amount: Joi.number.min(0).required(),
  date: Joi.date().format("YYYY-MM-DD").required(),
  comment: Joi.string().optional(),
  category: Joi.string().required(),
});

const validate = async (schema, req, next) => {
  try {
    await schema.validateAsync(req);
    next();
  } catch (err) {
    res.status(HttpCode.BAD_REQUEST).json({
      status: "error",
      code: HttpCode.BAD_REQUEST,
      message: `Field ${err.message.replace(/"/g, "")}`,
    });
  }
};

module.exports.validateTransactionAdd = async (req, res, next) => {
  return validate(shemaTransactionAdd, req.body, next);
};
