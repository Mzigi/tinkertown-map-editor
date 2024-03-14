"use-strict";
// @ts-check

/*
import { drawToolTick } from "./tools/draw";
import { eraseToolTick } from "./tools/erase";
import { pickToolTick } from "./tools/pick";*/

function drawToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
    //create new chunk if there is none
    if (chunkAtMouse == null) {
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
        replacementTile.tileAssetId = selectedTile

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
            if (highestTile.tileAssetId != replacementTile.tileAssetId) {
                chunkAtMouse.setTile(replacementTile)
            }
        } else {
            chunkAtMouse.setTile(replacementTile)
        }
    }
}

function eraseToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
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
}

function pickToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number): any {
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

                let slot = document.getElementById("list-slot-" + tileToPick.tileAssetId)
                if (slot) {
                    slot.classList.add("selected-slot")
                }
                return tileToPick.tileAssetId
            }
        }
    }
}

function listIncludesTilePos(arr: Array<any>, x: number, y: number) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] == x && arr[i][1] == y) {
            return true
        }
    }

    return false
}

function objectIncludesTilePos(obj: any, x: number, y: number) {
    if (!obj[x]) {
        return false
    }

    return obj[x][y] == true
}

function tilePosIsValid(tilePos: any) {
    return (tilePos.x >= 0 && tilePos.x <= 9 && tilePos.y >= 0 && tilePos.y <= 9)
}

function fillToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
    //create new chunk if there is none
    if (chunkAtMouse == null) {
        let chunkPos = worlds[currentWorld].getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y)
        chunkAtMouse = new Chunk()
        chunkAtMouse.x = chunkPos.x
        chunkAtMouse.y = chunkPos.y
        chunkAtMouse.fillWithId(selectedTile)
        worlds[currentWorld].addChunk(chunkAtMouse)
    } else {
        tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)

        let tileIdToFlood = -1
        let layerIdToFlood = 0

        let highestTile = null

        if (selectedLayer > -1) {
            layerIdToFlood = selectedLayer
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
            layerIdToFlood = highestZ
        }

        if (!highestTile) {
            highestTile = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, layerIdToFlood)
        }
        tileIdToFlood = highestTile?.tileAssetId

        if (!highestTile) {
            highestTile = {"x": tileAtMouse.x, "y": tileAtMouse.y, "z": layerIdToFlood, "tileAssetId": undefined}
            tileIdToFlood = undefined
        }

        let openTiles = [highestTile]
        let closedTiles = {}

        while (openTiles.length > 0) {
            let newOpenTiles = []

            for (let i = 0; i < openTiles.length; i++) {
                let currentTile = openTiles[i]
                
                if (currentTile.tileAssetId == tileIdToFlood && currentTile.z == layerIdToFlood) {
                    let replacementTile = new Tile()
                    replacementTile.x = currentTile.x
                    replacementTile.y = currentTile.y
                    replacementTile.z = layerIdToFlood
                    replacementTile.tileAssetId = selectedTile

                    chunkAtMouse.setTile(replacementTile)

                    if (!closedTiles[currentTile.x]) {
                        closedTiles[currentTile.x] = {}
                    }

                    closedTiles[currentTile.x][currentTile.y] = true

                    //west
                    let westTile = {"x": currentTile.x - 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined}
                    westTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x - 1, currentTile.y, currentTile.z)?.tileAssetId
                    if (tilePosIsValid(westTile)) {
                        if (!objectIncludesTilePos(closedTiles, westTile.x, westTile.y)) {
                            newOpenTiles.push(westTile)
                        }
                    }

                    //east
                    let eastTile = {"x": currentTile.x + 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined}
                    eastTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x + 1, currentTile.y, currentTile.z)?.tileAssetId
                    if (tilePosIsValid(eastTile)) {
                        if (!objectIncludesTilePos(closedTiles, eastTile.x, eastTile.y)) {
                            newOpenTiles.push(eastTile)
                        }
                    }

                    //north
                    let northTile = {"x": currentTile.x, "y": currentTile.y + 1, "z": currentTile.z, "tileAssetId": undefined}
                    northTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x, currentTile.y + 1, currentTile.z)?.tileAssetId
                    if (tilePosIsValid(northTile)) {
                        if (!objectIncludesTilePos(closedTiles, northTile.x, northTile.y)) {
                            newOpenTiles.push(northTile)
                        }
                    }

                    //south
                    let southTile = {"x": currentTile.x, "y": currentTile.y - 1, "z": currentTile.z, "tileAssetId": undefined}
                    southTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x, currentTile.y - 1, currentTile.z)?.tileAssetId
                    if (tilePosIsValid(southTile)) {
                        if (!objectIncludesTilePos(closedTiles, southTile.x, southTile.y)) {
                            newOpenTiles.push(southTile)
                        }
                    }
                }
            }

            openTiles = newOpenTiles
        }
    }
}

function addContainerToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
    if (chunkAtMouse) {
        if (tileAtMouse) {
            let alreadyPlaced = false

            for (let i = 0; i < worlds[currentWorld].containers.length; i++) {
                let container = worlds[currentWorld].containers[i]
                if (container.x == tileAtMouse.x && container.y == tileAtMouse.y && container.chunkX == chunkAtMouse.x && container.chunkY == chunkAtMouse.y) {
                    alreadyPlaced = true
                }
            }

            if (!alreadyPlaced) {
                let newContainer = new Inventory()
                newContainer.chunkX = chunkAtMouse.x
                newContainer.chunkY = chunkAtMouse.y
                newContainer.x = tileAtMouse.x
                newContainer.y = tileAtMouse.y

                worlds[currentWorld].containers.push(newContainer)
            }
        }
    }
}

function addItemToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
    if (chunkAtMouse) {
        if (tileAtMouse) {
            let alreadyPlaced = false

            for (let i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                let item = chunkAtMouse.itemDataList[i]
                if (Math.floor(item.x) == tileAtMouse.x && Math.floor(item.y) == tileAtMouse.y && item.chunkX == chunkAtMouse.x && item.chunkY == chunkAtMouse.y) {
                    alreadyPlaced = true
                }
            }

            if (!alreadyPlaced) {
                let newItem = new Item()
                newItem.chunkX = chunkAtMouse.x
                newItem.chunkY = chunkAtMouse.y

                let exactTileAtMouse = chunkAtMouse.getExactTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)
                newItem.x = tileAtMouse.x
                newItem.y = tileAtMouse.y

                chunkAtMouse.itemDataList.push(newItem)

                chunkAtMouse.chunkHasBeenEdited = true
                chunkAtMouse.undoEdited = true
                chunkAtMouse.resetCacheImage()

                console.log(chunkAtMouse)
            }
        }
    }
}

var selectedTile: number
var selectedTool: number
var selectedLayer: number //-1 == auto layer

selectedTile = 0
selectedTool = 0
selectedLayer = -1

var lastWorldMousePos: Vector2 = {"x": null, "y": null}

let mouseButtonPressed = {}
let lastMouseButtonPressed = {}

let hoveredItem: Item = null
let hoveredStorage: Inventory = null

let openedStorage: Inventory = null

let openedItem: Item = null
let openedItemStorage: Inventory = null

