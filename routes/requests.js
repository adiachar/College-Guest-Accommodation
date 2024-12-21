const express = require("express");
const router = express.Router();
const wrapAsync = require("../utility/wrapAsync");
const controller = require("../controller/requests.js");
const {isLoggedIn} = require("../middlewares.js");

//get for Show All Requests
router.get("/", isLoggedIn, wrapAsync (controller.allRequests));

//get for Show all Request Status
router.get("/status", isLoggedIn, wrapAsync(controller.allRequestsStatus));

module.exports = router;