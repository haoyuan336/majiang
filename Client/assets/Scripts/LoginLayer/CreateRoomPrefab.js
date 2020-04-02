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
                global.socketController.sendCreateRoomMessage(data);
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
        if (customData.indexOf("rate-type-1") > -1) {
            this._rateType = customData;
        }
    }
});
