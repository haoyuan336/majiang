import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        mySpriteFrameAtlas: cc.SpriteAtlas,
        backSpriteFrame: cc.SpriteFrame
    },
    onLoad() {
        this._ownerId = undefined;
        this.node.on("set-owner-id", (id)=>{
            this._ownerId = id;
        });
        this.node.on("init-data", (data) => {
            console.log("初始化牌的信息", data);
            // M_bamboo_2 //条
            //M_character_5 // 万
            //M_dot_5 //饼
            //
            // let value = data.{_color: "xi", _value: 0}
            this._id = data._id;
            let color = data._color;
            let value = data._value;
            let type = data._type;
            console.log("color", color);
            console.log("value", value);
            let colroMap = {
                "tiao": "bamboo",
                "wan": "character",
                "tong": "dot"
            }
            let fengMap = {
                "dong": "east",
                "bei": "north",
                "nan": "south",
                "xi": "west"
            }
            let coMap = {
                "zhong": 'red',
                "fa": "green",
                "bai": "white"
            }
            let spriteFrameName = undefined;
            if (type === "feng") {
                spriteFrameName = "M_" + fengMap[color];
                if (fengMap[color]) {
                    spriteFrameName = "M_wind_" + fengMap[color];
                } else if (coMap[color]) {
                    spriteFrameName = "M_" + coMap[color];
                }
            } else {
                spriteFrameName = "M_" + colroMap[color] + "_" + value;
            }
            console.log("sprite frame name", spriteFrameName);
            let spriteFrame = this.mySpriteFrameAtlas.getSpriteFrame(spriteFrameName);
            this.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            this._cardData = data;
        });
        this.node.on("show-back", ()=>{
            this.node.getComponent(cc.Sprite).spriteFrame = this.backSpriteFrame;
        });
        // this.node.on("click", ()=>{
        //     if (global.controller.getCurrentFocusPlayerId() === global.controller.getId()){
        //         if (this._ownerId === global.controller.getId()){
        //             console.log("click = ", this._cardData);
        //             // this.node.emit("click")
        //         }
        //     }
        // });
    },
    
    start() {

    },
    getCardData() {
        return this._cardData;
    },

    getId(){
        return this._id;
    }
});
