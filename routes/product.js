const express = require("express");
const router = express.Router();
const { isLoggdin, customRoles } = require("../middlewares/user");

const {
  addProduct,
  getAllProduct,
  adminGetAllProducts,
  getOneProduct,
} = require("../controllers/productController");

//user route
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getOneProduct);

//admin route
router
  .route("/admin/product/add")
  .post(isLoggdin, customRoles("admin"), addProduct);

router
  .route("/admin/products")
  .get(isLoggdin, customRoles("admin"), adminGetAllProducts);

module.exports = router;
