const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotpassword,
  passwordReset,
  userDashboard,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require("../controllers/userController");
const { isLoggdin, customRoles } = require("../middlewares/user");

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/forgotpassword").post(forgotpassword);

router.route("/password/reset/:token").post(passwordReset);

router.route("/userDashboard").get(isLoggdin, userDashboard);

router.route("/password/update").post(isLoggdin, changePassword);

router.route("/userDashboard/update").post(isLoggdin, updateUserDetails);

//Admin only route
router.route("/admin/users").get(isLoggdin, customRoles("admin"), adminAllUser);

router
  .route("/admin/user/:id")
  .get(isLoggdin, customRoles("admin"), adminGetOneUser)
  .put(isLoggdin, customRoles("admin"), adminUpdateOneUserDetails)
  .delete(isLoggdin, customRoles("admin", adminDeleteOneUser));

//manager only route
router
  .route("/manager/users")
  .get(isLoggdin, customRoles("manager"), managerAllUser);

module.exports = router;
