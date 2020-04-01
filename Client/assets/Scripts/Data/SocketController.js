class SocketController{
    constructor(){

    }
    connectToServer(){
        let connent = new WebSocket("ws://127.0.0.1:3001");
        console.log("链接服务器");
        connent.onopen = ()=>{
            console.log("链接成功");
        }
        connent.onmessage = (text)=>{
            console.log("收到服务器消息", text);
        }
        connent.onerror = (err)=>{
            console.log("链接错误", err);
        }
    }
}
export default SocketController;