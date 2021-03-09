import GameInstance from "./GameInstance";

const { ccclass, property } = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    onLoad() { }

    start() {
        GameInstance.getInstance().setGameLayerCtl(this.node);
    }

}
