
cc.Class({
    extends: cc.Component,

    properties: {
        idLabelNode: cc.Node,
        nickNameLabelNode: cc.Node,
        houseCardCountLabelNode: cc.Node,
        headImgaeNode: cc.Node
    },

    onLoad() {
        this.node.on("update-info", (info) => {
            this.idLabelNode.getComponent(cc.Label).string = info.id;
            this.nickNameLabelNode.getComponent(cc.Label).string = info.nickName;
            this.houseCardCountLabelNode.getComponent(cc.Label).string = info.houseCardCount;
            cc.loader.load(info.headImageUrl, (err, result) => {
                this.headImgaeNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(result);

            });
        });
    },

});
