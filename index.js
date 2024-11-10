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
    showAllRequests : false,
    allRequests : [],
    createGuestRequest : false,
    seeGuestRequest : false,
    guestRequest : [],
};

let makeAllFalse = () =>{
    nav.showAccount = false;
    nav.createRequest = false;
    nav.showAllRequests = false;
    nav.createGuestRequest = false;
    nav.seeGuestRequest = false;
    nav.allRequests = [];
    nav.guestRequest = [];
}


// get home
app.get("/home/:id", (req, res) =>{
    let {id} = req.params;
    let user = "";
    userQuery = `SELECT * FROM user WHERE id = '${id}'`;
    hodQuery = `SELECT * FROM user WHERE user_type = 'hod'`;
    principalQuery = `SELECT * FROM user WHERE user_type = 'principal'`;
    wardonQuery = `SELECT * FROM user WHERE user_type = 'warden'`;
    connection.query(userQuery, (err, result) =>{
        if(err)
        {
            console.log(err);
        }
        else{
            user = result[0];
            if(user.user_type == 'coordinator'){
                connection.query(hodQuery, (err, result) =>{
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        let reqTo = result;
                        res.render("home.ejs", {user, nav, reqTo});
                    }
                });
            }
            else if(user.user_type == 'hod'){
                connection.query(principalQuery, (err, result) =>{
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        let reqTo = result;
                        res.render("home.ejs", {user, nav, reqTo});
                    }
                });
            }
            else if(user.user_type == 'principal'){
                connection.query(wardonQuery, (err, result) =>{
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        let reqTo = result;
                        res.render("home.ejs", {user, nav, reqTo});
                    }
                });
            }   
        }
    });
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
            makeAllFalse();
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
    makeAllFalse();
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


//get creat guest request
app.get("/guestRequest/:id", (req, res) =>{
    let {id} = req.params;
    makeAllFalse();
    nav.createGuestRequest = true;
    res.redirect(`/home/${id}`);
});


//post for create guest request
app.post("/guestRequest/:id/:from_name/:user_type/:department", (req, res) =>{
    let {id, from_name, user_type, department} = req.params;
    let req_id = getRandomId(); 
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    let {numberOfGuests, guestName, arrivalDate, leavingDate, arrivalTime, reasonOfArrival, to_id} = req.body;
    from_name = `${from_name} - ${user_type} Of ${department} department`;
    let request = [req_id, id, id, from_name, to_id, numberOfGuests, guestName, arrivalDate, arrivalTime, leavingDate, reasonOfArrival, date];
    let q = `INSERT INTO guestRequest(req_id, creator_id, from_id, from_name, to_id, numberOfGuests, guestName, arrivalDate, arrivalTime, leavingDate, reasonOfArrival, req_date) VALUES(?)`;
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


//get for show all requests
app.get("/home/showAllRequests/:id", (req, res) =>{
    let {id} = req.params;
    nav.showAllRequests = true;
    q = `SELECT * FROM guestRequest WHERE to_id = '${id}'`;
    connection.query(q, (err, result) =>{
        if(err){
            console.log(err);
        }
        else{
            nav.allRequests = result;
            res.redirect(`/home/${id}`);
        }
    });
});


//post for approval or reject request
app.post("/request/:status/:user_id/:user_name/:user_type/:department/:req_id", (req, res) =>{
    let {status, user_id, user_name, user_type, department, req_id} = req.params;
    console.log(status, user_id, user_name, user_type, req_id);
    if(user_type == 'hod' || user_type == 'coordinator'){
        user_name = `${user_name} - ${user_type} Of ${department} department`;
    }
    else{
        user_name = `${user_name} - ${user_type} - MITE`;
    }
    if( user_type == 'hod'){
        console.log("user_type is hod");
        if(status == 'approved'){
            console.log('status is approoved');
            let qPrinciple = `SELECT id FROM user WHERE user_type = 'principal'`;
            connection.query(qPrinciple, (perr, presult) =>{
                if(perr)
                {
                    console.log(perr);
                }
                else if(presult.length > 0){
                    let pid = presult[0].id;
                    console.log(pid);
                    q = `UPDATE guestrequest SET req_status = 'AHNAPNAW', from_id ='${user_id}', from_name = '${user_name}', to_id = '${pid}' WHERE req_id = '${req_id}'`;
                    connection.query(q, (err, result) => {
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.send(result);
                        }
                    });
                }
                else{
                    res.send("no principal account");
                }
            });
        }
        else if(status == 'rejected'){
            q = `UPDATE guestrequest SET req_status = 'NAHNAPNAW' WHERE req_id = '${req_id}'`;
            connection.query(q, (err, result) => {
                if(err){
                    console.log(err);
                }
                else{
                    res.send(result);
                }
            });
        }
    }

    else if( user_type == 'principal'){
        if(status == 'approved'){
            let qWardon = `SELECT id FROM user WHERE user_type = 'wardon'`;
            connection.query(qWardon, (werr, wresult) =>{
                if(werr)
                {
                    console.log(werr);
                }
                else if(wresult.length > 0){
                    let wid = wresult[0];
                    q = `UPDATE guestrequest SET req_status = 'AHNAPNAW', from_id ='${user_id}', from_name = '${user_name}', to_id = '${wid}' WHERE req_id = '${req_id}'`;
                    connection.query(q, (err, result) => {
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.send(result);
                        }
                    });
                }
                else{
                    res.send("no wardon account");
                }
            });
        }
        else if(status == 'rejected'){
            q = `UPDATE guestrequest SET req_status = 'AHNAPNAW' WHERE req_id = '${req_id}'`;
            connection.query(q, (err, result) => {
                if(err){
                    console.log(err);
                }
                else{
                    res.send(result);
                }
            });
        }
    
    }
    else if( user_type == 'wardon'){
        if(status == 'approved'){
            q = `UPDATE guestrequest SET req_status = 'AHAPAW' WHERE req_id = '${req_id}'`;
            connection.query(q, (err, result) => {
                if(err){
                    console.log(err);
                }
                else{
                    console.log(result);
                }
            });
        }
        else if(status == 'rejected'){
            q = `UPDATE guestrequest SET req_status = 'AHAPNAW', from_id ='${user_id}', from_name = '${user_name}' WHERE req_id = '${req_id}'`;
            connection.query(q, (err, result) => {
                if(err){
                    console.log(err);
                }
                else{
                    console.log(result);
                }
            });
        }
    }
    else{
        res.send("none of those");
    }
});


// app.use((req, res) =>{
//     res.send("Page Not Found");
// });


app.listen(port, ()=>{
    console.log("listening to the port " +port);
});