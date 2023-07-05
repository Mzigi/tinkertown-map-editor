var selectedTile = 0
var selectedTool = 0
var selectedLayer = -1 //-1 == auto layer

var lastWorldMousePos = {"x": null, "y": null}

let mouseButtonPressed = {}
let lastMouseButtonPressed = {}

document.getElementById("2Dcanvas").addEventListener('mousedown', function(e) {
    mouseButtonPressed[e.button] = true
})
document.getElementById("2Dcanvas").addEventListener('mouseup', function(e) {
    mouseButtonPressed[e.button] = false
})

function alertText(text, isError, time) {
    alertElement.innerText = text
    if (isError) {
        alertElement.classList.add("errorAlert")
    } else {
        alertElement.classList.remove("errorAlert")
    }
    alertElement.classList.add("alertOn")
    setTimeout(function () {
        alertElement.classList.remove("alertOn")
    }, time * 1000)
}

function setLayer(layer) {
    document.getElementById("layer-input").classList.remove("selected-slot")
    if (document.getElementById("layer-" + selectedLayer)) {
        document.getElementById("layer-" + selectedLayer).classList.remove("selected-slot")
    }
    if (layer == null) {
        layer = Number(document.getElementById("layer-input").value)
    }
    selectedLayer = layer
    if (document.getElementById("layer-" + selectedLayer)) {
        document.getElementById("layer-" + selectedLayer).classList.add("selected-slot")
    } else if (Number(document.getElementById("layer-input").value) == selectedLayer) {
        document.getElementById("layer-input").classList.add("selected-slot")
    }
}

function setTool(tool) {
    document.getElementById("tool-" + selectedTool).classList.remove("selected-slot")
    selectedTool = tool
    document.getElementById("tool-" + selectedTool).classList.add("selected-slot")
}

function changeSetting(settingName) {
    if (settingName == "seed" || settingName == "timescale") { //numbers
        let num = Number(document.getElementById("world-settings-" + settingName).value)
        if (isNaN(num) || typeof(num) != "number") {
            alertText(`(${settingName}) Number is invalid`, true, 5)
        } else {
            worlds[currentWorld][settingName] = num
        }
    } else if (settingName == "version" || settingName == "highestUsedVersion" || settingName == "additionalParams") { //objects
        try {
            let object = JSON.parse(document.getElementById("world-settings-" + settingName).value)
            worlds[currentWorld][settingName] = object
        } catch (error) {
            alertText(`(${settingName}) ` + error, true, 5)
        }
    } if (settingName == "hasBeenGenerated" || settingName == "progression" || settingName == "friendlyFire" || settingName == "forestBarrierBroken" || settingName == "NPCsOff") {
        if (document.getElementById("world-settings-" + settingName).value === "true") {
            worlds[currentWorld][settingName] = true
        } else if (document.getElementById("world-settings-" + settingName).value === "false") {
            worlds[currentWorld][settingName] = false
        } else {
            alertText(`(${settingName}) ` + document.getElementById("world-settings-" + settingName).value + ' is not a valid bool. "true" or "false" expected', true, 5)
        }
    } else {
        worlds[currentWorld][settingName] = document.getElementById("world-settings-" + settingName).value
    }
}

