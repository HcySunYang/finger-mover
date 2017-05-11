const TW = {
    easeOutStrong: function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b
    },
    backOut: function (t, b, c, d, s) {
        if (typeof s === 'undefined') {
            s = 0.7
        }
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
    }
}

export default TW