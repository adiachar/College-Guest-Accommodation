const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const { faker } = require("@faker-js/faker");

const app = express();
const port = 8080;

app.listen(port, ()=>{
    console.log("listening to the port " +port);
});

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

let user = "hod";
app.get("/register", (req, res) =>{
    res.render("register.ejs", {user});
});


app.use(express.urlencoded({extended: true}));

//register 

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


