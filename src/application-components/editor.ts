import { Chunk } from "../classes/objects/chunk.js";
import { Inventory, InventoryFormat } from "../classes/objects/inventory.js";
import { Item } from "../classes/objects/item.js";
import { Tile } from "../classes/objects/tile.js";
import { World } from "../classes/objects/world.js";
import { Draw } from "../classes/tools/draw.js";
import { Tool } from "../classes/tools/tool.js";
import { ImageHolder } from "./image-loader.js";
import { Loader } from "./loader.js";

enum SelectToolState {
    None,
    Selecting,
    Selected,
    Move,
}

enum MouseButtonState {
    None,
    Down,
    Held,
    Up
}

export class Editor {
    loader: Loader
    imageHolder: ImageHolder

    images: {[key: string]: HTMLImageElement}

    tools: {[key: number]: Tool} = {
        0: new Draw(0, "Draw")
    }

    slotSize: number = 64

    mouseDownStartPos = null
    selectToolState = SelectToolState.None
    originalSelection = null

    selectedTile: number = 0
    selectedTool: number = 0
    selectedLayer: number = -1 //-1 == auto layer

    lastWorldMousePos: Vector2 = {"x": null, "y": null}
    
    mouseButtonPressed = {}
    lastMouseButtonPressed = {}
    
    hoveredItem: Item = null
    hoveredStorage: Inventory = null
    
    openedStorage: Inventory = null
    
    openedItem: Item = null
    openedItemStorage: Inventory = null

    alertElement: HTMLElement = document.getElementById("alert")
    
