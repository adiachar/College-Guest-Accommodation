const mysql = require("mysql2");
const { faker } = require("@faker-js/faker");

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'mite',
    password: 'Ad2142004',
});

class query{
    getRandomId(){
        return faker.string.uuid();
    }

    getDate(){
        let date = new Date();
        let day = date.getDate();
        let month = String(date.getMonth() + 1).padStart(2, "0");
        let year = String(date.getFullYear());
        return `${year}-${month}-${day}`;
        }
    

    async getUserById(id, table = 'user')
    {   
        return new Promise((resolve, reject) => {
            table = table.toLowerCase();
            connection.query(`SELECT id, name, email, user_type, department FROM ${table} WHERE id = '${id}'`, (err, result) => {
                if(err) 
                {
                    reject(err);
                }
                else
                {
                    resolve(result[0]);
                }
            });
        });
    }

    async getUserByType(user_type){
        return new Promise((resolve, reject) => {
            connection.query(`SELECT id, name, email, user_type, department FROM user WHERE user_type = '${user_type}'`, (err, result) => {
                if(err) 
                {
                    reject(err);
                }
                else if(result.length > 0)
                {
                    resolve(result);
                }
                else{
                    resolve(false);
                }
            });
        });
    }

    async userRegister(name, email, user_type, department, password){
        let id = this.getRandomId();
        let q = `INSERT INTO user VALUES ( '${id}', '${name}', '${email}', '${user_type}', '${department}', '${password}')`;
        return new Promise((resolve, reject) =>{
            connection.query(q, (err, result) =>{
                if(err){
                    reject(err);
                }
                else
                {
                   this.getUserById(id).then((user) =>{resolve(user);}).catch((err) =>{reject(err);});
                }
            });
        });
    }
   
