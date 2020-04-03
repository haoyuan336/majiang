const MySql = require("mysql")
class DBController {
    constructor() {
        // gX&8X)c=ulS)
        let connect = MySql.createConnection({
            host: "localhost",
            user: "root",
            database: "majiang",
            password: "chu7758521"
        });
        connect.connect();
        this._connect = connect;
    }
    getPlayerInfo(id) {
        let sql = 'select * from playerinfo where id=' + id + ';';
        return new Promise((resole, reject) => {
            this.query(sql, (err, data)=>{
                if (err){
                    resole(err)
                }else{
                    if (data.length === 0){
                        reject("无次用户");
                    }else{
                        resole(data[0]);
                    }
                }
            });
        });
    }
    query(sql, cb) {
        this._connect.query(sql, (err, data) => {
            if (cb) {
                cb(err, data);
            }
        });
    }
}
module.exports = DBController;