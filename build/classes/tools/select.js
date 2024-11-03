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
import { EventBinding } from "./event-binding.js";
import { ToolHistory } from "./tool-info.js";
import { Tool } from "./tool.js";
var SelectToolState;
(function (SelectToolState) {
    SelectToolState[SelectToolState["None"] = 0] = "None";
    SelectToolState[SelectToolState["Selecting"] = 1] = "Selecting";
    SelectToolState[SelectToolState["Selected"] = 2] = "Selected";
    SelectToolState[SelectToolState["Move"] = 3] = "Move";
})(SelectToolState || (SelectToolState = {}));
var MouseButtonState;
(function (MouseButtonState) {
    MouseButtonState[MouseButtonState["None"] = 0] = "None";
    MouseButtonState[MouseButtonState["Down"] = 1] = "Down";
    MouseButtonState[MouseButtonState["Held"] = 2] = "Held";
    MouseButtonState[MouseButtonState["Up"] = 3] = "Up";
})(MouseButtonState || (MouseButtonState = {}));
var SelectTool = /** @class */ (function (_super) {
    __extends(SelectTool, _super);
    function SelectTool(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.mouseDownStartPos = null;
        _this.selectToolState = SelectToolState.None;
        _this.originalSelection = null;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        _this.events = [
            new EventBinding("Delete", function (tool) {
                //history info
                var removedTiles = [];
                var removedContainers = [];
                var removedItems = [];
                //tool info
                var ti = tool.toolInfo;
                var world = ti.world;
                var selectedLayer = ti.selectedLayer;
                //main
                var lowX = Math.min(world.selection[0].x, world.selection[1].x);
                var highX = Math.max(world.selection[0].x, world.selection[1].x);
                var lowY = Math.min(world.selection[0].y, world.selection[1].y);
                var highY = Math.max(world.selection[0].y, world.selection[1].y);
                var lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0];
                var highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0];
                //delete tiles in selection
                removedTiles = tool.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world);
                //delete containers in selection
                removedContainers = tool.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world);
                //delete items in selection
                removedItems = tool.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world);
                //add to history stack
                var undoInstructions = [];
                var redoInstructions = [];
                //tile and chunk
                if (removedTiles.length > 0) {
                    undoInstructions.push(function () {
                        for (var _i = 0, removedTiles_1 = removedTiles; _i < removedTiles_1.length; _i++) {
                            var removedTileInfo = removedTiles_1[_i];
                            var removedTile = removedTileInfo[0];
                            var removedTilePos = removedTileInfo[1];
                            world.setTileAtGlobalPos(removedTile, removedTilePos.x, removedTilePos.y);
                        }
                    });
                    redoInstructions.push(function () {
                        for (var _i = 0, removedTiles_2 = removedTiles; _i < removedTiles_2.length; _i++) {
                            var removedTileInfo = removedTiles_2[_i];
                            var removedTilePos = removedTileInfo[1];
                            world.removeTileAtGlobalPos(removedTilePos.x, removedTilePos.y, removedTilePos.z);
                        }
                    });
                }
                //items
                if (removedItems.length > 0) {
                    undoInstructions.push(function () {
                        for (var _i = 0, removedItems_1 = removedItems; _i < removedItems_1.length; _i++) {
                            var removedItem = removedItems_1[_i];
                            world.setItem(removedItem);
                        }
                    });
                    redoInstructions.push(function () {
                        for (var _i = 0, removedItems_2 = removedItems; _i < removedItems_2.length; _i++) {
                            var removedItem = removedItems_2[_i];
                            var chunk = world.getChunkAt(removedItem.chunkX, removedItem.chunkY);
                            if (chunk) {
                                for (var i = 0; i < chunk.itemDataList.length; i++) {
                                    var item = chunk.itemDataList[i];
                                    if (item == removedItem) {
                                        chunk.itemDataList.splice(i, 1);
                                        chunk.edited();
                                    }
                                }
                            }
                        }
                    });
                }
                //containers
                if (removedContainers.length > 0) {
                    undoInstructions.push(function () {
                        for (var _i = 0, removedContainers_1 = removedContainers; _i < removedContainers_1.length; _i++) {
                            var removedContainer = removedContainers_1[_i];
                            world.containers.push(removedContainer);
                        }
                    });
                    redoInstructions.push(function () {
                        for (var _i = 0, removedContainers_2 = removedContainers; _i < removedContainers_2.length; _i++) {
                            var removedContainer = removedContainers_2[_i];
                            for (var i = 0; i < world.containers.length; i++) {
                                var container = world.containers[i];
                                if (container == removedContainer) {
                                    world.containers.splice(i, 1);
                                }
                            }
                        }
                    });
                }
                //undo/redo final
                if (undoInstructions.length > 0) {
                    var undo = function () {
                        for (var _i = 0, undoInstructions_1 = undoInstructions; _i < undoInstructions_1.length; _i++) {
                            var undoInstruction = undoInstructions_1[_i];
                            undoInstruction();
                        }
                    };
                    var redo = function () {
                        for (var _i = 0, redoInstructions_1 = redoInstructions; _i < redoInstructions_1.length; _i++) {
                            var redoInstruction = redoInstructions_1[_i];
                            redoInstruction();
                        }
                    };
                    ti.world.addHistory(new ToolHistory(undo, redo));
                }
                //remove selection
                world.selection = [];
                tool.selectToolState = SelectToolState.None;
            })
        ];
        return _this;
    }
    SelectTool.prototype.removeTilesInSelection = function (lowX, highX, lowY, highY, selectedLayer, world) {
        var removedTiles = [];
        for (var x = lowX; x <= highX; x++) {
            for (var y = lowY; y <= highY; y++) {
                if (selectedLayer === -1) { //layer auto
                    var tempRemovedTiles = world.removeTilesAtGlobalPosXY(x, y);
                    for (var _i = 0, tempRemovedTiles_1 = tempRemovedTiles; _i < tempRemovedTiles_1.length; _i++) {
                        var removedTile = tempRemovedTiles_1[_i];
                        removedTiles.push([removedTile, { "x": x, "y": y, "z": removedTile.z }]);
                    }
                }
                else {
                    var removedTile = world.removeTileAtGlobalPos(x, y, selectedLayer);
                    if (removedTile) {
                        removedTiles.push([removedTile, { "x": x, "y": y, "z": removedTile.z }]);
                    }
                }
            }
        }
        return removedTiles;
    };
    SelectTool.prototype.removeContainersInSelection = function (lowX, highX, lowY, highY, selectedLayer, world) {
        var removedContainers = [];
        for (var i = 0; i < world.containers.length; i++) {
            var container = world.containers[i];
            if (container.z === selectedLayer || selectedLayer === -1) {
                var globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y);
                if (globalPos.x >= lowX && globalPos.x <= highX && globalPos.y >= lowY && globalPos.y <= highY) {
                    var removedContainer = world.containers.splice(i, 1)[0];
                    removedContainers.push(removedContainer);
                    i--;
                }
            }
        }
        return removedContainers;
    };
    SelectTool.prototype.removeItemsInSelection = function (lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world) {
        var removedItems = [];
        if (selectedLayer !== -1) {
            return removedItems;
        }
        for (var chunkX = lowChunkPos.x; chunkX <= highChunkPos.x; chunkX++) {
            for (var chunkY = lowChunkPos.y; chunkY <= highChunkPos.y; chunkY++) {
                var chunk = world.getChunkAt(chunkX, chunkY);
                if (chunk) {
                    for (var i = 0; i < chunk.itemDataList.length; i++) {
                        var item = chunk.itemDataList[i];
                        var itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(chunkX, chunkY, item.x, item.y);
                        if (itemGlobalPos.x > lowX && itemGlobalPos.x <= highX && itemGlobalPos.y > lowY && itemGlobalPos.y <= highY) {
                            var removedItem = chunk.itemDataList.splice(i, 1)[0];
                            removedItems.push(removedItem);
                            chunk.edited();
                            i--;
                        }
                    }
                }
            }
        }
        return removedItems;
    };
    SelectTool.prototype.tick = function () {
        //history info
        var removedTiles = [];
        var addedTiles = [];
        var createdChunks = [];
        var removedItems = [];
        var addedItems = [];
        var removedContainers = [];
        var addedContainers = [];
        //main
        var ti = this.toolInfo;
        var world = ti.world;
        if (ti.selectedTool !== this.id) {
            this.selectToolState = SelectToolState.None;
            return;
        }
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
        var newItem = null;
        //select tool code
        var camera = world.camera;
        var isMouseButtonPressed = ti.mouseButtonPressed[0];
        var lastMouseButtonPressed = ti.lastMouseButtonPressed;
        var globalMousePos = { "x": Math.floor(worldMousePos.x / 16), "y": Math.floor((worldMousePos.y / 16) * -1) };
        //let chunkAndTilePos = worlds[currentWorld].getChunkAndTilePosAtGlobalPos(worldMousePos.x / 16, (worldMousePos.y / 16) * -1)
        var mouseIsInSelection = false;
        var mouseButtonState = MouseButtonState.None;
        if (isMouseButtonPressed && !lastMouseButtonPressed[0])
            mouseButtonState = MouseButtonState.Down;
        if (isMouseButtonPressed && lastMouseButtonPressed[0])
            mouseButtonState = MouseButtonState.Held;
        if (!isMouseButtonPressed && lastMouseButtonPressed[0])
            mouseButtonState = MouseButtonState.Up;
        if (world.selection.length == 2) {
            var lowX = Math.min(world.selection[0].x, world.selection[1].x);
            var highX = Math.max(world.selection[0].x, world.selection[1].x);
            var lowY = Math.min(world.selection[0].y, world.selection[1].y);
            var highY = Math.max(world.selection[0].y, world.selection[1].y);
            if (globalMousePos.x >= lowX && globalMousePos.x <= highX && globalMousePos.y >= lowY && globalMousePos.y <= highY) {
                mouseIsInSelection = true;
            }
        }
        //logic
        switch (mouseButtonState) {
            case MouseButtonState.None:
                if (this.selectToolState == SelectToolState.Selected && mouseIsInSelection) {
                    document.getElementById("2Dcanvas").style.cursor = "move";
                }
                break;
            case MouseButtonState.Down:
                this.mouseDownStartPos = globalMousePos;
                switch (this.selectToolState) {
                    case SelectToolState.None:
                        this.selectToolState = SelectToolState.Selecting;
                        break;
                    case SelectToolState.Selected:
                        if (mouseIsInSelection) {
                            this.selectToolState = SelectToolState.Move;
                            this.originalSelection = [{ "x": world.selection[0].x, "y": world.selection[0].y }, { "x": world.selection[1].x, "y": world.selection[1].y }];
                        }
                        else {
                            this.selectToolState = SelectToolState.None;
                        }
                        break;
                }
                break;
            case MouseButtonState.Held:
                switch (this.selectToolState) {
                    case SelectToolState.None:
                        if (this.mouseDownStartPos && this.mouseDownStartPos.x !== globalMousePos.x && this.mouseDownStartPos.y !== globalMousePos.y) {
                            this.selectToolState = SelectToolState.Selecting;
                        }
                        break;
                }
                break;
            case MouseButtonState.Up:
                switch (this.selectToolState) {
                    case SelectToolState.Selecting:
                        this.selectToolState = SelectToolState.Selected;
                        break;
                    case SelectToolState.Move:
                        console.log("MOVING SELECTION");
                        console.log(this.originalSelection);
                        console.log(world.selection);
                        //calulate stuff
                        var lowXold = Math.min(this.originalSelection[0].x, this.originalSelection[1].x);
                        var highXold = Math.max(this.originalSelection[0].x, this.originalSelection[1].x);
                        var lowYold = Math.min(this.originalSelection[0].y, this.originalSelection[1].y);
                        var highYold = Math.max(this.originalSelection[0].y, this.originalSelection[1].y);
                        var lowX = Math.min(world.selection[0].x, world.selection[1].x);
                        var highX = Math.max(world.selection[0].x, world.selection[1].x);
                        var lowY = Math.min(world.selection[0].y, world.selection[1].y);
                        var highY = Math.max(world.selection[0].y, world.selection[1].y);
                        var lowChunkPosOld = world.getChunkAndTilePosAtGlobalPos(lowXold, lowYold)[0];
                        var highChunkPosOld = world.getChunkAndTilePosAtGlobalPos(highXold, highYold)[0];
                        var lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0];
                        var highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0];
                        var xDiff = lowX - lowXold;
                        var yDiff = lowY - lowYold;
                        //get all tiles to copy and delete them
                        var tilesToCopy = [];
                        var tempOldTiles = this.removeTilesInSelection(lowXold, highXold, lowYold, highYold, selectedLayer, world);
                        for (var _i = 0, tempOldTiles_1 = tempOldTiles; _i < tempOldTiles_1.length; _i++) {
                            var tileInfo = tempOldTiles_1[_i];
                            var tile = tileInfo[0];
                            var globalTilePos = tileInfo[1];
                            tilesToCopy.push([tile.clone(), { "x": globalTilePos.x, "y": globalTilePos.y }]);
                            removedTiles.push([tile, { "x": globalTilePos.x, "y": globalTilePos.y, "z": tile.z }]);
                        }
                        //delete tiles in new area
                        var tempTiles = this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world);
                        for (var _a = 0, tempTiles_1 = tempTiles; _a < tempTiles_1.length; _a++) {
                            var tileInfo = tempTiles_1[_a];
                            var tile = tileInfo[0];
                            var globalTilePos = tileInfo[1];
                            removedTiles.push([tile, { "x": globalTilePos.x, "y": globalTilePos.y, "z": tile.z }]);
                        }
                        //put the old tiles in the new place
                        for (var _b = 0, tilesToCopy_1 = tilesToCopy; _b < tilesToCopy_1.length; _b++) {
                            var tileInfo = tilesToCopy_1[_b];
                            var tile = tileInfo[0];
                            var tileGlobalPos = { "x": tileInfo[1].x + xDiff, "y": tileInfo[1].y + yDiff };
                            var chunkAddedInfo = world.setTileAtGlobalPos(tile, tileGlobalPos.x, tileGlobalPos.y);
                            addedTiles.push([tile, chunkAddedInfo[0]]);
                            if (chunkAddedInfo[1]) {
                                createdChunks.push(chunkAddedInfo[0]);
                            }
                        }
                        //move items
                        var itemsToCopy = [];
                        //copy and delete old items
                        var tempOldItems = this.removeItemsInSelection(lowChunkPosOld, highChunkPosOld, lowXold, highXold, lowYold, highYold, selectedLayer, world);
                        for (var _c = 0, tempOldItems_1 = tempOldItems; _c < tempOldItems_1.length; _c++) {
                            var item = tempOldItems_1[_c];
                            var itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y);
                            itemsToCopy.push([item.clone(), itemGlobalPos]);
                            removedItems.push(item);
                        }
                        //delete items in new area
                        var tempItems = this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world);
                        for (var _d = 0, tempItems_1 = tempItems; _d < tempItems_1.length; _d++) {
                            var item = tempItems_1[_d];
                            removedItems.push(item);
                        }
                        //put old items in new area
                        for (var _e = 0, itemsToCopy_1 = itemsToCopy; _e < itemsToCopy_1.length; _e++) {
                            var itemInfo = itemsToCopy_1[_e];
                            var item = itemInfo[0];
                            var newGlobalPos = { "x": itemInfo[1].x + xDiff, "y": itemInfo[1].y + yDiff };
                            var chunkAndTilePos = world.getChunkAndTilePosAtGlobalPos(newGlobalPos.x, newGlobalPos.y);
                            var chunkPos = chunkAndTilePos[0];
                            var tilePos = chunkAndTilePos[1];
                            item.chunkX = chunkPos.x;
                            item.chunkY = chunkPos.y;
                            item.x = tilePos.x;
                            item.y = tilePos.y;
                            world.setItem(item);
                            addedItems.push(item);
                        }
                        //containers
                        var containersToCopy = [];
                        //copy and delete containers in old area
                        var tempOldContainers = this.removeContainersInSelection(lowXold, highXold, lowYold, highYold, selectedLayer, world);
                        for (var _f = 0, tempOldContainers_1 = tempOldContainers; _f < tempOldContainers_1.length; _f++) {
                            var container = tempOldContainers_1[_f];
                            var globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y);
                            containersToCopy.push([container.clone(), globalPos]);
                            removedContainers.push(container);
                        }
                        //delete containers in new area
                        var tempContainers = this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world);
                        for (var _g = 0, tempContainers_1 = tempContainers; _g < tempContainers_1.length; _g++) {
                            var container = tempContainers_1[_g];
                            removedContainers.push(container);
                        }
                        //put containers in new are
                        for (var _h = 0, containersToCopy_1 = containersToCopy; _h < containersToCopy_1.length; _h++) {
                            var containerInfo = containersToCopy_1[_h];
                            var container = containerInfo[0];
                            var newGlobalPos = { "x": containerInfo[1].x + xDiff, "y": containerInfo[1].y + yDiff };
                            var chunkAndTilePos = world.getChunkAndTilePosAtGlobalPos(newGlobalPos.x, newGlobalPos.y);
                            var chunkPos = chunkAndTilePos[0];
                            var tilePos = chunkAndTilePos[1];
                            container.chunkX = chunkPos.x;
                            container.chunkY = chunkPos.y;
                            container.x = tilePos.x;
                            container.y = tilePos.y;
                            world.containers.push(container);
                            addedContainers.push(container);
                        }
                        this.selectToolState = SelectToolState.None;
                        break;
                }
                break;
        }
        //update selection
        if (this.selectToolState === SelectToolState.Selecting) {
            if (!world.selection[0]) {
                world.selection[0] = this.mouseDownStartPos;
            }
            world.selection[1] = globalMousePos;
        }
        //remove seletion when click outside
        if (this.selectToolState === SelectToolState.None) {
            world.selection = [];
        }
        //move selection
        if (this.selectToolState === SelectToolState.Move) {
            var xOffset = globalMousePos.x - this.mouseDownStartPos.x;
            var yOffset = globalMousePos.y - this.mouseDownStartPos.y;
            world.selection[0] = { "x": this.originalSelection[0].x + xOffset, "y": this.originalSelection[0].y + yOffset };
            world.selection[1] = { "x": this.originalSelection[1].x + xOffset, "y": this.originalSelection[1].y + yOffset };
            document.getElementById("2Dcanvas").style.cursor = "move";
        }
        //add to history stack
        var undoInstructions = [];
        var redoInstructions = [];
        //tile and chunk
        if (removedTiles.length > 0 || addedTiles.length > 0 || createdChunks.length > 0) {
            undoInstructions.push(function () {
                for (var _i = 0, addedTiles_1 = addedTiles; _i < addedTiles_1.length; _i++) {
                    var addedTileInfo = addedTiles_1[_i];
                    var tileChunk = addedTileInfo[1];
                    var tile = addedTileInfo[0];
                    tileChunk.removeTileAt(tile.x, tile.y, tile.z);
                }
                for (var _a = 0, removedTiles_3 = removedTiles; _a < removedTiles_3.length; _a++) {
                    var removedTileInfo = removedTiles_3[_a];
                    var removedTile = removedTileInfo[0];
                    var removedTilePos = removedTileInfo[1];
                    world.setTileAtGlobalPos(removedTile, removedTilePos.x, removedTilePos.y);
                }
                for (var _b = 0, createdChunks_1 = createdChunks; _b < createdChunks_1.length; _b++) {
                    var createdChunk = createdChunks_1[_b];
                    world.removeChunkAt(createdChunk.x, createdChunk.y);
                }
            });
            redoInstructions.push(function () {
                for (var _i = 0, createdChunks_2 = createdChunks; _i < createdChunks_2.length; _i++) {
                    var createdChunk = createdChunks_2[_i];
                    world.addChunk(createdChunk);
                }
                for (var _a = 0, removedTiles_4 = removedTiles; _a < removedTiles_4.length; _a++) {
                    var removedTileInfo = removedTiles_4[_a];
                    var removedTilePos = removedTileInfo[1];
                    world.removeTileAtGlobalPos(removedTilePos.x, removedTilePos.y, removedTilePos.z);
                }
                for (var _b = 0, addedTiles_2 = addedTiles; _b < addedTiles_2.length; _b++) {
                    var addedTileInfo = addedTiles_2[_b];
                    var tileChunk = addedTileInfo[1];
                    var tile = addedTileInfo[0];
                    tileChunk.setTile(tile);
                }
            });
        }
        //items
        if (removedItems.length > 0 || addedItems.length > 0) {
            undoInstructions.push(function () {
                for (var _i = 0, addedItems_1 = addedItems; _i < addedItems_1.length; _i++) {
                    var addedItem = addedItems_1[_i];
                    var chunk = world.getChunkAt(addedItem.chunkX, addedItem.chunkY);
                    if (chunk) {
                        for (var i = 0; i < chunk.itemDataList.length; i++) {
                            var item = chunk.itemDataList[i];
                            if (item == addedItem) {
                                chunk.itemDataList.splice(i, 1);
                                chunk.edited();
                            }
                        }
                    }
                }
                for (var _a = 0, removedItems_3 = removedItems; _a < removedItems_3.length; _a++) {
                    var removedItem = removedItems_3[_a];
                    world.setItem(removedItem);
                }
            });
            redoInstructions.push(function () {
                for (var _i = 0, removedItems_4 = removedItems; _i < removedItems_4.length; _i++) {
                    var removedItem = removedItems_4[_i];
                    var chunk = world.getChunkAt(removedItem.chunkX, removedItem.chunkY);
                    if (chunk) {
                        for (var i = 0; i < chunk.itemDataList.length; i++) {
                            var item = chunk.itemDataList[i];
                            if (item == removedItem) {
                                chunk.itemDataList.splice(i, 1);
                                chunk.edited();
                            }
                        }
                    }
                }
                for (var _a = 0, addedItems_2 = addedItems; _a < addedItems_2.length; _a++) {
                    var addedItem = addedItems_2[_a];
                    world.setItem(addedItem);
                }
            });
        }
        //containers
        if (removedContainers.length > 0 || addedContainers.length > 0) {
            undoInstructions.push(function () {
                for (var _i = 0, addedContainers_1 = addedContainers; _i < addedContainers_1.length; _i++) {
                    var addedContainer = addedContainers_1[_i];
                    for (var i = 0; i < world.containers.length; i++) {
                        var container = world.containers[i];
                        if (container == addedContainer) {
                            world.containers.splice(i, 1);
                        }
                    }
                }
                for (var _a = 0, removedContainers_3 = removedContainers; _a < removedContainers_3.length; _a++) {
                    var removedContainer = removedContainers_3[_a];
                    world.containers.push(removedContainer);
                }
            });
            redoInstructions.push(function () {
                for (var _i = 0, removedContainers_4 = removedContainers; _i < removedContainers_4.length; _i++) {
                    var removedContainer = removedContainers_4[_i];
                    for (var i = 0; i < world.containers.length; i++) {
                        var container = world.containers[i];
                        if (container == removedContainer) {
                            world.containers.splice(i, 1);
                        }
                    }
                }
                for (var _a = 0, addedContainers_2 = addedContainers; _a < addedContainers_2.length; _a++) {
                    var addedContainer = addedContainers_2[_a];
                    world.containers.push(addedContainer);
                }
            });
        }
        //undo/redo final
        if (undoInstructions.length > 0) {
            var undo = function () {
                for (var _i = 0, undoInstructions_2 = undoInstructions; _i < undoInstructions_2.length; _i++) {
                    var undoInstruction = undoInstructions_2[_i];
                    undoInstruction();
                }
            };
            var redo = function () {
                for (var _i = 0, redoInstructions_2 = redoInstructions; _i < redoInstructions_2.length; _i++) {
                    var redoInstruction = redoInstructions_2[_i];
                    redoInstruction();
                }
            };
            ti.world.addHistory(new ToolHistory(undo, redo));
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return SelectTool;
}(Tool));
export { SelectTool };
//# sourceMappingURL=select.js.map