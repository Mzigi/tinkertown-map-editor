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
import { ToolHistory } from "./tool-info.js";
import { Tool } from "./tool.js";
var Erase = /** @class */ (function (_super) {
    __extends(Erase, _super);
    function Erase(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        return _this;
    }
    Erase.prototype.tick = function () {
        //history info
        var removedTile = null;
        var removedStorage = null;
        var removedItem = null;
        //main
        var ti = this.toolInfo;
        var world = ti.world;
        if (ti.selectedTool !== this.id)
            return;
        if (!ti.mouseButtonPressed[0])
            return;
        var chunkAtMouse = this.getChunkAtMouse();
        var worldMousePos = this.getWorldMousePos();
        var tileAtMouse = null;
        if (chunkAtMouse) {
            tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
        }
        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y);
        }
        if (!ti.isHoveringOverObject) {
            if (tileAtMouse) {
                //check if tile was already just erased here
                var shouldPlaceAgain = true;
                if (this.lastChunkAtMouse && chunkAtMouse.x == this.lastChunkAtMouse.x && chunkAtMouse.y == this.lastChunkAtMouse.y) {
                    if (tileAtMouse.x == this.lastTileAtMouse.x && tileAtMouse.y == this.lastTileAtMouse.y) {
                        shouldPlaceAgain = false;
                    }
                }
                //delete the tile
                if (shouldPlaceAgain) {
                    var zPos = ti.selectedLayer;
                    var highestTile = null;
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
                    removedTile = chunkAtMouse.removeTileAt(tileAtMouse.x, tileAtMouse.y, zPos);
                }
            }
        }
        else if (ti.hoveredStorage) { //erase storage
            for (var i = 0; i < world.containers.length; i++) {
                if (world.containers[i] == ti.hoveredStorage) {
                    removedStorage = world.containers.splice(i, 1)[0];
                    break;
                }
            }
        }
        else if (ti.hoveredItem && chunkAtMouse) { //erase item
            for (var i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                if (chunkAtMouse.itemDataList[i] == ti.hoveredItem) {
                    removedItem = chunkAtMouse.itemDataList.splice(i, 1)[0];
                    chunkAtMouse.edited();
                    break;
                }
            }
        }
        //add to history stack
        var undo = null;
        var redo = null;
        if (removedTile) {
            undo = function () {
                chunkAtMouse.setTile(removedTile);
            };
            redo = function () {
                chunkAtMouse.removeTileAt(removedTile.x, removedTile.y, removedTile.z);
            };
        }
        if (removedStorage) {
            undo = function () {
                world.containers.push(removedStorage);
            };
            redo = function () {
                for (var i = 0; i < world.containers.length; i++) {
                    if (world.containers[i] == removedStorage) {
                        world.containers.splice(i, 1);
                        break;
                    }
                }
            };
        }
        if (removedItem) {
            undo = function () {
                chunkAtMouse.itemDataList.push(removedItem);
                chunkAtMouse.edited();
            };
            redo = function () {
                for (var i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                    if (chunkAtMouse.itemDataList[i] == removedItem) {
                        chunkAtMouse.itemDataList.splice(i, 1)[0];
                        chunkAtMouse.edited();
                        break;
                    }
                }
            };
        }
        if (undo) {
            world.addHistory(new ToolHistory(undo, redo));
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return Erase;
}(Tool));
export { Erase };
//# sourceMappingURL=erase.js.map