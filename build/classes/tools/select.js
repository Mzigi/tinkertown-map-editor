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
    SelectToolState[SelectToolState["Paste"] = 4] = "Paste";
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
                tool.onDelete();
            }),
            new EventBinding("Copy", function (tool) {
                tool.onCopy(false);
            }),
            new EventBinding("Cut", function (tool) {
                tool.onCopy(true);
            }),
            new EventBinding("Paste", function (tool) {
                tool.onPaste();
            })
        ];
        return _this;
    }
    SelectTool.prototype.onPaste = function () {
        //tool info
        var ti = this.toolInfo;
        var world = ti.world;
        var selectedLayer = ti.selectedLayer;
        //main
        if (ti.selectedTool !== this.id)
            return;
        if (!this.clipboard)
            return;
        this.selectToolState = SelectToolState.Paste;
        console.log("starting paste");
    };
    SelectTool.prototype.onCopy = function (shouldRemove) {
        if (shouldRemove === void 0) { shouldRemove = false; }
        //tool info
        var ti = this.toolInfo;
        var world = ti.world;
        var selectedLayer = ti.selectedLayer;
        //main
        if (ti.selectedTool !== this.id) {
            this.clipboard = null;
            return;
        }
        if (world.selection.length < 2)
            return;
        var lowX = Math.min(world.selection[0].x, world.selection[1].x);
        var highX = Math.max(world.selection[0].x, world.selection[1].x);
        var lowY = Math.min(world.selection[0].y, world.selection[1].y);
        var highY = Math.max(world.selection[0].y, world.selection[1].y);
        var lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0];
        var highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0];
        //TILES
        //copy & remove tiles
        var tilesToCopyAndRemoved = this.getTilesToCopyAndRemoved(lowX, highX, lowY, highY, selectedLayer, world, shouldRemove);
        var tilesToCopy = tilesToCopyAndRemoved[0];
        var removedTiles = tilesToCopyAndRemoved[1];
        //ITEMS
        //copy & remove items
        var itemsToCopyAndRemove = this.getItemsToCopyAndRemoved(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world, shouldRemove);
        var itemsToCopy = itemsToCopyAndRemove[0];
        var removedItems = itemsToCopyAndRemove[1];
        //CONTAINERS
        //copy & remove containers
        var containersToCopyAndRemove = this.getContainersToCopyAndRemoved(lowX, highX, lowY, highY, selectedLayer, world, shouldRemove);
        var containersToCopy = containersToCopyAndRemove[0];
        var removedContainers = containersToCopyAndRemove[1];
        if (shouldRemove) {
            //add to history stack
            var undoInstructions_1 = [];
            var redoInstructions_1 = [];
            if (removedTiles.length > 0 || removedItems.length > 0 || removedContainers.length > 0) {
                //tile and chunk
                undoInstructions_1.push(this.getRemovedTileUndoInstruction(removedTiles, world));
                redoInstructions_1.push(this.getRemovedTileRedoInstruction(removedTiles, world));
                //items
                undoInstructions_1.push(this.getRemovedItemsUndoInstruction(removedItems, world));
                redoInstructions_1.push(this.getRemovedItemsRedoInstruction(removedItems, world));
                //containers
                undoInstructions_1.push(this.getRemovedContainersUndoInstruction(removedContainers, world));
                redoInstructions_1.push(this.getRemovedContainersRedoInstruction(removedContainers, world));
                //undo/redo final
                if (undoInstructions_1.length > 0) {
                    var undo = function () {
                        for (var _i = 0, undoInstructions_2 = undoInstructions_1; _i < undoInstructions_2.length; _i++) {
                            var undoInstruction = undoInstructions_2[_i];
                            undoInstruction();
                        }
                    };
                    var redo = function () {
                        for (var _i = 0, redoInstructions_2 = redoInstructions_1; _i < redoInstructions_2.length; _i++) {
                            var redoInstruction = redoInstructions_2[_i];
                            redoInstruction();
                        }
                    };
                    ti.world.addHistory(new ToolHistory(undo, redo));
                }
            }
        }
        this.clipboard = {
            "tilesToCopy": this.cloneTilesToCopy(tilesToCopy),
            "itemsToCopy": this.cloneItemsToCopy(itemsToCopy),
            "containersToCopy": this.cloneContainersToCopy(containersToCopy),
            "lowX": lowX,
            "lowY": lowY,
            "highX": highX,
            "highY": highY,
            "width": highX - lowX,
            "height": highY - lowY
        };
        this.selectToolState = SelectToolState.None;
        world.selection = [];
    };
    SelectTool.prototype.onDelete = function () {
        //history info
        var removedTiles = [];
        var removedContainers = [];
        var removedItems = [];
        //tool info
        var ti = this.toolInfo;
        var world = ti.world;
        var selectedLayer = ti.selectedLayer;
        if (ti.selectedTool !== this.id)
            return;
        if (world.selection.length < 2)
            return;
        //main
        var lowX = Math.min(world.selection[0].x, world.selection[1].x);
        var highX = Math.max(world.selection[0].x, world.selection[1].x);
        var lowY = Math.min(world.selection[0].y, world.selection[1].y);
        var highY = Math.max(world.selection[0].y, world.selection[1].y);
        var lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0];
        var highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0];
        //delete tiles in selection
        removedTiles = this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world);
        //delete containers in selection
        removedContainers = this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world);
        //delete items in selection
        removedItems = this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world);
        //add to history stack
        var undoInstructions = [];
        var redoInstructions = [];
        if (removedTiles.length > 0 || removedItems.length > 0 || removedContainers.length > 0) {
            //tile and chunk
            undoInstructions.push(this.getRemovedTileUndoInstruction(removedTiles, world));
            redoInstructions.push(this.getRemovedTileRedoInstruction(removedTiles, world));
            //items
            undoInstructions.push(this.getRemovedItemsUndoInstruction(removedItems, world));
            redoInstructions.push(this.getRemovedItemsRedoInstruction(removedItems, world));
            //containers
            undoInstructions.push(this.getRemovedContainersUndoInstruction(removedContainers, world));
            redoInstructions.push(this.getRemovedContainersRedoInstruction(removedContainers, world));
            //undo/redo final
            if (undoInstructions.length > 0) {
                var undo = function () {
                    for (var _i = 0, undoInstructions_3 = undoInstructions; _i < undoInstructions_3.length; _i++) {
                        var undoInstruction = undoInstructions_3[_i];
                        undoInstruction();
                    }
                };
                var redo = function () {
                    for (var _i = 0, redoInstructions_3 = redoInstructions; _i < redoInstructions_3.length; _i++) {
                        var redoInstruction = redoInstructions_3[_i];
                        redoInstruction();
                    }
                };
                ti.world.addHistory(new ToolHistory(undo, redo));
            }
        }
        //remove selection
        world.selection = [];
        this.selectToolState = SelectToolState.None;
    };
    SelectTool.prototype.getAddedTilesUndoInstruction = function (addedTiles) {
        return function () {
            for (var _i = 0, addedTiles_1 = addedTiles; _i < addedTiles_1.length; _i++) {
                var addedTileInfo = addedTiles_1[_i];
                var tileChunk = addedTileInfo[1];
                var tile = addedTileInfo[0];
                tileChunk.removeTileAt(tile.x, tile.y, tile.z);
            }
        };
    };
    SelectTool.prototype.getRemovedTileUndoInstruction = function (removedTiles, world) {
        return function () {
            for (var _i = 0, removedTiles_1 = removedTiles; _i < removedTiles_1.length; _i++) {
                var removedTileInfo = removedTiles_1[_i];
                var removedTile = removedTileInfo[0];
                var removedTilePos = removedTileInfo[1];
                world.setTileAtGlobalPos(removedTile, removedTilePos.x, removedTilePos.y);
            }
        };
    };
    SelectTool.prototype.getCreatedChunksUndoInstruction = function (createdChunks, world) {
        return function () {
            for (var _i = 0, createdChunks_1 = createdChunks; _i < createdChunks_1.length; _i++) {
                var createdChunk = createdChunks_1[_i];
                world.removeChunkAt(createdChunk.x, createdChunk.y);
            }
        };
    };
    SelectTool.prototype.getCreatedChunksRedoInstruction = function (createdChunks, world) {
        return function () {
            for (var _i = 0, createdChunks_2 = createdChunks; _i < createdChunks_2.length; _i++) {
                var createdChunk = createdChunks_2[_i];
                world.addChunk(createdChunk);
            }
        };
    };
    SelectTool.prototype.getRemovedTileRedoInstruction = function (removedTiles, world) {
        return function () {
            for (var _i = 0, removedTiles_2 = removedTiles; _i < removedTiles_2.length; _i++) {
                var removedTileInfo = removedTiles_2[_i];
                var removedTilePos = removedTileInfo[1];
                world.removeTileAtGlobalPos(removedTilePos.x, removedTilePos.y, removedTilePos.z);
            }
        };
    };
    SelectTool.prototype.getAddedTilesRedoInstruction = function (addedTiles) {
        return function () {
            for (var _i = 0, addedTiles_2 = addedTiles; _i < addedTiles_2.length; _i++) {
                var addedTileInfo = addedTiles_2[_i];
                var tileChunk = addedTileInfo[1];
                var tile = addedTileInfo[0];
                tileChunk.setTile(tile);
            }
        };
    };
    SelectTool.prototype.getAddedItemsUndoInstruction = function (addedItems, world) {
        return function () {
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
        };
    };
    SelectTool.prototype.getRemovedItemsUndoInstruction = function (removedItems, world) {
        return function () {
            for (var _i = 0, removedItems_1 = removedItems; _i < removedItems_1.length; _i++) {
                var removedItem = removedItems_1[_i];
                world.setItem(removedItem);
            }
        };
    };
    SelectTool.prototype.getAddedItemsRedoInstruction = function (addedItems, world) {
        return function () {
            for (var _i = 0, addedItems_2 = addedItems; _i < addedItems_2.length; _i++) {
                var addedItem = addedItems_2[_i];
                world.setItem(addedItem);
            }
        };
    };
    SelectTool.prototype.getRemovedItemsRedoInstruction = function (removedItems, world) {
        return function () {
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
        };
    };
    SelectTool.prototype.getAddedContainersUndoInstruction = function (addedContainers, world) {
        return function () {
            for (var _i = 0, addedContainers_1 = addedContainers; _i < addedContainers_1.length; _i++) {
                var addedContainer = addedContainers_1[_i];
                for (var i = 0; i < world.containers.length; i++) {
                    var container = world.containers[i];
                    if (container == addedContainer) {
                        world.containers.splice(i, 1);
                    }
                }
            }
        };
    };
    SelectTool.prototype.getRemovedContainersUndoInstruction = function (removedContainers, world) {
        return function () {
            for (var _i = 0, removedContainers_1 = removedContainers; _i < removedContainers_1.length; _i++) {
                var removedContainer = removedContainers_1[_i];
                world.containers.push(removedContainer);
            }
        };
    };
    SelectTool.prototype.getRemovedContainersRedoInstruction = function (removedContainers, world) {
        return function () {
            for (var _i = 0, removedContainers_2 = removedContainers; _i < removedContainers_2.length; _i++) {
                var removedContainer = removedContainers_2[_i];
                for (var i = 0; i < world.containers.length; i++) {
                    var container = world.containers[i];
                    if (container == removedContainer) {
                        world.containers.splice(i, 1);
                    }
                }
            }
        };
    };
    SelectTool.prototype.getAddedContainersRedoInstruction = function (addedContainers, world) {
        return function () {
            for (var _i = 0, addedContainers_2 = addedContainers; _i < addedContainers_2.length; _i++) {
                var addedContainer = addedContainers_2[_i];
                world.containers.push(addedContainer);
            }
        };
    };
    SelectTool.prototype.removeTilesInSelection = function (lowX, highX, lowY, highY, selectedLayer, world, shouldRemove) {
        if (shouldRemove === void 0) { shouldRemove = true; }
        var removedTiles = [];
        for (var x = lowX; x <= highX; x++) {
            for (var y = lowY; y <= highY; y++) {
                if (selectedLayer === -1) { //layer auto
                    var tempRemovedTiles = [];
                    if (shouldRemove) {
                        tempRemovedTiles = world.removeTilesAtGlobalPosXY(x, y);
                    }
                    else {
                        tempRemovedTiles = world.findTilesAtGlobalPos(x, y);
                    }
                    for (var _i = 0, tempRemovedTiles_1 = tempRemovedTiles; _i < tempRemovedTiles_1.length; _i++) {
                        var removedTile = tempRemovedTiles_1[_i];
                        removedTiles.push([removedTile, { "x": x, "y": y, "z": removedTile.z }]);
                    }
                }
                else {
                    var removedTile = null;
                    if (shouldRemove) {
                        removedTile = world.removeTileAtGlobalPos(x, y, selectedLayer);
                    }
                    else {
                        removedTile = world.findTileAtGlobalPos(x, y, selectedLayer);
                    }
                    if (removedTile) {
                        removedTiles.push([removedTile, { "x": x, "y": y, "z": removedTile.z }]);
                    }
                }
            }
        }
        return removedTiles;
    };
    SelectTool.prototype.removeContainersInSelection = function (lowX, highX, lowY, highY, selectedLayer, world, shouldRemove) {
        if (shouldRemove === void 0) { shouldRemove = true; }
        var removedContainers = [];
        for (var i = 0; i < world.containers.length; i++) {
            var container = world.containers[i];
            if (container.z === selectedLayer || selectedLayer === -1) {
                var globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y);
                if (globalPos.x >= lowX && globalPos.x <= highX && globalPos.y >= lowY && globalPos.y <= highY) {
                    var removedContainer = world.containers[i];
                    if (shouldRemove) {
                        removedContainer = world.containers.splice(i, 1)[0];
                        i--;
                    }
                    removedContainers.push(removedContainer);
                }
            }
        }
        return removedContainers;
    };
    SelectTool.prototype.removeItemsInSelection = function (lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world, shouldRemove) {
        if (shouldRemove === void 0) { shouldRemove = true; }
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
                            var removedItem = chunk.itemDataList[i];
                            if (shouldRemove) {
                                removedItem = chunk.itemDataList.splice(i, 1)[0];
                                chunk.edited();
                                i--;
                            }
                            removedItems.push(removedItem);
                        }
                    }
                }
            }
        }
        return removedItems;
    };
    SelectTool.prototype.getTilesToCopyAndRemoved = function (lowX, highX, lowY, highY, selectedLayer, world, shouldRemove) {
        if (shouldRemove === void 0) { shouldRemove = true; }
        var tilesToCopy = [];
        var removedTiles = [];
        var tempOldTiles = this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world, shouldRemove);
        for (var _i = 0, tempOldTiles_1 = tempOldTiles; _i < tempOldTiles_1.length; _i++) {
            var tileInfo = tempOldTiles_1[_i];
            var tile = tileInfo[0];
            var globalTilePos = tileInfo[1];
            tilesToCopy.push([tile.clone(), { "x": globalTilePos.x, "y": globalTilePos.y }]);
            removedTiles.push([tile, { "x": globalTilePos.x, "y": globalTilePos.y, "z": tile.z }]);
        }
        return [tilesToCopy, removedTiles];
    };
    SelectTool.prototype.getContainersToCopyAndRemoved = function (lowX, highX, lowY, highY, selectedLayer, world, shouldRemove) {
        if (shouldRemove === void 0) { shouldRemove = true; }
        var containersToCopy = [];
        var removedContainers = [];
        //copy and delete containers in old area
        var tempOldContainers = this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world, shouldRemove);
        for (var _i = 0, tempOldContainers_1 = tempOldContainers; _i < tempOldContainers_1.length; _i++) {
            var container = tempOldContainers_1[_i];
            var globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y);
            containersToCopy.push([container.clone(), globalPos]);
            removedContainers.push(container);
        }
        return [containersToCopy, removedContainers];
    };
    SelectTool.prototype.getItemsToCopyAndRemoved = function (lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world, shouldRemove) {
        if (shouldRemove === void 0) { shouldRemove = true; }
        var removedItems = [];
        var itemsToCopy = [];
        //copy and delete old items
        var tempOldItems = this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world, shouldRemove);
        for (var _i = 0, tempOldItems_1 = tempOldItems; _i < tempOldItems_1.length; _i++) {
            var item = tempOldItems_1[_i];
            var itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y);
            itemsToCopy.push([item.clone(), itemGlobalPos]);
            removedItems.push(item);
        }
        return [itemsToCopy, removedItems];
    };
    SelectTool.prototype.pasteTiles = function (tilesToCopy, xDiff, yDiff, world) {
        var addedTiles = [];
        var createdChunks = [];
        for (var _i = 0, tilesToCopy_1 = tilesToCopy; _i < tilesToCopy_1.length; _i++) {
            var tileInfo = tilesToCopy_1[_i];
            var tile = tileInfo[0];
            var tileGlobalPos = { "x": tileInfo[1].x + xDiff, "y": tileInfo[1].y + yDiff };
            var chunkAddedInfo = world.setTileAtGlobalPos(tile, tileGlobalPos.x, tileGlobalPos.y);
            addedTiles.push([tile, chunkAddedInfo[0]]);
            if (chunkAddedInfo[1]) {
                createdChunks.push(chunkAddedInfo[0]);
            }
        }
        return [addedTiles, createdChunks];
    };
    SelectTool.prototype.pasteContainers = function (containersToCopy, xDiff, yDiff, world) {
        var addedContainers = [];
        for (var _i = 0, containersToCopy_1 = containersToCopy; _i < containersToCopy_1.length; _i++) {
            var containerInfo = containersToCopy_1[_i];
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
        return addedContainers;
    };
    SelectTool.prototype.pasteItems = function (itemsToCopy, xDiff, yDiff, world) {
        var addedItems = [];
        for (var _i = 0, itemsToCopy_1 = itemsToCopy; _i < itemsToCopy_1.length; _i++) {
            var itemInfo = itemsToCopy_1[_i];
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
        return addedItems;
    };
    SelectTool.prototype.cloneTilesToCopy = function (tilesToCopy) {
        var newTilesToCopy = [];
        for (var _i = 0, tilesToCopy_2 = tilesToCopy; _i < tilesToCopy_2.length; _i++) {
            var tileInfo = tilesToCopy_2[_i];
            newTilesToCopy.push([tileInfo[0].clone(), { "x": tileInfo[1].x, "y": tileInfo[1].y }]);
        }
        return newTilesToCopy;
    };
    SelectTool.prototype.cloneContainersToCopy = function (containersToCopy) {
        var newContainersToCopy = [];
        for (var _i = 0, containersToCopy_2 = containersToCopy; _i < containersToCopy_2.length; _i++) {
            var containerInfo = containersToCopy_2[_i];
            newContainersToCopy.push([containerInfo[0].clone(), { "x": containerInfo[1].x, "y": containerInfo[1].y }]);
        }
        return newContainersToCopy;
    };
    SelectTool.prototype.cloneItemsToCopy = function (itemsToCopy) {
        var newItemsToCopy = [];
        for (var _i = 0, itemsToCopy_2 = itemsToCopy; _i < itemsToCopy_2.length; _i++) {
            var itemInfo = itemsToCopy_2[_i];
            newItemsToCopy.push([itemInfo[0].clone(), { "x": itemInfo[1].x, "y": itemInfo[1].y }]);
        }
        return newItemsToCopy;
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
            world.selection = [];
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
        var lowX = null;
        var highX = null;
        var lowY = null;
        var highY = null;
        var lowChunkPos = null;
        var highChunkPos = null;
        if (world.selection.length == 2) {
            lowX = Math.min(world.selection[0].x, world.selection[1].x);
            highX = Math.max(world.selection[0].x, world.selection[1].x);
            lowY = Math.min(world.selection[0].y, world.selection[1].y);
            highY = Math.max(world.selection[0].y, world.selection[1].y);
            lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0];
            highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0];
            if (globalMousePos.x >= lowX && globalMousePos.x <= highX && globalMousePos.y >= lowY && globalMousePos.y <= highY) {
                mouseIsInSelection = true;
            }
        }
        //logic
        switch (mouseButtonState) {
            case MouseButtonState.None:
                switch (this.selectToolState) {
                    case SelectToolState.Selected:
                        if (mouseIsInSelection) {
                            document.getElementById("2Dcanvas").style.cursor = "move";
                        }
                        break;
                    case SelectToolState.Paste:
                        world.selection = [];
                        world.selection[0] = { "x": globalMousePos.x, "y": globalMousePos.y };
                        world.selection[1] = { "x": globalMousePos.x + this.clipboard.width, "y": globalMousePos.y + this.clipboard.height };
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
                        var lowChunkPosOld = world.getChunkAndTilePosAtGlobalPos(lowXold, lowYold)[0];
                        var highChunkPosOld = world.getChunkAndTilePosAtGlobalPos(highXold, highYold)[0];
                        var xDiff = lowX - lowXold;
                        var yDiff = lowY - lowYold;
                        //TILES
                        //copy & remove tiles
                        var tilesToCopyAndRemoved = this.getTilesToCopyAndRemoved(lowXold, highXold, lowYold, highYold, selectedLayer, world);
                        var tilesToCopy = tilesToCopyAndRemoved[0];
                        removedTiles = removedTiles.concat(tilesToCopyAndRemoved[1]);
                        //delete tiles in new area
                        removedTiles = removedTiles.concat(this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world));
                        //paste old tiles in new area
                        var addedTilesAndCreatedChunks = this.pasteTiles(tilesToCopy, xDiff, yDiff, world);
                        addedTiles = addedTiles.concat(addedTilesAndCreatedChunks[0]);
                        createdChunks = createdChunks.concat(addedTilesAndCreatedChunks[1]);
                        //ITEMS
                        //copy & remove items
                        var itemsToCopyAndRemove = this.getItemsToCopyAndRemoved(lowChunkPosOld, highChunkPosOld, lowXold, highXold, lowYold, highYold, selectedLayer, world);
                        var itemsToCopy = itemsToCopyAndRemove[0];
                        removedItems = removedItems.concat(itemsToCopyAndRemove[1]);
                        //delete items in new area
                        removedItems = removedItems.concat(this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world));
                        //paste old items in new area
                        addedItems = addedItems.concat(this.pasteItems(itemsToCopy, xDiff, yDiff, world));
                        //CONTAINERS
                        //copy & remove containers
                        var containersToCopyAndRemove = this.getContainersToCopyAndRemoved(lowXold, highXold, lowYold, highYold, selectedLayer, world);
                        var containersToCopy = containersToCopyAndRemove[0];
                        removedContainers = removedContainers.concat(containersToCopyAndRemove[1]);
                        //delete containers in new area
                        removedContainers = removedContainers.concat(this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world));
                        //paste containers in new area
                        addedContainers = addedContainers.concat(this.pasteContainers(containersToCopy, xDiff, yDiff, world));
                        this.selectToolState = SelectToolState.None;
                        break;
                    case SelectToolState.Paste:
                        var xPasteDiff = lowX - this.clipboard.lowX;
                        var yPasteDiff = lowY - this.clipboard.lowY;
                        //TILES
                        //delete tiles in new area
                        removedTiles = removedTiles.concat(this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world));
                        //paste old tiles in new area
                        var pasteAddedTilesAndCreatedChunks = this.pasteTiles(this.cloneTilesToCopy(this.clipboard.tilesToCopy), xPasteDiff, yPasteDiff, world);
                        addedTiles = addedTiles.concat(pasteAddedTilesAndCreatedChunks[0]);
                        createdChunks = createdChunks.concat(pasteAddedTilesAndCreatedChunks[1]);
                        //ITEMS
                        //delete items in new area
                        removedItems = removedItems.concat(this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world));
                        //paste old items in new area
                        addedItems = addedItems.concat(this.pasteItems(this.cloneItemsToCopy(this.clipboard.itemsToCopy), xPasteDiff, yPasteDiff, world));
                        //CONTAINERS
                        //delete containers in new area
                        removedContainers = removedContainers.concat(this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world));
                        //paste containers in new area
                        addedContainers = addedContainers.concat(this.pasteContainers(this.cloneContainersToCopy(this.clipboard.containersToCopy), xPasteDiff, yPasteDiff, world));
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
        if (addedTiles.length > 0 ||
            removedTiles.length > 0 ||
            createdChunks.length > 0 ||
            addedItems.length > 0 ||
            removedItems.length > 0 ||
            addedContainers.length > 0 ||
            removedContainers.length > 0) {
            //tile and chunk
            undoInstructions.push(this.getAddedTilesUndoInstruction(addedTiles));
            undoInstructions.push(this.getRemovedTileUndoInstruction(removedTiles, world));
            undoInstructions.push(this.getCreatedChunksUndoInstruction(createdChunks, world));
            redoInstructions.push(this.getCreatedChunksRedoInstruction(createdChunks, world));
            redoInstructions.push(this.getRemovedTileRedoInstruction(removedTiles, world));
            redoInstructions.push(this.getAddedTilesRedoInstruction(addedTiles));
            //items
            undoInstructions.push(this.getAddedItemsUndoInstruction(addedItems, world));
            undoInstructions.push(this.getRemovedItemsUndoInstruction(removedItems, world));
            redoInstructions.push(this.getRemovedItemsRedoInstruction(removedItems, world));
            redoInstructions.push(this.getAddedItemsRedoInstruction(addedItems, world));
            //containers
            undoInstructions.push(this.getAddedContainersUndoInstruction(addedContainers, world));
            undoInstructions.push(this.getRemovedContainersUndoInstruction(removedContainers, world));
            redoInstructions.push(this.getRemovedContainersRedoInstruction(removedContainers, world));
            redoInstructions.push(this.getAddedContainersRedoInstruction(addedContainers, world));
            //undo/redo final
            if (undoInstructions.length > 0) {
                var undo = function () {
                    for (var _i = 0, undoInstructions_4 = undoInstructions; _i < undoInstructions_4.length; _i++) {
                        var undoInstruction = undoInstructions_4[_i];
                        undoInstruction();
                    }
                };
                var redo = function () {
                    for (var _i = 0, redoInstructions_4 = redoInstructions; _i < redoInstructions_4.length; _i++) {
                        var redoInstruction = redoInstructions_4[_i];
                        redoInstruction();
                    }
                };
                ti.world.addHistory(new ToolHistory(undo, redo));
            }
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return SelectTool;
}(Tool));
export { SelectTool };
//# sourceMappingURL=select.js.map