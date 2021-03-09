export default class Tool {
    public static formatTime(date, fmt) {
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + ''
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : Tool.padLeftZero(str))
            }
        }
        return fmt;
    }
    public static padLeftZero(str) {
        return ('00' + str).substr(str.length)
    }
    public static loadSpriteFrame(url: string) {
        return new Promise<cc.SpriteFrame>((resolve, reject) => {
            cc.loader.load({ url: url, type: 'png' }, (err, result) => {
                let spriteFrame = new cc.SpriteFrame(result);
                // console.log("result", result);
                if (!err) {
                    resolve(spriteFrame);
                } else {
                    // reject(err);
                    reject(null);
                }
            })
            // cc.resources.load(url, cc.SpriteFrame, (err, result:cc.SpriteFrame) => {
            //     if (!err) {
            //         resolve(result);
            //     } else {
            //         reject(err);
            //     }
            // })
        })
    }
    public static SameWeek(time: number) {
        //首先得到今天是周几
        let nowDate = new Date();
        let nowWeek = nowDate.getDay();
        // console.log("now week", nowWeek);
        // console.log("data week", )

        let nowHour = nowDate.getHours();
        // console.log("now hour", nowHour);
        let minute = nowDate.getMinutes();
        // console.log("minute", minute);
        let second = (nowHour * 3600 + minute * 60) * 1000;
        // console.log("second", second);
        let mondayTime = nowDate.getTime() - second - (nowWeek - 1) * 24 * 60 * 60 * 1000;
        let sunDayTime = nowDate.getTime() - second + (7 - nowWeek + 1) * 24 * 60 * 60 * 1000;
        if (time > mondayTime && time < sunDayTime) {
            return true;
        }
        return false;
    }

    public static GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    public static FormatWeekDay(time: number) {
        //时间转换为星期几
        // dateStr = "星期" + new Date(beginTime).getDay() + ' ' + Tool.formatTime(new Date(beginTime), "hh:mm");
        let strList = ['日', "一", '二', '三', '四', '五', '六']
        return "星期" + strList[new Date(time).getDay()] + ' ' + Tool.formatTime(new Date(time), "hh:mm");

    }
    public static getNowTime() {
        return Date.now();
    }
    public static FormatDay(time: number, format: string) {
        return this.formatTime(new Date(time), format);
    }
    public static playAudioEffect(path, cb, loadCb?) {
        cc.resources.load(path, cc.AudioClip, (err, result: cc.AudioClip) => {
            console.log("load audio", path);
            if (err) {  
                console.log("err", err)
                cb();
            } else {
                let id = cc.audioEngine.playEffect(result, false);
                if (loadCb) {
                    loadCb(id);
                }
                cc.audioEngine.setFinishCallback(id, () => {
                    if (cb) {
                        cb(id);
                    }
                })
            }
        })
    }
    public static stopAudioEffect(id: number) {
        cc.audioEngine.stop(id);
    }

}