const express = require("express");
const router = express.Router();

const ctrlCategories = require("../../controllers/categories/categories");

const guard = require("../../helpers/guard");
const wrapError = require("../../helpers/errorHandler");

router.get("/", guard, wrapError(ctrlCategories.getCategories));

module.exports = router;
