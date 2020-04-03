const MySql = require("mysql")
class DBController{
    constructor(){
        let connect = MySql.createConnection({
            host: "localhost",
            user: "root",
            database: "majiang",
            password: "chu7758521"
        });
        connect.connect();
    }
    getPlayerInfo(id){
    }
    query(sel){

    }
}
module.exports = DBController;