var DebugTimer = /** @class */ (function () {
    function DebugTimer(name) {
        this.name = name;
        this.startTime = performance.now();
    }
    DebugTimer.prototype.getTime = function () {
        return (performance.now() - this.startTime);
    };
    DebugTimer.prototype.log = function (name) {
        console.log("".concat(name || this.name, " took ").concat(this.getTime() / 1000, "s"));
    };
    return DebugTimer;
}());
export { DebugTimer };
//# sourceMappingURL=debug-timer.js.map