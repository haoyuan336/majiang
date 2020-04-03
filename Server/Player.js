class Player {
    constructor(db, controller) {
        this._id = "000000";
        this._nickName = "";
        this._houseCardCount = 0;
        this._db = db;
        this._controller = controller;
    }
    getId() {
        return this._id;
    }
    login(data, client) {
        console.log("login data", JSON.stringify(data));
        let id = data.data;
        let callBackId = data.callBackId;
        this._client = client;
        return this._db.getPlayerInfo(id).then((data) => {
            this._id = id;
            this._nickName = data.nickname;
            this._houseCardCount = data.housecardcount;
            this._headImageUrl = data.headimageurl;
            this.sendMessage("login-success", {
                id: this._id,
                nickName: this._nickName,
                houseCardCount: this._houseCardCount,
                headImageUrl: this._headImageUrl
            }, callBackId);
            this.registerEvent(client);
        }).catch((err) => {
            console.log("登录失败", err);
            this.sendMessage('login-fail', { err: err }, callBackId);
        });
    }
    reLogin(data, client) {
        let callBackId = data.callBackId;
        this.registerEvent(client);
    }
    registerEvent(client) {
        client.on("close", () => {

        });
        client.on("text", (data) => {
            this.processMessage(JSON.parse(data));
        });
    }
    processMessage(spec) {
        let type = spec.type;
        let data = spec.data;
        let callBackId = spec.callBackId;
        console.log("type", type);
        switch (type) {
            case 'create-room':
                this._controller.getRoomController().createRoom(this, data, (cbData) => {
                    if (cbData.err) {
                        this.sendMessage("create-fail", { err: cbData.err }, callBackId);
                    } else {
                        this.sendMessage("create-success", {
                            state: "success",
                            roomId: cbData.getId()
                        }, callBackId);
                    }
                });
                break;
            case 'join-room':
                let roomId = data.roomId;
                this._controller.getRoomController().playerJoinRoom(this, roomId, (cbdata) => {
                    if (cbdata.err) {
                        this.sendMessage("join-fail", { err: cbdata.err }, callBackId);
                    } else {
                        this._room = cbdata;
                        this.sendMessage("join-success", { state: 'success' }, callBackId);
                    }
                });
                break;
            default:
                break;
        }
    }
    getHouseCardCount() {
        return this._houseCardCount;
    }
    sendMessage(type, data, callBackId) {
        let str = JSON.stringify({
            type: type,
            data: data,
            callBackId: callBackId
        });
        console.log("send message", str);
        this._client.send(str);
    }
}
module.exports = Player;