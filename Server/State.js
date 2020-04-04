class State {
    constructor() {
        this._state = '';
        this._eventMap = {};
    }
    getState(state) {
        if (state === this._state) {
            return true;
        }
        return this._state;
    }
    addState(state, cb) {
        this._eventMap[state] = cb;
    }
    setState(state) {
        this._state = state;
        if (this._eventMap[state]) {
            this._eventMap[state]();
        }
    }
}
module.exports = State;