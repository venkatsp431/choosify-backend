import jwt from "jsonwebtoken";
import { Users } from "../Models/user.js";
// import { User } from "../models/users.js";

const isAuthenticated = async (req, res, next) => {
  let token;
  if (req.headers) {
    try {
      token = await req.headers["x-auth-token"];
      const decode = jwt.verify(token, process.env.SECRETKEY);

      req.user = await Users.findById(decode.id).select("_id name email cart");
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ data: "Internal Server Error" });
    }
  }
  if (!token) {
    console.log("no token");
  }
};

export default isAuthenticated;
