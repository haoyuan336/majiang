import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {

    },
    onLoad() {

    },
    start() {
        global.socketController.connectToServer();
    },
    update(dt) { }
});
