import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        healthGameTips: cc.Node,
        playerNodePrefab: cc.Prefab,
        createRoomPrefab: cc.Prefab
    },
    onLoad() {
        let screenView = cc.view.getVisibleSize();
        let node = cc.instantiate(this.playerNodePrefab);
        node.parent = this.node;
        node.x = screenView.width * - 0.5 + 100;
        node.y = screenView.height * 0.5 - 100;
        this._playerNode = node;
    },
    start() {
        this.healthGameTips.x = 1000;
        this.healthGameTips.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveTo(15, -1000, 0),
                    cc.callFunc(() => {
                        this.healthGameTips.x = 1000;
                    })
                )
            )
        )
        global.controller.showWaitAlert(true);
        global.socketController.connectToServer().then(() => {
            console.log("链接成功");
            return global.socketController.login(global.controller.getId()).then((data) => {
                // console.log("登录", data);
                if (data.err) {
                    global.controller.showAlert(data.err)
                } else {
                    console.log("登录成功", data);
                    this._playerNode.emit("update-info", data);
                }

            });
        }).then(() => {
            global.controller.showWaitAlert(false);

        });
    },
    onButtonClick(event, customData) {
        console.log("click ", customData);
        switch (customData) {
            case 'create-room':
                this._createRoomNode = cc.instantiate(this.createRoomPrefab);
                this._createRoomNode.parent = this.node;
                break;
        }
    }
});