    constructor(loader: Loader, imageHolder: ImageHolder) {
        this.loader = loader
        this.imageHolder = imageHolder
        this.images = imageHolder.images
        
        if (loader.NEWUI) {
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
            let cssTheme = loader.getPreference("theme")
            if (!cssTheme) {
                cssTheme = "dark"
            }
        
            document.getElementById("navbar-themes-dark").addEventListener("click", () => {
                this.updateTheme("dark")
            })
        
            document.getElementById("navbar-themes-light").addEventListener("click", () => {
                this.updateTheme("light")
            })
        
            this.updateTheme(cssTheme)
        
            //tile list view
            let tileListVisible: string = loader.getPreference("tile-list-visible")
            if (!tileListVisible) {
                tileListVisible = "true"
            }
        
            document.getElementById("navbar-view-tilelist").addEventListener("click", () => {
                if (loader.getPreference("tile-list-visible") === "true") {
                    this.setTileListDisplay("false")
                } else {
                    this.setTileListDisplay("true")
                }
            })
        
            this.setTileListDisplay(tileListVisible)
        
            //debug text in 2d renderer
        
            let canvasDebugText: string = loader.getPreference("canvas-debug-text")
            if (!canvasDebugText) {
                canvasDebugText = "false"
            }
        
            document.getElementById("navbar-view-canvasdebug").addEventListener("click",() => {
                if (loader.getPreference("canvas-debug-text") === "true") {
                    this.setCanvasDebugText("false")
                } else {
                    this.setCanvasDebugText("true")
                }
            })
        
            this.setCanvasDebugText(canvasDebugText)
        
            //show points of interest
            let showPOI: string = loader.getPreference("show-poi")
            if (!showPOI) {
                showPOI = "true"
            }
        
            document.getElementById("navbar-view-show-poi").addEventListener("click",() => {
                if (loader.getPreference("show-poi") === "true") {
                    this.setShowPOI("false")
                } else {
                    this.setShowPOI("true")
                }
            })
        
            this.setShowPOI(showPOI)
        }
        
        document.getElementById("2Dcanvas").addEventListener('mousedown', (e) => {
            this.mouseButtonPressed[e.button] = true
            this.openedStorage = null
        
            //set item properties
            if (this.openedItem && this.openedItemStorage) {
                let chunkAtItem = loader.worlds[loader.currentWorld].getChunkAt(this.openedItem.chunkX, this.openedItem.chunkY)
        
                let shouldDelete = false
        
                if (this.openedItemStorage.itemDataList.length > 0) {
                    if (this.openedItemStorage.itemDataList[0].count <= 0) {
                        shouldDelete = true
                    }
                } else {
                    shouldDelete = true
                }
        
                if (!shouldDelete) {
                    this.openedItem.id = this.openedItemStorage.itemDataList[0].id
                    this.openedItem.count = this.openedItemStorage.itemDataList[0].count
                } else {
                    if (chunkAtItem) {
                        for (let i = 0; i < chunkAtItem.itemDataList.length; i++) {
                            if (chunkAtItem.itemDataList[i] == this.openedItem) {
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
            this.openedItem = null
        
            document.getElementById("inventory-container").style.display = "none"
            document.getElementById("small-item-list-container").style.display = "none"
        })

        document.getElementById("2Dcanvas").addEventListener('mouseup', (e) => {
            this.mouseButtonPressed[e.button] = false
            if (e.button === 0) {
                if (this.hoveredStorage) {
                    this.openedStorage = this.hoveredStorage
                    this.hoveredStorage.visualize(this.images, this.slotSize)
        
                    this.positionInventory()
                } else if (this.hoveredItem) {
                    this.openedItem = this.hoveredItem
        
                    this.openedItemStorage = new Inventory()
                    this.openedItemStorage.width = 1
                    this.openedItemStorage.height = 1
        
                    this.openedItemStorage.setIdAtSlot(0, this.openedItem.id)
                    this.openedItemStorage.setCountAtSlot(0, this.openedItem.count)
        
                    this.openedItemStorage.visualize(this.images, this.slotSize)
        
                    this.positionInventory()
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

        //are you sure alert
        window.onbeforeunload = function () {
            for (let world of loader.worlds) {
                if (world.chunks.length > 0) {
                    return "Are you sure you want to exit the editor?"
                }
            }
        }

        let editor = this

        window["setTool"] = (toolId: number) => {
            editor.setTool(toolId, editor)
        }
        window["setLayer"] = (layerId: number) => {
            editor.setLayer(layerId, editor)
        }
        window["changeSetting"] = (settingName: string) => {
            editor.changeSetting(settingName)
        }

        this.loader.updateWorldList()
    }

    drawToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
        let world = this.loader.worlds[this.loader.currentWorld]
        
        //create new chunk if there is none
        if (chunkAtMouse == null) {
            let chunkPos = world.getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y)
            chunkAtMouse = new Chunk()
            chunkAtMouse.x = chunkPos.x
            chunkAtMouse.y = chunkPos.y
            world.addChunk(chunkAtMouse)
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
    
    eraseToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
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
    
    pickToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number): any {
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
    
    listIncludesTilePos(arr: Array<any>, x: number, y: number) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i][0] == x && arr[i][1] == y) {
                return true
            }
        }
    
        return false
    }
    
    objectIncludesTilePos(obj: any, x: number, y: number) {
        if (!obj[x]) {
            return false
        }
    
        return obj[x][y] == true
    }
    
    tilePosIsValid(tilePos: Vector2) {
        return (tilePos.x >= 0 && tilePos.x <= 9 && tilePos.y >= 0 && tilePos.y <= 9)
    }
    
    fillToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
        let world = this.loader.worlds[this.loader.currentWorld]

        //create new chunk if there is none
        if (chunkAtMouse == null) {
            let chunkPos = world.getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y)
            chunkAtMouse = new Chunk()
            chunkAtMouse.x = chunkPos.x
            chunkAtMouse.y = chunkPos.y
            chunkAtMouse.fillWithId(selectedTile)
            world.addChunk(chunkAtMouse)
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
                        if (this.tilePosIsValid(westTile)) {
                            if (!this.objectIncludesTilePos(closedTiles, westTile.x, westTile.y)) {
                                newOpenTiles.push(westTile)
                            }
                        }
    
                        //east
                        let eastTile = {"x": currentTile.x + 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined}
                        eastTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x + 1, currentTile.y, currentTile.z)?.tileAssetId
                        if (this.tilePosIsValid(eastTile)) {
                            if (!this.objectIncludesTilePos(closedTiles, eastTile.x, eastTile.y)) {
                                newOpenTiles.push(eastTile)
                            }
                        }
    
                        //north
                        let northTile = {"x": currentTile.x, "y": currentTile.y + 1, "z": currentTile.z, "tileAssetId": undefined}
                        northTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x, currentTile.y + 1, currentTile.z)?.tileAssetId
                        if (this.tilePosIsValid(northTile)) {
                            if (!this.objectIncludesTilePos(closedTiles, northTile.x, northTile.y)) {
                                newOpenTiles.push(northTile)
                            }
                        }
    
                        //south
                        let southTile = {"x": currentTile.x, "y": currentTile.y - 1, "z": currentTile.z, "tileAssetId": undefined}
                        southTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x, currentTile.y - 1, currentTile.z)?.tileAssetId
                        if (this.tilePosIsValid(southTile)) {
                            if (!this.objectIncludesTilePos(closedTiles, southTile.x, southTile.y)) {
                                newOpenTiles.push(southTile)
                            }
                        }
                    }
                }
    
