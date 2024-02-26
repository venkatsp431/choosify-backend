import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema({
  adminName: {
    type: String,
  },
  adminmail: {
    type: String,
    required: true,
    unique: true,
  },
  adminPassword: {
    type: String,
    required: true,
  },
  adminContact: {
    type: String,
  },
});

const generatejwtAdminToken = function (id) {
  return jwt.sign({ id }, process.env.SECRETKEY);
};

const Admins = mongoose.model("admins", adminSchema);

export { Admins, generatejwtAdminToken };
