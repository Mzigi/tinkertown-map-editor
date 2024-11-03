var EventBinding = /** @class */ (function () {
    function EventBinding(name, event) {
        this.name = name;
        this.event = event;
    }
    EventBinding.prototype.call = function (tool) {
        this.event(tool);
    };
    return EventBinding;
}());
//Type "tsc.cmd -w" to compile all files
//# sourceMappingURL=all.js.map