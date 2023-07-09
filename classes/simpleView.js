"use-strict";
// @ts-check
var simpleView = /** @class */ (function () {
    function simpleView(buffer) {
        this.view = new DataView(buffer);
        this.viewOffset = 0;
    }
    simpleView.prototype.writeInt16 = function (value, littleEdian) {
        if (!littleEdian) {
            littleEdian = true;
        }
        value = Math.max(value, -32768);
        value = Math.min(value, 32767);
        this.view.setInt16(this.viewOffset, value, littleEdian);
        this.viewOffset += 2;
    };
    simpleView.prototype.readInt16 = function (littleEdian) {
        if (!littleEdian) {
            littleEdian = true;
        }
        var value = this.view.getInt16(this.viewOffset, littleEdian);
        this.viewOffset += 2;
        return value;
    };
    simpleView.prototype.writeUint8 = function (value) {
        value = Math.max(value, 0);
        value = Math.min(value, 255);
        this.view.setUint8(this.viewOffset, value);
        this.viewOffset += 1;
    };
    simpleView.prototype.readUint8 = function () {
        var value = this.view.getUint8(this.viewOffset);
        this.viewOffset += 1;
        return value;
    };
    return simpleView;
}());
//# sourceMappingURL=simpleView.js.map