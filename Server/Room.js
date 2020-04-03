class Room {
    constructor(roomId) {
        this._roomId = roomId;
        console.log("新房间", this._roomId);
    }
    getId() {
        return this._roomId;
    }
}
module.exports = Room;