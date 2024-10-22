const express = require("express");
const mysql = require("mysql2");
const app = express();

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'mite',
    password: 'Ad2142004',
});


app.post("/register/hod", (req, res) => {

    let q = 'INSERT INTO hod (id, username, email, password, department ) VALUES(?)';
    let id = 1;
    let {username, department, email, password, confirmPassword} = req.body;
    let user = [id, username, email, password, department];

    if(password == confirmPassword){

    try{
        connection.query(q, [user], (err, result) =>{
            if(err) throw err;
        
            console.log(result);
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


