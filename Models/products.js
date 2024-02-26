import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    minlength: 4,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
  },
  dressType: {
    type: String, //shirt,pant,girltop
  },
  suitableFor: {
    type: String, //men/women/kids
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
    required: true,
  },
  availableSizes: [
    {
      type: String,
    },
  ],
  productImage: {
    imageName: String,
    imagePath: String,
  },
});

const Products = mongoose.model("products", productSchema);
export { Products };