function tick() {
    let worldMousePos = worlds[currentWorld].camera.screenPosToWorldPos(document.getElementById("2Dcanvas"), worlds[currentWorld].camera.lastPosition.x,worlds[currentWorld].camera.lastPosition.y)
    let chunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(worldMousePos.x, worldMousePos.y)
    let tileAtMouse = null

    let lastChunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(lastWorldMousePos.x, lastWorldMousePos.y)
    let lastTileAtMouse = {"x": null, "y": null}
    if (lastChunkAtMouse) {
        lastTileAtMouse = lastChunkAtMouse.getTilePosAtWorldPos(lastWorldMousePos.x, lastWorldMousePos.y)
    }
    if (!lastChunkAtMouse) {
        lastChunkAtMouse = {"x": null, "y": null}
    }

    if (chunkAtMouse) {
        tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)
        /*let replacementTile = new Tile()
        replacementTile.x = tileAtMouse.x
        replacementTile.y = tileAtMouse.y
        replacementTile.z = 9
        replacementTile.tileAssetid = selectedTile
        
        chunkAtMouse.setTile(replacementTile)*/
    }

    if (mouseButtonPressed[0] && selectedTool === 0) { // draw tool
        //create new chunk if there is none
        if (!chunkAtMouse) {
            let chunkPos = worlds[currentWorld].getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y)
            chunkAtMouse = new Chunk()
            chunkAtMouse.x = chunkPos.x
            chunkAtMouse.y = chunkPos.y
            worlds[currentWorld].addChunk(chunkAtMouse)
        }
        tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)

        //check if tile was already just placed here
        let shouldPlaceAgain = true

        if (chunkAtMouse.x == lastChunkAtMouse.x && chunkAtMouse.y == lastChunkAtMouse.y) {
            if (tileAtMouse.x == lastTileAtMouse.x && tileAtMouse.y == lastTileAtMouse.y) {
                shouldPlaceAgain = false
            }
        }

        //replace the tile with the selected one
        if (tileAtMouse && shouldPlaceAgain || !lastMouseButtonPressed[0]) {
            let replacementTile = new Tile()
            replacementTile.x = tileAtMouse.x
            replacementTile.y = tileAtMouse.y
            replacementTile.tileAssetid = selectedTile

            let highestTile = null

            if (selectedLayer > -1) {
                replacementTile.z = selectedLayer
            } else { //get highest layer if auto layer is on
                let highestZ = 0
                for (let i = 0; i < chunkAtMouse.layers; i++) {
                    let testTile = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i)
                    if (chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i)) {
                        highestZ = i
                        highestTile = testTile
                    }
                }

                if (highestTile) {
                    highestZ += 1
                }
                highestZ = Math.min(highestZ, chunkAtMouse.layers)
                replacementTile.z = highestZ
            }

            //make sure same tile type arent placed on top of eachother
            if (highestTile) {
                if (highestTile.tileAssetid != replacementTile.tileAssetid) {
                    chunkAtMouse.setTile(replacementTile)
                }
            } else {
                chunkAtMouse.setTile(replacementTile)
            }
        }
    } else if (mouseButtonPressed[0] && selectedTool === 1) { // erase tool
        if (tileAtMouse) {
            //check if tile was already just erased here
            let shouldPlaceAgain = true

            if (chunkAtMouse.x == lastChunkAtMouse.x && chunkAtMouse.y == lastChunkAtMouse.y) {
                if (tileAtMouse.x == lastTileAtMouse.x && tileAtMouse.y == lastTileAtMouse.y) {
                    shouldPlaceAgain = false
                }
            }

            //delete the tile
            if (tileAtMouse && shouldPlaceAgain || !lastMouseButtonPressed[0]) {
                let zPos = selectedLayer

                let highestTile = null

                if (selectedLayer > -1) {
                    zPos = selectedLayer
                } else { //get highest layer if auto layer is on
                    let highestZ = 0
                    for (let i = 0; i < chunkAtMouse.layers; i++) {
                        let testTile = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i)
                        if (chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i)) {
                            highestZ = i
                            highestTile = testTile
                        }
                    }

                    highestZ = Math.min(highestZ, chunkAtMouse.layers)
                    zPos = highestZ
                }
                chunkAtMouse.removeTileAt(tileAtMouse.x, tileAtMouse.y, zPos)
            }
        }
    } else if (mouseButtonPressed[0] && selectedTool === 2) { // pick tool
        if (tileAtMouse) {
            //delete the tile
            if (tileAtMouse && !lastMouseButtonPressed[0]) {
                let zPos = selectedLayer

                let highestTile = null

                if (selectedLayer > -1) {
                    zPos = selectedLayer
                } else { //get highest layer if auto layer is on
                    let highestZ = 0
                    for (let i = 0; i < chunkAtMouse.layers; i++) {
                        let testTile = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i)
                        if (chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i)) {
                            highestZ = i
                            highestTile = testTile
                        }
                    }

                    highestZ = Math.min(highestZ, chunkAtMouse.layers)
                    zPos = highestZ
                }

                let tileToPick = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, zPos)
                if (tileToPick != null) {
                    let previousSlot = document.getElementById("list-slot-" + selectedTile)
                    if (previousSlot) {
                        previousSlot.classList.remove("selected-slot")
                    }

                    let slot = document.getElementById("list-slot-" + tileToPick.tileAssetid)
                    if (slot) {
                        slot.classList.add("selected-slot")
                    }
                    selectedTile = tileToPick.tileAssetid
                }
            }
        }
    }

    lastWorldMousePos = {"x": worldMousePos.x, "y": worldMousePos.y}
    lastMouseButtonPressed = JSON.parse(JSON.stringify(mouseButtonPressed))
    window.requestAnimationFrame(tick)
}

tick()