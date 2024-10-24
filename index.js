const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const { faker } = require("@faker-js/faker");

const app = express();
const port = 8080;

app.listen(port, ()=>{
    console.log("listening to the port " +port);
});

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


//generating random id's
let getRandomUser = () => {
    return [
    faker.string.uuid(),
    ];
  }


// connection to the database
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'mite',
    password: 'Ad2142004',
});


//register web page
let user = "hod";
app.get("/register", (req, res) =>{
    res.render("register.ejs", {user});
});


//register post request
app.post("/register", (req, res) => {

    let {user} = req.query;
    let id = getRandomUser();
    id = id[0];
    let data = [];
    let a ={};
    let q = "";
    if( user == "hod"){
        q = `INSERT INTO hod (id, name, email, password, department ) VALUES(?)`;
        a = {username, department, email, password, confirmPassword} = req.body;
        data = [id, a.username, a.email, a.password, a.department];
    }

    if( user == "principal" ){
        q = `INSERT INTO principal (id, name, email, password, college ) VALUES(?)`;
        a = {username, college, email, password, confirmPassword} = req.body;
        data = [id, a.username, a.email, a.password, a.college];
    }

    if(a.password == a.confirmPassword){

    try{
        connection.query(q, [data], (err, result) =>{
            if(err) throw err;
        
            res.send("added successfully");
        });
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        res.send("check your password");
    }
});


//login web page
app.get("/login", (req, res) =>{
    res.render("login.ejs");
});

//login post request
app.post("/login", (req, res) => {
    let {email, password} = req.body;
    let user = "";
    let qhod = `SELECT * FROM hod WHERE email = '${email}' AND password = '${password}'`;

    try{
        connection.query(qhod, (err, result) => {
            if(err) throw err;
            user = "hod";
            res.send(user);
        });
    }
    catch(err){
        console.log("not hod");
    }

    let qprincipal = `SELECT * FROM principal WHERE email = '${email}' AND password = '${password}'`;

    try{
        connection.query(qprincipal, (err, result) => {
            if(err) throw err;
            
            user = "principal";
            res.send(user);
        });
    }
    catch(err){
        console.log("not principal")
    }
    

});

