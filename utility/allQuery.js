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
        let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        return date;
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

    async userRegister(name, email, userType, department, password){
        let id = this.getRandomId();
        let q = `INSERT INTO user VALUES ( '${id}', '${name}', '${email}', '${userType}', '${department}', '${password}')`;
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
        let qRequestTable = `INSERT INTO guestrequest(id, creator_id, hod_id, numberOfGuests, reasonOfArrival, createdDate ) VALUES (?)`;
        let values = [req_id, creator_id, hod_id, numberOfGuests, reasonOfArrival, createdDate];
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
            let userCharacter = userType.toUpperCase()[0];
            if(userType == "coordinator") {
                userType = "creator";
            }
            let qGuestRequest = `SELECT r.createdDate, r.id, r.requestStatus, u.name, u.userType, u.department FROM guestrequest r JOIN user u ON r.${userType}_id = u.id WHERE r.${userType}_id='${toId}' AND r.visibility LIKE '%${userCharacter}%' ORDER BY r.createdDate DESC`;
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
                qReqCount = `SELECT COUNT(*) AS count FROM guestrequest WHERE requestStatus = "NHNPNWNM" AND hod_id = "${toid}";`;
            }else if(userType == "principal"){
                qReqCount = `SELECT COUNT(*) AS count FROM guestrequest WHERE requestStatus = "AHNPNWNM" AND principal_id = "${toid}";`;
            }else if(userType == "warden"){
                qReqCount = `SELECT COUNT(*) AS count from guestrequest WHERE requestStatus = "AHAPNWNM" AND warden_id = "${toid}";`
            }else if(userType == "coordinator"){
                return resolve(0);
            }else if(userType == "messManager"){
                qReqCount = `SELECT COUNT(*) AS count from guestrequest WHERE requestStatus = "AHAPAWNM" AND messManager_id = "${toid}";`
            }else{
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
            let qGuestRequest = `SELECT r.*, u.id AS fromId, u.name AS fromName, u.userType, u.department FROM guestrequest r JOIN user u ON r.creator_id = u.id WHERE r.id='${id}' ORDER BY r.createdDate DESC`;
            connection. query(qGuestRequest, (err, guestRequest) =>{
                if(err){
                    console.log("error in getGuestRequestById query");
                    return reject(err);
                }
                else{
                    let qGuest = `SELECT * FROM guest WHERE guestRequest_id='${id}'`;
                    connection.query(qGuest, async (err, guest)=>{
                        if(err){
                            console.log("error in guest query inside getGuestRequestById query");
                            return reject(err);
                        }
                        else{
                            for(let gst of guest) {
                                let qHostel = `SELECT * FROM hostel WHERE guest_id='${gst.id}'`;
                                let hostel = await new Promise((resolve, rejected) => {
                                    connection.query(qHostel, (err, hostel) => {
                                        if(err) {
                                            console.log("error in guest query inside getGuestRequestById query");
                                            return reject(err);
                                        } else {
                                            resolve(hostel[0]);
                                        }
                                    });
                                });
                                gst.hostel = hostel;
                            }
                            return resolve({guestRequest, guest});    
                        }
                    });
                }
            });
        });
    }

    //delete if everything working fine
    async getGuestRequestsByCreatorId(id){   
        return new Promise((resolve, reject) =>{
            let qGuestRequest = `SELECT * FROM guestrequest WHERE creator_id='${id}' ORDER BY createdDate DESC`;
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

    async deleteGuestRequestForId(reqId, userType){
        let userCharacter = userType.toUpperCase()[0];
        console.log(userCharacter);
        return new Promise((resolve, reject) => {
            let qGuestRequest = `UPDATE guestrequest SET visibility = REPLACE(visibility, '${userCharacter}', '') WHERE id = '${reqId}';`;
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

    async rejectGuestRequest(req_id, rejectedBy_id, sts, reasonForRejection){
        let rejectedDate = this.getDate();
        return new Promise((resolve, reject) => {
            let q = `UPDATE guestrequest SET requestStatus='${sts}', rejectedBy_id = '${rejectedBy_id}', rejectedDate = '${rejectedDate}', statusMessage='${reasonForRejection}' WHERE id='${req_id}'`;
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

    async approveGuestRequestHod(req_id){
        return new Promise((resolve, reject) => {
            let hodApprovalDate = this.getDate();
                this.getUserByType('principal')
                .then((user) =>{
                    if(user){
                        let qApprove = `UPDATE guestrequest SET requestStatus = ?, principal_id = ?, hodApprovalDate = ? WHERE id = '${req_id}'`;
                        let id = user[0].id;
                        connection.query(qApprove, ['AHNPNWNM', id, hodApprovalDate], (err, result) => {
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
        });
    }

    async approveGuestRequestWarden(req_id, warden_id, roomData){
        return new Promise((resolve, reject) => {
            let approvalDate = this.getDate();
            let wardenApprovalQry = `UPDATE guestrequest SET requestStatus = ?, warden_id = ?, wardenApprovalDate = ? WHERE id = '${req_id}'`;
            let values = ['AHAPAWNM', warden_id, approvalDate];
            connection.query(wardenApprovalQry, values, (err, result) => {
                if(err){
                    return reject(err);
                }
                else{
                    for(let key in roomData){
                        let hostelAllocateQry = `INSERT INTO hostel(id, guest_id, allocatedDate, allocatedBy, roomNo, block) VALUES(?)`;
                        let values = [this.getRandomId(), key, this.getDate(), warden_id, roomData[key].roomNo, roomData[key].block];
                        connection.query(hostelAllocateQry, [values], (err, result) => {
                            if(err){
                                return reject(err);
                            }
                        });
                    }
                    return resolve("success");
                }
            });
        });
    }

    async approveGuestRequestPrincipal(req_id, wardenId, messManagerId, pId){
        return new Promise((resolve, reject) => {
            let principalApprovalDate = this.getDate();
            let qApprove = `UPDATE guestrequest SET warden_id = '${wardenId}', messManager_id = '${messManagerId}', requestStatus = 'AHAPNWNM', principalApprovalDate = '${principalApprovalDate}' WHERE id = '${req_id}'`;
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

    async approveGuestRequestMessManager(req_id){
        return new Promise((resolve, reject) => {
            let messManagerApprovalDate = this.getDate();
            let qApprove = `UPDATE guestrequest SET requestStatus = ?, messManagerApprovalDate = ? WHERE id = '${req_id}'`;
            connection.query(qApprove, ['AHAPAWAM', messManagerApprovalDate], (err, result) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(result);
                }
            });
        })
    }
}

module.exports = new query(connection);