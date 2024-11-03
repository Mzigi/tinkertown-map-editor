var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Tool } from "./tool.js";
var ChunkTool = /** @class */ (function (_super) {
    __extends(ChunkTool, _super);
    function ChunkTool(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        return _this;
    }
    ChunkTool.prototype.tick = function () {
        //main
        var ti = this.toolInfo;
        var world = ti.world;
        if (ti.selectedTool !== this.id)
            return;
        if (ti.isHoveringOverObject)
            return;
        var selectedLayer = ti.selectedLayer;
        var selectedTile = ti.selectedTile;
        var chunkAtMouse = this.getChunkAtMouse();
        var worldMousePos = this.getWorldMousePos();
        var tileAtMouse = null;
        if (chunkAtMouse) {
            tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
        }
        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y);
        }
        //chunk tool code
        if (ti.mouseButtonPressed[0]) {
            if (!ti.lastMouseButtonPressed[0]) {
                if (chunkAtMouse) {
                    console.log("cli");
                }
            }
        }
        else {
            if (chunkAtMouse) {
                world.highlightedChunk = chunkAtMouse;
            }
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return ChunkTool;
}(Tool));
export { ChunkTool };
//# sourceMappingURL=chunk-tool.js.map