import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
  },
  resettoken: {
    type: String,
  },
  activationToken: {
    type: String,
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  cart: [
    {
      productName: String,
      size: String,
      quantity: Number,
      price: Number,
      _id: String,
    },
  ],
  orders: [
    {
      productName: String,
      size: String,
      address: String,
      quantity: Number,
      total: Number,
      _id: String,
    },
  ],
});

const generatejwtToken = function (id) {
  return jwt.sign({ id }, process.env.SECRETKEY);
};

const Users = mongoose.model("users", userSchema);

export { Users, generatejwtToken };
