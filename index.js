const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const home = require("./routes/home.js");
const guestRequest = require("./routes/guestRequest.js");
const user = require("./routes/user.js");
const requests = require("./routes/requests.js");
const session = require("express-session");
const methodOverride = require("method-override");

const app = express();
const port = 8080;

const sessionOptions = {
    secret:  'superSecret@key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use('/home', home);
app.use('/guestRequest/:reqId', guestRequest);
app.use("/user", user);
app.use("/requests", requests);

app.all('*', (req, res) =>{
    res.send("Page Not Found");
});

app.use((err, req, res, next) =>{
    res.render("error.ejs", {err});
    console.log(err);
});

app.listen(port, ()=>{
    console.log("listening to the port " +port);
});