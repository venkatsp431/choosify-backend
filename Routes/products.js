import express from "express";
import { Products } from "../Models/products.js";
// import Stripe from "stripe";
import { Payment } from "../Models/payments.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

router.get("/all", async (req, res) => {
  try {
    const products = await Products.find({});
    if (!products) return res.status(400).json({ message: "No data Found" });
    res
      .status(200)
      .json({ data: products, message: "Products found successfull" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    // const {id}=req.params()
    const product = await Products.findOne({ _id: req.params.id });
    if (!product) return res.status(400).json({ message: "Cant find Product" });
    res.status(200).json({ data: product, message: "Successfull" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const upload = multer({ storage });
router.post("/postproduct", upload.single("productImage"), async (req, res) => {
  try {
    const product = new Products({
      productName: req.body.productName,
      description: req.body.description,
      dressType: req.body.dressType,
      suitableFor: req.body.suitableFor,
      oldPrice: req.body.oldPrice,
      discountedPrice: req.body.discountedPrice,
      availableSizes: req.body.availableSizes,
      productImage: {
        imageName: req.file.originalname,
        imagePath: req.file.path,
      },
    });

    const updateProducts = await product.save();
    if (!updateProducts) res.status(400).json({ message: "400 Error" });
    res.status(200).json({ message: "Product Posted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// const stripe = new Stripe(
//   "sk_test_51O6U5YSArPXaYxkpKRg2XxRV2o7atlCDhEWmewylz3byDxn7xRSvnoOlyqU2wkPzqRp9vWtjJbQ51P4FmnYWp4TR00KLTjODel",
//   {
//     apiVersion: "2023-10-16",
//   }
// );
import stripePackage from "stripe";
const stripe = stripePackage(
  "sk_test_51O6U5YSArPXaYxkpKRg2XxRV2o7atlCDhEWmewylz3byDxn7xRSvnoOlyqU2wkPzqRp9vWtjJbQ51P4FmnYWp4TR00KLTjODel"
);

const generateTransactionId = () => {
  const length = 8;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

router.post("/make-payment", async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      payment_method: paymentMethod,
      description: "Payment for Order #" + orderId,
      confirmation_method: "manual",
    });

    const newPayment = new Payment({
      orderId,
      amount,
      transactionNumber: generateTransactionId(),
    });

    const savedPayment = await newPayment.save();
    if (!savedPayment)
      res.status(400).json({ message: "Payment record not saved" });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/payment", async (req, res) => {
  try {
    const { paymentMethodId, amount, cartItems } = req.body;

    // Create a PaymentIntent on the server side
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
    });

    // Handle successful payment intent
    console.log("PaymentIntent created:", paymentIntent);

    // Process your cartItems or update your database accordingly

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});
router.put("/edit/:id", upload.single("productImage"), async (req, res) => {
  try {
    const updatedProduct = {
      productName: req.body.productName,
      description: req.body.description,
      dressType: req.body.dressType,
      suitableFor: req.body.suitableFor,
      oldPrice: req.body.oldPrice,
      discountedPrice: req.body.discountedPrice,
      availableSizes: req.body.availableSizes,
    };

    if (req.file) {
      updatedProduct.productImage = {
        imageName: req.file.originalname,
        imagePath: req.file.path,
      };
    }

    const result = await Products.findByIdAndUpdate(
      req.params.id,
      updatedProduct,
      {
        new: true,
      }
    );

    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.delete("/delete/:id", async (req, res) => {
  try {
    const result = await Products.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/edit/:id", async (req, res) => {
  try {
    const product = await Products.findOne({ _id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ data: product, message: "Product details fetched successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const productRouter = router;
