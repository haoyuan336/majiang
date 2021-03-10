import { EventType } from "./Common/TypeConfig";
import NetworkInstance from './NetworkInstance'
import Tool from "./util/Tool";
class GameInstance {
    public static instance: GameInstance = null;
    public uiLayerCtl: cc.Node = null;

    public gameLayerCtl: cc.Node = null;
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new GameInstance();
        }
        return this.instance;
    }

    setUILayerCtl(node: cc.Node) {
        this.uiLayerCtl = node;
    }
    setGameLayerCtl(node: cc.Node) {
        this.gameLayerCtl = node;
    }

    async playerClickStartGameButton() {
        //玩家点击了开始游戏对按钮
        this.uiLayerCtl.emit(EventType.ShowLoading.toString());


        let uid = this.getUid();
        await NetworkInstance.loginSocketServer(uid);
        this.uiLayerCtl.emit(EventType.HideLoading.toString());
    }
    onSocektMessage(msg) {
        console.log("on socket message", msg);
    }

    getUid(){
        return Tool.GetQueryString('uid');
    }
}
export default GameInstance;