var ToolHistory = /** @class */ (function () {
    function ToolHistory(undo, redo) {
        this.undo = undo;
        this.redo = redo;
    }
    return ToolHistory;
}());
export { ToolHistory };
var ToolInfo = /** @class */ (function () {
    function ToolInfo(world, canvas, selectedTile, selectedLayer, setSelectedTile, setSelectedLayer, editor, mouseButtonPressed, lastMouseButtonPressed, selectedTool, isHoveringOverObject) {
        this.world = world;
        this.camera = world.camera;
        this.canvas = canvas;
        this.selectedTile = selectedTile;
        this.selectedLayer = selectedLayer;
        this.setSelectedTile = setSelectedTile;
        this.setSelectedLayer = setSelectedLayer;
        this.editor = editor;
        this.mouseButtonPressed = mouseButtonPressed;
        this.lastMouseButtonPressed = lastMouseButtonPressed;
        this.selectedTool = selectedTool;
        this.isHoveringOverObject = isHoveringOverObject;
    }
    ToolInfo.prototype.update = function (world, selectedTile, selectedLayer, mouseButtonPressed, lastMouseButtonPressed, selectedTool, isHoveringOverObject, hoveredStorage, hoveredItem) {
        this.world = world;
        this.camera = world.camera;
        this.selectedTile = selectedTile;
        this.selectedLayer = selectedLayer;
        this.mouseButtonPressed = mouseButtonPressed;
        this.lastMouseButtonPressed = lastMouseButtonPressed;
        this.selectedTool = selectedTool;
        this.isHoveringOverObject = isHoveringOverObject;
        this.hoveredStorage = hoveredStorage;
        this.hoveredItem = hoveredItem;
    };
    return ToolInfo;
}());
export { ToolInfo };
//# sourceMappingURL=tool-info.js.map