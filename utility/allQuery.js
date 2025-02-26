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

    async getUserById(id){   
        return new Promise((resolve, reject) => {
            connection.query(`SELECT id, name, email, userType, department FROM user WHERE id = '${id}'`, (err, result) => {
                if(err) {
                    reject(err);
                }else{
                    resolve(result[0]);
                }
            });
        });
    }

    async getUserByType(userType){
        return new Promise((resolve, reject) => {
            connection.query(`SELECT id, name, email, userType, department FROM user WHERE userType = '${userType}'`, (err, result) => {
                if(err) {
                    reject(err);
                }else if(result.length > 0){
                    resolve(result);
                }else{
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
                }else{
                   this.getUserById(id)
                   .then((user) => resolve(user))
                   .catch((err) => reject(err));
                }
            });
        });
    }
   
    async userLogin(email, password)
    {   
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM user WHERE email = ? AND password = ?`, [email, password], (err, result) => {
                if(err) {
                    reject(err);
                }else if(result.length > 0 ){
                    let user = result[0];
                    resolve(user);
                }else{
                    resolve('');
                }
            });
        });
    }

    async insertRequest(creator_id, hod_id, numberOfGuests, reasonOfArrival, guest_name, guestInfo, vegNonveg, foodTime, arrivalDate, arrivalTime, leavingDate){  
        let createdDate = this.getDate();
        let req_id = this.getRandomId();
        let qRequestTable = `INSERT INTO guestrequest(id, creator_id, hod_id, numberOfGuests, reasonOfArrival, createdDate, statusMessage ) VALUES (?)`;
        let values = [req_id, creator_id, hod_id, numberOfGuests, reasonOfArrival, createdDate, 'Request Created'];
        return new Promise((resolve, reject) =>{
            connection.query(qRequestTable, [values], async (err, result) =>{
                if(err){
                    console.log("error in insertRequest query");
                    return reject(err);
                }else{
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
                    if(foodTime[i] === 'breakfast')food_time = 'B';
                    if(foodTime[i] === 'lunch')food_time = 'L';
                    if(foodTime[i] === 'dinner')food_time = 'D';
                }else{
                    for(let food of foodTime[i]){
                        if(food == 'breakfast')food_time += 'B';
                        if(food == 'lunch')food_time += 'L';
                        if(food == 'dinner')food_time +='D';
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
                
                connection.query(q, [values], async (err, res) =>{
                    if(err){
                        console.log("error in the addGuest query");
                        return reject(err);
                    }
                    else{
                        await this.addGuest(i + 1, noOfGuests, req_id, guest_name, guestInfo, vegNonveg, foodTime, arrivalDate, arrivalTime, leavingDate)
                        .then((result) => resolve(result))
                        .catch((err) => reject(err));
                    }
                });
            }
            catch(err){
                console.log("error in the addGuest query");
                reject(err);
            }
        });
    }

    async getGuestRequestsByToId(toId, userType){  
        return new Promise((resolve, reject) =>{
            if(userType == "coordinator"){
                userType = "creator";
            }
            let qGuestRequest = `SELECT r.createdDate, r.id, r.requestStatus, r.statusMessage, u.name, u.userType, u.department FROM guestrequest r JOIN user u ON r.creator_id = u.id WHERE r.${userType}_id='${toId}'`;
            connection. query(qGuestRequest, (error, result) =>{
                if(error){
                    console.log("error in getGuestRequestByToId");
                    return reject(error);
                }else{
                    return resolve(result);
                }
            });
        });
    }

    async reqCount(toid, userType){
        return new Promise((resolve, reject) => {
            let qReqCount = "";
            if(userType == "hod"){
                qReqCount = `SELECT COUNT(*) AS count FROM guestrequest WHERE requestStatus = "NHNPNW" AND hod_id = "${toid}";`;
            }else if(userType == "principal"){
                qReqCount = `SELECT COUNT(*) AS count FROM guestrequest WHERE requestStatus = "AHNPNW" AND principal_id = "${toid}";`;
            }else if(userType == "warden"){
                qReqCount = `SELECT COUNT(*) AS count from guestrequest WHERE requestStatus = "AHAPNW" AND warden_id = "${toid}";`
            }else if(userType == "coordinator"){
                return resolve(0);
            }
            if(qReqCount){
                connection.query(qReqCount, (err, result) => {
                    if(err){
                        console.log("error in reqCount query");
                        reject(err);
                    }else{
                        resolve(result[0].count);
                    }
                });
            }
        });
    }
    
    async getGuestRequestsById(id){   
        return new Promise((resolve, reject) =>{
            let qGuestRequest = `SELECT r.*, u.id AS fromId, u.name AS fromName, u.userType, u.department FROM guestrequest r JOIN user u ON r.creator_id = u.id WHERE r.id='${id}'`;
            connection. query(qGuestRequest, (err, guestRequest) =>{
                if(err){
                    console.log("error in getGuestRequestById query");
                    return reject(err);
                }
                else{
                    let qGuest = `SELECT * FROM guest WHERE guestRequest_id='${id}'`;
                    connection.query(qGuest, (err, guest)=>{
                        if(err){
                            console.log("error in guest query inside getGuestRequestById query");
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

    async deleteGuestRequestById(reqId, userId, userType){
        if(userType == "coordinator"){
            userType = "creator";
        }
        return new Promise((resolve, reject) => {
            let qGuestRequest = `UPDATE guestrequest SET ${userType}_id = NULL WHERE ${userType}_id = '${userId}' AND id = '${reqId}';`;
            connection.query(qGuestRequest, (err, result) => {
                if(err){
                    console.log("error in deleteGuestRequestById query");
                    reject(err);
                }else{
                    resolve("request Deleted");
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
                        console.log("error in deleteGuestRequestForToId query");
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

    async getGuestRequestsByCreatorId(id){   
        return new Promise((resolve, reject) =>{
            let qGuestRequest = `SELECT * FROM guestrequest WHERE creator_id='${id}'`;
            connection. query(qGuestRequest, (err, guestRequest) =>{
                if(err){
                    console.log("error in getGuestRequestByCreatorId query");
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
            connection.query(q, (err, result) =>{
                if(err){ 
                    console.log("error in rejectGuestRequest query");
                    return reject(err) 
                }
                else{
                    return resolve(result);
                }
            });
        })
        
    }

    async approveGuestRequest(req_id, userType, sts){
        return new Promise((resolve, reject) => {
            let approvalDate = this.getDate();
            let qApprove = `UPDATE guestrequest SET requestStatus = ?, ${userType}_id = ?, approvalDate = ?, WHERE id = '${req_id}'`;
                if(userType != "null"){
                    this.getUserByType(userType)
                    .then((user) =>{
                        if(user){
                            let id = user[0].id;
                            connection.query(qApprove, [sts, id, approvalDate], (err, result) => {
                                if(err){
                                    reject(err);
                                }
                                else{
                                    resolve(result);
                                }
                            });
                        }else{
                            reject('User Not Found!');
                        }
                }).catch((err) => { throw err; });
            }else{ return reject("user type not defined in approveGuestRequest");}
        });
    }

    async approveGuestRequestPrincipal(req_id, wardenId, messWardenId, pId){
        return new Promise((resolve, reject) => {
            qApprove = `UPDATE guestrequest SET warden_id = '${wardenId}', messWarden_id = '${messWardenId}' WHERE id = '${req_id}'`;
            connection.query(qApprove, (error, result) => {
                if(error){
                    console.log("error in approveGuestRequestPrincipal query");
                    reject(error);
                }else{
                    resolve("success");
                }
            });
        });
    }

    async getGuestRequestsForWarden(userId){
        return new Promise((resolve, reject) => {
            this.getGuestRequestsByToId(userId, "warden")
            .then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        });
    }
}


module.exports = new query(connection);