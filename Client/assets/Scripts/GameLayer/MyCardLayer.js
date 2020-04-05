cc.Class({
    extends: cc.Component,

    properties: {
        cardPrefab: cc.Prefab
    },
    onLoad() {
        this._cardDataQuene = [];
        this._cardNodeList = [];
        this.node.on("push-card", (data) => {
            console.log("push card", data);
            this._cardDataQuene.push(data);
        });

    },
    start() {
        this._addOneCardTime = 0;
    },
    referCardNodePos() {
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
                    console.log("color = ", lastCard._color);
                    console.log("target card ", targetCard._color);
                    if (targetCard._type === lastCard._type) {
                        console.log("找到了一张一样的牌型", lastCard._color);
                        this._cardNodeList.splice(i, 1);
                        i--;
                        list.push(targetNode);
                    }
                }
                console.log("list", list.length);
                list.push(convertList.pop());
                list = list.sort((a, b) => {
                    let cardA = a.getComponent('Card').getCardData();
                    let cardB = b.getComponent('Card').getCardData();
                    let value = cardA._value - cardB._value;
                    console.log("value", value);
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
            node.runAction(cc.moveTo(0.1, (i + 1) * 70 - 500, 0));
        }
        // console.log("card node list", this._cardNodeList);
    },
    update(dt) {
        if (this._addOneCardTime > 0.1) {
            this._addOneCardTime = 0;
            if (this._cardDataQuene.length > 0) {
                let data = this._cardDataQuene.shift();
                let card = cc.instantiate(this.cardPrefab);
                card.parent = this.node;
                card.emit('init-data', data);
                this._cardNodeList.push(card);
                card.x = this._cardNodeList.length * 70 - 500;
                if (this._cardDataQuene.length === 0) {
                    this.referCardNodePos();
                }
            }
        } else {
            this._addOneCardTime += dt;
        }
    }
});
