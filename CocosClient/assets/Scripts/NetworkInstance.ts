import { MsgInterface } from './Common/TypeConfig'



class NetworkInstance {


    static handlers = {};
    static callbackIndex: number = 1;

    static ws: WebSocket;
    static async loginSocketServer(uid) {
        //链接上长链接服务器
        await this.connectServer();
        this.sendMessage({
            eventType: "login",
            data: {uid: uid},
            callback: () => {
                console.log("消息发送完成")
            }
        })

    }
    static connectServer() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket("ws:localhost:3000");
            this.ws.onopen = () => {
                console.log("on open");
                resolve({});
            }

            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onclose = () => {
                console.log("链接关闭");
            }
            this.ws.onerror = (err) => {
                console.log("链接错误", err);
                reject();
            }
        })

    }

    static sendMessage(msg: MsgInterface) {
        console.log("msg", msg);
        // this.ws.send(JSON.stringify(msg));
        let callBack = msg.callback;
        this.handlers[this.callbackIndex] = callBack;
        let data = {
            event: msg.eventType,
            data: msg.data,
            callbackIndex: this.callbackIndex
        }
        console.log("data", data);
        this.ws.send(JSON.stringify(data));
        this.callbackIndex++;

    }

    static onMessage(msg) {
        let data = msg['data'];
        console.log("data", data);
        data = JSON.parse(data);
        let callbackIndex = data['callbackIndex'];
        console.log('callbackindex', callbackIndex);
    }
}
export default NetworkInstance;