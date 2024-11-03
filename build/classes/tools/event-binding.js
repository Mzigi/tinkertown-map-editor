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
//# sourceMappingURL=event-binding.js.map