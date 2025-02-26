const query = require("../utility/allQuery");
const ExpressError = require("../utility/ExpressError");

module.exports.allRequests = async (req, res) =>{
    if(res.locals.user.userType != 'warden'){
       query.getGuestRequestsByToId(res.locals.user.id, res.locals.user.userType)
        .then((guestRequestData) =>{
            res.render('showAllRequests.ejs', {guestRequestData});
        }).catch( (err) => { throw err; }); 
    }else{
        query.getGuestRequestsForWarden(res.locals.user.id)
        .then((data) => {
            res.render("showAllRequests.ejs", {data});
        }).catch((err) => { throw err; });
    }
}

module.exports.allRequestsStatus = async (req, res) =>{
    query.getGuestRequestsByCreatorId(res.locals.user.id)
    .then((guestRequestData)=>{
        res.render("showRequestStatus.ejs", {guestRequestData});
    });
}