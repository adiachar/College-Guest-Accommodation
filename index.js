const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const ejsMate = require("ejs-mate");
const { faker } = require("@faker-js/faker");
const ExpressError = require("./utility/ExpressError");
const wrapAsync = require("./utility/wrapAsync");
const query = require("./utility/allQuery");

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
app.get("/home/:id", wrapAsync( async (req, res) =>{
    let {id} = req.params;
    await query.getUserById(id)
    .then((user) => {

        if(user.user_type == 'coordinator'){
            query.getUserByType('hod')
            .then((reqTo) => {
                res.render("home.ejs", {user, nav, reqTo});
            })
            .catch((err) => {throw err;})
        }

        else if(user.user_type == 'hod'){
            query.getUserByType('principal')
            .then((reqTo) =>{
                res.render("home.ejs", {user, nav, reqTo});
            })
            .catch((err) =>{throw err});
        }

        else if(user.user_type == 'principal'){
            query.getUserByType('wardon')
            .then((reqTo) =>{
                res.render("home.ejs", {user, nav, reqTo});
            })
            .catch((err) =>{throw err});
        }

    })
    .catch( (rejected) =>{console.log(rejected)});
    
}));


//register web page
app.get("/register", (req, res) =>{
    let { user_type } = req.query;
    res.render("register.ejs", {user_type});
});


//register post request
app.post("/register", wrapAsync ( (req, res) => {
    let {user_type} = req.query;
    let id = getRandomId();
    id = id[0];
    let {name, department, password, confirmPassword} = req.body;
    let data = [id, name, user_type, department, password];
    let q = `INSERT INTO user (id, name, user_type, department, password ) VALUES(?)`;
    if(password == confirmPassword){
        connection.query(q, [data], (err, result) =>{
            if(err){
                throw err;
            }
            else{
            makeAllFalse();
            res.redirect(`/home/${id}`);
            }
        });
    }
}));


//login web page
app.get("/login", (req, res) =>{
    res.render("login.ejs");
});


//login post request
app.post("/login", wrapAsync ( (req, res) => {
    makeAllFalse();
    let {name, password} = req.body;
    query.userLogin(name, password)
    .then((user) => {
        res.redirect(`/home/${user.id}`);
    }).catch((err) =>{throw err});
}));


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
app.post("/guestRequest/:id", wrapAsync ( (req, res) =>{
    let {id} = req.params;
    query.getUserById(id).then((user) => {
        let from_name = user.name;
        let user_type = user.user_type;
        let department = user.department;
        let req_id = getRandomId(); 
        const today = new Date();
        const date = today.toISOString().split('T')[0];
        let {numberOfGuests, guestName, arrivalDate, leavingDate, arrivalTime, reasonOfArrival, to_id} = req.body;
        from_name = `${from_name} - ${user_type} Of ${department} department`;
        let request = [req_id, id, id, from_name, to_id, numberOfGuests, guestName, arrivalDate, arrivalTime, leavingDate, reasonOfArrival, date];
        let q = `INSERT INTO guestRequest(req_id, creator_id, from_id, from_name, to_id, numberOfGuests, guestName, arrivalDate, arrivalTime, leavingDate, reasonOfArrival, req_date) VALUES(?)`;
        connection.query(q, [request], (err, result) =>{
            if(err){
                throw err;
            }
            if(result)
            {   
                makeAllFalse();
                res.redirect(`/home/${id}`);
            }
        });
    }).catch((err) =>{throw err});
}));


//get for show all requests
app.get("/home/showAllRequests/:id", wrapAsync ( (req, res) =>{
    let {id} = req.params;
    nav.showAllRequests = true;
    q = `SELECT * FROM guestRequest WHERE to_id = '${id}'`;
    connection.query(q, (err, result) =>{
        if(err){
            throw err;
        }
        else{
            nav.allRequests = result;
            res.redirect(`/home/${id}`);
        }
    });
}));


//post for approval or reject request
app.post("/request/:status/:id/:user_name/:user_type/:department/:req_id", wrapAsync ( (req, res) =>{
    let {status, id, req_id} = req.params;

    query.getUserById(id)
    .then((user) => {
        let from_name = user.name;
        if(user.user_type == 'hod' || user.user_type == 'coordinator'){
            from_name = `${from_name} - ${user.user_type} Of ${user.department} department`;
        }
        else{
            from_name = `${from_name} - ${user.user_type} - MITE`;
        }
        if( user.user_type == 'hod'){
            if(status == 'approved'){
                query.getUserByType('principal')
                .then((princy) => {
                    let pid = princy[0].id;
                    q = `UPDATE guestrequest SET req_status = 'AHNAPNAW', from_id ='${user.id}', from_name = '${user.name}', to_id = '${pid}' WHERE req_id = '${req_id}'`;
                    connection.query(q, (err, result) => {
                        if(err){
                            throw err;
                        }
                        else{
                            res.send(result);
                        }
                    });
                })
                .catch((err) => {throw err;});
            }
            else if(status == 'rejected'){
                q = `UPDATE guestrequest SET req_status = 'NAHNAPNAW' WHERE req_id = '${req_id}'`;
                connection.query(q, (err, result) => {
                    if(err){
                        throw err;
                    }
                    else{
                        res.send(result);
                    }
                });
            }
            else{
                throw new ExpressError(400, "Status is Not Valid");
            }
        }
        else if( user.user_type == 'principal'){
            if(status == 'approved'){
                query.getUserByType('warden')
                .then((warden) => {
                    let wid = warden[0].id;
                    q = `UPDATE guestrequest SET req_status = 'AHNAPNAW', from_id ='${user.id}', from_name = '${user.name}', to_id = '${wid}' WHERE req_id = '${req_id}'`;
                    connection.query(q, (err, result) => {
                        if(err){
                            throw err;
                        }
                        else{
                            res.send(result);
                        }
                    });
                })
                .catch((err) =>{throw err;});
            }
            else if(status == 'rejected'){
                q = `UPDATE guestrequest SET req_status = 'AHNAPNAW' WHERE req_id = '${req_id}'`;
                connection.query(q, (err, result) => {
                    if(err){
                        throw err;
                    }
                    else{
                        res.send(result);
                    }
                });
            }
            else{
                throw new ExpressError(400, "Status is Not Valid");
            }
        }
        else if( user.user_type == 'wardon'){
            if(status == 'approved'){
                q = `UPDATE guestrequest SET req_status = 'AHAPAW' WHERE req_id = '${req_id}'`;
                connection.query(q, (err, result) => {
                    if(err){
                        throw err;
                    }
                    else{
                        console.log(result);
                    }
                });
            }
            else if(status == 'rejected'){
                q = `UPDATE guestrequest SET req_status = 'AHAPNAW' WHERE req_id = '${req_id}'`;
                connection.query(q, (err, result) => {
                    if(err){
                        throw err;
                    }
                    else{
                        console.log(result);
                    }
                });
            }
            else{
                throw new ExpressError(400, "Status is Not Valid");
            }
            
        }
        else{
            throw new ExpressError(400, "user_type is invalid");
        }

    }).catch((err) =>{ throw err; });
}));


app.all('*', (req, res) =>{
    res.send("Page Not Found");
});

app.use((err, req, res, next) =>{
    res.render("error.js");
});

app.listen(port, ()=>{
    console.log("listening to the port " +port);
});
