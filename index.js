const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const { faker } = require("@faker-js/faker");

const app = express();
const port = 8080;

app.listen(port, ()=>{
    console.log("listening to the port " +port);
});

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


app.get("/", (req, res) =>{
    res.render("register.ejs");

});

app.use(express.urlencoded({extended: true}));

//register 
app.post("/register", (req, res) => {
    let {user} = req.query;
    let q = `INSERT INTO ${user} (id, name, email, password, department ) VALUES(?)`;
    let id = getRandomUser();
    id = id[0];
    console.log(id);
    let {username, department, email, password, confirmPassword} = req.body;

    let data = [id, username, email, password, department];

    if(password == confirmPassword){

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