if (NEWUI) {
    let navbarButtons = document.getElementsByClassName("navbar-button")
    
    let hoveredButton = null

    let navButtonClicked = false

    for (let i = 0; i < navbarButtons.length; i++) {
        //BUTTON EVENT
        navbarButtons[i].addEventListener("click", () => {
            navButtonClicked = true
            let dropdownList = document.getElementById(navbarButtons[i].id + "-buttons")

            if (dropdownList) {
                dropdownList.classList.add("navbar-dropdown-active")
            }
        })

        //DOCUMENT HOVEROVER
        document.addEventListener("mouseover", (e) => {
            //find hovered button
            let target = e.target || document

            let newHoveredButton = null
            let lastCheckedElement: HTMLElement = target as HTMLElement
            
            while (lastCheckedElement != null) {
                if ((lastCheckedElement as HTMLElement).classList.contains("navbar-button")) {
                    newHoveredButton = lastCheckedElement.id
                    lastCheckedElement = null
                } else {
                    lastCheckedElement = lastCheckedElement.parentElement

                    if (lastCheckedElement && lastCheckedElement.classList.contains("navbar-dropdown")) {
                        lastCheckedElement = document.getElementById(lastCheckedElement.id.replace("-buttons",""))
                    }
                }
            }

            hoveredButton = newHoveredButton

            //remove dropdowns
            for (let i = 0; i < navbarButtons.length; i++) {
                let dropdownList = document.getElementById(navbarButtons[i].id + "-buttons")

                if (dropdownList) {
                    document.getElementById(navbarButtons[i].id + "-buttons").classList.remove("navbar-dropdown-active")
                }
            }

            //stop click if no hovered button
            if (!hoveredButton) {
                navButtonClicked = false
            }

            //show correct dropdown
            if (hoveredButton && navButtonClicked) {
                let hoveredButtonElement = document.getElementById(hoveredButton)
                let dropdownList = document.getElementById(hoveredButton + "-buttons")
                let parentNav = hoveredButtonElement.getAttribute("parentnav")

                if (dropdownList) {
                    dropdownList.classList.add("navbar-dropdown-active")
                    if (dropdownList.classList.contains("navbar-dropdown-parented")) {
                        dropdownList.style.left = hoveredButtonElement.clientWidth + "px"
                    }
                }

                let lastParentNav = parentNav
                
                while (lastParentNav) {
                    document.getElementById(lastParentNav + "-buttons").classList.add("navbar-dropdown-active")

                    if (document.getElementById(lastParentNav).getAttribute("parentnav")) {
                        lastParentNav = document.getElementById(lastParentNav).getAttribute("parentnav")
                    } else {
                        lastParentNav = null
                    }
                }

                if (dropdownList) {
                    if (dropdownList.classList.contains("navbar-dropdown-parented")) {
                        dropdownList.style.left = hoveredButtonElement.clientWidth + "px"
                    }
                }
            }
        })
    }

    //preferences ui
    let cssThemeElement: HTMLLinkElement = <HTMLLinkElement>document.getElementById("css-theme")

    let cssTheme = getPreference("theme")
    if (!cssTheme) {
        cssTheme = "dark"
    }

    function updateTheme(cssTheme: string) {
        setPreference("theme", cssTheme)

        switch (cssTheme) {
            case "dark":
                document.getElementById("navbar-themes-dark").innerHTML = 'Dark<span class="material-symbols-outlined" style="display: inline-block;">done</span>'
                document.getElementById("navbar-themes-light").innerHTML = 'Light'
                cssThemeElement.setAttribute("href", "assets/css/themes/dark.css")
                break;
            case "light":
                document.getElementById("navbar-themes-light").innerHTML = 'Light<span class="material-symbols-outlined" style="display: inline-block;">done</span>'
                document.getElementById("navbar-themes-dark").innerHTML = 'Dark'
                cssThemeElement.setAttribute("href", "assets/css/themes/light.css")
                break;
        }
    }

    document.getElementById("navbar-themes-dark").addEventListener("click", () => {
        updateTheme("dark")
    })

    document.getElementById("navbar-themes-light").addEventListener("click", () => {
        updateTheme("light")
    })

    updateTheme(cssTheme)

    //tile list view
    let tileListVisible: string = getPreference("tile-list-visible")
    if (!tileListVisible) {
        tileListVisible = "true"
    }

    function setTileListDisplay(visible: string) {
        setPreference("tile-list-visible", visible)

        if (visible === "true") {
            document.getElementById("item-list-side").style.display = ""
            document.getElementById("layer-list-side").style.display = ""
            document.getElementById("2Dcanvas").style.width = 'calc(100% - 550px)'
            document.getElementById("navbar-view-tilelist").innerHTML = 'Tile List<span class="material-symbols-outlined" style="display: inline-block;">done</span>'
        } else {
            document.getElementById("item-list-side").style.display = "none"
            document.getElementById("layer-list-side").style.display = "none"
            document.getElementById("2Dcanvas").style.width = '100%'
            document.getElementById("navbar-view-tilelist").innerHTML = 'Tile List'
        }
    }

    document.getElementById("navbar-view-tilelist").addEventListener("click", () => {
        if (getPreference("tile-list-visible") === "true") {
            setTileListDisplay("false")
        } else {
            setTileListDisplay("true")
        }
    })

    setTileListDisplay(tileListVisible)

    //debug text in 2d renderer

    let canvasDebugText: string = getPreference("canvas-debug-text")
    if (!canvasDebugText) {
        canvasDebugText = "true"
    }

    function setCanvasDebugText(visible: string) {
        setPreference("canvas-debug-text", visible)

        if (visible === "true") {
            document.getElementById("navbar-view-canvasdebug").innerHTML = 'Canvas Debug<span class="material-symbols-outlined" style="display: inline-block;">done</span>'
        } else {
            document.getElementById("navbar-view-canvasdebug").innerHTML = 'Canvas Debug'
        }
    }

    document.getElementById("navbar-view-canvasdebug").addEventListener("click",() => {
        if (getPreference("canvas-debug-text") === "true") {
            setCanvasDebugText("false")
        } else {
            setCanvasDebugText("true")
        }
    })

    setCanvasDebugText(canvasDebugText)
}

