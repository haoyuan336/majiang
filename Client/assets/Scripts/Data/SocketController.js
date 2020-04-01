class SocketController{
    constructor(){

    }
    connectToServer(){
        let connent = new WebSocket("ws://127.0.0.1:3001");
        console.log("链接服务器");
    }
}
export default SocketController;