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
import { Inventory, InventoryFormat } from "../objects/inventory.js";
import { ToolHistory } from "./tool-info.js";
import { Tool } from "./tool.js";
var AddContainer = /** @class */ (function (_super) {
    __extends(AddContainer, _super);
    function AddContainer(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        return _this;
    }
    AddContainer.prototype.tick = function () {
        //main
        var ti = this.toolInfo;
        var world = ti.world;
        if (ti.selectedTool !== this.id)
            return;
        if (!ti.mouseButtonPressed[0])
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
        var newContainer = null;
        //add container tool code
        if (chunkAtMouse) {
            if (tileAtMouse) {
                var alreadyPlaced = false;
                for (var i = 0; i < world.containers.length; i++) {
                    var container = world.containers[i];
                    if (container.x == tileAtMouse.x && container.y == tileAtMouse.y && container.chunkX == chunkAtMouse.x && container.chunkY == chunkAtMouse.y) {
                        alreadyPlaced = true;
                    }
                }
                var highestTile = null;
                var zPos = 0;
                if (ti.selectedLayer > -1) {
                    zPos = ti.selectedLayer;
                }
                else { //get highest layer if auto layer is on
                    var highestZ = 0;
                    for (var i = 0; i < chunkAtMouse.layers; i++) {
                        var testTile = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i);
                        if (chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i)) {
                            highestZ = i;
                            highestTile = testTile;
                        }
                    }
                    highestZ = Math.min(highestZ, chunkAtMouse.layers);
                    zPos = highestZ;
                }
                if (!alreadyPlaced) {
                    newContainer = new Inventory();
                    newContainer.chunkX = chunkAtMouse.x;
                    newContainer.chunkY = chunkAtMouse.y;
                    newContainer.x = tileAtMouse.x;
                    newContainer.y = tileAtMouse.y;
                    newContainer.z = zPos;
                    newContainer.target = InventoryFormat.Container;
                    world.containers.push(newContainer);
                }
            }
        }
        //add to history stack
        if (newContainer) {
            var undo = function () {
                for (var i = 0; i < world.containers.length; i++) {
                    if (world.containers[i] == newContainer) {
                        world.containers.splice(i, 1);
                        break;
                    }
                }
            };
            var redo = function () {
                world.containers.push(newContainer);
            };
            ti.world.addHistory(new ToolHistory(undo, redo));
            ti.setSelectedTool(7, ti.editor);
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return AddContainer;
}(Tool));
export { AddContainer };
//# sourceMappingURL=add-container.js.map