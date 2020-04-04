import global from "./global";

cc.Class({
    extends: cc.Component,

    properties: {
        loginLayerPrefab: cc.Prefab,
        waitAlertPrefab: cc.Prefab,
        alertNodePrefab: cc.Prefab,
        gameLayerPrefab: cc.Prefab
    },
    onLoad() {
        this._currentLayerNode = undefined;
        this.node.on("enter-login-layer", () => {
            this.enterNewLayer(this.loginLayerPrefab);

        });
        this.node.on("show-wait-alert", (value) => {
            if (value) {
                this._waitAlertNode = cc.instantiate(this.waitAlertPrefab);
                this._waitAlertNode.parent = this.node;

            } else {
                if (this._waitAlertNode && cc.isValid(this._waitAlertNode)) {
                    this._waitAlertNode.destroy();
                }
            }
        });
        this.node.on("show-alert", (text) => {
            let node = cc.instantiate(this.alertNodePrefab);
            node.parent = this.node;
            node.emit("set-text", text);
        });
        this.node.on("enter-game-layer", () => {
            this.enterNewLayer(this.gameLayerPrefab);
        });
    },
    enterNewLayer(prefab) {
        console.log("enter new layer");
        let node = cc.instantiate(prefab);
        node.parent = this.node;
        if (cc.isValid(this._currentLayerNode)) {
            let view = cc.view.getVisibleSize();
            node.x = view.width;
            node.runAction(cc.sequence(cc.moveTo(0.4, 0, 0), cc.callFunc(() => {
                this._currentLayerNode.destroy();
                this._currentLayerNode = node;

            })));
        } else {
            this._currentLayerNode = node;
        }
    },

    start() {
        global.controller.setMainNode(this.node);
    },

    // update (dt) {},
});
