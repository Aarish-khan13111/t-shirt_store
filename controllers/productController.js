const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

// const CustomError = require("../utils/customError");

exports.addProduct = BigPromise(async (req, res, next) => {
  //images
  let imagesArray = [];

  if (!req.files) {
    return next(new CustomError("images are required", 401));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imagesArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resulPerPage = 6;
  const totalcountProduct = await Product.countDocuments();

  const products = new WhereClause(Product.find(), req.query).search().filter();

  const filterProductNumber = products.length;

  products.pager(resulPerPage);
  products = await products.base;

  res.status(200).json({
    success: true,
    products,
    filterProductNumber,
    totalcountProduct,
  });
});