                openTiles = newOpenTiles
            }
        }
    }
    
    addContainerToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
        let world = this.loader.worlds[this.loader.currentWorld]
        
        if (chunkAtMouse) {
            if (tileAtMouse) {
                let alreadyPlaced = false
    
                for (let i = 0; i < world.containers.length; i++) {
                    let container = world.containers[i]
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
                    newContainer.z = tileAtMouse.z
                    newContainer.target = InventoryFormat.Container
    
                    world.containers.push(newContainer)
                }
            }
        }
    }
    
    addItemToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
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
    
    chunkToolTick(chunkAtMouse: Chunk | null, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
        if (chunkAtMouse) {
            this.loader.worlds[this.loader.currentWorld].highlightedChunk = chunkAtMouse
        }
    }
    
    chunkToolPressed(chunkAtMouse: Chunk | null, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number) {
        if (chunkAtMouse) {
            console.log("cli")
        }
    }
    
    selectToolTick(chunkAtMouse: any, tileAtMouse: any, lastChunkAtMouse: any, lastTileAtMouse: any, worldMousePos: Vector2, lastMouseButtonPressed: any, selectedLayer: number, selectedTile: number, isMouseButtonPressed: boolean) {
        let world = this.loader.worlds[this.loader.currentWorld]
        let camera = world.camera
    
        let globalMousePos = {"x": Math.floor(worldMousePos.x / 16), "y": Math.floor((worldMousePos.y / 16) * -1)}
        //let chunkAndTilePos = worlds[currentWorld].getChunkAndTilePosAtGlobalPos(worldMousePos.x / 16, (worldMousePos.y / 16) * -1)
    
        let mouseIsInSelection = false
        let mouseButtonState: MouseButtonState = MouseButtonState.None
        if (isMouseButtonPressed && !lastMouseButtonPressed[0]) mouseButtonState = MouseButtonState.Down
        if (isMouseButtonPressed && lastMouseButtonPressed[0]) mouseButtonState = MouseButtonState.Held
        if (!isMouseButtonPressed && lastMouseButtonPressed[0]) mouseButtonState = MouseButtonState.Up
    
        if (world.selection.length == 2) {
            let lowX = Math.min(world.selection[0].x, world.selection[1].x)
            let highX = Math.max(world.selection[0].x, world.selection[1].x)
    
            let lowY = Math.min(world.selection[0].y, world.selection[1].y)
            let highY = Math.max(world.selection[0].y, world.selection[1].y)
    
            if (globalMousePos.x >= lowX && globalMousePos.x <= highX && globalMousePos.y >= lowY && globalMousePos.y <= highY) {
                mouseIsInSelection = true
            }
        }
    
        //logic
        switch (mouseButtonState) {
            case MouseButtonState.None:
                break
            case MouseButtonState.Down:
                this.mouseDownStartPos = globalMousePos
    
                switch (this.selectToolState) {
                    case SelectToolState.None:
                        this.selectToolState = SelectToolState.Selecting
                        break
                    case SelectToolState.Selected:
                        if (mouseIsInSelection) {
                            this.selectToolState = SelectToolState.Move
    
                            this.originalSelection = [{"x": world.selection[0].x, "y": world.selection[0].y},{"x": world.selection[1].x, "y": world.selection[1].y}]
                        } else {
                            this.selectToolState = SelectToolState.None
                        }
                        break
                }
                break
            case MouseButtonState.Held:
                switch (this.selectToolState) {
                    case SelectToolState.None:
                        if (this.mouseDownStartPos && this.mouseDownStartPos.x !== globalMousePos.x && this.mouseDownStartPos.y !== globalMousePos.y) {
                            this.selectToolState = SelectToolState.Selecting
                        }
                        break
                }
                break
            case MouseButtonState.Up:
                switch (this.selectToolState) {
                    case SelectToolState.Selecting:
                        this.selectToolState = SelectToolState.Selected
                        break
                    case SelectToolState.Move:
                        //calulate stuff
                        let lowXold = Math.min(this.originalSelection[0].x, this.originalSelection[1].x)
                        let highXold = Math.max(this.originalSelection[0].x, this.originalSelection[1].x)
                
                        let lowYold = Math.min(this.originalSelection[0].y, this.originalSelection[1].y)
                        let highYold = Math.max(this.originalSelection[0].y, this.originalSelection[1].y)
    
                        let lowX = Math.min(world.selection[0].x, world.selection[1].x)
                        let highX = Math.max(world.selection[0].x, world.selection[1].x)
    
                        let lowY = Math.min(world.selection[0].y, world.selection[1].y)
                        let highY = Math.max(world.selection[0].y, world.selection[1].y)
    
                        let lowChunkPosOld = world.getChunkAndTilePosAtGlobalPos(lowXold, lowYold)[0]
                        let highChunkPosOld = world.getChunkAndTilePosAtGlobalPos(highXold, highYold)[0]
    
                        let lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0]
                        let highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0]
    
                        let xDiff = lowX - lowXold
                        let yDiff = lowY - lowYold
    
                        //get all tiles to copy and delete them
                        let tilesToCopy: Array<[Tile, Vector2]> = []
    
                        for (let x = lowXold; x <= highXold; x++) {
                            for (let y = lowYold; y <= highYold; y++) {
                                if (selectedLayer === -1) { //layer auto
                                    for (let tile of world.findTilesAtGlobalPos(x, y)) {
                                        tilesToCopy.push([tile.clone(), {"x": x, "y": y}])
    
                                        world.removeTileAtGlobalPos(x, y, tile.z)
                                    }
                                }
                            }
                        }
    
                        //delete tiles in new area
                        for (let x = lowX; x <= highX; x++) {
                            for (let y = lowY; y <= highY; y++) {
                                if (selectedLayer === -1) { //layer auto
                                    world.removeTilesAtGlobalPosXY(x, y)
                                }
                            }
                        }
    
                        //put the old tiles in the new place
                        for (let tileInfo of tilesToCopy) {
                            let tile = tileInfo[0]
                            let tileGlobalPos = {"x": tileInfo[1].x + xDiff, "y": tileInfo[1].y + yDiff}
    
                            world.setTileAtGlobalPos(tile, tileGlobalPos.x, tileGlobalPos.y)
                        }
                        
                        //move items
                        let itemsToCopy: Array<[Item, Vector2]> = []
    
                        for (let chunkX = lowChunkPosOld.x; chunkX <= highChunkPosOld.x; chunkX++) { //copy old items
                            for (let chunkY = lowChunkPosOld.y; chunkY <= highChunkPosOld.y; chunkY++) {
                                let chunk = world.getChunkAt(chunkX, chunkY)
    
                                if (chunk) {
                                    for (let i = 0; i < chunk.itemDataList.length; i++) {
                                        let item = chunk.itemDataList[i]
    
                                        let itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(chunkX, chunkY, item.x, item.y)
    
                                        if (itemGlobalPos.x >= lowXold && itemGlobalPos.x <= highXold && itemGlobalPos.y >= lowYold && itemGlobalPos.y <= highYold) {
                                            itemsToCopy.push([item.clone(), itemGlobalPos])
                                            chunk.itemDataList.splice(i, 1)
                                            chunk.edited()
                                            i--
                                        }
                                    }
                                }
                            }
                        }
    
                        //delete items in new area
                        for (let chunkX = lowChunkPos.x; chunkX <= highChunkPos.x; chunkX++) {
                            for (let chunkY = lowChunkPos.y; chunkY <= highChunkPos.y; chunkY++) {
                                let chunk = world.getChunkAt(chunkX, chunkY)
    
                                if (chunk) {
                                    for (let i = 0; i < chunk.itemDataList.length; i++) {
                                        let item = chunk.itemDataList[i]
    
                                        let itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(chunkX, chunkY, item.x, item.y)
    
                                        if (itemGlobalPos.x > lowX && itemGlobalPos.x <= highX && itemGlobalPos.y > lowY && itemGlobalPos.y <= highY) {
                                            chunk.itemDataList.splice(i, 1)
                                            chunk.edited()
                                            i--
                                        }
                                    }
                                }
                            }
                        }
    
                        for (let itemInfo of itemsToCopy) { //put old items in new area
                            let item = itemInfo[0]
    
                            let newGlobalPos = {"x": itemInfo[1].x + xDiff, "y": itemInfo[1].y + yDiff}
    
                            let chunkAndTilePos = world.getChunkAndTilePosAtGlobalPos(newGlobalPos.x, newGlobalPos.y)
                            let chunkPos = chunkAndTilePos[0]
                            let tilePos = chunkAndTilePos[1]
    
                            item.chunkX = chunkPos.x
                            item.chunkY = chunkPos.y
    
                            item.x = tilePos.x
                            item.y = tilePos.y
    
                            world.setItem(item)
                        }
    
                        //containers
                        let containersToCopy: Array<[Inventory, Vector2]> = []
    
                        //copy and delete containers in old area
                        for (let i = 0; i < world.containers.length; i++) {
                            let container = world.containers[i]
    
                            let globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y)
    
                            if (globalPos.x >= lowXold && globalPos.x <= highXold && globalPos.y >= lowYold && globalPos.y <= highYold) {
                                containersToCopy.push([container.clone(), globalPos])
                                world.containers.splice(i, 1)
                                i--
                            }
                        }
    
                        //put containers in new are
                        for (let containerInfo of containersToCopy) {
                            let container = containerInfo[0]
    
                            let newGlobalPos = {"x": containerInfo[1].x + xDiff, "y": containerInfo[1].y + yDiff}
                            
                            let chunkAndTilePos = world.getChunkAndTilePosAtGlobalPos(newGlobalPos.x, newGlobalPos.y)
                            let chunkPos = chunkAndTilePos[0]
                            let tilePos = chunkAndTilePos[1]
    
                            container.chunkX = chunkPos.x
                            container.chunkY = chunkPos.y
    
                            container.x = tilePos.x
                            container.y = tilePos.y
    
                            world.containers.push(container)
                        }
    
                        this.selectToolState = SelectToolState.None
                        break
                }
                break
        }
    
        //update selection
        if (this.selectToolState === SelectToolState.Selecting) {
            if (!world.selection[0]) {
                world.selection[0] = this.mouseDownStartPos
            }
            
            world.selection[1] = globalMousePos
        }
    
        //remove seletion when click outside
        if (this.selectToolState === SelectToolState.None) {
            world.selection = []
        }
    
        //move selection
        if (this.selectToolState === SelectToolState.Move) {
            let xOffset = globalMousePos.x - this.mouseDownStartPos.x
            let yOffset = globalMousePos.y - this.mouseDownStartPos.y
    
            world.selection[0] = {"x": this.originalSelection[0].x + xOffset, "y": this.originalSelection[0].y + yOffset}
            world.selection[1] = {"x": this.originalSelection[1].x + xOffset, "y": this.originalSelection[1].y + yOffset}
        }
    }
    
    updateTheme(cssTheme: string) {
        let cssThemeElement: HTMLLinkElement = <HTMLLinkElement>document.getElementById("css-theme")
        this.loader.setPreference("theme", cssTheme)
    
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
    
    setTileListDisplay(visible: string) {
        this.loader.setPreference("tile-list-visible", visible)
    
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
    
    setCanvasDebugText(visible: string) {
        this.loader.setPreference("canvas-debug-text", visible)
    
        if (visible === "true") {
            document.getElementById("navbar-view-canvasdebug").innerHTML = 'Debug Info<span class="material-symbols-outlined" style="display: inline-block;">done</span>'
        } else {
            document.getElementById("navbar-view-canvasdebug").innerHTML = 'Debug Info'
        }
    }
    
    setShowPOI(visible: string) {
        this.loader.setPreference("show-poi", visible)
    
        if (visible === "true") {
            document.getElementById("navbar-view-show-poi").innerHTML = 'Show Points Of Interest<span class="material-symbols-outlined" style="display: inline-block;">done</span>'
        } else {
            document.getElementById("navbar-view-show-poi").innerHTML = 'Show Points Of Interest'
        }
    }
    
    findFirstVisibleWorld() {
        let worlds = this.loader.worlds

        let visibleWorld = null
        let index = 0
    
        for (let i = 0; i < worlds.length; i++) {
            if (!worlds[i].hidden) {
                visibleWorld = worlds[i]
                index = i
            }
        }
    
        if (visibleWorld == null) {
            let visibleWorld = new World(worlds.length, this.loader)
            worlds.push(visibleWorld)
    
            index = worlds.length - 1
        }
    
        this.loader.currentWorld = index
    }
    
    positionInventory() {
        let world = this.loader.worlds[this.loader.currentWorld]
        let camera = world.camera

        let worldMousePos = camera.screenPosToWorldPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), camera.lastPosition.x, camera.lastPosition.y)
                
        worldMousePos.x = Math.floor(worldMousePos.x / 16) * 16 + 16
        worldMousePos.y = Math.floor(worldMousePos.y / 16) * 16 + 16
    
        let mouseTileScreenPos = camera.worldPosToScreenPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), worldMousePos.x, worldMousePos.y)
    
        document.getElementById("inventory-container").style.display = "block"
    
        let inventoryY = Math.min(window.innerHeight - document.getElementById("inventory-container").clientHeight, mouseTileScreenPos.y)
    
        document.getElementById("inventory-container").style.left = mouseTileScreenPos.x + "px"
        document.getElementById("inventory-container").style.top = inventoryY + "px"
    
        document.getElementById("small-item-list-container").style.display = ""
        document.getElementById("small-item-list-container").style.left = (mouseTileScreenPos.x + document.getElementById("inventory-container").clientWidth) + "px"
        document.getElementById("small-item-list-container").style.top = inventoryY + "px"
    }
    
    setLayer(layer: number, editor: Editor) {
        document.getElementById("layer-input").classList.remove("selected-slot")
        if (document.getElementById("layer-" + editor.selectedLayer)) {
            document.getElementById("layer-" + editor.selectedLayer).classList.remove("selected-slot")
        }
        if (layer == null) {
            layer = Number((<HTMLInputElement>document.getElementById("layer-input")).value)
        }
        editor.selectedLayer = layer
        if (document.getElementById("layer-" + editor.selectedLayer)) {
            document.getElementById("layer-" + editor.selectedLayer).classList.add("selected-slot")
        } else if (Number((<HTMLInputElement>document.getElementById("layer-input")).value) == editor.selectedLayer) {
            document.getElementById("layer-input").classList.add("selected-slot")
        }
    }
    
    setTool(tool: number, editor: Editor) {
        document.getElementById("tool-" + editor.selectedTool).classList.remove("tool-selected")
        editor.selectedTool = tool
        document.getElementById("tool-" + editor.selectedTool).classList.add("tool-selected")
    
        editor.loader.worlds[editor.loader.currentWorld].selection = []
        editor.selectToolState = SelectToolState.None
    }
    
    //world settings
    changeSetting(settingName: string) {
        let originalName = this.loader.worlds[this.loader.currentWorld]["name"]
        let worldSettingValue: string = (<HTMLInputElement>document.getElementById("world-settings-" + settingName)).value
    
        for (let key in this.loader.worlds[this.loader.currentWorld].uneditedFiles) {
            originalName = key.split("/")[0]
        }
    
        if (settingName == "seed" || settingName == "timescale") { //numbers
            let num = Number(worldSettingValue)
            if (isNaN(num) || typeof(num) != "number") {
                this.loader.alertText(`(${settingName}) Number is invalid`, true, 5)
            } else {
                this.loader.worlds[this.loader.currentWorld][settingName] = num
            }
        } else if (settingName == "version" || settingName == "highestUsedVersion" || settingName == "additionalParams") { //objects
            try {
                let object = JSON.parse(worldSettingValue)
                this.loader.worlds[this.loader.currentWorld][settingName] = object
            } catch (error) {
                this.loader.alertText(`(${settingName}) ` + error, true, 5)
            }
        } if (settingName == "hasBeenGenerated" || settingName == "progression" || settingName == "friendlyFire" || settingName == "forestBarrierBroken" || settingName == "NPCsOff") {
            if (worldSettingValue === "true") {
                this.loader.worlds[this.loader.currentWorld][settingName] = true
            } else if (worldSettingValue === "false") {
                this.loader.worlds[this.loader.currentWorld][settingName] = false
            } else {
                this.loader.alertText(`(${settingName}) ` + worldSettingValue + ' is not a valid boolean. "true" or "false" expected', true, 5)
            }
        } else {
            this.loader.worlds[this.loader.currentWorld][settingName] = worldSettingValue
        }
    
        if (settingName == "name") {
            let world = this.loader.worlds[this.loader.currentWorld]

            //fix file paths in unedited files
            for (let key in world.uneditedFiles) {
                let buffer = world.uneditedFiles[key]
                let newKey = key.replace(originalName, world.name)
                world.uneditedFiles[newKey] = buffer
                delete world.uneditedFiles[key]
            }
    
            //fix file paths in world.chunkCache
            for (let key in world.chunkCache) {
                let buffer = world.chunkCache[key]
                let newKey = key.replace(originalName, world.name)
                world.chunkCache[newKey] = buffer
                delete world.chunkCache[key]
            }
    
            this.loader.updateWorldList()
        }
    }
    
    tick() {
        let world = this.loader.worlds[this.loader.currentWorld]

        let worldMousePos = world.camera.screenPosToWorldPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), world.camera.lastPosition.x, world.camera.lastPosition.y)
        let chunkAtMouse = world.getChunkAtWorldPos(worldMousePos.x, worldMousePos.y)
        let tileAtMouse = null
    
        let lastChunkAtMouse: any = world.getChunkAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y)
        let lastTileAtMouse = {"x": null, "y": null}
        if (lastChunkAtMouse) {
            lastTileAtMouse = lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y)
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
    
        world.highlightedChunk = null
    
        //Items and containers
        let isHoveringOverObject = false
        this.hoveredStorage = null
        this.hoveredItem = null
    
        //containers
        if (tileAtMouse) {
            for (let i = 0; i < world.containers.length; i++) {
                let container = world.containers[i]
                if (tileAtMouse.x == container.x && tileAtMouse.y == container.y && chunkAtMouse.x == container.chunkX && chunkAtMouse.y == container.chunkY) {
                    isHoveringOverObject = true
                    this.hoveredStorage = container
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
                    this.hoveredItem = item
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
            if (this.mouseButtonPressed[0]) { //mouse pressed
                switch (this.selectedTool) {
                    case 0: //draw
                        this.drawToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile)
                        break
                    case 1: //erase
                        this.eraseToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile)
                        break
                    case 2: //pick
                        let tileToSet = this.pickToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile)
                        if (tileToSet) {
                            console.log(tileToSet)
                            this.selectedTile = tileToSet
                        }
                        break
                    case 3: //fill
                        this.fillToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile)
                        break
                    case 4: //container
                        this.addContainerToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile)
                        break
                    case 5: //item
                        this.addItemToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile)
                        break
                    case 6: //chunk
                        if (!this.lastMouseButtonPressed[0])
                            this.chunkToolPressed(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile)
                        break
                    case 7: //select
                        this.selectToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile, true)
                    default:
                        break
                }
            } else { //mouse not pressed
                switch (this.selectedTool) {
                    case 6: //chunk
                        this.chunkToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile)
                        break
                    case 7: //select
                        this.selectToolTick(chunkAtMouse, tileAtMouse, lastChunkAtMouse, lastTileAtMouse, worldMousePos, this.lastMouseButtonPressed, this.selectedLayer, this.selectedTile, false)
                    default:
                        break
                }
            }
        } else if (this.hoveredStorage && this.mouseButtonPressed[0] && this.selectedTool === 1) { //erase storage
            for (let i = 0; i < world.containers.length; i++) {
                if (world.containers[i] == this.hoveredStorage) {
                    world.containers.splice(i,1)
                    break
                }
            }
        } else if (this.hoveredItem && this.mouseButtonPressed[0] && this.selectedTool === 1 && chunkAtMouse) { //erase item
            for (let i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                if (chunkAtMouse.itemDataList[i] == this.hoveredItem) {
                    chunkAtMouse.itemDataList.splice(i,1)
                    chunkAtMouse.chunkHasBeenEdited = true
                    chunkAtMouse.undoEdited = true
                    chunkAtMouse.resetCacheImage()
                    break
                }
            }
        }
    
        this.lastWorldMousePos = {"x": worldMousePos.x, "y": worldMousePos.y}
        this.lastMouseButtonPressed = JSON.parse(JSON.stringify(this.mouseButtonPressed))
        //window.requestAnimationFrame(tick)
    }
}