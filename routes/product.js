const express = require("express");
const router = express.Router();
const { isLoggdin, customRoles } = require("../middlewares/user");

const {
  addProduct,
  getAllProduct,
  adminGetAllProducts,
  getOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require("../controllers/productController");

//user route
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getOneProduct);
router.route("/review").put(isLoggdin, addReview);
router.route("/review").delete(isLoggdin, deleteReview);
router.route("/reviews").get(isLoggdin, getOnlyReviewsForOneProduct);

//admin route
router
  .route("/admin/product/add")
  .post(isLoggdin, customRoles("admin"), addProduct);

router
  .route("/admin/products")
  .get(isLoggdin, customRoles("admin"), adminGetAllProducts);

router
  .route("/admin/product/:id")
  .put(isLoggdin, customRoles("admin"), adminUpdateOneProduct)
  .delete(isLoggdin, customRoles("admin"), adminDeleteOneProduct);

module.exports = router;
