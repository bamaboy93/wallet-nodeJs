const express = require("express");
const router = express.Router();

const { getAllCategories } = require("../../controllers/categories/categories");

const guard = require("../../helpers/guard");
const wrapError = require("../../helpers/errorHandler");

router.get("/all", guard, wrapError(getAllCategories));

module.exports = router;
