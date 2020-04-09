import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        roomIdLabel: cc.Node,
        ruleLabel: cc.Node,
        rateLabel: cc.Node,
        rountCountLabel: cc.Node,
        playerNodePrefab: cc.Prefab,
        startGameButton: cc.Node,
        backButton: cc.Node,
        myCardLayerPrefab: cc.Prefab,
        cardCountLabel: cc.Node,
        eatButton: cc.Node,
        pengButton: cc.Node,
        gangButton: cc.Node,
        huButton: cc.Node,
        getCardButton: cc.Node
    },
    onLoad() {
        //进入房间成功
        this._playerNodeList = [];
        this._activeButton = [
            this.eatButton, 
            this.pengButton, 
            this.gangButton,
            this.huButton, 
            this.getCardButton
        ];
        this.hideActiveButton();
        this._currentOutPlayerId = undefined;
        global.socketController.onSyncAllPlayerInfo = this.syncAllPlayerInfo.bind(this);
        global.socketController.onSyncState = this.syncState.bind(this);
        global.socketController.onPushCard = this.showCards.bind(this);
        global.socketController.onUpdateCardCount = this.updateCardCount.bind(this);
        global.socketController.onSyncFocusPlayerId = this.syncFocusePlayerId.bind(this);
        global.socketController.onSyncAllPlayerOutCardList = this.syncAllPlayerOutCardList.bind(this);
        global.socketController.onSyncSelfCardList = this.syncSelfCardList.bind(this);
        this.myCardLayer = cc.instantiate(this.myCardLayerPrefab);
        this.myCardLayer.parent = this.node;
        this.myCardLayer.scale = 0.7;
        this.myCardLayer.y = -200;
        this.myCardLayer.on("player-click-card-node", (id, cb) => {
            // console.log("玩家点击了某张牌 id是", id);
            // console.log("current focus player id", global.controller.getCurrentFocusPlayerId());
            // console.log("self id", global.controller.getId());
            // console

            if (global.controller.getCurrentFocusPlayerId() == global.controller.getId()
                && this._cardList.length === 14) {

                global.socketController.sendOutOneCardMessage(id).then((result) => {
                    console.log("玩家打了一张牌", result);
                    if (!result.err && cb) {
                        cb();
                    }
                });
            }
        });
        // this.myCardLayer.addComponent(cc.Button);
        // this.myCardLayer.on("click", ()=>{
        //     console.log(" game layer click");
        // })
    },
    hideActiveButton(){
        for (let i =  0 ; i < this._activeButton.length ; i ++){    
            this._activeButton[i].active = false;
        }
    },
    showCards(data) {
        console.log("显示牌", data);
        let cardList = data.cardList;
        this._cardList = cardList;
        for (let i = 0; i < cardList.length; i++) {
            this.myCardLayer.emit("push-card", cardList[i]);
        }
        for (let i = 0; i < this._playerNodeList.length; i++) {
            let playerNode = this._playerNodeList[i];
            playerNode.emit("show-card-back");
        }
        if (data.roomCardCount !== undefined) {
            // this.cardCountLabel.getComponent(cc.Label).string = "剩余牌数:" + data.roomCardCount;
            this.updateCardCount(data);
        }

        // this.myCardLayer.emit("")
    },
    syncSelfCardList(data) {
        this._cardList = data;

    },
    syncFocusePlayerId(id) {
        // this._currentFocusPlayerId = id;
        global.controller.setCurrentFocusPlayerId(id);
        if (id === global.controller.getId()) {
            this.processNextEvent();
        }
    },
    syncAllPlayerOutCardList(data) {
        //同步所有玩家已经打出去的牌
        let cardList = data.playerOutCardList;
        let currentCard = data.targetCard;
        this._currentOutCard = currentCard;
        let outPlayerId = data.outPlayerId;
        this._currentOutPlayerId = outPlayerId; //当前出牌的玩家
        console.log("card list", cardList);
        console.log("current card", currentCard);
        //同步其他玩家打的牌

        for (let i = 0 ; i < this._playerNodeList.length ; i ++){
            this._playerNodeList[i].emit("refer-out-card-data", cardList);
        }
        let myData = undefined;
        for (let i = 0; i < cardList.length; i++) {
            if (global.controller.getId() == cardList[i].id) {
                myData = cardList[i];
            }
        }
        console.log("my data", myData);
        this.myCardLayer.emit("update-out-card-info", myData, currentCard);
    },
    getOneCard() {
        console.log("获取一张牌");
        return new Promise((resole, reject) => {

            if (this._cardList.length < 14) {
                global.socketController.sendGetOneCard().then((data) => {
                    console.log("获取一张牌", data);
                    this._cardList.push(data);
                    this.myCardLayer.emit('push-card', data);
                    resole();
                });
            }
        });
    },
    processNextEvent() {
        if (this._currentOutPlayerId === undefined) {
            //还没有玩家出牌,那么当前的焦点玩家发送获取一张牌的操作
            this.getOneCard();
        } else {
            let result = this.checkCardResult();

            let isGetCard = true;
            if (result.eatResult) {
                isGetCard = false;
                this.showCanEatCards(result.eatResult);
            }
            if (result.pengResult) {
                isGetCard = false;
            }
            if (isGetCard) {
                this.getOneCard();
            }
        }

    },
    showCanEatCards(eatResult) {
        console.log("展示可以吃的牌", eatResult);
        this.eatButton.active = true;
        this.getCardButton.active = true;
        this.myCardLayer.emit("show-can-interactive-card", eatResult);
    },
    checkCardResult() {
        //检查牌的结果
        console.log("检查可以吃碰", this._ruleType);
        let eatResult = undefined;
        let pengResult = undefined;
        switch (this._ruleType) {
            case 'rule-type-1':
                //胡吃乱碰
                eatResult = this.checkCanEat();
                pengResult = this.checkCanPeng();
                break;
            case 'rule-type-2':
                //只碰不吃
                pengResult = this.checkCanPeng();
                break;
            default:
                break;
        }
        return {
            eatResult: eatResult,
            pengResult: pengResult
        }
    },
    checkCanEat() {
        //检查是否可以吃
        //根据自己的牌型，与上家打出的牌。检查一下是否可以吃
        let type = this._currentOutCard._type;
        let list = [];
        for (let j = 0; j < this._cardList.length; j++) {
            let card = this._cardList[j];
            if (card._type === type &&
                card._value !== this._currentOutCard._value &&
                card._type !== 'feng') {
                list.push(card);
            }
        }
        console.log("去重之前list", list);
        //先去重
        let valueMap = {};
        for (let i = 0; i < list.length; i++) {
            valueMap[list[i]._value] = list[i];
        }
        console.log("value Map ", valueMap);
        list = [];
        for (let i in valueMap) {
            list.push(valueMap[i]);
        }
        console.log("list", list);


        list.push(this._currentOutCard);
        list.sort((a, b) => {
            return a._value - b._value;
        });
        console.log("list= ", list);
        let index = 0;
        for (let j = 0; j < list.length; j++) {
            if (this._currentOutCard._id === list[j]._id) {
                index = j;
            }
        }
        console.log("index", index);
        let findList = [];
        for (let j = 0; j < 3; j++) {
            let x = index - 2 + j;
            console.log("x", x);
            if (x >= 0 && x + 2 < list.length && x + 1 < list.length) {
                console.log(list[x], list[x + 1], list[x + 2]);
                let findData = [];
                if (Math.abs(list[x]._value - list[x + 1]._value) === 1 &&
                    Math.abs(list[x + 1]._value - list[x + 2]._value) === 1) {
                    console.log("找到了可以吃的牌型");
                    findData.push(list[x]);
                    findData.push(list[x + 1]);
                    findData.push(list[x + 2]);
                }
                if (findData.length !== 0){
                    findList.push(findData);
                }
            }
        }
        // for (let i = 0 ; i < this._cardList.length ; i ++){

        // }
        return findList.length === 0 ? false : findList;
    },
    checkCanPeng() {
        //检查是否可以碰
    },
    updateCardCount(data) {
        if (data.roomCardCount !== undefined) {
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(0.1),
                    cc.callFunc(() => {
                        this.cardCountLabel.getComponent(cc.Label).string = "剩余牌数:" + data.roomCardCount;
                    })
                )
            )
        }
        // if (this._isFocus && this._cardList.length === 13){
        //     global.socketController.sendGetOneCard().then((data)=>{
        //         console.log("获取到一张牌", data);
        //     });
        // }
    },
    syncState(state) {
        console.log("同步房间状态", state);
        switch (state) {
            case 'start-game':
                this.startGameButton.active = false;
                this.backButton.active = false;
                break;
            case 'wait':
                this.startGameButton.active = this._isHouseMaster;
                this.backButton.active = true;
                break;
            default:
                break;
        }
    },
    syncAllPlayerInfo(playersInfo) {
        let count = playersInfo.length - this._playerNodeList.length;
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let node = cc.instantiate(this.playerNodePrefab);
                node.parent = this.node;
                this._playerNodeList.push(node);
            }
        }
        if (count < 0) {
            count = Math.abs(count);
            for (let i = 0; i < count; i++) {
                let node = this._playerNodeList.pop();
                node.destroy();
            }
        }
        let listIndex = 0;
        for (let i = 0; i < playersInfo.length; i++) {
            if (playersInfo[i].id === global.controller.getId()) {
                listIndex = i;
            }
        }
        for (let i = 0; i < this._playerNodeList.length; i++) {
            let playerNode = this._playerNodeList[i];
            playerNode.emit("update-info", playersInfo[i], i, listIndex);
        }
        let state = '';
        let isFocus = false;
        for (let i = 0; i < playersInfo.length; i++) {
            let player = playersInfo[i];
            if (player.id === global.controller.getId()) {
                this._isHouseMaster = player.isHouseMaster;
                state = player.state;
                isFocus = player.isFocus;
            }
        }
        this._isFocus = isFocus;
        console.log("state", state);
        console.log('is house master', this._isHouseMaster);
        this.syncState(state);

    },
    start() {
        global.socketController.sendEnterRoomLayer().then((data) => {
            console.log("初始化房间信息", data);
            this.roomIdLabel.getComponent(cc.Label).string = "房间号:" + data.roomId;
            this.ruleLabel.getComponent(cc.Label).string = data.ruleTypeName;
            // this.rateLabel.getComponent(cc.Label).string = rateConfig
            let rateConfig = data.rateConfig;
            this.rateLabel.getComponent(cc.Label).string = "胡X" + rateConfig['hu'] + '杠X' + rateConfig['gang'];
            this.rountCountLabel.getComponent(cc.Label).string = "总局数:" + data.totalRoundCount + " 当前局数:" + data.currentRountCount;
            // let playersInfo = data.playersInfo;
            // this.updateAllPlayerNode(playersInfo);
            this._ruleType = data.ruleType;
        });
    },
    onButtonClick(event, customData) {
        switch (customData) {
            case 'start-game':
                global.socketController.sendStartGameMessage().then((result) => {
                    if (result.err) {
                        global.controller.showAlert(result.err);
                    }
                });
                break;
            case 'back-room':
                global.socketController.sendExitRoomtMessage().then((reuslt) => {
                    // global.controller.enetr
                    console.log("退出房间", reuslt);
                    if (reuslt.err) {
                        global.controller.showAlert(reuslt.err);
                    } else {
                        global.controller.enterLoginLayer();
                    }
                });
                break;
            case 'get-card':
                //楼牌
                 this.hideActiveButton();
                 this.getOneCard();
                break;   
            case 'eat':
                //吃
                this.hideActiveButton();
                global.socketController.sendEatCard
                break;     
            default:
                break;
        }
    }
});
