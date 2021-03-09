export default class State {
    private currentState = null;

    private callBackMap = {};

    constructor() {

    }
    getState() {
        return this.currentState;
    }

    /***
     * 设置状态
     * @params  
     * state string类型
     * 需要设置的状态
     */
    setState(state) {
        if (this.currentState == state) {
            return;
        }

        this.currentState = state;

        let handlerList = this.callBackMap[state];
        if (handlerList) {

            let args = [];
            for (let i = 1; i < arguments.length; i++) {
                args.push(arguments[i])
            }

            handlerList.forEach(element => {
                let handler = element['cb'];
                let target = element['target'];
                if (target) {
                    handler.call(target, args);
                } else {
                    handler.call(this, args);
                }
            });
        }


    }
    /***
    * 添加状态改变时候的监听机制
    * @params  
    * state string类型
    * 需要添加的状态
    * @param
    * cb 切换状态时的回调
    */
    addState(state, cb: Function, target?) {
        if (this.callBackMap[state]) {
            this.callBackMap[state].push({
                cb: cb,
                target: target
            });
        } else {
            this.callBackMap[state] = [{
                cb: cb,
                target: target
            }];
        }
    }
}