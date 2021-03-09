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
        let id = data.data;
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            console.log("id", id);
            console.log("player id = ", player.getId());
            if (player.getId() == id) {
                console.log("找到了玩家");
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