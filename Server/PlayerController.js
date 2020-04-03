const Player = require("./Player");
class PlayerController {
    constructor(db, roomController) {
        this._db = db;
        this._playerList = [];
        this._roomController = roomController;
    }
    getRoomController() {
        return this._roomController;
    }
    playerLogin(data, client) {
        console.log("player login", JSON.stringify(data));
        let id = data.id;
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            if (player.getId() === id) {
                player.reLogin(data, client);
                return;
            }
        }
        let player = new Player(this._db, this);
        player.login(data, client).then(() => {
            this._playerList.push(player);
        })

    }
}
module.exports = PlayerController;