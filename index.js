const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const app = express();
const port = 8080;
const wrapAsync = require("./utility/wrapAsync");
const query = require("./utility/allQuery");
const jwt = require("jsonwebtoken");
const home = require("./routes/homeRouts.js");
const gstRqst = require("./routes/gstRqstRouts.js");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

const secretKey = "secretKey";

app.use('/home', home);
app.use('/guestRequest', gstRqst);

// connection to the database
// const connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     database: 'mite',
//     password: 'Ad2142004',
// });

let nav = { 
    showAccount : false, 
    createRequest : false,
};

let makeAllFalse = () =>{
    nav.showAccount = false;
    nav.createRequest = false;
}

//register web page
app.get("/register", (req, res) =>{
    res.render("register.ejs");
});

//register post request
app.post("/register", wrapAsync ( async (req, res) => {
    let {name, email, user_type, department, password, confirmPassword} = req.body;
    let id = getRandomId();
    if(password == confirmPassword)
    {   
        await query.userRegister(id, name, email, user_type, department, password)
        .then((user) => {
            jwt.sign(user, secretKey, (err, token) =>{
                if(err) throw err;
                else{
                    res.cookie('token', token, {httpOnly: true, secure: true, sameSite: 'Strict'});
                    makeAllFalse();
                    res.redirect('/home');
                }
            })
        }).catch((err) => {throw err});
    }
    else{
        res.redirect('/register');
    }
}));

//login web page
app.get("/login", (req, res) =>{
    let userStatus = '';
    res.render("login.ejs", {userStatus});
});

//login post request
app.post("/login", wrapAsync ( async (req, res) => {
    makeAllFalse();
    let {email, password} = req.body;
    query.userLogin(email, password)
    .then((user) => {
        if(!user){
            let userStatus = 'user Not found';
            res.render('login.ejs', {userStatus});
        }
        else{
            jwt.sign(user, secretKey, {expiresIn : '1h'}, (err, token) =>{
                if(err) throw err;
                else{
                    res.cookie('token', token, {httpOnly: true, secure: true, sameSite: 'Strict'});
                    res.redirect("/home");
                }
            });
        }
    }).catch((err) =>{throw err});
}));


app.all('*', (req, res) =>{
    res.send("Page Not Found");
});

app.use((err, req, res, next) =>{
    res.render("error.ejs", {err});
});

app.listen(port, ()=>{
    console.log("listening to the port " +port);
});

