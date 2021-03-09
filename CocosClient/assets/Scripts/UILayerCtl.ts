import { EventType } from "./Common/TypeConfig";
import GameInstance from "./GameInstance";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    @property(cc.Node)
    public loadingLayerNode: cc.Node = null;

    onLoad() {
        this.node.on(EventType.ShowLoading.toString(), this.showLoading.bind(this));
        this.node.on(EventType.HideLoading.toString(), this.hideloading.bind(this));
    }

    showLoading() {
        this.loadingLayerNode.active = true;
    }
    hideloading() {
        this.loadingLayerNode.active = false;
    }
    start() {
        GameInstance.getInstance().setUILayerCtl(this.node);
    }

    onButtonClick(event, customData) {
        if (customData === 'start-game') {
            console.log("开始游戏");
            GameInstance.getInstance().playerClickStartGameButton();
        }
    }
}
