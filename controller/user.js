const query = require("../utility/allQuery");
const ExpressError = require("../utility/ExpressError");

module.exports.userRegisterPage = (req, res) =>{
    res.render("register.ejs");
}

module.exports.userRegister = async (req, res) => {
    let {name, email, user_type, department, password, confirmPassword} = req.body;
    if(password == confirmPassword){  
        await query.userRegister(name, email, user_type, department, password)
        .then((user) => {
            req.session.user = user;
            res.redirect("/home");
        }).catch((err) => {throw err});
    }
    else{
        res.redirect('user/register');
    }
}

module.exports.userLoginPage = (req, res) =>{
    let userStatus = '';
    res.render("login.ejs", {userStatus});
}

module.exports.userLogin = async (req, res) => {
    let {email, password} = req.body;
    let idx = email.indexOf(" ");
    if(idx == -1){
        query.userLogin(email, password)
        .then((user) => {
        if(!user){
            let userStatus = 'user Not found';
            res.render('login.ejs', {userStatus});
        }
        else{
            req.session.user = user;
            res.redirect("/home");
        }
        }).catch((err) =>{throw err});
    }else{
        let userStatus = 'Please check email';
        res.render('login.ejs', {userStatus});
    }
}