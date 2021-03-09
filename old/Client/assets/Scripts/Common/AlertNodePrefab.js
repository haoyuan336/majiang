cc.Class({
    extends: cc.Component,
    properties: {
        textLabelNode: cc.Node
    },
    onLoad() {
        this.node.on("set-text", (text) => {
            this.textLabelNode.getComponent(cc.Label).string = text;
            this.schedule(() => {
                this.node.destroy();
            }, 1);
        });
    }
});
