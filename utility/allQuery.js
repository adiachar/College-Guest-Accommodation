const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'mite',
    password: 'Ad2142004',
});

class query{

    async getUserById(id)
    {   
        return new Promise((resolved, rejected) => {
            connection.query(`SELECT * FROM user WHERE id = '${id}'`, (err, result) => {
                if(err) 
                {
                    rejected(err);
                }
                else if(result.length > 0 )
                {
                    resolved(result[0]);
                }
            });
        });
    }

    async getUserByType(user_type){
        return new Promise((resolved, rejected) => {
            connection.query(`SELECT * FROM user WHERE user_type = '${user_type}'`, (err, result) => {
                if(err) 
                {
                    rejected(err);
                }
                else if(result.length > 0 )
                {
                    resolved(result);
                }
            });
        });
    }

    async userLogin(name, password)
    {   
        return new Promise((resolved, rejected) => {
            connection.query(`SELECT * FROM user WHERE name = '${name}' AND password = '${password}'`, (err, result) => {
                if(err) 
                {
                    rejected(err);
                }
                else if(result.length > 0 )
                {
                    resolved(result[0]);
                }
            });
        });
    }
}

module.exports = new query(connection);