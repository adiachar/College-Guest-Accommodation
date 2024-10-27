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
let user = "coordinator";
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
        q = `INSERT INTO hod (id, name, password, department ) VALUES(?)`;
        a = {username, department, password, confirmPassword} = req.body;
        data = [id, a.username, a.password, a.department];
    }

    if( user == "principal" ){
        q = `INSERT INTO principal (id, name, password, college ) VALUES(?)`;
        a = {username, college, password, confirmPassword} = req.body;
        data = [id, a.username, a.password, a.college];
    }

    if( user == "coordinator"){
        q = `INSERT INTO coordinator (id, name, password, department ) VALUES(?)`;
        a = {username, department, password, confirmPassword} = req.body;
        data = [id, a.username, a.password, a.department];
    }

    if(a.password == a.confirmPassword){
        connection.query(q, [data], (err, result) =>{
            if(err){
                res.send("some error in the database");
            }
            else{
            res.send("added successfully");
            }
        });
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
    let {username, password} = req.body;
    let qhod = `SELECT * FROM hod WHERE name = '${username}' AND password = '${password}'`;
    connection.query(qhod, (err, result) =>{
        if(err){
            res.send("some error in database");
        }
        else if( result.length > 0)
        {   
            let user = result[0];
            res.render("hod.ejs", {user});
        }
        else{
            let qprincipal = `SELECT * FROM principal WHERE name = '${username}' AND password = '${password}'`;
            connection.query(qprincipal, (err, result) => {
                if(err){
                    res.send("some error in the database");
                }
                else if(result.length > 0){
                    res.send("user is principal");
                }
                else{
                    let qcoordinator = `SELECT * FROM coordinator WHERE name = '${username}' AND password = '${password}'`;
                    connection.query(qcoordinator, (err, result) => {
                        if(err){
                            res.send("some error in the database");
                        }
                        else if(result.length > 0){
                            let user = result[0];
                            res.render("coordinator.ejs", {user});
                        }
                        else{
                            res.render("login.ejs");
                        }
                    });
                }
            });
        }
    });
        
});
