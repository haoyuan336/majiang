const Player = require("./Player");
class PlayerController {
    constructor(db){
        this._db = db;
        this._playerList = [];
    }
    playerLogin(data, client){
        let id = data.id;
        for (let i = 0 ; i < this._playerList.length ; i ++){
            let player = this._playerList[i];
            if (player.getId() === id){
                player.reLogin(data, client);
                return;
            }
        }
        let player = new Player(this._db);
        player.login(data, client);
        this._playerList.push(player);

    }
}
module.exports = PlayerController;