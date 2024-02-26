import express from "express";
import bcrypt from "bcrypt";
import { Admins, generatejwtAdminToken } from "../Models/admin.js";

const router = express.Router();

router.get("/alladmins", async (req, res) => {
  try {
    const admins = await Admins.find();
    if (!admins)
      return res.status(400).json({ message: "Internal Server Error" });
    res.status(200).json({ admins });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/adminsignup", async (req, res) => {
  try {
    const admin = await Admins.findOne({ adminmail: req.body.adminmail });
    if (admin) {
      return res.status(400).json({ message: "Admin mail already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.adminPassword, salt);

    const newAdmin = await new Admins({
      adminmail: req.body.adminmail,
      adminPassword: hashedPassword,
      adminContact: req.body.adminContact,
    }).save();

    const token = generatejwtAdminToken(newAdmin._id);

    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const admin = await Admins.findOne({ adminmail: req.body.adminmail });
    if (!admin) {
      return res.status(400).json({ message: "Admin Not found" });
    }
    const password = await bcrypt.compare(
      req.body.adminPassword,
      admin.adminPassword
    );
    if (!password) {
      return res.status(400).json({ message: "Passwords donot match" });
    }
    const token = generatejwtAdminToken(admin._id);
    res.status(200).json({ token, message: "Login Successfull" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const adminRouter = router;
