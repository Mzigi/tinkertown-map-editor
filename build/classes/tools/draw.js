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
import { Tool } from "./tool.js";
var Draw = /** @class */ (function (_super) {
    __extends(Draw, _super);
    function Draw(id, name) {
        var _this = _super.call(this, id, name) || this;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        return _this;
    }
    Draw.prototype.tick = function () {
        var selectedLayer = this.toolInfo.selectedLayer;
        var selectedTile = this.toolInfo.selectedTile;
        var chunkAtMouse = this.getChunkAtMouse();
        var worldMousePos = this.getWorldMousePos();
        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y);
        }
        //create new chunk if there is none
        if (chunkAtMouse == null) {
            var chunkPos = this.toolInfo.world.getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y);
            chunkAtMouse = new Chunk();
            chunkAtMouse.x = chunkPos.x;
            chunkAtMouse.y = chunkPos.y;
            this.toolInfo.world.addChunk(chunkAtMouse);
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
        if (tileAtMouse && shouldPlaceAgain || !this.toolInfo.lastMouseButtonPressed[0]) {
            var replacementTile = new Tile();
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
                    chunkAtMouse.setTile(replacementTile);
                }
            }
            else {
                chunkAtMouse.setTile(replacementTile);
            }
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return Draw;
}(Tool));
export { Draw };
//# sourceMappingURL=draw.js.map