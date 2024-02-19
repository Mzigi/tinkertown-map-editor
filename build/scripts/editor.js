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
function fillToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile) {
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
            if (highestTile) {
                highestZ += 1;
            }
            highestZ = Math.min(highestZ, chunkAtMouse.layers);
            layerIdToFlood = highestZ - 1;
        }
        if (!highestTile) {
            highestTile = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, layerIdToFlood);
        }
        tileIdToFlood = highestTile.id;
        console.log(tileIdToFlood);
        console.log(layerIdToFlood);
        var openTiles = [highestTile];
        var closedTiles = [];
        while (openTiles.length > 0) {
            var newOpenTiles = [];
            for (var i = 0; i < openTiles.length; i++) {
                var currentTile = openTiles[i];
                if (currentTile.id == tileIdToFlood && currentTile.z == layerIdToFlood) {
                    var replacementTile = new Tile();
                    replacementTile.x = currentTile.x;
                    replacementTile.y = currentTile.y;
                    replacementTile.tileAssetId = selectedTile;
                    chunkAtMouse.setTile(replacementTile);
                    closedTiles.push([currentTile.x, currentTile.y]);
                    //west
                    var westTile = chunkAtMouse.findTileAt(currentTile.x - 1, currentTile.y, currentTile.z);
                    if (westTile) {
                        if (!listIncludesTilePos(closedTiles, westTile.x, westTile.y)) {
                            newOpenTiles.push(westTile);
                        }
                    }
                    //east
                    var eastTile = chunkAtMouse.findTileAt(currentTile.x + 1, currentTile.y, currentTile.z);
                    if (eastTile) {
                        if (!listIncludesTilePos(closedTiles, eastTile.x, eastTile.y)) {
                            newOpenTiles.push(eastTile);
                        }
                    }
                    //north
                    var northTile = chunkAtMouse.findTileAt(currentTile.x, currentTile.y + 1, currentTile.z);
                    if (northTile) {
                        if (!listIncludesTilePos(closedTiles, northTile.x, northTile.y)) {
                            newOpenTiles.push(northTile);
                        }
                    }
                    //south
                    var southTile = chunkAtMouse.findTileAt(currentTile.x, currentTile.y - 1, currentTile.z);
                    if (southTile) {
                        if (!listIncludesTilePos(closedTiles, southTile.x, southTile.y)) {
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
                newItem.x = tileAtMouse.x;
                newItem.y = tileAtMouse.y;
                chunkAtMouse.itemDataList.push(newItem);
                chunkAtMouse.chunkHasBeenEdited = true;
                chunkAtMouse.undoEdited = true;
                chunkAtMouse.resetCacheImage();
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
    document.getElementById("tool-" + selectedTool).classList.remove("selected-slot");
    selectedTool = tool;
    document.getElementById("tool-" + selectedTool).classList.add("selected-slot");
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
            alertText("(".concat(settingName, ") ") + worldSettingValue + ' is not a valid bool. "true" or "false" expected', true, 5);
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