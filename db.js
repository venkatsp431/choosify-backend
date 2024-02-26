import mongoose from "mongoose";

export default function dbConnection() {
  try {
    const params = {
      useNewURLParser: true,
      useUnifiedTopology: true,
    };
    mongoose.connect(
      "mongodb+srv://venki31:venki31@cluster0.1dvu1dy.mongodb.net/?retryWrites=true&w=majority",
      params
    );
    console.log("Mongo Connected");
  } catch (error) {
    console.log(error);
  }
}
