const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const ejsMate = require("ejs-mate");
const { faker } = require("@faker-js/faker");
const { homedir } = require("os");

const app = express();
const port = 8080;


app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);


// connection to the database
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'mite',
    password: 'Ad2142004',
});

//generating random id's
let getRandomId = () => {
    return [
    faker.string.uuid(),
    ];
}

let nav = { 
    showAccount : false, 
    createRequest : false, 
    showRequests : false,
    showRequestsData : [],
    guestRequest : false,
};

let makeAllFalse = () =>{
    nav.showAccount = false;
    nav.createRequest = false;
    nav.showRequests = false;
    nav.guestRequest = false;
    nav.showRequestsData = [];
}


// get home
app.get("/home/:id", (req, res) =>{
    let {id} = req.params;
    let user = "";
    userQuery = `SELECT * FROM user WHERE id = '${id}'`;
    hodQuery = `SELECT * FROM user WHERE user_type = 'hod'`;
    connection.query(userQuery, (err, result) =>{
        if(err)
        {
            console.log(err);
        }
        else{
            user = result[0];
        }
    });
    connection.query(hodQuery, (err, result) =>{
        if(err)
        {
            console.log(err);
        }
        else{
            let hods = result;
            res.render("home.ejs", {user, nav, hods});
        }
    });

    // res.render("home.ejs", {user, allRequest, createRequest, showAccount});
});


//register web page
app.get("/register", (req, res) =>{
    let { user_type } = req.query;
    res.render("register.ejs", {user_type});
});


//register post request
app.post("/register", (req, res) => {
    let {user_type} = req.query;
    let id = getRandomId();
    id = id[0];
    let {name, department, password, confirmPassword} = req.body;
    let data = [id, name, user_type, department, password];
    let q = `INSERT INTO user (id, name, user_type, department, password ) VALUES(?)`;
    if(password == confirmPassword){
        connection.query(q, [data], (err, result) =>{
            if(err){
                res.send(err);
            }
            else{
            res.redirect(`/home/${id}`);
            }
        });
    }
});


//login web page
app.get("/login", (req, res) =>{
    res.render("login.ejs");
});


//login post request
app.post("/login", (req, res) => {
    let {name, password} = req.body;
    let q = `SELECT * FROM user WHERE name = '${name}' AND password = '${password}'`;
    connection.query(q, (err, result) =>{
        if(err){
            res.send("some error in database");
        }
        else if( result.length > 0)
        {
            let user = result[0];
            res.redirect(`/home/${user.id}`);
        }
        else{
            res.send("user not found");
        }
    });  
});


//guest Request
app.get("/guestRequest/:id", (req, res) =>{
    let {id} = req.params;
    makeAllFalse();
    nav.guestRequest = true;
    res.redirect(`/home/${id}`);
});


//nav routs ----------------------------------------------------

//get home
app.get("/home/redirect/:id", (req, res) => {
    let {id} = req.params;
    makeAllFalse();
    res.redirect(`/home/${id}`);
});


// get account
app.get("/home/account/:id", (req, res) =>{
    let {id} = req.params;
    makeAllFalse();
    nav.showAccount = true;
    res.redirect(`/home/${id}`);     
});


//get create_request
app.get("/home/createRequest/:id", (req, res) =>{
    let {id} = req.params;
    makeAllFalse();
    nav.createRequest = true;
    res.redirect(`/home/${id}`);
});


//post for guest request
app.post("/guestRequest/:id", (req, res) =>{
    let {id} = req.params;
    let randId = getRandomId();
    let {title, numberOfGuests, guestName, arrivalDate, leavingDate, arrivalTime, reasonOfArrival, to_id} = req.body;
    let request = [randId, id, title, numberOfGuests, guestName, arrivalDate, leavingDate, arrivalTime, reasonOfArrival, to_id];
    q = `INSERT INTO guestRequest(id, from_id, title, numberOfGuests, guestName, arrivalDate, leavingDate, arrivalTime, reasonOfArrival, to_id) VALUES(?)`;
    connection.query(q, [request], (err, result) =>{
        if(err){
            console.log(err);
        }
        if(result)
        {   
            makeAllFalse();
            res.redirect(`/home/${id}`);
        }
    });
});

//get for show requests
app.get("/home/showRequests/:id", (req, res) =>{
    let {id} = req.params;
    makeAllFalse();
    nav.showRequests = true;
    q = `SELECT * FROM guestRequest WHERE to_id = '${id}'`;
    connection.query(q, (err, result) =>{
        if(err){
            console.log(err);
        }
        else if(result.length > 0){
            nav.showRequestsData = result;
            console.log(nav.showRequestsData);
            res.redirect(`/home/${id}`);
        }
        else{
            res.redirect(`/home/${id}`);
        }
    });
});

// ----------------------------------------------------------------------------------------------------------

app.use((req, res) =>{
    res.send("Page Not Found");
});

// app.use((err, req, res, next) =>{
//     res.send("----Some error--------");
// });

app.listen(port, ()=>{
    console.log("listening to the port " +port);
});