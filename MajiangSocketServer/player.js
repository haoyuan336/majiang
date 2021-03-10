class Player {
    uid = 0;
    constructor(socket, uid) {
        this.uid = uid;
        console.log("创建新的player");
        socket.on('text', (str) => {
            console.log("player receive msg", str);

        });

    }
}
module.exports = Player