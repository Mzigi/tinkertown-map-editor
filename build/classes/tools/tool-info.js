var ToolInfo = /** @class */ (function () {
    function ToolInfo(world, canvas, selectedTile, selectedLayer, setSelectedTile, setSelectedLayer) {
        this.world = world;
        this.camera = world.camera;
        this.canvas = canvas;
        this.selectedTile = selectedTile;
        this.selectedLayer = selectedLayer;
        this.setSelectedTile = setSelectedTile;
        this.setSelectedLayer = setSelectedLayer;
    }
    ToolInfo.prototype.update = function (world, selectedTile, selectedLayer, mouseButtonPressed, lastMouseButtonPressed) {
        this.world = world;
        this.camera = world.camera;
        this.selectedTile = selectedTile;
        this.selectedLayer = selectedLayer;
        this.mouseButtonPressed = mouseButtonPressed;
        this.lastMouseButtonPressed = lastMouseButtonPressed;
    };
    return ToolInfo;
}());
export { ToolInfo };
//# sourceMappingURL=tool-info.js.map