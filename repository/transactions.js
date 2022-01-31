const Transaction = require("../models/transaction");
const Users = require("./users");

const listTransactions = async (userId, query) => {
  const { sortBy = "date", sortByDesc, filter, page = 1, limit = 1e12 } = query;
  const searchOptions = { owner: userId };

  const results = await Transaction.paginate(searchOptions, {
    limit,
    page,
    sort: {
      ...(!sortBy && !sortByDesc ? { date: 1 } : {}),

      ...(sortBy
        ? sortBy.split`|`.reduce((acc, item) => ({ ...acc, [item]: 1 }), {})
        : {}),

      ...(sortByDesc
        ? sortByDesc.split`|`.reduce(
            (acc, item) => ({ ...acc, [item]: -1 }),
            {}
          )
        : {}),

      ...(!sortBy?.includes("createdAt") && !sortByDesc?.includes("createdAt")
        ? { createdAt: 1 }
        : {}),
    },
    select: filter ? filter.split("|").join("") : "",
    populate: {
      path: "category",
      select: "name color",
    },
  });

  const allTransactions = await Transaction.find({ owner: userId });
  const years = [...new Set(allTransactions.map(({ year }) => year))].sort();

  const { docs: transactions, ...pageInfo } = results;

  return { pageInfo, transactions, years };
};

const getTransactionById = async (id, userId) => {
  const result = await Transaction.findOne({ _id: id, owner: userId }).populate(
    { path: "owner", select: "name email createdAt updatedAt" }
  );

  return result;
};

const removeTransaction = async (transactionId, userId) => {
  const transactionToDelete = await Transaction.findOne({
    _id: transactionId,
    owner: userId,
  });
  if (!transactionToDelete) return null;

  const { date, createdAt, amount, isExpense } = transactionToDelete;

  const { transactions } = await listTransactions(userId, {});
  const lastTransaction = findLastTransaction(transactions);
  const laterTransactions = findLaterTransactions(
    transactions,
    date,
    createdAt
  );

  const amountChange = -1 * amount * (isExpense ? -1 : 1);

  const deletedTransaction = await Transaction.findByIdAndRemove(transactionId);
  await updateBalanceForTransactions(laterTransactions, amountChange);

  const newUserBalance = (lastTransaction?.balanceAfter || 0) + amountChange;
  await Users.updateBalance(userId, newUserBalance);

  const { transactions: updatedTransactions, pageInfo } =
    await listTransactions(userId, query);

  return {
    newBalance: newUserBalance,
    transactions: updatedTransactions,
    deletedTransaction,
    pageInfo,
  };
};

const addTransaction = async (body) => {
  const { owner: userId, date, amount, isExpense } = details;

  const { transactions } = await listTransactions(userId, {});
  const lastTransaction = findLastTransaction(transactions);
  const latestPrevTransaction = findLatestPrevTransaction(transactions, date);
  const laterTransactions = findLaterTransactions(transactions, date);

  const amountChange = amount * (isExpense ? -1 : 1);

  details.balanceAfter =
    (latestPrevTransaction?.balanceAfter || 0) + amountChange;

  await Transaction.create(details);
  await updateBalanceForTransactions(laterTransactions, amountChange);

  const newUserBalance = (lastTransaction?.balanceAfter || 0) + amountChange;
  await Users.updateBalance(userId, newUserBalance);

  const { transactions: updatedTransactions, pageInfo } =
    await listTransactions(userId, query);

  return {
    newBalance: newUserBalance,
    transactions: updatedTransactions,
    pageInfo,
  };
};

const updateTransaction = async (transactionId, body, userId, query) => {
  const transactionToUpdate = await Transaction.findOne({
    _id: transactionId,
    owner: userId,
  });
  if (!transactionToUpdate) return null;

  const { date, createdAt } = transactionToUpdate;

  const { transactions } = await listTransactions(userId, {});
  const lastTransaction = findLastTransaction(transactions);
  const laterTransactions = findLaterTransactions(
    transactions,
    date,
    createdAt
  );
  laterTransactions.push(transactionToUpdate);

  const updatedTransaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, owner: userId },
    { ...body },
    { new: true }
  );

  const { amount, isExpense } = transactionToUpdate;
  const { amount: NewAmount, isExpense: newIsExpense } = updatedTransaction;
  const oldAmount = amount * (isExpense ? -1 : 1);
  const newAmount = NewAmount * (newIsExpense ? -1 : 1);
  const amountChange = newAmount - oldAmount;

  const newUserBalance = (lastTransaction?.balanceAfter || 0) + amountChange;

  if (amountChange) {
    await updateBalanceForTransactions(laterTransactions, amountChange);
    await Users.updateBalance(userId, newUserBalance);
  }

  const { transactions: updatedTransactions, pageInfo } =
    await listTransactions(userId, query);

  return {
    newBalance: newUserBalance,
    updatedTransaction,
    transactions: updatedTransactions,
    pageInfo,
  };
};

const listTransactionStats = async (userId, month, year) => {
  const allTransactions = await Transaction.find({
    owner: userId,
    month,
    year,
  });

  const stats1 = allTransactions.reduce((acc, { category, amount }) => {
    const id = category.toString();

    return {
      ...acc,
      [id]: acc[id] ? acc[id] + amount : amount,
    };
  }, {});

  const stats = await Transaction.aggregate([
    {
      $match: {
        $and: [
          {
            owner: mongoose.Types.ObjectId(userId),
            month,
            year,
          },
        ],
      },
    },

    {
      $group: {
        _id: "$category",
        amount: { $sum: "$amount" },
      },
    },

    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        amount: 1,
      },
    },
  ]);

  const result = stats.reduce(
    (acc, { categoryId, amount }) => ({
      ...acc,
      [categoryId]: amount,
    }),
    {}
  );

  console.log(result);
  console.log(stats1);

  return result;
};

const updateBalanceForTransactions = async (transactions, amount) => {
  await transactions.forEach(async ({ _id, balanceAfter }) => {
    await Transaction.findOneAndUpdate(
      { _id },
      { balanceAfter: balanceAfter + amount }
    );
  });
};

const findLastTransaction = (transactions) => {
  return transactions.reduce(
    (acc, transaction) =>
      transaction.date > acc.date ||
      (transaction.date >= acc.date && transaction.createdAt > acc.createdAt)
        ? transaction
        : acc,
    { date: 0, createdAt: 0 }
  );
};

const findLatestPrevTransaction = (
  transactions,
  date,
  createdAt = new Date()
) => {
  date = new Date(date);
  createdAt = new Date(createdAt);

  return transactions.reduce(
    (acc, transaction) =>
      transaction.date > date ||
      (transaction.date >= date && transaction.createdAt > createdAt) ||
      transaction.date < acc.date ||
      (transaction.date <= acc.date && transaction.createdAt < acc.createdAt)
        ? acc
        : transaction,
    { date: 0, createdAt: 0 }
  );
};

const findLaterTransactions = (transactions, date, createdAt = new Date()) => {
  date = new Date(date);
  createdAt = new Date(createdAt);

  return transactions.filter(
    (transaction) =>
      transaction.date > date ||
      (transaction.date >= date && transaction.createdAt > createdAt)
  );
};

module.exports = {
  listTransactions,
  getTransactionById,
  removeTransaction,
  addTransaction,
  updateTransaction,
  listTransactionStats,
  updateBalanceForTransactions,
};
