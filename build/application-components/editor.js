import { Inventory } from "../classes/objects/inventory.js";
import { World } from "../classes/objects/world.js";
import { AddContainer } from "../classes/tools/add-container.js";
import { AddItem } from "../classes/tools/add-item.js";
import { ChunkTool } from "../classes/tools/chunk-tool.js";
import { Draw } from "../classes/tools/draw.js";
import { Erase } from "../classes/tools/erase.js";
import { Fill } from "../classes/tools/fill.js";
import { Pick } from "../classes/tools/pick.js";
import { SelectTool } from "../classes/tools/select.js";
import { ToolHistory, ToolInfo } from "../classes/tools/tool-info.js";
var Editor = /** @class */ (function () {
    function Editor(loader, imageHolder) {
        var _this = this;
        this.slotSize = 64;
        //mouseDownStartPos = null //deprecated
        //selectToolState = SelectToolState.None //deprecated
        //originalSelection = null //deprecated
        this.selectedTile = 0;
        this.selectedTool = 0;
        this.selectedLayer = -1; //-1 == auto layer
        this.lastWorldMousePos = { "x": null, "y": null };
        this.mouseButtonPressed = {};
        this.lastMouseButtonPressed = {};
        this.pressedKeys = {};
        this.lastPressedKeys = {};
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
                var world = _this.loader.getCurrentWorld();
                var chunkAtItem_1 = world.getChunkAt(_this.openedItem.chunkX, _this.openedItem.chunkY);
                var shouldDelete = false;
                if (_this.openedItemStorage.itemDataList.length > 0) {
                    if (_this.openedItemStorage.itemDataList[0].count <= 0) {
                        shouldDelete = true;
                    }
                }
                else {
                    shouldDelete = true;
                }
                var openedItem_1 = _this.openedItem;
                if (!shouldDelete) {
                    var originalId_1 = _this.openedItem.id;
                    var originalCount_1 = _this.openedItem.count;
                    var newId_1 = _this.openedItemStorage.itemDataList[0].id;
                    var newCount_1 = _this.openedItemStorage.itemDataList[0].count;
                    if (_this.openedItem.id != newId_1 || _this.openedItem.count != newCount_1) {
                        world.addHistory(new ToolHistory(function () {
                            openedItem_1.id = originalId_1;
                            openedItem_1.count = originalCount_1;
                            chunkAtItem_1.edited();
                        }, function () {
                            openedItem_1.id = newId_1;
                            openedItem_1.count = newCount_1;
                            chunkAtItem_1.edited();
                        }));
                    }
                    _this.openedItem.id = newId_1;
                    _this.openedItem.count = newCount_1;
                }
                else {
                    world.addHistory(new ToolHistory(function () {
                        chunkAtItem_1.itemDataList.push(openedItem_1);
                        chunkAtItem_1.edited();
                    }, function () {
                        if (chunkAtItem_1) {
                            for (var i = 0; i < chunkAtItem_1.itemDataList.length; i++) {
                                if (chunkAtItem_1.itemDataList[i] == openedItem_1) {
                                    chunkAtItem_1.itemDataList.splice(i, 1);
                                    chunkAtItem_1.edited();
                                    break;
                                }
                            }
                        }
                    }));
                    if (chunkAtItem_1) {
                        for (var i = 0; i < chunkAtItem_1.itemDataList.length; i++) {
                            if (chunkAtItem_1.itemDataList[i] == _this.openedItem) {
                                chunkAtItem_1.itemDataList.splice(i, 1);
                                chunkAtItem_1.edited();
                                break;
                            }
                        }
                    }
                }
                if (chunkAtItem_1) {
                    chunkAtItem_1.edited();
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
                    _this.hoveredStorage.visualize(_this.images, _this.slotSize, _this.loader.getCurrentWorld());
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
        document.body.addEventListener("keydown", function (e) {
            //console.log(e)
            _this.pressedKeys[e.key] = true;
            if (e.ctrlKey) {
                _this.pressedKeys["ctrlKey"] = true;
            }
            if (e.ctrlKey && e.key == "z" && !e.shiftKey && !_this.loader.worldSettingsIsOpen) {
                _this.loader.getCurrentWorld().undo();
            }
            if (e.ctrlKey && e.key == "y" && !_this.loader.worldSettingsIsOpen) {
                _this.loader.getCurrentWorld().redo();
            }
            //tool keybind
            switch (e.key) {
                case "1":
                    _this.setTool(0, _this);
                    break;
                case "2":
                    _this.setTool(1, _this);
                    break;
                case "3":
                    _this.setTool(7, _this);
                    break;
                case "4":
                    _this.setTool(2, _this);
                    break;
                case "5":
                    _this.setTool(3, _this);
                    break;
                case "6":
                    _this.setTool(4, _this);
                    break;
                case "7":
                    _this.setTool(5, _this);
                    break;
                case "8":
                    _this.setTool(6, _this);
                default:
                    break;
            }
            //event bindings
            if (e.key == "Delete" || e.key == "Backspace") {
                _this.callToolEvents("Delete");
            }
            if (e.ctrlKey && e.key == "c") {
                _this.callToolEvents("Copy");
            }
            if (e.ctrlKey && e.key == "x") {
                _this.callToolEvents("Cut");
            }
            if (e.ctrlKey && e.key == "v") {
                _this.callToolEvents("Paste");
            }
        });
        document.body.addEventListener("keyup", function (e) {
            _this.pressedKeys[e.key] = false;
            if (e.ctrlKey) {
                _this.pressedKeys["ctrlKey"] = false;
            }
        });
        //are you sure alert
        window.onbeforeunload = function () {
            for (var _i = 0, _a = loader.worlds; _i < _a.length; _i++) {
                var world = _a[_i];
                if (world.recentlyEdited) {
                    return "You have unsaved changes";
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
        this.toolInfo = new ToolInfo(this.loader.worlds[this.loader.currentWorld], document.getElementById("2Dcanvas"), this.selectedTile, this.selectedLayer, function (tileId, editor) { editor.selectedTile = tileId; }, function (layerId, editor) { editor.setLayer(layerId, editor); }, this, this.mouseButtonPressed, this.lastMouseButtonPressed, this.selectedTool, false);
        this.tools = {
            0: new Draw(0, "Draw", this.toolInfo),
            1: new Erase(1, "Erase", this.toolInfo),
            2: new Pick(2, "Pick", this.toolInfo),
            3: new Fill(3, "Fill", this.toolInfo),
            4: new AddContainer(4, "Add Container", this.toolInfo),
            5: new AddItem(5, "Add Item", this.toolInfo),
            6: new ChunkTool(6, "Chunk Tool", this.toolInfo),
            7: new SelectTool(7, "Select", this.toolInfo)
        };
    }
    Editor.prototype.callToolEvents = function (eventName) {
        for (var toolId in this.tools) {
            var tool = this.tools[toolId];
            for (var _i = 0, _a = tool.events; _i < _a.length; _i++) {
                var eventBinding = _a[_i];
                if (eventBinding.name == eventName) {
                    eventBinding.call(tool);
                }
            }
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
        this.toolInfo.update(this.loader.worlds[this.loader.currentWorld], this.selectedTile, this.selectedLayer, this.mouseButtonPressed, this.lastMouseButtonPressed, this.selectedTool, isHoveringOverObject, this.hoveredStorage, this.hoveredItem);
        if (this.tools[this.selectedTool]) {
            this.tools[this.selectedTool].tick();
        }
        this.lastWorldMousePos = { "x": worldMousePos.x, "y": worldMousePos.y };
        this.lastMouseButtonPressed = JSON.parse(JSON.stringify(this.mouseButtonPressed));
        this.lastPressedKeys = JSON.parse(JSON.stringify(this.pressedKeys));
        //window.requestAnimationFrame(tick)
    };
    return Editor;
}());
export { Editor };
//# sourceMappingURL=editor.js.map