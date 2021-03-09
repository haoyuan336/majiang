console.log("start server");
const websocket = require("nodejs-websocket");
const { Player } = require("./player");
const playerCtl = require("./playerCtl");
websocket.createServer((socket)=>{
    console.log("有客户端链接");

    playerCtl.socketContent(socket);
    
    
    

}).listen(3000);