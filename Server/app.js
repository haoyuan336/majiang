const WebSocket = require("nodejs-websocket");
class App{
    constructor(){
        console.log("启动");
        // let wb = new
        let server = WebSocket.createServer((connect)=>{
            console.log("有客户端链接了");
            connect.on("text", (spec)=>{
                console.log("收到消息", JSON.stringify(spec));
            });
            connect.on("close", ()=>{

            });
            connect.on("error", ()=>{

            });
        }).listen(3001);
    }
}
let app = new App();