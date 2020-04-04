import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        idLabelNodeList: [cc.Node]
    },
    onLoad() {
        let children = this.node.children;
        this._inputStr = '';
        this.updateRoomIdLabel();
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.name.indexOf('join') > -1) {
                this.addTouchEvent(child);
            }
        }
    },
    updateRoomIdLabel() {

        for (let i = 0; i < this.idLabelNodeList.length; i++) {
            let node = this.idLabelNodeList[i];
            node.getComponent(cc.Label).string = "";
        }
        for (let i = 0; i < this._inputStr.length; i++) {
            let node = this.idLabelNodeList[i];
            node.getComponent(cc.Label).string = this._inputStr[i];
        }

    },
    addTouchEvent(node) {
        let button = node.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        node.on("click", () => {
            console.log("node name", node.name);
            let number = Number(node.name.substring(5, node.name.length));
            if (number === 0 || number) {
                console.log("点击的数字是", number);
                if (this._inputStr.length < 6) {
                    this._inputStr += "" + number;
                    this.updateRoomIdLabel();
                    if (this._inputStr.length === 6) {
                        this.sendJoinRoomMessage();
                    }
                }
            } else {
                let key = node.name.substring(5, node.name.length);
                console.log("点击的key", key);
                switch (key) {
                    case 'zuoxia':
                        this._inputStr = "";
                        this.updateRoomIdLabel();
                        break;
                    case 'youxia':
                        this._inputStr = this._inputStr.substring(0, this._inputStr.length - 1);
                        this.updateRoomIdLabel();
                        break;
                    default:
                        break;
                }
            }
        })
    },
    sendJoinRoomMessage() {
        global.socketController.sendJoinRoomMessage(this._inputStr).then((data) => {
            console.log("加入房间成功", data);
            if (data.err) {
                global.controller.showAlert(data.err);
                this._inputStr = "";
                this.updateRoomIdLabel();
            } else {
                global.controller.enterGameLayer();
            }
        });
    },
    onButtonClick(event, customData){
        switch(customData){
            case 'close':
                this.node.destroy();
                break;
        }
    },
    start() {

    }
});
