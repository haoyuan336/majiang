class Player{
    constructor(socket){
        console.log("创建新的player");
        socket.on('text', (str)=>{
            console.log("有客户端发来消息", str);
    
        });
        
    }
}
exports.Player = Player;