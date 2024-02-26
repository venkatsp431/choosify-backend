import mongoose from "mongoose";

// const Order = mongoose.model("Order", orderSchema);

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,

    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionNumber: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
export { Payment };
