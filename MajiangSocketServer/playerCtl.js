class PlayerCtl {
    constructor(){

    }
    socketContent(socket){
        console.log("有新的客户端链接了");

        socket.on('text', (str)=>{
            console.log("有客户端发来消息", str);
            let msg = JSON.parse(str);
            let event = msg['event'];
            
    
        });
        socket.on("error", (err)=>{
            console.log("on error", err);
        });
        socket.on("discontent", ()=>{
            console.log("discontent")
        })
    }
}
exports.playerCtl = new PlayerCtl();