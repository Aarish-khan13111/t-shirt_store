const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotpassword,
  passwordReset,
} = require("../controllers/userController");

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/forgotpassword").post(forgotpassword);

router.route("/password/reset/:token").post(passwordReset);

module.exports = router;
