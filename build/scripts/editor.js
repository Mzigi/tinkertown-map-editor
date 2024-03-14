"use-strict";
// @ts-check
/*
import { drawToolTick } from "./tools/draw";
import { eraseToolTick } from "./tools/erase";
import { pickToolTick } from "./tools/pick";*/
function drawToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
    //create new chunk if there is none
    if (chunkAtMouse == null) {
        var chunkPos = worlds[currentWorld].getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y);
        chunkAtMouse = new Chunk();
        chunkAtMouse.x = chunkPos.x;
        chunkAtMouse.y = chunkPos.y;
        worlds[currentWorld].addChunk(chunkAtMouse);
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
}
function eraseToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
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
}
function pickToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
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
}
function listIncludesTilePos(arr, x, y) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][0] == x && arr[i][1] == y) {
            return true;
        }
    }
    return false;
}
function objectIncludesTilePos(obj, x, y) {
    if (!obj[x]) {
        return false;
    }
    return obj[x][y] == true;
}
function tilePosIsValid(tilePos) {
    return (tilePos.x >= 0 && tilePos.x <= 9 && tilePos.y >= 0 && tilePos.y <= 9);
}
function fillToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
    var _a, _b, _c, _d;
    //create new chunk if there is none
    if (chunkAtMouse == null) {
        var chunkPos = worlds[currentWorld].getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y);
        chunkAtMouse = new Chunk();
        chunkAtMouse.x = chunkPos.x;
        chunkAtMouse.y = chunkPos.y;
        chunkAtMouse.fillWithId(selectedTile);
        worlds[currentWorld].addChunk(chunkAtMouse);
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
                    if (tilePosIsValid(westTile)) {
                        if (!objectIncludesTilePos(closedTiles, westTile.x, westTile.y)) {
                            newOpenTiles.push(westTile);
                        }
                    }
                    //east
                    var eastTile = { "x": currentTile.x + 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined };
                    eastTile.tileAssetId = (_b = chunkAtMouse.findTileAt(currentTile.x + 1, currentTile.y, currentTile.z)) === null || _b === void 0 ? void 0 : _b.tileAssetId;
                    if (tilePosIsValid(eastTile)) {
                        if (!objectIncludesTilePos(closedTiles, eastTile.x, eastTile.y)) {
                            newOpenTiles.push(eastTile);
                        }
                    }
                    //north
                    var northTile = { "x": currentTile.x, "y": currentTile.y + 1, "z": currentTile.z, "tileAssetId": undefined };
                    northTile.tileAssetId = (_c = chunkAtMouse.findTileAt(currentTile.x, currentTile.y + 1, currentTile.z)) === null || _c === void 0 ? void 0 : _c.tileAssetId;
                    if (tilePosIsValid(northTile)) {
                        if (!objectIncludesTilePos(closedTiles, northTile.x, northTile.y)) {
                            newOpenTiles.push(northTile);
                        }
                    }
                    //south
                    var southTile = { "x": currentTile.x, "y": currentTile.y - 1, "z": currentTile.z, "tileAssetId": undefined };
                    southTile.tileAssetId = (_d = chunkAtMouse.findTileAt(currentTile.x, currentTile.y - 1, currentTile.z)) === null || _d === void 0 ? void 0 : _d.tileAssetId;
                    if (tilePosIsValid(southTile)) {
                        if (!objectIncludesTilePos(closedTiles, southTile.x, southTile.y)) {
                            newOpenTiles.push(southTile);
                        }
                    }
                }
            }
            openTiles = newOpenTiles;
        }
    }
}
function addContainerToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
    if (chunkAtMouse) {
        if (tileAtMouse) {
            var alreadyPlaced = false;
            for (var i = 0; i < worlds[currentWorld].containers.length; i++) {
                var container = worlds[currentWorld].containers[i];
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
                worlds[currentWorld].containers.push(newContainer);
            }
        }
    }
}
function addItemToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
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
}
var selectedTile;
var selectedTool;
var selectedLayer; //-1 == auto layer
selectedTile = 0;
selectedTool = 0;
selectedLayer = -1;
var lastWorldMousePos = { "x": null, "y": null };
var mouseButtonPressed = {};
var lastMouseButtonPressed = {};
var hoveredItem = null;
var hoveredStorage = null;
var openedStorage = null;
var openedItem = null;
var openedItemStorage = null;
if (NEWUI) {
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
    var cssThemeElement_1 = document.getElementById("css-theme");
    var cssTheme = getPreference("theme");
    if (!cssTheme) {
        cssTheme = "dark";
    }
    function updateTheme(cssTheme) {
        setPreference("theme", cssTheme);
        switch (cssTheme) {
            case "dark":
                document.getElementById("navbar-themes-dark").innerHTML = 'Dark<span class="material-symbols-outlined" style="display: inline-block;">done</span>';
                document.getElementById("navbar-themes-light").innerHTML = 'Light';
                cssThemeElement_1.setAttribute("href", "assets/css/themes/dark.css");
                break;
            case "light":
                document.getElementById("navbar-themes-light").innerHTML = 'Light<span class="material-symbols-outlined" style="display: inline-block;">done</span>';
                document.getElementById("navbar-themes-dark").innerHTML = 'Dark';
                cssThemeElement_1.setAttribute("href", "assets/css/themes/light.css");
                break;
        }
    }
    document.getElementById("navbar-themes-dark").addEventListener("click", function () {
        updateTheme("dark");
    });
    document.getElementById("navbar-themes-light").addEventListener("click", function () {
        updateTheme("light");
    });
    updateTheme(cssTheme);
    //tile list view
    var tileListVisible = getPreference("tile-list-visible");
    if (!tileListVisible) {
        tileListVisible = "true";
    }
    function setTileListDisplay(visible) {
        setPreference("tile-list-visible", visible);
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
    }
    document.getElementById("navbar-view-tilelist").addEventListener("click", function () {
        if (getPreference("tile-list-visible") === "true") {
            setTileListDisplay("false");
        }
        else {
            setTileListDisplay("true");
        }
    });
    setTileListDisplay(tileListVisible);
    //debug text in 2d renderer
    var canvasDebugText = getPreference("canvas-debug-text");
    if (!canvasDebugText) {
        canvasDebugText = "true";
    }
    function setCanvasDebugText(visible) {
        setPreference("canvas-debug-text", visible);
        if (visible === "true") {
            document.getElementById("navbar-view-canvasdebug").innerHTML = 'Canvas Debug<span class="material-symbols-outlined" style="display: inline-block;">done</span>';
        }
        else {
            document.getElementById("navbar-view-canvasdebug").innerHTML = 'Canvas Debug';
        }
    }
    document.getElementById("navbar-view-canvasdebug").addEventListener("click", function () {
        if (getPreference("canvas-debug-text") === "true") {
            setCanvasDebugText("false");
        }
        else {
            setCanvasDebugText("true");
        }
    });
    setCanvasDebugText(canvasDebugText);
}
document.getElementById("2Dcanvas").addEventListener('mousedown', function (e) {
    mouseButtonPressed[e.button] = true;
    openedStorage = null;
    //set item properties
    if (openedItem && openedItemStorage) {
        var chunkAtItem = worlds[currentWorld].getChunkAt(openedItem.chunkX, openedItem.chunkY);
        var shouldDelete = false;
        if (openedItemStorage.itemDataList.length > 0) {
            if (openedItemStorage.itemDataList[0].count <= 0) {
                shouldDelete = true;
            }
        }
        else {
            shouldDelete = true;
        }
        if (!shouldDelete) {
            openedItem.id = openedItemStorage.itemDataList[0].id;
            openedItem.count = openedItemStorage.itemDataList[0].count;
        }
        else {
            if (chunkAtItem) {
                for (var i = 0; i < chunkAtItem.itemDataList.length; i++) {
                    if (chunkAtItem.itemDataList[i] == openedItem) {
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
    openedItem = null;
    document.getElementById("inventory-container").style.display = "none";
    document.getElementById("small-item-list-container").style.display = "none";
});
function findFirstVisibleWorld() {
    var visibleWorld = null;
    var index = 0;
    for (var i = 0; i < worlds.length; i++) {
        if (!worlds[i].hidden) {
            visibleWorld = worlds[i];
            index = i;
        }
    }
    if (visibleWorld == null) {
        var visibleWorld_1 = new World();
        worlds.push(visibleWorld_1);
        index = worlds.length - 1;
    }
    currentWorld = index;
}
function createWorldElement(worldId) {
    var thisWorld = worlds[worldId];
    var worldButton = document.createElement("button");
    worldButton.classList.add("world");
    worldButton.setAttribute("world-id", String(worldId));
    var worldTitle = document.createElement("span");
    worldTitle.classList.add("world-name");
    worldTitle.innerText = thisWorld.name;
    worldButton.appendChild(worldTitle);
    var closeButton = document.createElement("button");
    closeButton.classList.add("material-symbols-outlined");
    closeButton.classList.add("world-close");
    closeButton.innerText = "close";
    worldButton.appendChild(closeButton);
    closeButton.addEventListener("click", function () {
        document.getElementById("remove-world-title").innerText = "Remove " + thisWorld.name + "?";
        document.getElementById("dialog-confirm-close").showModal();
        function RemoveWorld() {
            thisWorld.reset();
            thisWorld.hidden = true;
            if (worldId == currentWorld) {
                findFirstVisibleWorld();
            }
            updateWorldList();
            document.getElementById("dialog-confirm-close").close();
            document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", RemoveWorld);
            document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", CancelRemove);
        }
        function CancelRemove() {
            document.getElementById("dialog-confirm-close").close();
            document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", RemoveWorld);
            document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", CancelRemove);
        }
        document.getElementById("dialog-confirm-close-confirm").addEventListener("click", RemoveWorld);
        document.getElementById("dialog-confirm-close-cancel").addEventListener("click", CancelRemove);
    });
    if (worldId != currentWorld) {
        worldButton.classList.add("world-unloaded");
    }
    worldButton.addEventListener("click", function () {
        if (!worlds[worldId].hidden) {
            currentWorld = worldId;
            updateWorldList();
        }
    });
    return worldButton;
}
function updateWorldList() {
    if (NEWUI) {
        //remove all elements
        document.getElementById("worldlist").innerHTML = "";
        //add new ones
        //let currentWorldElement = createWorldElement(currentWorld)
        //document.getElementById("worldlist").appendChild(currentWorldElement)
        for (var i = 0; i < worlds.length; i++) {
            if (!worlds[i].hidden) {
                document.getElementById("worldlist").appendChild(createWorldElement(i));
            }
        }
    }
}
updateWorldList();
function positionInventory() {
    var worldMousePos = worlds[currentWorld].camera.screenPosToWorldPos(document.getElementById("2Dcanvas"), worlds[currentWorld].camera.lastPosition.x, worlds[currentWorld].camera.lastPosition.y);
    worldMousePos.x = Math.floor(worldMousePos.x / 16) * 16 + 16;
    worldMousePos.y = Math.floor(worldMousePos.y / 16) * 16 + 16;
    var mouseTileScreenPos = worlds[currentWorld].camera.worldPosToScreenPos(document.getElementById("2Dcanvas"), worldMousePos.x, worldMousePos.y);
    document.getElementById("inventory-container").style.display = "block";
    var inventoryY = Math.min(window.innerHeight - document.getElementById("inventory-container").clientHeight, mouseTileScreenPos.y);
    document.getElementById("inventory-container").style.left = mouseTileScreenPos.x + "px";
    document.getElementById("inventory-container").style.top = inventoryY + "px";
    document.getElementById("small-item-list-container").style.display = "";
    document.getElementById("small-item-list-container").style.left = (mouseTileScreenPos.x + document.getElementById("inventory-container").clientWidth) + "px";
    document.getElementById("small-item-list-container").style.top = inventoryY + "px";
}
document.getElementById("2Dcanvas").addEventListener('mouseup', function (e) {
    mouseButtonPressed[e.button] = false;
    if (e.button === 0) {
        if (hoveredStorage) {
            openedStorage = hoveredStorage;
            hoveredStorage.visualize();
            positionInventory();
        }
        else if (hoveredItem) {
            openedItem = hoveredItem;
            openedItemStorage = new Inventory();
            openedItemStorage.width = 1;
            openedItemStorage.height = 1;
            openedItemStorage.setIdAtSlot(0, openedItem.id);
            openedItemStorage.setCountAtSlot(0, openedItem.count);
            openedItemStorage.visualize();
            positionInventory();
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
function alertText(text, isError, time) {
    alertElement.innerText = text;
    if (isError) {
        alertElement.classList.add("errorAlert");
    }
    else {
        alertElement.classList.remove("errorAlert");
    }
    alertElement.classList.add("alertOn");
    setTimeout(function () {
        alertElement.classList.remove("alertOn");
    }, time * 1000);
}
function setLayer(layer) {
    document.getElementById("layer-input").classList.remove("selected-slot");
    if (document.getElementById("layer-" + selectedLayer)) {
        document.getElementById("layer-" + selectedLayer).classList.remove("selected-slot");
    }
    if (layer == null) {
        layer = Number(document.getElementById("layer-input").value);
    }
    selectedLayer = layer;
    if (document.getElementById("layer-" + selectedLayer)) {
        document.getElementById("layer-" + selectedLayer).classList.add("selected-slot");
    }
    else if (Number(document.getElementById("layer-input").value) == selectedLayer) {
        document.getElementById("layer-input").classList.add("selected-slot");
    }
}
function setTool(tool) {
    document.getElementById("tool-" + selectedTool).classList.remove("tool-selected");
    selectedTool = tool;
    document.getElementById("tool-" + selectedTool).classList.add("tool-selected");
}
//world settings
function changeSetting(settingName) {
    var originalName = worlds[currentWorld]["name"];
    var worldSettingValue = document.getElementById("world-settings-" + settingName).value;
    for (var key in uneditedFiles) {
        originalName = key.split("/")[0];
    }
    if (settingName == "seed" || settingName == "timescale") { //numbers
        var num = Number(worldSettingValue);
        if (isNaN(num) || typeof (num) != "number") {
            alertText("(".concat(settingName, ") Number is invalid"), true, 5);
        }
        else {
            worlds[currentWorld][settingName] = num;
        }
    }
    else if (settingName == "version" || settingName == "highestUsedVersion" || settingName == "additionalParams") { //objects
        try {
            var object = JSON.parse(worldSettingValue);
            worlds[currentWorld][settingName] = object;
        }
        catch (error) {
            alertText("(".concat(settingName, ") ") + error, true, 5);
        }
    }
    if (settingName == "hasBeenGenerated" || settingName == "progression" || settingName == "friendlyFire" || settingName == "forestBarrierBroken" || settingName == "NPCsOff") {
        if (worldSettingValue === "true") {
            worlds[currentWorld][settingName] = true;
        }
        else if (worldSettingValue === "false") {
            worlds[currentWorld][settingName] = false;
        }
        else {
            alertText("(".concat(settingName, ") ") + worldSettingValue + ' is not a valid boolean. "true" or "false" expected', true, 5);
        }
    }
    else {
        worlds[currentWorld][settingName] = worldSettingValue;
    }
    if (settingName == "name") {
        //fix file paths in unedited files
        for (var key in uneditedFiles) {
            var buffer = uneditedFiles[key];
            var newKey = key.replace(originalName, worlds[currentWorld].name);
            uneditedFiles[newKey] = buffer;
            delete uneditedFiles[key];
        }
        //fix file paths in world.chunkCache
        for (var key in worlds[currentWorld].chunkCache) {
            var buffer = worlds[currentWorld].chunkCache[key];
            var newKey = key.replace(originalName, worlds[currentWorld].name);
            worlds[currentWorld].chunkCache[newKey] = buffer;
            delete worlds[currentWorld].chunkCache[key];
        }
        updateWorldList();
    }
}
//are you sure alert
window.onbeforeunload = function () {
    return "Are you sure you want to exit the editor?";
};
function tick() {
    var worldMousePos = worlds[currentWorld].camera.screenPosToWorldPos(document.getElementById("2Dcanvas"), worlds[currentWorld].camera.lastPosition.x, worlds[currentWorld].camera.lastPosition.y);
    var chunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(worldMousePos.x, worldMousePos.y);
    var tileAtMouse = null;
    var lastChunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(lastWorldMousePos.x, lastWorldMousePos.y);
    var lastTileAtMouse = { "x": null, "y": null };
    if (lastChunkAtMouse) {
        lastTileAtMouse = lastChunkAtMouse.getTilePosAtWorldPos(lastWorldMousePos.x, lastWorldMousePos.y);
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
    //Items and containers
    var isHoveringOverObject = false;
    hoveredStorage = null;
    hoveredItem = null;
    //containers
    if (tileAtMouse) {
        for (var i = 0; i < worlds[currentWorld].containers.length; i++) {
            var container = worlds[currentWorld].containers[i];
            if (tileAtMouse.x == container.x && tileAtMouse.y == container.y && chunkAtMouse.x == container.chunkX && chunkAtMouse.y == container.chunkY) {
                isHoveringOverObject = true;
                hoveredStorage = container;
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
                hoveredItem = item;
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
        if (mouseButtonPressed[0] && selectedTool === 0) { // draw tool
            drawToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile);
        }
        else if (mouseButtonPressed[0] && selectedTool === 1) { // erase tool
            eraseToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile);
        }
        else if (mouseButtonPressed[0] && selectedTool === 2) { // pick tool
            var tileToSet = pickToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile);
            if (tileToSet) {
                console.log(tileToSet);
                selectedTile = tileToSet;
            }
        }
        else if (mouseButtonPressed[0] && selectedTool === 3) {
            fillToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile);
        }
        else if (mouseButtonPressed[0] && selectedTool === 4) {
            addContainerToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile);
        }
        else if (mouseButtonPressed[0] && selectedTool === 5) {
            addItemToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile);
        }
    }
    else if (hoveredStorage && mouseButtonPressed[0] && selectedTool === 1) { //erase storage
        for (var i = 0; i < worlds[currentWorld].containers.length; i++) {
            if (worlds[currentWorld].containers[i] == hoveredStorage) {
                worlds[currentWorld].containers.splice(i, 1);
                break;
            }
        }
    }
    else if (hoveredItem && mouseButtonPressed[0] && selectedTool === 1 && chunkAtMouse) { //erase item
        for (var i = 0; i < chunkAtMouse.itemDataList.length; i++) {
            if (chunkAtMouse.itemDataList[i] == hoveredItem) {
                chunkAtMouse.itemDataList.splice(i, 1);
                chunkAtMouse.chunkHasBeenEdited = true;
                chunkAtMouse.undoEdited = true;
                chunkAtMouse.resetCacheImage();
                break;
            }
        }
    }
    lastWorldMousePos = { "x": worldMousePos.x, "y": worldMousePos.y };
    lastMouseButtonPressed = JSON.parse(JSON.stringify(mouseButtonPressed));
    window.requestAnimationFrame(tick);
}
tick();
//# sourceMappingURL=editor.js.map