import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        headImageNode: cc.Node,
        nickNameLabel: cc.Node,
        GameConfig: cc.JsonAsset,
        houseMasterIcon: cc.Node,
        banckerIcon: cc.Node,
        cardPrefab: cc.Prefab
    },
    onLoad() {
        this._state = 'wait';
        this._playerSeatConfig = this.GameConfig.json['player-seat-config'];
        this._convertIndex = 0;
        this._outCardList = [];
        this.node.on("update-info", (data, index, listIndex) => {
            console.log("update player node info", data);
            this._id = data.id;
            let nickName = data.nickName;
            this.nickNameLabel.getComponent(cc.Label).string = nickName;
            let headImageUrl = data.headImageUrl;
            this.updateHeadImage(headImageUrl);
            // this.node.x = this._playerSeatConfig[index].x;
            // this.node.y = this._playerSeatConfig[index].y;
            let convertSeatIndex = index - listIndex;
            if (convertSeatIndex < 0) {
                convertSeatIndex = convertSeatIndex + 4;
            }
            this._convertIndex = convertSeatIndex;
            this.node.x = this._playerSeatConfig[convertSeatIndex].x;
            this.node.y = this._playerSeatConfig[convertSeatIndex].y;
            this.houseMasterIcon.active = data.isHouseMaster;
            this.banckerIcon.active = data.isBanker;
        });
        this._cardBackNodeList = [];
        this.node.on("show-card-back", () => {
            if (this._convertIndex !== 0) {
                console.log("convert index", this._convertIndex);
                let pos = this.GameConfig.json['player-node-card-back-pos'][this._convertIndex];
                this._cardBackPos = pos;
                this._state = "add-card-back";
            }
        });
        this.node.on("refer-out-card-data", (cardList) => {
            //同步打出去的牌的列表
            console.log("同步每个玩家打出去的牌的列表", cardList);
            for (let i = 0; i < cardList.length; i++) {
                let cardData = cardList[i];
                if (cardData.id === this._id && this._id !== global.controller.getId()) {
                    let cardList = cardData.cardList;
                    this.referOutCardListNode(cardList);
                }
            }
        });
    },
    referOutCardListNode(cardList) {
        let count = cardList.length - this._outCardList.length;
        for (let i = 0; i < count; i++) {
            let node = cc.instantiate(this.cardPrefab);
            node.parent = this.node;
            this._outCardList.push(node);
        }
        for (let i = 0; i < this._outCardList.length; i++) {
            let cardNode = this._outCardList[i];
            cardNode.emit("init-data", cardList[i]);
            cardNode.angle = -90 * this._convertIndex + 180;
            cardNode.scale = 0.4;
            let pos = this.GameConfig.json['player-node-out-card-pos'][this._convertIndex];
            switch (this._convertIndex) {
                case 1:
                    cardNode.x = pos.x;
                    cardNode.y = pos.y + (i + 1) * 30;
                    break;
                case 2:
                    cardNode.y = pos.y;
                    cardNode.x = pos.x - (i + 1) * 30;
                    break;
                case 3:
                    cardNode.x = pos.x;
                    cardNode.y = pos.y - (i + 1) * 30;
                    break;
                default:
                    break;
            }
        }

    },
    updateHeadImage(headImageUrl) {
        cc.loader.load(headImageUrl, (err, result) => {
            this.headImageNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(result);
        });
    },
    start() {
        // this._state = new ListeningStateChangedEvent();
        this._addCardTime = 0;
    },
    update(dt) {
        if (this._state === 'add-card-back') {
            if (this._addCardTime > 0.1) {
                this._addCardTime = 0;
                let node = cc.instantiate(this.cardPrefab);
                node.parent = this.node;
                node.emit("show-back");
                node.scale = 0.6;
                this._cardBackNodeList.push(node);
                node.angle = -90 * this._convertIndex;

                switch (this._convertIndex) {
                    case 1:
                        node.x = this._cardBackPos.x;
                        node.y = this._cardBackPos.y + this._cardBackNodeList.length * 30;
                        break;
                    case 2:
                        node.x = this._cardBackPos.x - this._cardBackNodeList.length * 30;
                        node.y = this._cardBackPos.y;
                        break;
                    case 3:
                        node.x = this._cardBackPos.x;
                        node.y = this._cardBackPos.y - this._cardBackNodeList.length * 30;
                        break;
                    default:
                        break;
                }
                if (this._cardBackNodeList.length >= 13) {
                    this._state = 'add-card-back-end';
                }
            } else {
                this._addCardTime += dt;
            }
        }
    }

});
