const express = require("express");
const router = express.Router();
const { isLoggdin, customRoles } = require("../middlewares/user");

const {
  createOrder,
  getOneOrder,
  getUserOrders,
  admingetallOrders,
  adminUpdateOrder,
  adminDeletOrder,
} = require("../controllers/orderController");

router.route("/order/create").post(isLoggdin, createOrder);
router.route("/order/:id").get(isLoggdin, getOneOrder);
router.route("/myorder").get(isLoggdin, getUserOrders);

//admins routes
router
  .route("/admin/orders")
  .get(isLoggdin, customRoles("admin"), admingetallOrders);

router
  .route("/admin/orders")
  .put(isLoggdin, customRoles("admin"), adminUpdateOrder)
  .delete(isLoggdin, customRoles("admin"), adminDeletOrder);

module.exports = router;
