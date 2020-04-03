class Player{
    constructor(db){
        this._id = "000000";
        this._nickName = "";
        this._houseCardCound = 0;
        this._db = db;
    }
    getId(){
        return this._id;
    }
    login(data, client){
        let id = data.id;
        let callBakcId =data.id;
    }
    reLogin(data,client){
        let callBakcId = data.callBakcId;
    }
    sendMessage(type, data, callBakcId){

    }
}
module.exports = Player;