const query = require("../utility/allQuery");
const ExpressError = require("../utility/ExpressError");

module.exports.home = async (req, res) =>{
    if(res.locals.user){
        let nav = req.session.nav;
        query.reqCount(res.locals.user.id, res.locals.user.userType)
        .then((reqCount) => {
            res.locals.user.reqCount = reqCount;
            res.render("home.ejs", {nav});
        }).catch((err) => {throw new ExpressError(404, err)});
    }else{
        let userStatus = 'Please Login';
        res.render('login.ejs', {userStatus});
    }
}

module.exports.homeRedirect = (req, res) => {
    req.session.nav = "home";
    res.redirect(`/home`);
}

module.exports.account = (req, res) =>{
    req.session.nav = "account";
    res.redirect(`/home`);  
}

module.exports.createRequest = (req, res) =>{
    req.session.nav = "createRequest";
    res.redirect('/home');
}

module.exports.createGuestRequestPage = async (req, res) =>{
    if(res.locals.user){
        if(res.locals.user.userType == 'coordinator'){  
            query.getUserByType('hod')
            .then((upperLevelUser) =>{
                res.render('gstRqst/createRequest.ejs', {upperLevelUser});
            })
            .catch((err) =>{throw err});
        }
        else if(res.locals.user.userType == 'hod'){
            query.getUserByType('principal')
            .then((upperLevelUser) =>{
                res.render('gstRqst/createRequest.ejs', {upperLevelUser});
            })
            .catch((err) =>{throw err});
        }
        else if(res.locals.user.userType == 'principal'){
            query.getUserByType('warden')
            .then((upperLevelUser) =>{
                res.render('gstRqst/createRequest.ejs', {upperLevelUser});
            })
            .catch((err) =>{throw err});
        }
    }
    else{
        res.send(res.locals.user.id);
    }
}

module.exports.createGuestRequest = async (req, res) =>{
    let {numberOfGuests, arrivalDate, arrivalTime, leavingDate, name, guestDetail, vegNonVeg, foodTime, reasonOfArrival, to_id} = req.body;
    await query.insertRequest(res.locals.user.id, to_id, numberOfGuests, reasonOfArrival, name, guestDetail, vegNonVeg, foodTime, arrivalDate, arrivalTime, leavingDate)
    .then((resolve) => {
        let confirmation = {};
        confirmation.status = "successfull";
        confirmation.message = "Guest Request has been Created and Sent Successfully";
        res.render( "confirmation.ejs", {confirmation});
    })
    .catch((err) => {
        let confirmation = {};
        confirmation.status = "rejected";
        confirmation.message = "Guest Request was Not Created Due to some error in the Database";
        res.render( "confirmation", {confirmation});
    });
}