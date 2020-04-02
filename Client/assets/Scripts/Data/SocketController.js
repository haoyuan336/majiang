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
            connent.onmessage = (text) => {
                console.log("收到服务器消息", text);
                this.processMessage(text);
            }
            connent.onerror = (err) => {
                console.log("链接错误", err);
                reject();
            }
            this._connent = connent;
        });

    }
    processMessage(data) {
        console.log("处理消息", data);
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