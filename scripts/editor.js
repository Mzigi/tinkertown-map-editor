"use-strict";
// @ts-check
var selectedTile = 0;
var selectedTool = 0;
var selectedLayer = -1; //-1 == auto layer
var lastWorldMousePos = { "x": null, "y": null };
var mouseButtonPressed = {};
var lastMouseButtonPressed = {};
document.getElementById("2Dcanvas").addEventListener('mousedown', function (e) {
    mouseButtonPressed[e.button] = true;
});
document.getElementById("2Dcanvas").addEventListener('mouseup', function (e) {
    mouseButtonPressed[e.button] = false;
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
    if (mouseButtonPressed[0] && selectedTool === 0) { // draw tool
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
    else if (mouseButtonPressed[0] && selectedTool === 1) { // erase tool
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
    else if (mouseButtonPressed[0] && selectedTool === 2) { // pick tool
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
                    selectedTile = tileToPick.tileAssetId;
                }
            }
        }
    }
    lastWorldMousePos = { "x": worldMousePos.x, "y": worldMousePos.y };
    lastMouseButtonPressed = JSON.parse(JSON.stringify(mouseButtonPressed));
    window.requestAnimationFrame(tick);
}
tick();
//# sourceMappingURL=editor.js.map