const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const ejsMate = require("ejs-mate");
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
app.engine("ejs", ejsMate);


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

app.get("/register", (req, res) =>{
    let { user_type } = req.query;
    res.render("register.ejs", {user_type});
});


//register post request
app.post("/register", (req, res) => {
    let {user_type} = req.query;
    let id = getRandomUser();
    id = id[0];
    let a ={name, department, password, confirmPassword} = req.body;
    let data = [id, a.name, user_type, a.department, a.password];
    let q = `INSERT INTO user (id, name, user_type, department, password ) VALUES(?)`;
    if(a.password == a.confirmPassword){
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
            res.render("home.ejs", {user});
        }
        else{
            res.send("user not found");
        }
    });  
});


// get home
app.get("/home/:id", (req, res) =>{
    let {id} = req.params;
    q = `SELECT * FROM user WHERE id = '${id}'`;
    connection.query(q, (err, result) =>{
        if(err)
        {
            console.log(err);
        }
        else{
            let user = result[0];
            res.render("home.ejs", {user});
        }
    });
});