    async userLogin(email, password)
    {   
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM user WHERE email = '${email}' AND password = '${password}'`, (err, result) => {
                if(err) 
                {
                    reject(err);
                }
                else if(result.length > 0 )
                {
                    let user = result[0];
                    resolve(user);
                }
                else{
                    resolve('');
                }
            });
        });
    }

    async insertRequest(creator_id, to_id, numberOfGuests, reasonOfArrival, guest_name, guestInfo, vegNonveg, foodTime, arrivalDate, arrivalTime, leavingDate)
    {  
        let req_date = this.getDate();
        let req_id = this.getRandomId();
        let qRequestTable = `INSERT INTO guestrequest(id, creator_id, to_id, numberOfGuests, reasonOfArrival, requestDate, statusMessage ) VALUES (?)`;
        let values = [req_id, creator_id, to_id, numberOfGuests, reasonOfArrival, req_date, 'Request Created'];
        return new Promise((resolve, reject) =>{
            connection.query(qRequestTable, [values], async (err, result) =>{
                if(err)
                {
                    return reject(err);
                }
                else{
    
                    await this.addGuest(0, numberOfGuests, req_id, guest_name, guestInfo, vegNonveg, foodTime, arrivalDate, arrivalTime, leavingDate)
                    .then((result) => resolve(result))
                    .catch((err)=> reject(err));
                }
            });
        });
    }

    async addGuest(i, noOfGuests, req_id, guest_name, guestInfo, vegNonveg, foodTime, arrivalDate, arrivalTime, leavingDate){
        return new Promise(async (resolve, reject) =>{
            if(i>= noOfGuests){
                return resolve("User Data Entered Successfully");
            }
            let id = this.getRandomId();
            let food_time = '';
            
            try{
                if(!Array.isArray(foodTime[i])){
                    if(!Array.isArray(foodTime[i])){
                        if(foodTime[i] === 'breakfast')food_time = 'B';
                        if(foodTime[i] === 'lunch')food_time = 'L';
                        if(foodTime[i] === 'dinner')food_time = 'D';
                    }
                }
                else{
                    for(let food of foodTime[i]){
                        if(food == 'breakfast')food_time = food_time +'B';
                        if(food == 'lunch')food_time = food_time +'L';
                        if(food == 'dinner')food_time = food_time +'D';
                    }
                }
                
                let arrDate = arrivalDate;
                let arrTime = arrivalTime;
                let leavDate = leavingDate;
                if(noOfGuests > 1){
                    arrDate = arrDate[i];
                    arrTime = arrTime[i];
                    leavDate = leavDate[i];
                }
                
                let q = `INSERT INTO guest VALUES(?)`;
                let values = [id, req_id, guest_name[i], guestInfo[i], vegNonveg[i], food_time, arrDate, arrTime, leavDate];
                // console.log(q);
                connection.query(q, [values], async (err, res) =>{
                    if(err){
                        return reject(err);
                    }
                    else{
                        await this.addGuest(i + 1, noOfGuests, req_id, guest_name, guestInfo, vegNonveg, foodTime, arrivalDate, arrivalTime, leavingDate)
                        .then((result) => resolve(result))
                        .catch((err) => reject(err));
                    }
                });
            }
            catch(err){reject(err);}
        });
    }

    async getGuestRequestsByToId(toId)
    {   
        return new Promise((resolve, reject) =>{
            let qGuestRequest = `SELECT r.requestDate, r.id, r.requestStatus, r.statusMessage, u.name, u.user_type, u.department FROM guestrequest r JOIN user u ON r.creator_id = u.id WHERE r.to_id='${toId}'`;
            connection. query(qGuestRequest, (error, result) =>{
                if(error)
                {
                    return reject(error);
                }
                else{
                    return resolve(result);
                }
            });
        });
    }

    async reqCount(Toid, userType){
        return new Promise((resolve, reject) => {
            let qReqCount = "";
            if(userType == "hod"){
                qReqCount = `SELECT COUNT(*) AS count FROM guestrequest WHERE requestStatus = "NHNPNW" AND to_id = "${Toid}";`;
            }else if(userType == "principal"){
                qReqCount = `SELECT COUNT(*) AS count FROM guestrequest WHERE requestStatus = "AHNPNW" AND to_id = "${Toid}";`;
            }else if(userType == "warden"){
                qReqCount = `SELECT COUNT(*) AS count from wardenGuestRequest w JOIN guestrequest g ON w.guestRequest_id = g.id WHERE warden_id = "${Toid}" AND g.requestStatus = "AHAPNW";`
            }else if(userType == "coordinator"){
                resolve(0);
            }
            if(qReqCount){
                connection.query(qReqCount, (err, result) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve(result[0].count);
                    }
                });
            }
        });
    }
    
    async getGuestRequestsById(id)
    {   
        return new Promise((resolve, reject) =>{
            let qGuestRequest = `SELECT r.*, u.id AS fromId, u.name AS fromName, u.user_type, u.department FROM guestrequest r JOIN user u ON r.creator_id = u.id WHERE r.id='${id}'`;
            connection. query(qGuestRequest, (err, guestRequest) =>{
                if(err){
                    return reject(err);
                }
                else{
                    let qGuest = `SELECT * FROM guest WHERE guestRequest_id='${id}'`;
                    connection.query(qGuest, (err, guest)=>{
                        if(err){
                            return reject(err);
                        }
                        else{
                            return resolve({guestRequest, guest});
                        }
                    });
                }
            });
        });
    }

    async deleteGuestRequestById(id)
    {
        return new Promise((resolve, reject) => {
            let qGuest = `DELETE FROM guest WHERE guestRequest_id = '${id}';`;
            let qWarden = `DELETE FROM wardenguestrequest WHERE guestRequest_id = '${id}';`
            let qGuestRequest = `DELETE FROM guestrequest WHERE id = '${id}';`;

            connection.query(qWarden, (err, result) => {
                if(err){
                    reject(err);
                }
                else{
                    connection.query(qGuest, (err, result) => {
                        if(err){
                            reject(err);
                        }
                        else{
                            connection.query(qGuestRequest, (err, result) => {
                                if(err){
                                    reject(err);
                                }
                                else{
                                    return resolve("request Deleted");
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    async deleteGuestRequestForToId(reqId, user_type){
        return new Promise((resolve, reject) => {
            let sts = "";
            if(user_type == "hod"){
                sts = "RH";
            }else if(user_type == "principal"){
                sts = "RP";
            }else if(user_type == "warden"){
                sts = "RW";
            }
            if(typeof(sts) != null){
                let qGuestRequest = `UPDATE guestrequest SET to_id = 'null', requestStatus='${sts}', statusMessage='Request Deleted' WHERE id='${reqId}'`;
                connection. query(qGuestRequest, (err, result) =>{
                    if(err){
                        return reject(err);
                    }
                    else{
                        return resolve("Request Deleted");
                    }
                });
            }else{
                reject("user type incorrect");
            }
            
        });
    }

    async getGuestRequestsByCreatorId(id)
    {   
        return new Promise((resolve, reject) =>{
            let qGuestRequest = `SELECT * FROM guestrequest WHERE creator_id='${id}'`;
            connection. query(qGuestRequest, (err, guestRequest) =>{
                if(err){
                    return reject(err);
                }
                else{
                    return resolve(guestRequest);
                }
            });
        });
    }

    async rejectGuestRequest(req_id, sts, reasonForRejection){
        return new Promise((resolve, reject) => {
            let q = `UPDATE guestrequest SET requestStatus='${sts}', statusMessage='${reasonForRejection}' WHERE id='${req_id}'`;
            // console.log(q);
            connection.query(q, (err, result) =>{
                if(err){ return reject(err) }
                else{
                    return resolve(result);
                }
            });
        })
        
    }

    async approveGuestRequest(req_id, userType, sts){
        return new Promise((resolve, reject) => {
            let qApprove = `UPDATE guestrequest SET requestStatus = ?, to_id = ? WHERE id = '${req_id}'`;
                if(userType != "null"){
                    this.getUserByType(userType)
                    .then((user) =>{
                        if(user){
                            let id = user[0].id;
                            connection.query(qApprove, [sts, id], (err, result) => {
                                if(err){
                                reject(err);
                                }
                                else{
                                    resolve(result);
                                }
                            });
                        }
                        else{
                            reject('User Not Found!');
                        }
                }).catch((err) => { throw err; });
            }else{ return reject("user type not defined in approveGuestRequest");}
        });
    }

    async approveGuestRequestPrincipal(req_id, wardenDId, wardenFId, pId){
        return new Promise((resolve, reject) => {
            const id1 = this.getRandomId();
            const id2 = this.getRandomId();
            const requestDate = this.getDate();
            let values1 = [id1, wardenDId, req_id, 'GD', requestDate];
            let values2 = [id2, wardenFId, req_id, 'GFD', requestDate];
            let Aquery = "INSERT INTO wardenGuestRequest VALUES(?)";
            connection.query(Aquery, [values1], (err, result) => {
                if(err){
                    return reject(err);
                }else{
                    connection.query(Aquery, [values2], async (err, result) => {
                        if(err){
                            // console.log("in query err2");
                            return reject(err);
                        }else{
                            // console.log("in resolve of guest request");
                            this.approveGuestRequest(req_id, "principal", "AHAPNW");
                            return resolve(result);
                        }
                    });
                }
            });
        })
    }

    async getGuestRequestsForWarden(userId){
        return new Promise((resolve, reject) => {
            let q = `SELECT w.*, g.* FROM wardenguestrequest w JOIN guestrequest g ON w.guestRequest_id = g.id WHERE warden_id = '${userId}'`;
            connection.query(q, async (err, data) => {
                if(err){
                    throw err;
                }else{
                    return resolve(data);
                }
            });
        });
    }
}


module.exports = new query(connection);