class Controller {
    constructor(){
        this._mainNode = undefined;
        
    }
    setMainNode(node){
        this._mainNode = node;
        this._mainNode.emit("enter-login-layer");

    }   
}
export default Controller;