import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbConnection from "./db.js";
import { userRouter } from "./Routes/user.js";
import { productRouter } from "./Routes/products.js";
import { adminRouter } from "./Routes/admin.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
dbConnection();

app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/products", productRouter);
app.use(express.static("uploads"));
app.use((req, res, next) => {
  console.log("Requested URL:", req.url);
  next();
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => console.log("Server is running in localhost:8000"));