document.getElementById("2Dcanvas").addEventListener('mousedown', function(e) {
    mouseButtonPressed[e.button] = true
    openedStorage = null

    //set item properties
    if (openedItem && openedItemStorage) {
        let chunkAtItem = worlds[currentWorld].getChunkAt(openedItem.chunkX, openedItem.chunkY)

        let shouldDelete = false

        if (openedItemStorage.itemDataList.length > 0) {
            if (openedItemStorage.itemDataList[0].count <= 0) {
                shouldDelete = true
            }
        } else {
            shouldDelete = true
        }

        if (!shouldDelete) {
            openedItem.id = openedItemStorage.itemDataList[0].id
            openedItem.count = openedItemStorage.itemDataList[0].count
        } else {
            if (chunkAtItem) {
                for (let i = 0; i < chunkAtItem.itemDataList.length; i++) {
                    if (chunkAtItem.itemDataList[i] == openedItem) {
                        chunkAtItem.itemDataList.splice(i,1)
                        chunkAtItem.chunkHasBeenEdited = true
                        chunkAtItem.undoEdited = true
                        chunkAtItem.resetCacheImage()
                        break
                    }
                }
            }
        }

        if (chunkAtItem) {
            chunkAtItem.chunkHasBeenEdited = true
            chunkAtItem.undoEdited = true
            chunkAtItem.resetCacheImage()
        }
    }
    openedItem = null

    document.getElementById("inventory-container").style.display = "none"
    document.getElementById("small-item-list-container").style.display = "none"
})

function findFirstVisibleWorld() {
    let visibleWorld = null
    let index = 0

    for (let i = 0; i < worlds.length; i++) {
        if (!worlds[i].hidden) {
            visibleWorld = worlds[i]
            index = i
        }
    }

    if (visibleWorld == null) {
        let visibleWorld = new World()
        worlds.push(visibleWorld)

        index = worlds.length - 1
    }

    currentWorld = index
}

function createWorldElement(worldId: number): HTMLButtonElement {
    let thisWorld = worlds[worldId]

    let worldButton = document.createElement("button")
    worldButton.classList.add("world")
    worldButton.setAttribute("world-id", String(worldId))

    let worldTitle = document.createElement("span")
    worldTitle.classList.add("world-name")
    worldTitle.innerText = thisWorld.name

    worldButton.appendChild(worldTitle)

    let closeButton = document.createElement("button")
    closeButton.classList.add("material-symbols-outlined")
    closeButton.classList.add("world-close")
    closeButton.innerText = "close"

    worldButton.appendChild(closeButton)

    closeButton.addEventListener("click", () => {
        document.getElementById("remove-world-title").innerText = "Remove " + thisWorld.name + "?";
        (<HTMLDialogElement>document.getElementById("dialog-confirm-close")).showModal()

        function RemoveWorld() {
            thisWorld.reset()
            thisWorld.hidden = true
            
            if (worldId == currentWorld) {
                findFirstVisibleWorld()
            }
            updateWorldList();

            (<HTMLDialogElement>document.getElementById("dialog-confirm-close")).close()

            document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", RemoveWorld)
            document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", CancelRemove)
        }

        function CancelRemove() {
            (<HTMLDialogElement>document.getElementById("dialog-confirm-close")).close()

            document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", RemoveWorld)
            document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", CancelRemove)
        }

        document.getElementById("dialog-confirm-close-confirm").addEventListener("click", RemoveWorld)
        document.getElementById("dialog-confirm-close-cancel").addEventListener("click", CancelRemove)
    })

    if (worldId != currentWorld) {
        worldButton.classList.add("world-unloaded")
    }

    worldButton.addEventListener("click", () => {
        if (!worlds[worldId].hidden) {
            currentWorld = worldId
            updateWorldList()
        }
    })

    return worldButton
}

function updateWorldList() {
    if (NEWUI) {
        //remove all elements
        document.getElementById("worldlist").innerHTML = ""

        //add new ones
        //let currentWorldElement = createWorldElement(currentWorld)

        //document.getElementById("worldlist").appendChild(currentWorldElement)

        for (let i = 0; i < worlds.length; i++) {
            if (!worlds[i].hidden) {
                document.getElementById("worldlist").appendChild(createWorldElement(i))
            }
        }
    }
}

updateWorldList()

