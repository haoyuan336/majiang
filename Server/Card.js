const ColorTypeMap = {
    "wan": "wan",
    "tong": "tong",
    "tiao": "tiao",
    "feng": "feng"
};

class Card {
    constructor(color, value) {
        this._color = color;
        this._value = value;
        this._type = ColorTypeMap[color]?ColorTypeMap[color]:ColorTypeMap['feng'];
    }
}
module.exports = Card;