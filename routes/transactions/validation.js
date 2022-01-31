const Joi = require("joi");
const { HttpCode } = require("../../config/constants");

const schemaMakeTransaction = Joi.object({
  date: Joi.date().required(),
  category: Joi.string()
    .pattern(/^[\da-f]{24}$/)
    .required(),
  comment: Joi.string().required(),
  amount: Joi.number().required(),
});

const validate = async (schema, obj, res, next) => {
  try {
    await schema.validateAsync(obj);
    next();
  } catch (err) {
    console.log(err);
    res.status(HttpCode.BAD_REQUEST).json({
      status: "error",
      code: HttpCode.BAD_REQUEST,
      message: `Field ${err.message.replace(/"/g, "")}`,
    });
  }
};

module.exports.validateMakeTransaction = async (req, res, next) => {
  return await validate(schemaMakeTransaction, req.body, res, next);
};