function positionInventory() {
    let worldMousePos = worlds[currentWorld].camera.screenPosToWorldPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), worlds[currentWorld].camera.lastPosition.x,worlds[currentWorld].camera.lastPosition.y)
            
    worldMousePos.x = Math.floor(worldMousePos.x / 16) * 16 + 16
    worldMousePos.y = Math.floor(worldMousePos.y / 16) * 16 + 16

    let mouseTileScreenPos = worlds[currentWorld].camera.worldPosToScreenPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), worldMousePos.x, worldMousePos.y)

    document.getElementById("inventory-container").style.display = "block"

    let inventoryY = Math.min(window.innerHeight - document.getElementById("inventory-container").clientHeight, mouseTileScreenPos.y)

    document.getElementById("inventory-container").style.left = mouseTileScreenPos.x + "px"
    document.getElementById("inventory-container").style.top = inventoryY + "px"

    document.getElementById("small-item-list-container").style.display = ""
    document.getElementById("small-item-list-container").style.left = (mouseTileScreenPos.x + document.getElementById("inventory-container").clientWidth) + "px"
    document.getElementById("small-item-list-container").style.top = inventoryY + "px"
}

document.getElementById("2Dcanvas").addEventListener('mouseup', function(e) {
    mouseButtonPressed[e.button] = false
    if (e.button === 0) {
        if (hoveredStorage) {
            openedStorage = hoveredStorage
            hoveredStorage.visualize()

            positionInventory()
        } else if (hoveredItem) {
            openedItem = hoveredItem

            openedItemStorage = new Inventory()
            openedItemStorage.width = 1
            openedItemStorage.height = 1

            openedItemStorage.setIdAtSlot(0, openedItem.id)
            openedItemStorage.setCountAtSlot(0, openedItem.count)

            openedItemStorage.visualize()

            positionInventory()
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
})

function alertText(text: string, isError: boolean, time: number) {
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

function setLayer(layer: number) {
    document.getElementById("layer-input").classList.remove("selected-slot")
    if (document.getElementById("layer-" + selectedLayer)) {
        document.getElementById("layer-" + selectedLayer).classList.remove("selected-slot")
    }
    if (layer == null) {
        layer = Number((<HTMLInputElement>document.getElementById("layer-input")).value)
    }
    selectedLayer = layer
    if (document.getElementById("layer-" + selectedLayer)) {
        document.getElementById("layer-" + selectedLayer).classList.add("selected-slot")
    } else if (Number((<HTMLInputElement>document.getElementById("layer-input")).value) == selectedLayer) {
        document.getElementById("layer-input").classList.add("selected-slot")
    }
}

function setTool(tool: number) {
    document.getElementById("tool-" + selectedTool).classList.remove("tool-selected")
    selectedTool = tool
    document.getElementById("tool-" + selectedTool).classList.add("tool-selected")
}

//world settings
function changeSetting(settingName: string) {
    let originalName = worlds[currentWorld]["name"]
    let worldSettingValue: string = (<HTMLInputElement>document.getElementById("world-settings-" + settingName)).value

    for (let key in uneditedFiles) {
        originalName = key.split("/")[0]
    }

    if (settingName == "seed" || settingName == "timescale") { //numbers
        let num = Number(worldSettingValue)
        if (isNaN(num) || typeof(num) != "number") {
            alertText(`(${settingName}) Number is invalid`, true, 5)
        } else {
            worlds[currentWorld][settingName] = num
        }
    } else if (settingName == "version" || settingName == "highestUsedVersion" || settingName == "additionalParams") { //objects
        try {
            let object = JSON.parse(worldSettingValue)
            worlds[currentWorld][settingName] = object
        } catch (error) {
            alertText(`(${settingName}) ` + error, true, 5)
        }
    } if (settingName == "hasBeenGenerated" || settingName == "progression" || settingName == "friendlyFire" || settingName == "forestBarrierBroken" || settingName == "NPCsOff") {
        if (worldSettingValue === "true") {
            worlds[currentWorld][settingName] = true
        } else if (worldSettingValue === "false") {
            worlds[currentWorld][settingName] = false
        } else {
            alertText(`(${settingName}) ` + worldSettingValue + ' is not a valid boolean. "true" or "false" expected', true, 5)
        }
    } else {
        worlds[currentWorld][settingName] = worldSettingValue
    }

    if (settingName == "name") {
        //fix file paths in unedited files
        for (let key in uneditedFiles) {
            let buffer = uneditedFiles[key]
            let newKey = key.replace(originalName, worlds[currentWorld].name)
            uneditedFiles[newKey] = buffer
            delete uneditedFiles[key]
        }

        //fix file paths in world.chunkCache
        for (let key in worlds[currentWorld].chunkCache) {
            let buffer = worlds[currentWorld].chunkCache[key]
            let newKey = key.replace(originalName, worlds[currentWorld].name)
            worlds[currentWorld].chunkCache[newKey] = buffer
            delete worlds[currentWorld].chunkCache[key]
        }

        updateWorldList()
    }
}

//are you sure alert
window.onbeforeunload = function () {
    return "Are you sure you want to exit the editor?"
}

function tick() {
    let worldMousePos = worlds[currentWorld].camera.screenPosToWorldPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), worlds[currentWorld].camera.lastPosition.x,worlds[currentWorld].camera.lastPosition.y)
    let chunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(worldMousePos.x, worldMousePos.y)
    let tileAtMouse = null

    let lastChunkAtMouse: any = worlds[currentWorld].getChunkAtWorldPos(lastWorldMousePos.x, lastWorldMousePos.y)
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
        replacementTile.tileAssetId = selectedTile
        
        chunkAtMouse.setTile(replacementTile)*/
    }

    //Items and containers
    let isHoveringOverObject = false
    hoveredStorage = null
    hoveredItem = null

    //containers
    if (tileAtMouse) {
        for (let i = 0; i < worlds[currentWorld].containers.length; i++) {
            let container = worlds[currentWorld].containers[i]
            if (tileAtMouse.x == container.x && tileAtMouse.y == container.y && chunkAtMouse.x == container.chunkX && chunkAtMouse.y == container.chunkY) {
                isHoveringOverObject = true
                hoveredStorage = container
            }
        }
    }

    //items
    if (chunkAtMouse) {
        for (let i = 0; i < chunkAtMouse.itemDataList.length; i++) {
            let item = chunkAtMouse.itemDataList[i]
            let mouseTilePosOffGrid = chunkAtMouse.getOffGridTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)
            mouseTilePosOffGrid.x -= 0.5
            mouseTilePosOffGrid.y += 0.5

            if (chunkAtMouse.x == item.chunkX && chunkAtMouse.y == item.chunkY && mouseTilePosOffGrid.x > item.x - 0.5 && mouseTilePosOffGrid.x < item.x + 0.5 && mouseTilePosOffGrid.y > item.y - 0.5 && mouseTilePosOffGrid.y < item.y + 0.5) {
                isHoveringOverObject = true
                hoveredItem = item
            }
        }
    }

    //Change cursor
    if (isHoveringOverObject) {
        document.getElementById("2Dcanvas").style.cursor = "pointer"
    } else {
        document.getElementById("2Dcanvas").style.cursor = ""
    }

    //Tools
    if (!isHoveringOverObject) {
        if (mouseButtonPressed[0] && selectedTool === 0) { // draw tool
            drawToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile)
        } else if (mouseButtonPressed[0] && selectedTool === 1) { // erase tool
            eraseToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile)
        } else if (mouseButtonPressed[0] && selectedTool === 2) { // pick tool
            let tileToSet = pickToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile)
            if (tileToSet) {
                console.log(tileToSet)
                selectedTile = tileToSet
            }
        } else if (mouseButtonPressed[0] && selectedTool === 3) {
            fillToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile)
        } else if (mouseButtonPressed[0] && selectedTool === 4) {
            addContainerToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile)
        } else if (mouseButtonPressed[0] && selectedTool === 5) {
            addItemToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, lastMouseButtonPressed, selectedLayer, selectedTile)
        }
    } else if (hoveredStorage && mouseButtonPressed[0] && selectedTool === 1) { //erase storage
        for (let i = 0; i < worlds[currentWorld].containers.length; i++) {
            if (worlds[currentWorld].containers[i] == hoveredStorage) {
                worlds[currentWorld].containers.splice(i,1)
                break
            }
        }
    } else if (hoveredItem && mouseButtonPressed[0] && selectedTool === 1 && chunkAtMouse) { //erase item
        for (let i = 0; i < chunkAtMouse.itemDataList.length; i++) {
            if (chunkAtMouse.itemDataList[i] == hoveredItem) {
                chunkAtMouse.itemDataList.splice(i,1)
                chunkAtMouse.chunkHasBeenEdited = true
                chunkAtMouse.undoEdited = true
                chunkAtMouse.resetCacheImage()
                break
            }
        }
    }

    lastWorldMousePos = {"x": worldMousePos.x, "y": worldMousePos.y}
    lastMouseButtonPressed = JSON.parse(JSON.stringify(mouseButtonPressed))
    window.requestAnimationFrame(tick)
}

tick()