import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {

    },
    onLoad() {
        this._roundCountType = 'round-count-type-1';
        this._ruleType = "rule-type-1";
        this._rateType = "rate-type-1";
    },
    onButtonClick(event, customData) {
        console.log("click ", customData);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            case 'create-room':
                let data = {
                    'round-type': this._roundCountType,
                    'rule-type': this._ruleType,
                    'rate-type': this._rateType
                }
                console.log("data", data);
                global.controller.showWaitAlert(true);
                global.socketController.sendCreateRoomMessage(data).then((spec) => {
                    global.controller.showWaitAlert(false);
                    let state = spec.state;
                    let roomId = spec.roomId;
                    console.log("创建房间", spec);
                    return global.socketController.sendJoinRoomMessage(roomId);

                }).then((data) => {
                    console.log("进入房间成功", data);
                    global.controller.enterGameLayer();
                });
                break;
            default:
                break;
        }
        if (customData.indexOf('round-count-type') > -1) {
            this._roundCountType = customData;
        }
        if (customData.indexOf("rule-type") > -1) {
            this._ruleType = customData;
        }
        if (customData.indexOf("rate-type") > -1) {
            this._rateType = customData;
        }
    }
});
