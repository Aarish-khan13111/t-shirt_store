const express = require("express");
const router = express.Router();

const { addProduct } = require("../controllers/productController");
// const { isLoggdin, customRoles } = require("../middlewares/user");

router.route("/testProduct").get(addProduct);

module.exports = router;
