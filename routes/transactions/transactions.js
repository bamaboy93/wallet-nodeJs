const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  addTransaction,
  editTransactionById,
  deleteTransactionById,
  getStatisticsByMonth,
} = require("../../controllers/transactions/transactions");

const guard = require("../../helpers/guard");

const wrapError = require("../../helpers/errorHandler");

router.get("/", guard, wrapError(getAllTransactions));

router.post("/", guard, wrapError(addTransaction));

router.get("/statistics/", guard, getStatisticsByMonth);

router.patch("/:transactionId", guard, wrapError(editTransactionById));

router.delete("/:transactionId", guard, wrapError(deleteTransactionById));

module.exports = router;
