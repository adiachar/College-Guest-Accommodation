const express = require('express');
const router = express.Router();
const { faker } = require("@faker-js/faker");
const ExpressError = require("../utility/ExpressError");
const wrapAsync = require("../utility/wrapAsync");
const controller = require("../controller/home.js");
const {isLoggedIn} = require("../middlewares.js");

// home
router.get("/", isLoggedIn, wrapAsync(controller.home));

//home redirect
router.get("/redirect", controller.homeRedirect);

//account
router.get("/account", controller.account);

//create_request
router.get("/createRequest", isLoggedIn, controller.createRequest);

//create guest request
router.route("/createGuestRequest")
.get( isLoggedIn, wrapAsync(controller.createGuestRequestPage))
.post( isLoggedIn, wrapAsync (controller.createGuestRequest));


module.exports = router;
