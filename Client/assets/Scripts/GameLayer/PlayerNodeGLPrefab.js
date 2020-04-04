cc.Class({
    extends: cc.Component,

    properties: {
        headImageNode: cc.Node,
        nickNameLabel: cc.Node,
        GameConfig: cc.JsonAsset,
        houseMasterIcon: cc.Node
    },
    onLoad() {
        this._playerSeatConfig = this.GameConfig.json['player-seat-config'];
        this.node.on("update-info", (data, index, listIndex) => {
            console.log("update player node info", data);
            let nickName = data.nickName;
            this.nickNameLabel.getComponent(cc.Label).string = nickName;
            let headImageUrl = data.headImageUrl;
            this.updateHeadImage(headImageUrl);
            // this.node.x = this._playerSeatConfig[index].x;
            // this.node.y = this._playerSeatConfig[index].y;
            let convertSeatIndex = index - listIndex;
            if (convertSeatIndex < 0) {
                convertSeatIndex = convertSeatIndex + 4;
            }
            this.node.x = this._playerSeatConfig[convertSeatIndex].x;
            this.node.y = this._playerSeatConfig[convertSeatIndex].y;
            this.houseMasterIcon.active = data.isHouseMaster;

        });
    },
    updateHeadImage(headImageUrl) {
        cc.loader.load(headImageUrl, (err, result) => {
            this.headImageNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(result);
        });
    },
    start() {

    }

});
