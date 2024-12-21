const query = require("./utility/allQuery");

module.exports.isLoggedIn = (req, res, next) => {
    if(typeof(req.session.user) !== "undefined"){
        res.locals.user = req.session.user;
        next();
    }else{
        let userStatus = 'Please Login';
        res.render('login.ejs', {userStatus});
    }
}