const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a product name"],
    trim: true,
    maxlength: [120, "product name should not be more then 120 char"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a product price"],
    maxlength: [6, "product price should not be more then 6 digits"],
  },
  description: {
    type: String,
    required: [true, "Please provide a product description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please select a category"],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
      message: "Please select only from category",
    },
  },
  stoke: {
    type: Number,
    required: [true, "please add stoke quantity"],
  },
  brand: {
    type: String,
    required: [true, "Please add a brand for cloathing"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
