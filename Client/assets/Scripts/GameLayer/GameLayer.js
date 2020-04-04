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
        backButton: cc.Node
    },
    onLoad() {
        //进入房间成功
        this._playerNodeList = [];
        global.socketController.onSyncAllPlayerInfo = this.syncAllPlayerInfo.bind(this);
        global.socketController.onSyncState = this.syncState.bind(this);

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
        for (let i = 0; i < playersInfo.length; i++) {
            let player = playersInfo[i];
            if (player.id === global.controller.getId()) {
                this._isHouseMaster = player.isHouseMaster;
                state = player.state;
            }
        }
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
            default:
                break;
        }
    }
});
