var Tool = /** @class */ (function () {
    function Tool(toolId, toolName, toolInfo) {
        this.id = toolId;
        this.name = toolName;
        this.toolInfo = toolInfo;
        this.events = [];
    }
    Tool.prototype.getWorldMousePos = function () {
        return this.toolInfo.camera.screenPosToWorldPos(document.getElementById("2Dcanvas"), this.toolInfo.camera.lastPosition.x, this.toolInfo.camera.lastPosition.y);
    };
    Tool.prototype.getChunkAtMouse = function () {
        var worldMousePos = this.getWorldMousePos();
        return this.toolInfo.world.getChunkAtWorldPos(worldMousePos.x, worldMousePos.y);
    };
    Tool.prototype.tick = function () { console.error("Virtual method tick() called"); };
    return Tool;
}());
export { Tool };
//# sourceMappingURL=tool.js.map