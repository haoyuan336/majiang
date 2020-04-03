const Room = require('./Room');
class RoomController {
    constructor() {
        this._roomList = [];
    }
    createRoom(player, data, cb) {
        let config = require("./config");
        console.log("创建房间", JSON.stringify(config));
        console.log("data", JSON.stringify(data));
        let roundType = data['round-type'];
        let ruleType = data['rule-type'];
        let rateType = data['rate-type'];
        let costCount = config['round-type-house-card-cost'][roundType];
        console.log("消耗的房卡数是", costCount);
        let playerHouseCardCount = player.getHouseCardCount();
        if (playerHouseCardCount < costCount) {
            if (cb) {
                cb({ err: "房卡数不足" });
            }
        } else {
            let newRoomId = this.getNewRoomId();
            let room = new Room(newRoomId);
            this._roomList.push(room);
            if (cb) {
                cb(room);
            }
        }
    }
    playerJoinRoom(player, roomId, cb) {
        let targetRoom = undefined;
        for (let i = 0; i < this._roomList.length; i++) {
            let room = this._roomList[i];
            if (room.getId() === roomId) {
                //找到了房间
                targetRoom = room;
                break;
            }
        }
        if (targetRoom){
            if (cb){
                cb(targetRoom)
            }
        }else{
            if (cb){
                cb({err:"未找到房间"});
            }
        }
    }
    getNewRoomId() {
        let isFinded = false;
        let randomId = 0;
        while (!isFinded) {
            isFinded = true;
            randomId = Math.floor(Math.random() * 100000) + 100000;
            for (let i = 0; i < this._roomList.length; i++) {
                let room = this._roomList[i];
                let id = room.getId();
                if (id === randomId) {
                    isFinded = false;
                    break;
                }
            }
        }
        return randomId;
    }
}
module.exports = RoomController;