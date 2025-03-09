const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utility/wrapAsync");
const controller = require("../controller/guestRequest.js");
const { ColorModule } = require('@faker-js/faker');
const {isLoggedIn} = require("../middlewares.js");

//Guest Request Letter
router.get("/", isLoggedIn, wrapAsync(controller.guestRequestLetter));

//Guest Request Report
router.get("/report", isLoggedIn, controller.guestRequestReport);

//Guest Request Delete for To id
router.delete("/delete", isLoggedIn, wrapAsync(controller.guestRequestDeleteForId));

//Guest Request Reject
router.route("/reject", isLoggedIn)
.get(isLoggedIn, controller.guestRequestRejectPage)
.post(isLoggedIn, wrapAsync(controller.guestRequestReject));

//Guest Request Letter for warden
router.get("/warden", isLoggedIn, wrapAsync(controller.guestRequestLetterForWarden));

//Guest request Approve for hod and messManager
router.post("/approve/hod", isLoggedIn, wrapAsync(controller.guestRequestApproveHod));

router.post("/approve/warden", isLoggedIn, wrapAsync(controller.guestRequestApproveWarden));

router.post("/approve/messManager", isLoggedIn, wrapAsync(controller.guestRequestApproveMessManager));

router.post("/allocateRoom", isLoggedIn, wrapAsync(controller.guestRequestAllocateRoom));

//Guest Request Approve Principal
router.post("/approve/principal", isLoggedIn, wrapAsync (controller.guestRequestApprovePrincipal));

module.exports = router;