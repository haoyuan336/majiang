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
        this._roomCardCount = 0;
        this._isFocus = false;
        this._outCardList = [];
        this._currentFoucsPlayerId = undefined;
        this._allPlayerOutCardInfo = undefined;
    }
    setFocus(value) {
        this._isFocus = value;
    }
    getIsFocus() {
        return this._isFocus;
    }
    pushCard(cardList) {
        this._cardList = cardList;
        this.sendMessage("push-card", {
            cardList: this._cardList
        }, 0);
    }
    updateCardCount(count) {
        this._roomCardCount = count;
        this.sendMessage("update-card-count", { roomCardCount: count }, 0);
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
                    if (this._cardList.length !== 0) {
                        this.sendMessage("push-card", {
                            cardList: this._cardList,
                            roomCardCount: this._roomCardCount
                        }, 0);
                    }
                    if (this._currentFoucsPlayerId !== undefined) {
                        this.sendMessage('sync-focus-player-id', this._currentFoucsPlayerId, 0);
                    }
                    if (this._allPlayerOutCardInfo !== undefined){
                        this.sendMessage("sync-all-player-out-card-list", this._allPlayerOutCardInfo, 0);
                    }
                    // if (this._outCardList.length !== 0){
                    //     this.sendMessage("sync-out-cardlist", {})
                    // }
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
            case 'get-one-card':
                if (this._room) {
                    if (this._cardList.length < 14) {
                        let result = this._room.getOneCardData(this);
                        if (result.err) {
                            this.sendMessage("fail", { err: result.err }, callBackId);

                        } else {
                            this._cardList.push(result);
                            this.sendMessage("get-one-card-success", result, callBackId);
                        }
                    }

                } else {
                    this.sendMessage("fail", { err: "不在房间里面了" }, callBackId);
                }
                break;
            case 'player-out-one-card':
                let cardId = data;
                if (this._room) {
                    this._room.playerOutOneCard(this, cardId);
                    this.sendMessage('player-out-one-card', 'success', callBackId);
                }
                break;
            default:
                break;
        }
    }
    playerOutOneCardData(cardId) {
        console.log("需要一处的牌 id是", cardId);
        let target = undefined;
        for (let i = 0; i < this._cardList.length; i++) {
            let card = this._cardList[i];
            console.log("循环到的牌的id是", card._id);
            if (card._id === cardId) {
                this._cardList.splice(i, 1);
                target = card;
            }
        }
        this._outCardList.push(target);
        return target;
    }
    getLastCardCount() {
        return this._cardList.length;
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
            isBanker: this._isBanker,
            isFocus: this._isFocus
        }
    }
    sendSyncAllPlayerInfo(info) {
        this.sendMessage("sync-all-player-info", info, 0);
    }
    sendSyncFocusPlayerMessage(id) {
        this._currentFoucsPlayerId = id;
        this.sendMessage("sync-focus-player-id", id, 0);
    }
    setHouseMaster(value) {
        this._isHouseMaster = value;
    }
    getIsHouseMaster() {
        return this._isHouseMaster;
    }
    sendPlayerOutOneCardMessage(data) {
        this._allPlayerOutCardInfo = data;
        this.sendMessage("sync-all-player-out-card-list", data, 0);
    }
    getOutCardList() {
        return this._outCardList;
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