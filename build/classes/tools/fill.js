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
var Fill = /** @class */ (function (_super) {
    __extends(Fill, _super);
    function Fill(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        return _this;
    }
    Fill.prototype.objectIncludesTilePos = function (obj, x, y) {
        if (!obj[x]) {
            return false;
        }
        return obj[x][y];
    };
    Fill.prototype.tilePosIsValid = function (tilePos) {
        return (tilePos.x >= 0 && tilePos.x <= 9 && tilePos.y >= 0 && tilePos.y <= 9);
    };
    Fill.prototype.tick = function () {
        var _a, _b, _c, _d;
        //history info
        var didCreateNewChunk = false;
        var originalTiles = [];
        var replacementTiles = [];
        //main
        var ti = this.toolInfo;
        if (ti.selectedTool !== this.id)
            return;
        if (!ti.mouseButtonPressed[0])
            return;
        //if (ti.isHoveringOverObject) return
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
        //fill tool code
        var world = ti.world;
        //create new chunk if there is none
        if (chunkAtMouse == null) {
            didCreateNewChunk = true;
            var chunkPos = world.getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y);
            chunkAtMouse = new Chunk();
            chunkAtMouse.x = chunkPos.x;
            chunkAtMouse.y = chunkPos.y;
            chunkAtMouse.fillWithId(selectedTile);
            world.addChunk(chunkAtMouse);
        }
        else {
            tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
            var tileIdToFlood = -1;
            var layerIdToFlood = 0;
            var highestTile = null;
            if (selectedLayer > -1) {
                layerIdToFlood = selectedLayer;
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
                layerIdToFlood = highestZ;
            }
            if (!highestTile) {
                highestTile = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, layerIdToFlood);
            }
            tileIdToFlood = highestTile === null || highestTile === void 0 ? void 0 : highestTile.tileAssetId;
            if (!highestTile) {
                highestTile = { "x": tileAtMouse.x, "y": tileAtMouse.y, "z": layerIdToFlood, "tileAssetId": undefined };
                tileIdToFlood = undefined;
            }
            if (tileIdToFlood === ti.selectedTile) {
                return;
            }
            var openTiles = [highestTile];
            var closedTiles = {};
            while (openTiles.length > 0) {
                var currentTile = openTiles[0];
                if (currentTile.tileAssetId == tileIdToFlood && currentTile.z == layerIdToFlood) {
                    var replacementTile = new Tile();
                    replacementTile.x = currentTile.x;
                    replacementTile.y = currentTile.y;
                    replacementTile.z = layerIdToFlood;
                    replacementTile.tileAssetId = selectedTile;
                    var originalTile = chunkAtMouse.setTile(replacementTile);
                    replacementTiles.push(replacementTile);
                    if (originalTile) {
                        originalTiles.push(originalTile);
                    }
                    //west
                    var westTile = { "x": currentTile.x - 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined };
                    westTile.tileAssetId = (_a = chunkAtMouse.findTileAt(currentTile.x - 1, currentTile.y, currentTile.z)) === null || _a === void 0 ? void 0 : _a.tileAssetId;
                    if (this.tilePosIsValid(westTile)) {
                        if (!this.objectIncludesTilePos(closedTiles, westTile.x, westTile.y)) {
                            openTiles.push(westTile);
                            if (!closedTiles[westTile.x]) {
                                closedTiles[westTile.x] = {};
                            }
                            closedTiles[westTile.x][westTile.y] = true;
                        }
                    }
                    //east
                    var eastTile = { "x": currentTile.x + 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined };
                    eastTile.tileAssetId = (_b = chunkAtMouse.findTileAt(currentTile.x + 1, currentTile.y, currentTile.z)) === null || _b === void 0 ? void 0 : _b.tileAssetId;
                    if (this.tilePosIsValid(eastTile)) {
                        if (!this.objectIncludesTilePos(closedTiles, eastTile.x, eastTile.y)) {
                            openTiles.push(eastTile);
                            if (!closedTiles[eastTile.x]) {
                                closedTiles[eastTile.x] = {};
                            }
                            closedTiles[eastTile.x][eastTile.y] = true;
                        }
                    }
                    //north
                    var northTile = { "x": currentTile.x, "y": currentTile.y + 1, "z": currentTile.z, "tileAssetId": undefined };
                    northTile.tileAssetId = (_c = chunkAtMouse.findTileAt(currentTile.x, currentTile.y + 1, currentTile.z)) === null || _c === void 0 ? void 0 : _c.tileAssetId;
                    if (this.tilePosIsValid(northTile)) {
                        if (!this.objectIncludesTilePos(closedTiles, northTile.x, northTile.y)) {
                            openTiles.push(northTile);
                            if (!closedTiles[northTile.x]) {
                                closedTiles[northTile.x] = {};
                            }
                            closedTiles[northTile.x][northTile.y] = true;
                        }
                    }
                    //south
                    var southTile = { "x": currentTile.x, "y": currentTile.y - 1, "z": currentTile.z, "tileAssetId": undefined };
                    southTile.tileAssetId = (_d = chunkAtMouse.findTileAt(currentTile.x, currentTile.y - 1, currentTile.z)) === null || _d === void 0 ? void 0 : _d.tileAssetId;
                    if (this.tilePosIsValid(southTile)) {
                        if (!this.objectIncludesTilePos(closedTiles, southTile.x, southTile.y)) {
                            openTiles.push(southTile);
                            if (!closedTiles[southTile.x]) {
                                closedTiles[southTile.x] = {};
                            }
                            closedTiles[southTile.x][southTile.y] = true;
                        }
                    }
                }
                openTiles.splice(0, 1);
            }
        }
        //add to history stack
        var didChangeSomething = didCreateNewChunk || replacementTiles.length > 0 || originalTiles.length > 0;
        if (didChangeSomething) {
            var undo = function () {
                for (var _i = 0, replacementTiles_1 = replacementTiles; _i < replacementTiles_1.length; _i++) {
                    var replacementTile = replacementTiles_1[_i];
                    chunkAtMouse.removeTileAt(replacementTile.x, replacementTile.y, replacementTile.z);
                }
                for (var _a = 0, originalTiles_1 = originalTiles; _a < originalTiles_1.length; _a++) {
                    var originalTile = originalTiles_1[_a];
                    chunkAtMouse.setTile(originalTile);
                }
                if (didCreateNewChunk) {
                    ti.world.removeChunkAt(chunkAtMouse.x, chunkAtMouse.y);
                }
            };
            var redo = function () {
                if (didCreateNewChunk) {
                    ti.world.addChunk(chunkAtMouse);
                }
                for (var _i = 0, originalTiles_2 = originalTiles; _i < originalTiles_2.length; _i++) {
                    var originalTile = originalTiles_2[_i];
                    chunkAtMouse.removeTileAt(originalTile.x, originalTile.y, originalTile.z);
                }
                for (var _a = 0, replacementTiles_2 = replacementTiles; _a < replacementTiles_2.length; _a++) {
                    var replacementTile = replacementTiles_2[_a];
                    chunkAtMouse.setTile(replacementTile);
                }
            };
            ti.world.addHistory(new ToolHistory(undo, redo));
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return Fill;
}(Tool));
export { Fill };
//# sourceMappingURL=fill.js.map