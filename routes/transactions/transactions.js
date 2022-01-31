const express = require("express");
const router = express.Router();
const {
  getTransactions,
  makeTransaction,
  removeTransaction,
  updateTransaction,
  getTransactionStats,
} = require("../../controllers/transactions/transactions");
const { validateMakeTransaction } = require("./validation");
const guard = require("../../helpers/guard");

const wrapError = require("../../helpers/errorHandler");

router.get("/", guard, wrapError(getTransactions));

router.post("/", guard, validateMakeTransaction, wrapError(makeTransaction));

router.delete("/:transactionId", guard, wrapError(removeTransaction));

router.patch("/:transactionId", guard, wrapError(updateTransaction));

router.get("/stats", guard, wrapError(getTransactionStats));

module.exports = router;
