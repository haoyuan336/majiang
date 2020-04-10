import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        cardPrefab: cc.Prefab,
       
    },
    onLoad() {
        this._cardDataQuene = [];
        this._cardNodeList = [];
        // this._outCardNodeList = [];
        this._currentOutCardList = [];
        this.node.on("push-card", (data) => {
            console.log("push card", data);
            this._cardDataQuene.push(data);
        });
        this.node.on("update-out-card-info", (data, currentCard) => {
            let cardList = data.cardList;
            let count = cardList.length - this._currentOutCardList.length;
            console.log("count", count);
            if (count > 0) {
                for (let i = 0; i < count; i++) {
                    let node = cc.instantiate(this.cardPrefab);
                    node.parent = this.node;
                    node.x = -430 + 70 * this._currentOutCardList.length;
                    node.y = 120 + Math.floor((this._currentOutCardList.length / 10)) * 100;
                    this._currentOutCardList.push(node);
                }
                for (let i = 0; i < this._currentOutCardList.length; i++) {
                    let node = this._currentOutCardList[i];
                    console.log("i", i);
                    node.emit('init-data', cardList[i]);
                }
            }
        });
        this.node.on("show-can-interactive-card", (cardData) => {
            //显示可以交互的牌
            // this.eatButton.active = true;
            // let showCardListIndex = 0;
            // let cardData = cardList[showCardListIndex];
            console.log("card data", cardData);
            for (let i = 0; i < this._cardNodeList.length; i++) {
                let node = this._cardNodeList[i];
                console.log("node", node);
                for (let j = 0; j < cardData.length; j++) {
                    let id = node.getComponent('Card').getId();
                    console.log("id = ", id);
                    console.log("card data id", cardData[j]._id);
                    if (id === cardData[j]._id) {
                        node.y = 20;
                    }
                }

            }
        });
    },
    start() {
        this._addOneCardTime = 0;
    },
  
    referCardNodePos() {
        console.log("刷新牌的位置");
        this._cardNodeList = this._cardNodeList.sort((a, b) => {
            let cardA = a.getComponent('Card').getCardData();
            let cardB = b.getComponent('Card').getCardData();

            if (cardA._color === cardB._color) {
                return 1;
            } else {
                return -1;
            }
        });
        let convertList = [];
        while (this._cardNodeList.length > 0) {
            if (convertList.length > 0) {
                let lastNode = convertList[convertList.length - 1];
                let lastCard = lastNode.getComponent("Card").getCardData();
                let list = [];
                for (let i = 0; i < this._cardNodeList.length; i++) {
                    let targetNode = this._cardNodeList[i];
                    let targetCard = targetNode.getComponent("Card").getCardData();
                    // console.log("color = ", lastCard._color);
                    // console.log("target card ", targetCard._color);
                    if (targetCard._type === lastCard._type) {
                        // console.log("找到了一张一样的牌型", lastCard._color);
                        this._cardNodeList.splice(i, 1);
                        i--;
                        list.push(targetNode);
                    }
                }
                // console.log("list", list.length);
                list.push(convertList.pop());
                list = list.sort((a, b) => {
                    let cardA = a.getComponent('Card').getCardData();
                    let cardB = b.getComponent('Card').getCardData();
                    let value = cardA._value - cardB._value;
                    // console.log("value", value);
                    return value;
                });
                convertList = convertList.concat(list);
            }
            if (this._cardNodeList.length > 0) {
                let node = this._cardNodeList.shift();
                convertList.push(node);
            }
        }
        for (let i = 0; i < convertList.length; i++) {
            let node = convertList[i];
            if (i === 13) {
                node.runAction(cc.moveTo(0.1, (i + 1) * 70 - 500 + 30, 0));

            } else {
                node.runAction(cc.moveTo(0.1, (i + 1) * 70 - 500, 0));
            }
        }
        this._cardNodeList = convertList;
        // console.log("card node list", this._cardNodeList);
    },
    addOneCardNode(data, index) {
        let card = cc.instantiate(this.cardPrefab);
        card.parent = this.node;
        card.emit('init-data', data);
        card.emit("set-owner-id", global.controller.getId());
        card.addComponent(cc.Button);
        console.log("添加点击事件");
        card.on("click", () => {
            let id = card.getComponent('Card').getId();
            this.node.emit("player-click-card-node", id, () => {
                for (let i = 0; i < this._cardNodeList.length; i++) {
                    let target = this._cardNodeList[i].getComponent("Card");
                    if (target.getId() === id) {
                        this._cardNodeList.splice(i, 1);
                        break;
                    }
                }
                this.referCardNodePos();
                card.destroy();

            });
            // console.log("click w", index);
        });
        return card;
    },
    update(dt) {
        if (this._addOneCardTime > 0.1) {
            this._addOneCardTime = 0;
            if (this._cardDataQuene.length > 0) {
                let data = this._cardDataQuene.shift();
                let card = this.addOneCardNode(data, this._cardNodeList.length);
                this._cardNodeList.push(card);
                card.x = this._cardNodeList.length * 70 - 500;
                if (this._cardDataQuene.length === 0) {
                    this.referCardNodePos();
                }
            }
        } else {
            this._addOneCardTime += dt;
        }
    },
    onButtonClick(event, customData) {
        console.log("button click", customData);
        switch (customData) {
            case 'eat':
                break;
            case 'peng':
                break;
            default:
                break;
        }
    }
});
