import global from "./global";

cc.Class({
    extends: cc.Component,

    properties: {
        loginLayerPrefab: cc.Prefab,
        waitAlertPrefab: cc.Prefab
    },
    onLoad () {
        this._currentLayerNode = undefined;
        this.node.on("enter-login-layer", ()=>{
            this.enterNewLayer(this.loginLayerPrefab);

        });
        this.node.on("show-wait-alert", (value)=>{
            if (value){
                this._waitAlertNode = cc.instantiate(this.waitAlertPrefab);
                this._waitAlertNode.parent = this.node;

            }else{
                if (this._waitAlertNode && cc.isValid(this._waitAlertNode)){
                    this._waitAlertNode.destroy();
                }
            }
        });
    },
    enterNewLayer(prefab){
        let node = cc.instantiate(prefab);
        node.parent = this.node;

        if (this._currentLayerNode || cc.isValid(this._currentLayerNode)){
            this._currentLayerNode.destroy();
            this._currentLayerNode = this.node;
        }else{
            this._currentLayerNode = this.node;
        }
    },

    start () {
        global.controller.setMainNode(this.node);
    },

    // update (dt) {},
});
