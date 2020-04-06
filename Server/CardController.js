const Card = require("./Card");
class CardController {
    constructor() {

    }
    getNewOnePackCards() {
        //先创建万通条
        let cardlist = [];
        let types = ['wan', 'tong', 'tiao'];
        for (let j = 0; j < types.length; j++) {
            for (let i = 0; i < 9; i++) {
                for (let h = 0; h < 4; h++) {
                    let card = new Card(types[j], i + 1,cardlist.length);
                    cardlist.push(card);
                }
            }
        }
        let types2 = ['dong', 'xi', 'nan', 'bei', 'zhong', 'fa', 'bai'];
        for (let j = 0; j < types2.length; j++) {
            for (let i = 0; i < 4; i++) {
                let card = new Card(types2[j], j, cardlist.length);
                cardlist.push(card);
            }
        }
        console.log("cards = ", JSON.stringify(cardlist));
        console.log("card length ", cardlist.length);
        //洗牌
        // cardlist = cardlist.sort(() => {
        //     return Math.random() - 0.5;
        // });

        let sortList = [];
        while (cardlist.length > 0) {
            let index = Math.round(Math.random() * (cardlist.length - 1));
            sortList.push(cardlist[index]);
            cardlist.splice(index, 1);

        }

        return sortList;
    }
}
module.exports = CardController;