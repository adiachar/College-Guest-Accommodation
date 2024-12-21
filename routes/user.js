const express = require("express");
const router = express.Router();
const wrapAsync = require("../utility/wrapAsync");
const controller = require("../controller/user.js");

router.route("/register")
.get(controller.userRegisterPage)
.post(wrapAsync (controller.userRegister));

router.route("/login")
.get(controller.userLoginPage)
.post(wrapAsync ( controller.userLogin));

module.exports = router;