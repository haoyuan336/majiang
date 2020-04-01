cc.Class({
    extends: cc.Component,

    properties: {

    },

    onButtonClick(event, customData) {
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            default:
                break;
        }
    }
});
