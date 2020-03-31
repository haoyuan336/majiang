import Controller from "./Data/Controller";
import SocketController from "./Data/SocketController";

const global = {
    controller: new Controller(),
    socketController: new SocketController()
}
export default global;