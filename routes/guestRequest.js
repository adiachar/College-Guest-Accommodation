const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utility/wrapAsync");
const controller = require("../controller/guestRequest.js");
const { ColorModule } = require('@faker-js/faker');
const {isLoggedIn} = require("../middlewares.js");

//Guest Request Letter
router.get("/", isLoggedIn, wrapAsync(controller.guestRequestLetter));

//Guest Request Delete
router.delete("/delete", isLoggedIn, wrapAsync(controller.guestRequestDelete));

//Guest Request Report
router.get("/report", isLoggedIn, controller.guestRequestReport);

//Guest Request Delete for To id
router.delete("/:toId/delete", isLoggedIn, wrapAsync(controller.guestRequestDeleteForToId));

//Guest Request Reject
router.route("/reject", isLoggedIn)
.get(isLoggedIn, controller.guestRequestRejectPage)
.post(isLoggedIn, wrapAsync(controller.guestRequestReject));

//Guest Request Letter for warden
router.get("/:reqType", isLoggedIn, wrapAsync(controller.guestRequestLetterForWarden));

//Guest request Approve
router.post("/approve", isLoggedIn, wrapAsync (controller.guestRequestApprove));

//Guest Request Approve Principal
router.post("/approve/principal", isLoggedIn, wrapAsync (controller.guestRequestApprovePrincipal));

module.exports = router;