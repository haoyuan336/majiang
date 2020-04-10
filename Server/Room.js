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
        this._bankerIndex = 0;
        this._focusPlayerIndex = undefined;
        this._currentOutCard = undefined;//当前被打出来的牌
        this._currentOutCardPlayer = undefined; //当前打出去牌的玩家
    }
    startGame() {
        console.log("开始游戏");
        //告诉所有的玩家开始游戏了
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            player.roomStartGame();
        }
        let onePackCards = this._cardController.getNewOnePackCards();
        console.log("one pack card", onePackCards);
        //拿到牌之后，开始发牌
        //首先确定撞见
        //
        this.setBanker();
        this._onePackCards = onePackCards;
        this.pushCard();
        this.updateCardCount();
        this.setFocusPlayer();

    }
    setFocusPlayer() {
        //设置焦点玩家
        //首先找到上一个焦点玩家
        // let focusPlayer = undefined;
        // for (let i = 0 ; i < this._playerList.length ; i ++){

        // }
        if (this._focusPlayerIndex === undefined) {
            this._focusPlayerIndex = this._bankerIndex;
        } else {
            this._focusPlayerIndex++;
            if (this._focusPlayerIndex == this._playerList.length) {
                this._focusPlayerIndex = 0;
            }
        }
        for (let i = 0; i < this._playerList.length; i++) {
            this._playerList[i].setFocus(false);
        }
        this._playerList[this._focusPlayerIndex].setFocus(true);
        // this.syncAllPlayerInfo();

        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            player.sendSyncFocusPlayerMessage(this._playerList[this._focusPlayerIndex].getId());
        }
    }
    getOneCardData(player) {
        if (this._onePackCards.length > 0) {
            let oneCardData = this._onePackCards.pop();
            this.updateCardCount();
            return oneCardData;
        } else {
            return { err: "没牌了" };
        }

    }
    updateCardCount() {
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            player.updateCardCount(this._onePackCards.length);
        }
    }
    pushCard() {
        for (let i = 0; i < this._playerList.length; i++) {
            let cardList = [];
            let player = this._playerList[i];
            for (let j = 0; j < 13; j++) {
                cardList.push(this._onePackCards.pop());
            }
            player.pushCard(cardList);
        }
    }
    setBanker() {
        let bankerPlayer = undefined;
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            if (player.getIsBanker()) {
                bankerPlayer = player;
            }
        }
        if (!bankerPlayer) {
            this._bankerIndex = 0;
        } else {
            if (!bankerPlayer.getIsWin()) {
                //如果庄家没有赢，那么下一位玩家设置为庄家
                this._bankerIndex++;
                if (this._bankerIndex === this._playerList.length) {
                    this._bankerIndex = 0;
                }
            }
        }
        for (let i = 0; i < this._playerList.length; i++) {
            let player = this._playerList[i];
            player.setIsBanker(false);
        }
        this._playerList[this._bankerIndex].setIsBanker(true);
        this.syncAllPlayerInfo();
    }
    getId() {
        return this._roomId;
    }
    playerOutOneCard(player, cardId) {
        this._currentOutCardPlayer = player;
        this._currentOutCard = player.playerOutOneCardData(cardId);
        //广播一下
        let playerOutCardList = [];
        for (let i = 0; i < this._playerList.length; i++) {
            playerOutCardList.push({
                id: this._playerList[i].getId(),
                cardList: this._playerList[i].getOutCardList()
            })
        }
        for (let i = 0; i < this._playerList.length; i++) {
            let target = this._playerList[i];
            target.sendPlayerOutOneCardMessage({
                playerOutCardList: playerOutCardList,
                targetCard: this._currentOutCard,
                outPlayerId: player.getId()
            });
        }
        //将焦点设置到下一位玩家
        this.setFocusPlayer();
        // this._currentAskPlayerIndex = this._focusPlayerIndex + 1;
        //询问剩下 的所有的玩家 是否吃或者碰
    }

    askPlayerOrEat(){
        //询问玩家可以吃跟碰么。
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
                currentRountCount: this._currentRoundCount,
                ruleType: this._ruleType
            });
            this.syncAllPlayerInfo();
        });
    }
    playerEatCard(target){
        // let allCardData = [];
        // for (let i = 0 ; i < this._playerList.length ; i ++){
        //     allCardData.push(this._playerList[i].getAllCardData());
        // }
        let eatedCardList = target.getEatedCardData();
        for (let i = 0 ; i < this._playerList.length ; i ++){
            let player = this._playerList[i];
            player.sendPlayerEatCardMessage(target);
        }
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
    getState() {
        return this._state.getState();
    }
}
module.exports = Room;