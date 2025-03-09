const query = require("../utility/allQuery");
const ExpressError = require("../utility/ExpressError");

module.exports.guestRequestLetter = async (req, res) =>{
    let{reqId} = req.params;
    query.getGuestRequestsById(reqId)
    .then((reqData) =>{
        let {guestRequest} = reqData;
        let {guest} = reqData;
        guestRequest = guestRequest[0];
        let to_id;
        if(res.locals.user.userType == "hod"){
            to_id = "hod_id";
        }else if(res.locals.user.userType == "principal"){
            to_id = "principal_id";
        }
        query.getUserById(guestRequest[to_id])
        .then((toUser)=>{
            guestRequest.to = toUser;
            query.getUserByType('warden')
            .then((wardens)=>{
                query.getUserByType('messWarden')
                .then((messWardens)=>{
                    res.render("gstRqst/showRequestLetter.ejs", {guestRequest, guest, wardens, messWardens});
                }).catch((err) =>{throw err});
            }).catch((err) =>{throw err});
        }).catch((err) => {throw err});
    }).catch((err) => {throw err});
}

module.exports.guestRequestDelete = async (req, res)=>{
    let {reqId} = req.params;
    let userId = res.locals.user.id;
    let userType = res.locals.user.userType;
    query.deleteGuestRequestById(reqId, userId, userType)
    .then((result) => {
        let confirmation = {};
        confirmation.status = "successfull";
        confirmation.message = result;
        res.render('confirmation.ejs', {confirmation});
        console.log("confirmation sent");
    }).catch((err) => {throw err;});
}

module.exports.guestRequestReport = (req, res) => {
    let {reqId} = req.params;
    query.getGuestRequestsById(reqId)
    .then(({guestRequest, guest}) => {
        guestRequest = guestRequest[0];
        console.log({guestRequest, guest});
        res.render("report.ejs", {guestRequest, guest});
    });
}

module.exports.guestRequestDeleteForToId = async (req, res) => {
    const {reqId, toId} = req.params;
    if(res.locals.user.id === toId){
        query.deleteGuestRequestById(reqId, toId,  res.locals.user.userType)
        .then((result) => {
            console.log(result);
            let confirmation = {};
            confirmation.status = "successfull";
            confirmation.message = result;
            res.render('confirmation.ejs', {confirmation});
        }).catch((err) => {throw err;});
    }
}

module.exports.guestRequestLetterForWarden = async (req, res) => {
    let {reqId} = req.params;
    query.getGuestRequestsById(reqId)
    .then((reqData) =>{
        let {guestRequest} = reqData;
        let {guest} = reqData;
        guestRequest = guestRequest[0];
        res.render("gstRqst/showRequestLetter.ejs", {guestRequest, guest});
    }).catch((err) => {throw err});
}

module.exports.guestRequestApproveHod = async (req, res) =>{
    let {reqId} = req.params;
    query.approveGuestRequestHod(reqId)
    .then((result) => {
        let confirmation = {};
        confirmation.status = "successfull";
        confirmation.message = "Request Status Approved";
        res.render('confirmation.ejs', {confirmation});
    }).catch((err) => {throw err});
}

module.exports.guestRequestAllocateRoom = async (req, res) =>{
    let {reqId} = req.params;
    if(res.locals.user.userType == 'warden'){
        query.getGuestRequestsById(reqId)
        .then((reqData) =>{
            let {guestRequest} = reqData;
            let {guest} = reqData;
            guestRequest = guestRequest[0];
            return res.render('wardenApproval.ejs', {guestRequest, guest});
        }).catch((err) => {throw err});
    }
}

module.exports.guestRequestApproveWarden = async (req, res) => {
    let {reqId} = req.params;
    let warden_id = res.locals.user.id;
    console.log(req.body);
    query.approveGuestRequestWarden(reqId, warden_id, req.body)
    .then((result) => {
        let confirmation = {};
        confirmation.status = "successfull";
        confirmation.message = "Request Status Approved";
        res.render('confirmation.ejs', {confirmation});
    }).catch((err) => {throw err});
}

module.exports.guestRequestRejectPage = (req, res) =>{
    let {reqId} = req.params;
    res.render("gstRqst/rejectGuestRequest", {reqId});
}

module.exports.guestRequestReject = async (req, res) =>{
    let {reqId} = req.params;
    let {reasonForRejection} = req.body;
    let sts;
    console.log("in guest Reject");
    if(res.locals.user.userType == 'hod'){
        sts = 'RH';
        reject(sts);
    }
    else if(res.locals.user.userType == 'principal'){
        sts = 'RP';
        reject(sts);
    }
    else if(res.locals.user.userType == 'warden'){
        sts = 'RW';
        reject(sts);
    }
    
    function reject(sts){
        query.rejectGuestRequest(reqId, sts, reasonForRejection)
        .then((result) => {
            let confirmation = {};
            confirmation.status = "successfull";
            confirmation.message = "Request Rejected";
            res.render("confirmation.ejs", {confirmation});
        }).catch((err) => {throw new ExpressError(400, err);

        });
    }
}

module.exports.guestRequestApprovePrincipal = async(req, res) =>{
    let {reqId} = req.params;
    let {wardenId1, wardenId2} = req.body;
    query.approveGuestRequestPrincipal(reqId, wardenId1, wardenId2, res.locals.user.id)
    .then((result) => {
        let confirmation = {};
        confirmation.status = 'successfull';
        confirmation.message = 'Request Status Approved';
        res.render("confirmation.ejs", {confirmation});
    }).catch((err) => {
        console.log(err);
        throw new ExpressError(400, err);
    });
}