class Controller {
    constructor() {
        this._mainNode = undefined;
        this._id = this.getQueryVariable('id')||"000000";
        this._currentFocusPlayerId = undefined;
    }
    getId(){
        return this._id;
    }
    setMainNode(node) {
        this._mainNode = node;
        this._mainNode.emit("enter-login-layer");

    }
    showWaitAlert(value){
        this._mainNode.emit("show-wait-alert", value);
    }
    showAlert(text){
        this._mainNode.emit("show-alert", text);
    }
    enterGameLayer(){
        this._mainNode.emit("enter-game-layer");
    }
    enterLoginLayer(){
        this._mainNode.emit("enter-login-layer");
    }
    getQueryVariable(type) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair[0] === type) {
                return pair[1];
            }
        }
        return false;
    }
    setCurrentFocusPlayerId(id){
        this._currentFocusPlayerId = id;
    }
    getCurrentFocusPlayerId(){
        return this._currentFocusPlayerId;
    }
}
export default Controller;