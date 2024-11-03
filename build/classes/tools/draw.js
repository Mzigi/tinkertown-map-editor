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
import { Chunk } from "../objects/chunk.js";
import { Tile } from "../objects/tile.js";
import { ToolHistory } from "./tool-info.js";
import { Tool } from "./tool.js";
var Draw = /** @class */ (function (_super) {
    __extends(Draw, _super);
    function Draw(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        return _this;
    }
    Draw.prototype.tick = function () {
        //history info
        var didCreateNewChunk = false;
        var originalTile = null;
        var didChangeSomething = false;
        //main
        var ti = this.toolInfo;
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
        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y);
        }
        //create new chunk if there is none
        if (chunkAtMouse == null) {
            didCreateNewChunk = true;
            didChangeSomething = true;
            var chunkPos = ti.world.getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y);
            chunkAtMouse = new Chunk();
            chunkAtMouse.x = chunkPos.x;
            chunkAtMouse.y = chunkPos.y;
            ti.world.addChunk(chunkAtMouse);
        }
        var tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
        //check if tile was already just placed here
        var shouldPlaceAgain = true;
        if (this.lastChunkAtMouse && chunkAtMouse.x == this.lastChunkAtMouse.x && chunkAtMouse.y == this.lastChunkAtMouse.y) {
            if (tileAtMouse.x == this.lastTileAtMouse.x && tileAtMouse.y == this.lastTileAtMouse.y) {
                shouldPlaceAgain = false;
            }
        }
        //replace the tile with the selected one
        var replacementTile = null;
        if (tileAtMouse && shouldPlaceAgain || !ti.lastMouseButtonPressed[0]) {
            replacementTile = new Tile();
            replacementTile.x = tileAtMouse.x;
            replacementTile.y = tileAtMouse.y;
            replacementTile.tileAssetId = selectedTile;
            var highestTile = null;
            if (selectedLayer > -1) {
                replacementTile.z = selectedLayer;
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
                if (highestTile) {
                    highestZ += 1;
                }
                highestZ = Math.min(highestZ, chunkAtMouse.layers);
                replacementTile.z = highestZ;
            }
            //make sure same tile type arent placed on top of eachother
            if (highestTile) {
                if (highestTile.tileAssetId != replacementTile.tileAssetId) {
                    originalTile = chunkAtMouse.setTile(replacementTile);
                    didChangeSomething = true;
                }
            }
            else {
                originalTile = chunkAtMouse.setTile(replacementTile);
                didChangeSomething = true;
            }
        }
        //add to history stack
        if (didChangeSomething) {
            var undo = function () {
                if (originalTile) {
                    chunkAtMouse.setTile(originalTile);
                }
                else if (replacementTile) {
                    chunkAtMouse.removeTileAt(replacementTile.x, replacementTile.y, replacementTile.z);
                }
                if (didCreateNewChunk) {
                    ti.world.removeChunkAt(chunkAtMouse.x, chunkAtMouse.y);
                }
            };
            var redo = function () {
                if (didCreateNewChunk) {
                    ti.world.addChunk(chunkAtMouse);
                }
                if (replacementTile) {
                    chunkAtMouse.setTile(replacementTile);
                }
            };
            ti.world.addHistory(new ToolHistory(undo, redo));
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return Draw;
}(Tool));
export { Draw };
//# sourceMappingURL=draw.js.map