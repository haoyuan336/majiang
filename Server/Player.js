const State = require("./State")
class Player {
    constructor(db, controller) {
        this._id = "000000";
        this._nickName = "";
        this._houseCardCount = 0;
        this._db = db;
        this._controller = controller;
        this._totalScore = 0;
        this._currentScore = 0;
        this._isHouseMaster = false;
        this._state = new State();
        this._state.setState('wait');
        this._isBanker = false;
        this._cardList = [];
    }
    pushCard(cardList){
        this._cardList = cardList;
        this.sendMessage("push-card", {cardList: this._cardList}, 0);
    }
    setIsBanker(value) {
        this._isBanker = value;
    }
    getIsBanker() {
        return this._isBanker;
    }
    getId() {
        return this._id;
    }
    login(data, client) {
        console.log("login data", JSON.stringify(data));
        let id = data.data;
        let callBackId = data.callBackId;
        this._client = client;
        this._id = id;
        return new Promise((resolve, reject) => {
            this._db.getPlayerInfo(id).then((data) => {
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
                resolve();
            }).catch((err) => {
                console.log("登录失败", err);
                this.sendMessage('login-fail', { err: err }, callBackId);
                reject();

            });
        });


    }
    reLogin(data, client) {
        let callBackId = data.callBackId;
        this._client = client;
        let roomId = 0;
        if (this._room) {
            roomId = this._room.getId();
        }
        this.sendMessage("login-success", {
            id: this._id,
            nickName: this._nickName,
            houseCardCount: this._houseCardCount,
            headImageUrl: this._headImageUrl,
            roomId: roomId
        }, callBackId);
        this.registerEvent(client);

        if (this._room) {
            //还在房间里面

        }
    }
    registerEvent(client) {
        client.on("close", () => {
            // if (this._room) {
            //     this._room.playerExit(this);
            // }
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
                console.log("room id", roomId);
                this._controller.getRoomController().playerJoinRoom(this, roomId, (cbdata) => {
                    if (cbdata.err) {
                        this.sendMessage("join-fail", { err: cbdata.err }, callBackId);
                    } else {
                        this._room = cbdata;
                        this.sendMessage("join-success", { state: 'success' }, callBackId);
                    }
                });
                break;
            case 'exit-room':
                if (this._room) {
                    let result = this._room.playerExit(this);
                    if (result === 'success') {
                        this._room = undefined;
                        this.sendMessage('exit-success', result, callBackId);
                    } else {
                        this.sendMessage('exit-fail', { err: result }, callBackId);
                    }
                } else {
                    this.sendMessage('exit-fail', { err: "未在房间里" }, callBackId);
                }
                break;
            case 'enter-room-layer-success':
                if (this._room) {
                    this._room.playerEnterGameLayer(this).then((data) => {
                        this.sendMessage("enter-success", data, callBackId)
                    }).catch((err) => {
                        this.sendMessage("enter-fail", { err: err }, callBackId);
                    });
                    if (this._cardList.length !== 0){
                        this.sendMessage("push-card", {cardList: this._cardList},0);
                    }
                }
                break;
            case 'start-game':
                //开始游戏
                if (this._room) {
                    let result = this._room.houseMasterStartGame(this);
                    if (result === true) {
                        this.sendMessage("success", "", callBackId);
                    } else {
                        this.sendMessage("fail", { err: result }, callBackId);
                    }
                }
                break;
            default:
                break;
        }
    }
    getHouseCardCount() {
        return this._houseCardCount;
    }
    roomStartGame() {
        this._state.setState("start-game");
        this.sendMessage("sync-state", this._state.getState(), 0);
    }
    getPlayerInfo() {
        return {
            id: this._id,
            nickName: this._nickName,
            headImageUrl: this._headImageUrl,
            totalScore: this._totalScore,
            currentScore: this._currentScore,
            isHouseMaster: this._isHouseMaster,
            state: this._state.getState(),
            isBanker: this._isBanker
        }
    }
    sendSyncAllPlayerInfo(info) {
        this.sendMessage("sync-all-player-info", info, 0);
    }
    setHouseMaster(value) {
        this._isHouseMaster = value;
    }
    getIsHouseMaster() {
        return this._isHouseMaster;
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