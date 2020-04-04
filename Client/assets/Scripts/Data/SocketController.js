class SocketController {
    constructor() {
        this._callBackMap = {};
        this._callBackId = 1;
    }
    connectToServer() {

        return new Promise((resole, reject) => {
            let connent = new WebSocket("ws://127.0.0.1:3001");
            console.log("链接服务器");
            connent.onopen = () => {
                console.log("链接成功");
                resole();
            }
            connent.onmessage = (message) => {
                this.processMessage(JSON.parse(message.data));
            }
            connent.onerror = (err) => {
                console.log("链接错误", err);
                reject();
            }
            this._connent = connent;
        });

    }
    onSyncAllPlayerInfo(data) {
        console.warn("on sync all player info", data);
    }
    onSyncState(state) {
        console.warn("on sync state", state);
    }
    processMessage(spec) {
        console.log("处理消息", spec);
        let type = spec.type;
        let data = spec.data;
        let callBackId = spec.callBackId;
        console.log("call back id", callBackId);
        console.log("call map", this._callBackMap);
        if (this._callBackMap[callBackId]) {
            console.log("存在回调");
            let cb = this._callBackMap[callBackId];
            if (cb) {
                cb(data);
            }
            delete this._callBackMap[callBackId];
        }
        switch (type) {
            case 'sync-all-player-info':
                this.onSyncAllPlayerInfo(data);
                break;
            case 'sync-state':
                this.onSyncState(data);
                break;
            default:
                break
        }
    }
    login(id) {
        return new Promise((resole, reject) => {
            this.sendMessage(
                'login',
                id,
                resole
            )
        })
    }
    sendCreateRoomMessage(data) {
        return new Promise((resole, reject) => {
            this.sendMessage("create-room", data, resole);
        });
    }
    sendJoinRoomMessage(roomId) {
        return new Promise((resole) => {
            this.sendMessage("join-room", { roomId: roomId }, resole);
        });
    }
    sendEnterRoomLayer() {
        return new Promise((resole) => {
            this.sendMessage("enter-room-layer-success", "", resole);
        });
    }
    sendStartGameMessage() {
        return new Promise((resole, reject) => {
            this.sendMessage("start-game", "", resole);
        })
    }
    sendExitRoomtMessage() {
        return new Promise((resole, reject) => {
            this.sendMessage("exit-room", "", resole);
        });
    }
    sendMessage(type, data, callBack) {
        this._connent.send(JSON.stringify({
            type: type,
            data: data,
            callBackId: this._callBackId
        }));
        this._callBackMap[this._callBackId] = callBack;
        this._callBackId++;
    }
}
export default SocketController;