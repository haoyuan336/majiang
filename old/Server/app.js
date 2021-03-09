const WebSocket = require("nodejs-websocket");
let PC = require("./PlayerController");
let DBController = require("./DBController");
let RoomController = require("./RoomController");
let roomController = new RoomController();
let db = new DBController();
let playerController = new PC(db, roomController);
class App {
    constructor() {
        console.log("启动");
        // let wb = new
        let server = WebSocket.createServer((connect) => {
            connect.on("text", (spec) => {
                console.log("收到消息", spec);
                let data = JSON.parse(spec);
                let type = data.type;
                if (type === 'login') {
                    console.log("玩家发来了请求登录的消息");
                    playerController.playerLogin(data, connect);
                }
            });
            connect.on("close", () => {

            });
            connect.on("error", () => {

            });
        }).listen(3001);
    }
}
let app = new App();