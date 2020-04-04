const State = require("./State")
const CardController = require("./CardController")
class Room {
    constructor(roomId, spec) {
        this._roomId = roomId;
        console.log("新房间", this._roomId);
        let config = require('./config');
        console.log("spec", JSON.stringify(spec));
        this._ruleType = spec['rule-type'];
        this._roundType = spec['round-type'];
        this._rateType = spec['rate-type'];
        this._ruleTypeName = config['rule-name'][this._ruleType];
        this._rateConfig = config['rate-type'][this._rateType];
        this._totalRoundCount = config['round-type'][this._roundType];
        this._currentRoundCount = 0;
        this._playerList = [];
        this._state = new State();
        this._state.setState('wait');
        this._state.addState("start-game", this.startGame.bind(this));
        this._cardController = new CardController();
    }
    startGame() {
        console.log("开始游戏");
        //告诉所有的玩家开始游戏了
        for (let i = 0 ; i < this._playerList.length ; i ++){
            let player  =this._playerList[i];
            player.roomStartGame();
        }
        let onePackCards = this._cardController.getNewOnePackCards();
    }
    
    getId() {
        return this._roomId;
    }
    playerEnterGameLayer(player) {
        let isHave = false;
        for (let i = 0; i < this._playerList.length; i++) {
            let target = this._playerList[i];
            if (player.getId() === target.getId()) {
                //存在
                isHave = true;
            }
        }
        if (!isHave)
            this._playerList.push(player);

        this.setHouseMaster();
        return new Promise((resole, reject) => {
            resole({
                roomId: this._roomId,
                ruleTypeName: this._ruleTypeName,
                rateConfig: this._rateConfig,
                totalRoundCount: this._totalRoundCount,
                currentRountCount: this._currentRoundCount
            });
            this.syncAllPlayerInfo();
        });
    }
    syncAllPlayerInfo() {
        let playerInfoList = this.getAllPlayerInfo();
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            player.sendSyncAllPlayerInfo(playerInfoList);
        }
    }
    getAllPlayerInfo() {
        let playerInfoList = [];
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            playerInfoList.push(player.getPlayerInfo());
        }
        return playerInfoList;
    }
    getIsCanJoin(id) {
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            if (player.getId() === id) {
                return true;
            }
        }
        if (this._playerList.length < 4) {
            return true;
        }
        return "房间已满";
    }
    playerExit(player) {
        if (this._state.getState() !== 'wait') {
            return "已经开始游戏，不能退出房间";
        }
        for (let i = 0; i < this._playerList.length; i++) {
            let target = this._playerList[i];
            if (target.getId() === player.getId()) {
                this._playerList.splice(i, 1);
                this.setHouseMaster();
                this.syncAllPlayerInfo();
                return 'success';
            }
        }

    }
    houseMasterStartGame(player) {
        let isCanStartGame = true;
        if (!player.getIsHouseMaster()) {
            isCanStartGame = '不是房主不能开始游戏';
        }
        if (this._playerList.length !== 4) {
            isCanStartGame = '房间人员未满不能开始游戏';
        }
        if (isCanStartGame === true) {
            this._state.setState("start-game");
        }
        return isCanStartGame;
    }
    setHouseMaster() {
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            if (i === 0) {
                player.setHouseMaster(true);
            } else {
                player.setHouseMaster(false);
            }
        }
    }
    getState(){
        return this._state.getState();
    }
}
module.exports = Room;