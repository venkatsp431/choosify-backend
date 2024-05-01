import express from "express";
import { Users, generatejwtToken } from "../Models/user.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import isAuthenticated from "../Controllers/auth.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "sealvenki@gmail.com",
    pass: "fsfl tkoz vqwa lyhv",
  },
});
router.post("/subscribe", async (req, res) => {
  try {
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const newUser = req.body.email;

    const mailOptions = {
      to: newUser,
      subject: "Welcome to Choosify!",
      text: "Thank you for subscribing to Choosify. We're excited to have you on board!",
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ message: "Failed to send welcome email" });
      }

      return res
        .status(200)
        .json({ message: "Welcome email sent successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/all", async (req, res) => {
  try {
    const user = await Users.find({});
    if (!user) return res.status(400).json({ message: "Data not found" });
    res.status(200).json({ data: user, message: "Found Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: "duplicate key error" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const actToken = crypto.randomBytes(20).toString("hex");
    user = await new Users({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      contact: req.body.contact,
      activationToken: actToken,
      isActivated: false,
    }).save();

    const mailOptions = {
      to: user.email,
      subject: "Choosify Äctivation mail",
      text: `To activate your account, please click <a href="http://localhost:3000/activation/${actToken}">here</a>.`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to send mail" });
      }
      const token = generatejwtToken(user._id);
      return res.status(200).json({ token });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/activation/:activationToken", async (req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await Users.findOne({ activationToken: activationToken });
    if (!user) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    user.activationToken = undefined;
    user.isActivated = true;
    await user.save();

    const token = generatejwtToken(user._id);
    res.status(200).json({ token, message: "Account activated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: "Email not found" });
    const password = await bcrypt.compare(req.body.password, user.password);
    if (!password) return res.status(400).json({ message: "Password Wrong" });
    const token = generatejwtToken(user._id);
    res.status(200).json({ token, message: "Login Successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await Users.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, contact, cart } = user;

    const userProfile = {
      name,
      email,
      contact,
      cart,
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/forgotpassword", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const token = crypto.randomBytes(20).toString("hex");
    user.resettoken = token;
    await user.save();
    const mailOptions = {
      to: user.email,
      subject: "Password Reset",
      text: `To reset your Password, please click on the link below http:your-app/resetpassword/${token}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Email sending failed" });
      }
      return res.status(200).json({ message: "Email Sent Successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/resetpassword/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const user = await Users.findOne({ resettoken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.resettoken = undefined;
    await user.save();
    return res.status(200).json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/cart", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/cart", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productName, size, quantity, price, _id } = req.body;
    console.log(userId);
    console.log(productName, size, quantity, price);
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart.push({ productName, size, price, quantity, _id });
    await user.save();

    res
      .status(200)
      .json({ message: "Item added to cart successfully", cart: user.cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add this route to your userRouter
router.delete("/cart/:itemId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.itemId;
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter((item) => item._id.toString() !== itemId);
    await user.save();

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const userRouter = router;
