import { Chunk } from "../classes/objects/chunk.js";
import { Inventory, InventoryFormat } from "../classes/objects/inventory.js";
import { Item } from "../classes/objects/item.js";
import { Tile } from "../classes/objects/tile.js";
import { World } from "../classes/objects/world.js";
import { Draw } from "../classes/tools/draw.js";
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
var Editor = /** @class */ (function () {
    function Editor(loader, imageHolder) {
        var _this = this;
        this.tools = {
            0: new Draw(0, "Draw")
        };
        this.slotSize = 64;
        this.mouseDownStartPos = null;
        this.selectToolState = SelectToolState.None;
        this.originalSelection = null;
        this.selectedTile = 0;
        this.selectedTool = 0;
        this.selectedLayer = -1; //-1 == auto layer
        this.lastWorldMousePos = { "x": null, "y": null };
        this.mouseButtonPressed = {};
        this.lastMouseButtonPressed = {};
        this.hoveredItem = null;
        this.hoveredStorage = null;
        this.openedStorage = null;
        this.openedItem = null;
        this.openedItemStorage = null;
        this.alertElement = document.getElementById("alert");
        this.loader = loader;
        this.imageHolder = imageHolder;
        this.images = imageHolder.images;
        if (loader.NEWUI) {
            var navbarButtons_1 = document.getElementsByClassName("navbar-button");
            var hoveredButton_1 = null;
            var navButtonClicked_1 = false;
            var _loop_1 = function (i) {
                //BUTTON EVENT
                navbarButtons_1[i].addEventListener("click", function () {
                    navButtonClicked_1 = true;
                    var dropdownList = document.getElementById(navbarButtons_1[i].id + "-buttons");
                    if (dropdownList) {
                        dropdownList.classList.add("navbar-dropdown-active");
                    }
                });
                //DOCUMENT HOVEROVER
                document.addEventListener("mouseover", function (e) {
                    //find hovered button
                    var target = e.target || document;
                    var newHoveredButton = null;
                    var lastCheckedElement = target;
                    while (lastCheckedElement != null) {
                        if (lastCheckedElement.classList.contains("navbar-button")) {
                            newHoveredButton = lastCheckedElement.id;
                            lastCheckedElement = null;
                        }
                        else {
                            lastCheckedElement = lastCheckedElement.parentElement;
                            if (lastCheckedElement && lastCheckedElement.classList.contains("navbar-dropdown")) {
                                lastCheckedElement = document.getElementById(lastCheckedElement.id.replace("-buttons", ""));
                            }
                        }
                    }
                    hoveredButton_1 = newHoveredButton;
                    //remove dropdowns
                    for (var i_1 = 0; i_1 < navbarButtons_1.length; i_1++) {
                        var dropdownList = document.getElementById(navbarButtons_1[i_1].id + "-buttons");
                        if (dropdownList) {
                            document.getElementById(navbarButtons_1[i_1].id + "-buttons").classList.remove("navbar-dropdown-active");
                        }
                    }
                    //stop click if no hovered button
                    if (!hoveredButton_1) {
                        navButtonClicked_1 = false;
                    }
                    //show correct dropdown
                    if (hoveredButton_1 && navButtonClicked_1) {
                        var hoveredButtonElement = document.getElementById(hoveredButton_1);
                        var dropdownList = document.getElementById(hoveredButton_1 + "-buttons");
                        var parentNav = hoveredButtonElement.getAttribute("parentnav");
                        if (dropdownList) {
                            dropdownList.classList.add("navbar-dropdown-active");
                            if (dropdownList.classList.contains("navbar-dropdown-parented")) {
                                dropdownList.style.left = hoveredButtonElement.clientWidth + "px";
                            }
                        }
                        var lastParentNav = parentNav;
                        while (lastParentNav) {
                            document.getElementById(lastParentNav + "-buttons").classList.add("navbar-dropdown-active");
                            if (document.getElementById(lastParentNav).getAttribute("parentnav")) {
                                lastParentNav = document.getElementById(lastParentNav).getAttribute("parentnav");
                            }
                            else {
                                lastParentNav = null;
                            }
                        }
                        if (dropdownList) {
                            if (dropdownList.classList.contains("navbar-dropdown-parented")) {
                                dropdownList.style.left = hoveredButtonElement.clientWidth + "px";
                            }
                        }
                    }
                });
            };
            for (var i = 0; i < navbarButtons_1.length; i++) {
                _loop_1(i);
            }
            //preferences ui
            var cssTheme = loader.getPreference("theme");
            if (!cssTheme) {
                cssTheme = "dark";
            }
            document.getElementById("navbar-themes-dark").addEventListener("click", function () {
                _this.updateTheme("dark");
            });
            document.getElementById("navbar-themes-light").addEventListener("click", function () {
                _this.updateTheme("light");
            });
            this.updateTheme(cssTheme);
            //tile list view
            var tileListVisible = loader.getPreference("tile-list-visible");
            if (!tileListVisible) {
                tileListVisible = "true";
            }
            document.getElementById("navbar-view-tilelist").addEventListener("click", function () {
                if (loader.getPreference("tile-list-visible") === "true") {
                    _this.setTileListDisplay("false");
                }
                else {
                    _this.setTileListDisplay("true");
                }
            });
            this.setTileListDisplay(tileListVisible);
            //debug text in 2d renderer
            var canvasDebugText = loader.getPreference("canvas-debug-text");
            if (!canvasDebugText) {
                canvasDebugText = "false";
            }
            document.getElementById("navbar-view-canvasdebug").addEventListener("click", function () {
                if (loader.getPreference("canvas-debug-text") === "true") {
                    _this.setCanvasDebugText("false");
                }
                else {
                    _this.setCanvasDebugText("true");
                }
            });
            this.setCanvasDebugText(canvasDebugText);
            //show points of interest
            var showPOI = loader.getPreference("show-poi");
            if (!showPOI) {
                showPOI = "true";
            }
            document.getElementById("navbar-view-show-poi").addEventListener("click", function () {
                if (loader.getPreference("show-poi") === "true") {
                    _this.setShowPOI("false");
                }
                else {
                    _this.setShowPOI("true");
                }
            });
            this.setShowPOI(showPOI);
        }
        document.getElementById("2Dcanvas").addEventListener('mousedown', function (e) {
            _this.mouseButtonPressed[e.button] = true;
            _this.openedStorage = null;
            //set item properties
            if (_this.openedItem && _this.openedItemStorage) {
                var chunkAtItem = loader.worlds[loader.currentWorld].getChunkAt(_this.openedItem.chunkX, _this.openedItem.chunkY);
                var shouldDelete = false;
                if (_this.openedItemStorage.itemDataList.length > 0) {
                    if (_this.openedItemStorage.itemDataList[0].count <= 0) {
                        shouldDelete = true;
                    }
                }
                else {
                    shouldDelete = true;
                }
                if (!shouldDelete) {
                    _this.openedItem.id = _this.openedItemStorage.itemDataList[0].id;
                    _this.openedItem.count = _this.openedItemStorage.itemDataList[0].count;
                }
                else {
                    if (chunkAtItem) {
                        for (var i = 0; i < chunkAtItem.itemDataList.length; i++) {
                            if (chunkAtItem.itemDataList[i] == _this.openedItem) {
                                chunkAtItem.itemDataList.splice(i, 1);
                                chunkAtItem.chunkHasBeenEdited = true;
                                chunkAtItem.undoEdited = true;
                                chunkAtItem.resetCacheImage();
                                break;
                            }
                        }
                    }
                }
                if (chunkAtItem) {
                    chunkAtItem.chunkHasBeenEdited = true;
                    chunkAtItem.undoEdited = true;
                    chunkAtItem.resetCacheImage();
                }
            }
            _this.openedItem = null;
            document.getElementById("inventory-container").style.display = "none";
            document.getElementById("small-item-list-container").style.display = "none";
        });
        document.getElementById("2Dcanvas").addEventListener('mouseup', function (e) {
            _this.mouseButtonPressed[e.button] = false;
            if (e.button === 0) {
                if (_this.hoveredStorage) {
                    _this.openedStorage = _this.hoveredStorage;
                    _this.hoveredStorage.visualize(_this.images, _this.slotSize);
                    _this.positionInventory();
                }
                else if (_this.hoveredItem) {
                    _this.openedItem = _this.hoveredItem;
                    _this.openedItemStorage = new Inventory();
                    _this.openedItemStorage.width = 1;
                    _this.openedItemStorage.height = 1;
                    _this.openedItemStorage.setIdAtSlot(0, _this.openedItem.id);
                    _this.openedItemStorage.setCountAtSlot(0, _this.openedItem.count);
                    _this.openedItemStorage.visualize(_this.images, _this.slotSize);
                    _this.positionInventory();
                }
            }
            /*if (e.button === 0) {
                for (let i = 0; i < worlds[currentWorld].chunks.length; i++) {
                    if (worlds[currentWorld].chunks[i].undoEdited) {
                        worlds[currentWorld].chunks[i].undoEdited = false
                        worlds[currentWorld].toolHistory[worlds[currentWorld].toolHistory.length - 1].chunks.push(worlds[currentWorld].chunks[i].clone())
                    }
                }
        
                worlds[currentWorld].toolHistory.push({"chunks":[]})
                console.log(worlds[currentWorld].toolHistory)
            }*/
        });
        //are you sure alert
        window.onbeforeunload = function () {
            for (var _i = 0, _a = loader.worlds; _i < _a.length; _i++) {
                var world = _a[_i];
                if (world.chunks.length > 0) {
                    return "Are you sure you want to exit the editor?";
                }
            }
        };
        var editor = this;
        window["setTool"] = function (toolId) {
            editor.setTool(toolId, editor);
        };
        window["setLayer"] = function (layerId) {
            editor.setLayer(layerId, editor);
        };
        window["changeSetting"] = function (settingName) {
            editor.changeSetting(settingName);
        };
        this.loader.updateWorldList();
    }
    Editor.prototype.drawToolTick = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
        var world = this.loader.worlds[this.loader.currentWorld];
        //create new chunk if there is none
        if (chunkAtMouse == null) {
            var chunkPos = world.getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y);
            chunkAtMouse = new Chunk();
            chunkAtMouse.x = chunkPos.x;
            chunkAtMouse.y = chunkPos.y;
            world.addChunk(chunkAtMouse);
        }
        tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
        //check if tile was already just placed here
        var shouldPlaceAgain = true;
        if (chunkAtMouse.x == lastChunkAtMouse.x && chunkAtMouse.y == lastChunkAtMouse.y) {
            if (tileAtMouse.x == lastTileAtMouse.x && tileAtMouse.y == lastTileAtMouse.y) {
                shouldPlaceAgain = false;
            }
        }
        //replace the tile with the selected one
        if (tileAtMouse && shouldPlaceAgain || !lastMouseButtonPressed[0]) {
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
    };
    Editor.prototype.eraseToolTick = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
        if (tileAtMouse) {
            //check if tile was already just erased here
            var shouldPlaceAgain = true;
            if (chunkAtMouse.x == lastChunkAtMouse.x && chunkAtMouse.y == lastChunkAtMouse.y) {
                if (tileAtMouse.x == lastTileAtMouse.x && tileAtMouse.y == lastTileAtMouse.y) {
                    shouldPlaceAgain = false;
                }
            }
            //delete the tile
            if (tileAtMouse && shouldPlaceAgain || !lastMouseButtonPressed[0]) {
                var zPos = selectedLayer;
                var highestTile = null;
                if (selectedLayer > -1) {
                    zPos = selectedLayer;
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
                chunkAtMouse.removeTileAt(tileAtMouse.x, tileAtMouse.y, zPos);
            }
        }
    };
    Editor.prototype.pickToolTick = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
        if (tileAtMouse) {
            //delete the tile
            if (tileAtMouse && !lastMouseButtonPressed[0]) {
                var zPos = selectedLayer;
                var highestTile = null;
                if (selectedLayer > -1) {
                    zPos = selectedLayer;
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
                var tileToPick = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, zPos);
                if (tileToPick != null) {
                    var previousSlot = document.getElementById("list-slot-" + selectedTile);
                    if (previousSlot) {
                        previousSlot.classList.remove("selected-slot");
                    }
                    var slot = document.getElementById("list-slot-" + tileToPick.tileAssetId);
                    if (slot) {
                        slot.classList.add("selected-slot");
                    }
                    return tileToPick.tileAssetId;
                }
            }
        }
    };
    Editor.prototype.listIncludesTilePos = function (arr, x, y) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][0] == x && arr[i][1] == y) {
                return true;
            }
        }
        return false;
    };
    Editor.prototype.objectIncludesTilePos = function (obj, x, y) {
        if (!obj[x]) {
            return false;
        }
        return obj[x][y] == true;
    };
    Editor.prototype.tilePosIsValid = function (tilePos) {
        return (tilePos.x >= 0 && tilePos.x <= 9 && tilePos.y >= 0 && tilePos.y <= 9);
    };
    Editor.prototype.fillToolTick = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
        var _a, _b, _c, _d;
        var world = this.loader.worlds[this.loader.currentWorld];
        //create new chunk if there is none
        if (chunkAtMouse == null) {
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
            var openTiles = [highestTile];
            var closedTiles = {};
            while (openTiles.length > 0) {
                var newOpenTiles = [];
                for (var i = 0; i < openTiles.length; i++) {
                    var currentTile = openTiles[i];
                    if (currentTile.tileAssetId == tileIdToFlood && currentTile.z == layerIdToFlood) {
                        var replacementTile = new Tile();
                        replacementTile.x = currentTile.x;
                        replacementTile.y = currentTile.y;
                        replacementTile.z = layerIdToFlood;
                        replacementTile.tileAssetId = selectedTile;
                        chunkAtMouse.setTile(replacementTile);
                        if (!closedTiles[currentTile.x]) {
                            closedTiles[currentTile.x] = {};
                        }
                        closedTiles[currentTile.x][currentTile.y] = true;
                        //west
                        var westTile = { "x": currentTile.x - 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined };
                        westTile.tileAssetId = (_a = chunkAtMouse.findTileAt(currentTile.x - 1, currentTile.y, currentTile.z)) === null || _a === void 0 ? void 0 : _a.tileAssetId;
                        if (this.tilePosIsValid(westTile)) {
                            if (!this.objectIncludesTilePos(closedTiles, westTile.x, westTile.y)) {
                                newOpenTiles.push(westTile);
                            }
                        }
                        //east
                        var eastTile = { "x": currentTile.x + 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined };
                        eastTile.tileAssetId = (_b = chunkAtMouse.findTileAt(currentTile.x + 1, currentTile.y, currentTile.z)) === null || _b === void 0 ? void 0 : _b.tileAssetId;
                        if (this.tilePosIsValid(eastTile)) {
                            if (!this.objectIncludesTilePos(closedTiles, eastTile.x, eastTile.y)) {
                                newOpenTiles.push(eastTile);
                            }
                        }
                        //north
                        var northTile = { "x": currentTile.x, "y": currentTile.y + 1, "z": currentTile.z, "tileAssetId": undefined };
                        northTile.tileAssetId = (_c = chunkAtMouse.findTileAt(currentTile.x, currentTile.y + 1, currentTile.z)) === null || _c === void 0 ? void 0 : _c.tileAssetId;
                        if (this.tilePosIsValid(northTile)) {
                            if (!this.objectIncludesTilePos(closedTiles, northTile.x, northTile.y)) {
                                newOpenTiles.push(northTile);
                            }
                        }
                        //south
                        var southTile = { "x": currentTile.x, "y": currentTile.y - 1, "z": currentTile.z, "tileAssetId": undefined };
                        southTile.tileAssetId = (_d = chunkAtMouse.findTileAt(currentTile.x, currentTile.y - 1, currentTile.z)) === null || _d === void 0 ? void 0 : _d.tileAssetId;
                        if (this.tilePosIsValid(southTile)) {
                            if (!this.objectIncludesTilePos(closedTiles, southTile.x, southTile.y)) {
                                newOpenTiles.push(southTile);
                            }
                        }
                    }
                }
                openTiles = newOpenTiles;
            }
        }
    };
    Editor.prototype.addContainerToolTick = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
        var world = this.loader.worlds[this.loader.currentWorld];
        if (chunkAtMouse) {
            if (tileAtMouse) {
                var alreadyPlaced = false;
                for (var i = 0; i < world.containers.length; i++) {
                    var container = world.containers[i];
                    if (container.x == tileAtMouse.x && container.y == tileAtMouse.y && container.chunkX == chunkAtMouse.x && container.chunkY == chunkAtMouse.y) {
                        alreadyPlaced = true;
                    }
                }
                if (!alreadyPlaced) {
                    var newContainer = new Inventory();
                    newContainer.chunkX = chunkAtMouse.x;
                    newContainer.chunkY = chunkAtMouse.y;
                    newContainer.x = tileAtMouse.x;
                    newContainer.y = tileAtMouse.y;
                    newContainer.z = tileAtMouse.z;
                    newContainer.target = InventoryFormat.Container;
                    world.containers.push(newContainer);
                }
            }
        }
    };
    Editor.prototype.addItemToolTick = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
        if (chunkAtMouse) {
            if (tileAtMouse) {
                var alreadyPlaced = false;
                for (var i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                    var item = chunkAtMouse.itemDataList[i];
                    if (Math.floor(item.x) == tileAtMouse.x && Math.floor(item.y) == tileAtMouse.y && item.chunkX == chunkAtMouse.x && item.chunkY == chunkAtMouse.y) {
                        alreadyPlaced = true;
                    }
                }
                if (!alreadyPlaced) {
                    var newItem = new Item();
                    newItem.chunkX = chunkAtMouse.x;
                    newItem.chunkY = chunkAtMouse.y;
                    var exactTileAtMouse = chunkAtMouse.getExactTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
                    newItem.x = tileAtMouse.x;
                    newItem.y = tileAtMouse.y;
                    chunkAtMouse.itemDataList.push(newItem);
                    chunkAtMouse.chunkHasBeenEdited = true;
                    chunkAtMouse.undoEdited = true;
                    chunkAtMouse.resetCacheImage();
                    console.log(chunkAtMouse);
                }
            }
        }
    };
    Editor.prototype.chunkToolTick = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
        if (chunkAtMouse) {
            this.loader.worlds[this.loader.currentWorld].highlightedChunk = chunkAtMouse;
        }
    };
    Editor.prototype.chunkToolPressed = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
        if (chunkAtMouse) {
            console.log("cli");
        }
    };
    Editor.prototype.selectToolTick = function (chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile, isMouseButtonPressed) {
        var world = this.loader.worlds[this.loader.currentWorld];
        var camera = world.camera;
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
                        for (var x = lowXold; x <= highXold; x++) {
                            for (var y = lowYold; y <= highYold; y++) {
                                if (selectedLayer === -1) { //layer auto
                                    for (var _i = 0, _a = world.findTilesAtGlobalPos(x, y); _i < _a.length; _i++) {
                                        var tile = _a[_i];
                                        tilesToCopy.push([tile.clone(), { "x": x, "y": y }]);
                                        world.removeTileAtGlobalPos(x, y, tile.z);
                                    }
                                }
                            }
                        }
                        //delete tiles in new area
                        for (var x = lowX; x <= highX; x++) {
                            for (var y = lowY; y <= highY; y++) {
                                if (selectedLayer === -1) { //layer auto
                                    world.removeTilesAtGlobalPosXY(x, y);
                                }
                            }
                        }
                        //put the old tiles in the new place
                        for (var _b = 0, tilesToCopy_1 = tilesToCopy; _b < tilesToCopy_1.length; _b++) {
                            var tileInfo = tilesToCopy_1[_b];
                            var tile = tileInfo[0];
                            var tileGlobalPos = { "x": tileInfo[1].x + xDiff, "y": tileInfo[1].y + yDiff };
                            world.setTileAtGlobalPos(tile, tileGlobalPos.x, tileGlobalPos.y);
                        }
                        //move items
                        var itemsToCopy = [];
                        for (var chunkX = lowChunkPosOld.x; chunkX <= highChunkPosOld.x; chunkX++) { //copy old items
                            for (var chunkY = lowChunkPosOld.y; chunkY <= highChunkPosOld.y; chunkY++) {
                                var chunk = world.getChunkAt(chunkX, chunkY);
                                if (chunk) {
                                    for (var i = 0; i < chunk.itemDataList.length; i++) {
                                        var item = chunk.itemDataList[i];
                                        var itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(chunkX, chunkY, item.x, item.y);
                                        if (itemGlobalPos.x >= lowXold && itemGlobalPos.x <= highXold && itemGlobalPos.y >= lowYold && itemGlobalPos.y <= highYold) {
                                            itemsToCopy.push([item.clone(), itemGlobalPos]);
                                            chunk.itemDataList.splice(i, 1);
                                            chunk.edited();
                                            i--;
                                        }
                                    }
                                }
                            }
                        }
                        //delete items in new area
                        for (var chunkX = lowChunkPos.x; chunkX <= highChunkPos.x; chunkX++) {
                            for (var chunkY = lowChunkPos.y; chunkY <= highChunkPos.y; chunkY++) {
                                var chunk = world.getChunkAt(chunkX, chunkY);
                                if (chunk) {
                                    for (var i = 0; i < chunk.itemDataList.length; i++) {
                                        var item = chunk.itemDataList[i];
                                        var itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(chunkX, chunkY, item.x, item.y);
                                        if (itemGlobalPos.x > lowX && itemGlobalPos.x <= highX && itemGlobalPos.y > lowY && itemGlobalPos.y <= highY) {
                                            chunk.itemDataList.splice(i, 1);
                                            chunk.edited();
                                            i--;
                                        }
                                    }
                                }
                            }
                        }
                        for (var _c = 0, itemsToCopy_1 = itemsToCopy; _c < itemsToCopy_1.length; _c++) { //put old items in new area
                            var itemInfo = itemsToCopy_1[_c];
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
                        }
                        //containers
                        var containersToCopy = [];
                        //copy and delete containers in old area
                        for (var i = 0; i < world.containers.length; i++) {
                            var container = world.containers[i];
                            var globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y);
                            if (globalPos.x >= lowXold && globalPos.x <= highXold && globalPos.y >= lowYold && globalPos.y <= highYold) {
                                containersToCopy.push([container.clone(), globalPos]);
                                world.containers.splice(i, 1);
                                i--;
                            }
                        }
                        //put containers in new are
                        for (var _d = 0, containersToCopy_1 = containersToCopy; _d < containersToCopy_1.length; _d++) {
                            var containerInfo = containersToCopy_1[_d];
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
        }
    };
    Editor.prototype.updateTheme = function (cssTheme) {
        var cssThemeElement = document.getElementById("css-theme");
        this.loader.setPreference("theme", cssTheme);
        switch (cssTheme) {
            case "dark":
                document.getElementById("navbar-themes-dark").innerHTML = 'Dark<span class="material-symbols-outlined" style="display: inline-block;">done</span>';
                document.getElementById("navbar-themes-light").innerHTML = 'Light';
                cssThemeElement.setAttribute("href", "assets/css/themes/dark.css");
                break;
            case "light":
                document.getElementById("navbar-themes-light").innerHTML = 'Light<span class="material-symbols-outlined" style="display: inline-block;">done</span>';
                document.getElementById("navbar-themes-dark").innerHTML = 'Dark';
                cssThemeElement.setAttribute("href", "assets/css/themes/light.css");
                break;
        }
    };
    Editor.prototype.setTileListDisplay = function (visible) {
        this.loader.setPreference("tile-list-visible", visible);
        if (visible === "true") {
            document.getElementById("item-list-side").style.display = "";
            document.getElementById("layer-list-side").style.display = "";
            document.getElementById("2Dcanvas").style.width = 'calc(100% - 550px)';
            document.getElementById("navbar-view-tilelist").innerHTML = 'Tile List<span class="material-symbols-outlined" style="display: inline-block;">done</span>';
        }
        else {
            document.getElementById("item-list-side").style.display = "none";
            document.getElementById("layer-list-side").style.display = "none";
            document.getElementById("2Dcanvas").style.width = '100%';
            document.getElementById("navbar-view-tilelist").innerHTML = 'Tile List';
        }
    };
    Editor.prototype.setCanvasDebugText = function (visible) {
        this.loader.setPreference("canvas-debug-text", visible);
        if (visible === "true") {
            document.getElementById("navbar-view-canvasdebug").innerHTML = 'Debug Info<span class="material-symbols-outlined" style="display: inline-block;">done</span>';
        }
        else {
            document.getElementById("navbar-view-canvasdebug").innerHTML = 'Debug Info';
        }
    };
    Editor.prototype.setShowPOI = function (visible) {
        this.loader.setPreference("show-poi", visible);
        if (visible === "true") {
            document.getElementById("navbar-view-show-poi").innerHTML = 'Show Points Of Interest<span class="material-symbols-outlined" style="display: inline-block;">done</span>';
        }
        else {
            document.getElementById("navbar-view-show-poi").innerHTML = 'Show Points Of Interest';
        }
    };
    Editor.prototype.findFirstVisibleWorld = function () {
        var worlds = this.loader.worlds;
        var visibleWorld = null;
        var index = 0;
        for (var i = 0; i < worlds.length; i++) {
            if (!worlds[i].hidden) {
                visibleWorld = worlds[i];
                index = i;
            }
        }
        if (visibleWorld == null) {
            var visibleWorld_1 = new World(worlds.length, this.loader);
            worlds.push(visibleWorld_1);
            index = worlds.length - 1;
        }
        this.loader.currentWorld = index;
    };
    Editor.prototype.positionInventory = function () {
        var world = this.loader.worlds[this.loader.currentWorld];
        var camera = world.camera;
        var worldMousePos = camera.screenPosToWorldPos(document.getElementById("2Dcanvas"), camera.lastPosition.x, camera.lastPosition.y);
        worldMousePos.x = Math.floor(worldMousePos.x / 16) * 16 + 16;
        worldMousePos.y = Math.floor(worldMousePos.y / 16) * 16 + 16;
        var mouseTileScreenPos = camera.worldPosToScreenPos(document.getElementById("2Dcanvas"), worldMousePos.x, worldMousePos.y);
        document.getElementById("inventory-container").style.display = "block";
        var inventoryY = Math.min(window.innerHeight - document.getElementById("inventory-container").clientHeight, mouseTileScreenPos.y);
        document.getElementById("inventory-container").style.left = mouseTileScreenPos.x + "px";
        document.getElementById("inventory-container").style.top = inventoryY + "px";
        document.getElementById("small-item-list-container").style.display = "";
        document.getElementById("small-item-list-container").style.left = (mouseTileScreenPos.x + document.getElementById("inventory-container").clientWidth) + "px";
        document.getElementById("small-item-list-container").style.top = inventoryY + "px";
    };
    Editor.prototype.setLayer = function (layer, editor) {
        document.getElementById("layer-input").classList.remove("selected-slot");
        if (document.getElementById("layer-" + editor.selectedLayer)) {
            document.getElementById("layer-" + editor.selectedLayer).classList.remove("selected-slot");
        }
        if (layer == null) {
            layer = Number(document.getElementById("layer-input").value);
        }
        editor.selectedLayer = layer;
        if (document.getElementById("layer-" + editor.selectedLayer)) {
            document.getElementById("layer-" + editor.selectedLayer).classList.add("selected-slot");
        }
        else if (Number(document.getElementById("layer-input").value) == editor.selectedLayer) {
            document.getElementById("layer-input").classList.add("selected-slot");
        }
    };
    Editor.prototype.setTool = function (tool, editor) {
        document.getElementById("tool-" + editor.selectedTool).classList.remove("tool-selected");
        editor.selectedTool = tool;
        document.getElementById("tool-" + editor.selectedTool).classList.add("tool-selected");
        editor.loader.worlds[editor.loader.currentWorld].selection = [];
        editor.selectToolState = SelectToolState.None;
    };
    //world settings
    Editor.prototype.changeSetting = function (settingName) {
        var originalName = this.loader.worlds[this.loader.currentWorld]["name"];
        var worldSettingValue = document.getElementById("world-settings-" + settingName).value;
        for (var key in this.loader.worlds[this.loader.currentWorld].uneditedFiles) {
            originalName = key.split("/")[0];
        }
        if (settingName == "seed" || settingName == "timescale") { //numbers
            var num = Number(worldSettingValue);
            if (isNaN(num) || typeof (num) != "number") {
                this.loader.alertText("(".concat(settingName, ") Number is invalid"), true, 5);
            }
            else {
                this.loader.worlds[this.loader.currentWorld][settingName] = num;
            }
        }
        else if (settingName == "version" || settingName == "highestUsedVersion" || settingName == "additionalParams") { //objects
            try {
                var object = JSON.parse(worldSettingValue);
                this.loader.worlds[this.loader.currentWorld][settingName] = object;
            }
            catch (error) {
                this.loader.alertText("(".concat(settingName, ") ") + error, true, 5);
            }
        }
        if (settingName == "hasBeenGenerated" || settingName == "progression" || settingName == "friendlyFire" || settingName == "forestBarrierBroken" || settingName == "NPCsOff") {
            if (worldSettingValue === "true") {
                this.loader.worlds[this.loader.currentWorld][settingName] = true;
            }
            else if (worldSettingValue === "false") {
                this.loader.worlds[this.loader.currentWorld][settingName] = false;
            }
            else {
                this.loader.alertText("(".concat(settingName, ") ") + worldSettingValue + ' is not a valid boolean. "true" or "false" expected', true, 5);
            }
        }
        else {
            this.loader.worlds[this.loader.currentWorld][settingName] = worldSettingValue;
        }
        if (settingName == "name") {
            var world = this.loader.worlds[this.loader.currentWorld];
            //fix file paths in unedited files
            for (var key in world.uneditedFiles) {
                var buffer = world.uneditedFiles[key];
                var newKey = key.replace(originalName, world.name);
                world.uneditedFiles[newKey] = buffer;
                delete world.uneditedFiles[key];
            }
            //fix file paths in world.chunkCache
            for (var key in world.chunkCache) {
                var buffer = world.chunkCache[key];
                var newKey = key.replace(originalName, world.name);
                world.chunkCache[newKey] = buffer;
                delete world.chunkCache[key];
            }
            this.loader.updateWorldList();
        }
    };
    Editor.prototype.tick = function () {
        var world = this.loader.worlds[this.loader.currentWorld];
        var worldMousePos = world.camera.screenPosToWorldPos(document.getElementById("2Dcanvas"), world.camera.lastPosition.x, world.camera.lastPosition.y);
        var chunkAtMouse = world.getChunkAtWorldPos(worldMousePos.x, worldMousePos.y);
        var tileAtMouse = null;
        var lastChunkAtMouse = world.getChunkAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y);
        var lastTileAtMouse = { "x": null, "y": null };
        if (lastChunkAtMouse) {
            lastTileAtMouse = lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y);
        }
        if (!lastChunkAtMouse) {
            lastChunkAtMouse = { "x": null, "y": null };
        }
        if (chunkAtMouse) {
            tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
            /*let replacementTile = new Tile()
            replacementTile.x = tileAtMouse.x
            replacementTile.y = tileAtMouse.y
            replacementTile.z = 9
            replacementTile.tileAssetId = selectedTile
            
            chunkAtMouse.setTile(replacementTile)*/
        }
        world.highlightedChunk = null;
        //Items and containers
        var isHoveringOverObject = false;
        this.hoveredStorage = null;
        this.hoveredItem = null;
        //containers
        if (tileAtMouse) {
            for (var i = 0; i < world.containers.length; i++) {
                var container = world.containers[i];
                if (tileAtMouse.x == container.x && tileAtMouse.y == container.y && chunkAtMouse.x == container.chunkX && chunkAtMouse.y == container.chunkY) {
                    isHoveringOverObject = true;
                    this.hoveredStorage = container;
                }
            }
        }
        //items
        if (chunkAtMouse) {
            for (var i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                var item = chunkAtMouse.itemDataList[i];
                var mouseTilePosOffGrid = chunkAtMouse.getOffGridTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
                mouseTilePosOffGrid.x -= 0.5;
                mouseTilePosOffGrid.y += 0.5;
                if (chunkAtMouse.x == item.chunkX && chunkAtMouse.y == item.chunkY && mouseTilePosOffGrid.x > item.x - 0.5 && mouseTilePosOffGrid.x < item.x + 0.5 && mouseTilePosOffGrid.y > item.y - 0.5 && mouseTilePosOffGrid.y < item.y + 0.5) {
                    isHoveringOverObject = true;
                    this.hoveredItem = item;
                }
            }
        }
        //Change cursor
        if (isHoveringOverObject) {
            document.getElementById("2Dcanvas").style.cursor = "pointer";
        }
        else {
            document.getElementById("2Dcanvas").style.cursor = "";
        }
        //Tools
        if (!isHoveringOverObject) {
            if (this.mouseButtonPressed[0]) { //mouse pressed
                switch (this.selectedTool) {
                    case 0: //draw
                        this.drawToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile);
                        break;
                    case 1: //erase
                        this.eraseToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile);
                        break;
                    case 2: //pick
                        var tileToSet = this.pickToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile);
                        if (tileToSet) {
                            console.log(tileToSet);
                            this.selectedTile = tileToSet;
                        }
                        break;
                    case 3: //fill
                        this.fillToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile);
                        break;
                    case 4: //container
                        this.addContainerToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile);
                        break;
                    case 5: //item
                        this.addItemToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile);
                        break;
                    case 6: //chunk
                        if (!this.lastMouseButtonPressed[0])
                            this.chunkToolPressed(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile);
                        break;
                    case 7: //select
                        this.selectToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile, true);
                    default:
                        break;
                }
            }
            else { //mouse not pressed
                switch (this.selectedTool) {
                    case 6: //chunk
                        this.chunkToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile);
                        break;
                    case 7: //select
                        this.selectToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile, false);
                    default:
                        break;
                }
            }
        }
        else if (this.hoveredStorage && this.mouseButtonPressed[0] && this.selectedTool === 1) { //erase storage
            for (var i = 0; i < world.containers.length; i++) {
                if (world.containers[i] == this.hoveredStorage) {
                    world.containers.splice(i, 1);
                    break;
                }
            }
        }
        else if (this.hoveredItem && this.mouseButtonPressed[0] && this.selectedTool === 1 && chunkAtMouse) { //erase item
            for (var i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                if (chunkAtMouse.itemDataList[i] == this.hoveredItem) {
                    chunkAtMouse.itemDataList.splice(i, 1);
                    chunkAtMouse.chunkHasBeenEdited = true;
                    chunkAtMouse.undoEdited = true;
                    chunkAtMouse.resetCacheImage();
                    break;
                }
            }
        }
        this.lastWorldMousePos = { "x": worldMousePos.x, "y": worldMousePos.y };
        this.lastMouseButtonPressed = JSON.parse(JSON.stringify(this.mouseButtonPressed));
        //window.requestAnimationFrame(tick)
    };
    return Editor;
}());
export { Editor };
//# sourceMappingURL=editor.js.map