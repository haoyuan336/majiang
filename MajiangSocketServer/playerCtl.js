const Player = require('./player');



class PlayerCtl {
    playerList = {};
    socketContent(socket) {
        console.log("有新的客户端链接了");


        socket.on('text', (str) => {
            console.log("有客户端发来消息", str);
            let msg = JSON.parse(str);
            let event = msg['event'];
            let data = msg['data'];
            if (event === 'login') {
                let uid = data['uid'];
                console.log("user login uid", uid);
                if (this.playerList[uid]) {

                } else {
                   this.playerList[uid] = new Player(socket);
                }
            }

        });
        socket.on("error", (err) => {
            console.log("on error", err);
        });
        socket.on("discontent", () => {
            console.log("discontent")
        })
    }
}
module.exports = new PlayerCtl();