const express = require("express");
const router = express.Router();
const {
  sendStripKey,
  sendRazorPyaKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require("../controllers/paymentController");
const { isLoggdin } = require("../middlewares/user");

router.route("/stripkey").get(isLoggdin, sendStripKey);
router.route("/razorpaykey").get(isLoggdin, sendRazorPyaKey);

router.route("/capturestripepayment").post(isLoggdin, captureStripePayment);
router.route("/capturerazorpaypayment").post(isLoggdin, captureRazorpayPayment);

module.exports = router;
