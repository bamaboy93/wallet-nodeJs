const { Schema, SchemaTypes, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const transactionSchema = new Schema(
  {
    type: {
      type: SchemaTypes.String,
      enum: ["incomes", "expenses"],
      default: "incomes",
      required: true,
    },
    amount: {
      type: SchemaTypes.Number,
      min: 0,
      required: true,
    },
    date: {
      type: SchemaTypes.String,
      default: new Date(),
    },
    day: {
      type: SchemaTypes.Number,
    },
    month: {
      type: SchemaTypes.Number,
    },
    year: {
      type: SchemaTypes.Number,
    },
    comment: {
      type: SchemaTypes.String,
      default: "",
    },
    balance: {
      type: SchemaTypes.Number,
      default: 0,
    },
    incomesBalance: {
      type: SchemaTypes.Number,
      default: 0,
    },
    expensesBalance: {
      type: SchemaTypes.Number,
      default: 0,
    },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: "user",
      required: true,
    },
    category: {
      type: SchemaTypes.String,
      enum: [...Category.expenses, ...Category.incomes],
      default: Category.incomes[0],
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

transactionSchema.plugin(mongoosePaginate);

const Transaction = model("transaction", transactionSchema);

module.exports = Transaction;
