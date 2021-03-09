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
}
export default GameInstance;