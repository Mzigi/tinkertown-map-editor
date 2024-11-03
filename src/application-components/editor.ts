import { Chunk } from "../classes/objects/chunk.js";
import { Inventory, InventoryFormat } from "../classes/objects/inventory.js";
import { Item } from "../classes/objects/item.js";
import { Tile } from "../classes/objects/tile.js";
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
import { Tool } from "../classes/tools/tool.js";
import { ImageHolder } from "./image-loader.js";
import { Loader } from "./loader.js";

export class Editor {
    loader: Loader
    imageHolder: ImageHolder

    images: {[key: string]: HTMLImageElement}

    slotSize: number = 64

    //mouseDownStartPos = null //deprecated
    //selectToolState = SelectToolState.None //deprecated
    //originalSelection = null //deprecated

    selectedTile: number = 0
    selectedTool: number = 0
    selectedLayer: number = -1 //-1 == auto layer

    lastWorldMousePos: Vector2 = {"x": null, "y": null}
    
    mouseButtonPressed = {}
    lastMouseButtonPressed = {}

    pressedKeys = {}
    lastPressedKeys = {}
    
    hoveredItem: Item = null
    hoveredStorage: Inventory = null
    
    openedStorage: Inventory = null
    
    openedItem: Item = null
    openedItemStorage: Inventory = null

    toolInfo: ToolInfo

    tools: {[key: number]: Tool}

    alertElement: HTMLElement = document.getElementById("alert")
    
    constructor(loader: Loader, imageHolder: ImageHolder) {
        this.loader = loader
        this.imageHolder = imageHolder
        this.images = imageHolder.images
        
        if (loader.NEWUI) {
            let navbarButtons = document.getElementsByClassName("navbar-button")
            let navbarLis = document.getElementsByClassName("navbar-li")
            
            let hoveredButton = null
        
            let navButtonClicked = false
        
            for (let i = 0; i < navbarLis.length; i++) { //close list when clicking button in list
                navbarLis[i].addEventListener("click", () => {
                    let dropdownList = navbarLis[i].parentElement

                    if (dropdownList && dropdownList.id != "navbar-view-buttons") {
                        dropdownList.classList.remove("navbar-dropdown-active")
                        navButtonClicked = false
                    }
                })
            }

            for (let i = 0; i < navbarButtons.length; i++) {
                //BUTTON EVENT
                navbarButtons[i].addEventListener("click", () => {
                    let dropdownList = document.getElementById(navbarButtons[i].id + "-buttons")

                    if (dropdownList) {
                        if (!navButtonClicked) {
                            dropdownList.classList.add("navbar-dropdown-active")
                        } else {
                            dropdownList.classList.remove("navbar-dropdown-active")
                        }
                    }

                    navButtonClicked = !navButtonClicked
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
                let world = this.loader.getCurrentWorld()

                let chunkAtItem = world.getChunkAt(this.openedItem.chunkX, this.openedItem.chunkY)
        
                let shouldDelete = false
        
                if (this.openedItemStorage.itemDataList.length > 0) {
                    if (this.openedItemStorage.itemDataList[0].count <= 0) {
                        shouldDelete = true
                    }
                } else {
                    shouldDelete = true
                }
        
                let openedItem = this.openedItem

                if (!shouldDelete) {
                    let originalId = this.openedItem.id
                    let originalCount = this.openedItem.count

                    let newId = this.openedItemStorage.itemDataList[0].id
                    let newCount = this.openedItemStorage.itemDataList[0].count

                    if (this.openedItem.id != newId || this.openedItem.count != newCount) {
                        world.addHistory(new ToolHistory(
                            () => { //undo
                                openedItem.id = originalId
                                openedItem.count = originalCount
                                chunkAtItem.edited()
                            },
                            () => { //redo
                                openedItem.id = newId
                                openedItem.count = newCount
                                chunkAtItem.edited()
                            }
                        ))
                    }

                    this.openedItem.id = newId
                    this.openedItem.count = newCount
                } else {
                    world.addHistory(new ToolHistory(
                        () => { //undo
                            chunkAtItem.itemDataList.push(openedItem)
                            chunkAtItem.edited()
                        },
                        () => { //redo
                            if (chunkAtItem) {
                                for (let i = 0; i < chunkAtItem.itemDataList.length; i++) {
                                    if (chunkAtItem.itemDataList[i] == openedItem) {
                                        chunkAtItem.itemDataList.splice(i,1)
                                        chunkAtItem.edited()
                                        break
                                    }
                                }
                            }
                        }
                    ))

                    if (chunkAtItem) {
                        for (let i = 0; i < chunkAtItem.itemDataList.length; i++) {
                            if (chunkAtItem.itemDataList[i] == this.openedItem) {
                                chunkAtItem.itemDataList.splice(i,1)
                                chunkAtItem.edited()
                                break
                            }
                        }
                    }
                }
        
                if (chunkAtItem) {
                    chunkAtItem.edited()
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
                    this.hoveredStorage.visualize(this.images, this.slotSize, this.loader.getCurrentWorld())
        
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
        
        document.body.addEventListener("keydown", (e) => {
            //console.log(e)
            //console.log(e.key)
            this.pressedKeys[e.key] = true
            if (e.ctrlKey) {
                this.pressedKeys["ctrlKey"] = true
            }

            if (e.ctrlKey && e.key == "z" && !e.shiftKey && !this.loader.worldSettingsIsOpen) {
                this.loader.getCurrentWorld().undo()
            }

            if (e.ctrlKey && e.key == "y" && !this.loader.worldSettingsIsOpen) {
                this.loader.getCurrentWorld().redo()
            }

            //tool keybind
            switch (e.key) {
                case "1":
                    this.setTool(0, this)
                    break
                case "2":
                    this.setTool(1, this)
                    break
                case "3":
                    this.setTool(7, this)
                    break
                case "4":
                    this.setTool(2, this)
                    break
                case "5":
                    this.setTool(3, this)
                    break
                case "6":
                    this.setTool(4, this)
                    break
                case "7":
                    this.setTool(5, this)
                    break
                case "8":
                    this.setTool(6, this)
                default:
                    break
            }

            //event bindings
            if (e.key == "Delete" || e.key == "Backspace") {
                this.callToolEvents("Delete")
            }

            if (e.ctrlKey && e.key == "c") {
                this.callToolEvents("Copy")
            }

            if (e.ctrlKey && e.key == "x") {
                this.callToolEvents("Cut")
            }

            if (e.ctrlKey && e.key == "v") {
                this.callToolEvents("Paste")
            }

            if (e.key == "Escape") {
                this.callToolEvents("Deselect")
            }
        })

        document.body.addEventListener("keyup", (e) => {
            this.pressedKeys[e.key] = false
            if (e.ctrlKey) {
                this.pressedKeys["ctrlKey"] = false
            }
        })

        //are you sure alert
        window.onbeforeunload = function () {
            for (let world of loader.worlds) {
                if (world.recentlyEdited) {
                    return "You have unsaved changes"
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

        this.toolInfo = new ToolInfo(this.loader.worlds[this.loader.currentWorld], <HTMLCanvasElement>document.getElementById("2Dcanvas"), this.selectedTile, this.selectedLayer, (tileId, editor) => {editor.selectedTile = tileId}, (layerId, editor) => {editor.setLayer(layerId, editor)}, this, this.mouseButtonPressed, this.lastMouseButtonPressed, this.selectedTool, false)

        this.tools = {
            0: new Draw(0, "Draw", this.toolInfo),
            1: new Erase(1, "Erase", this.toolInfo),
            2: new Pick(2, "Pick", this.toolInfo),
            3: new Fill(3, "Fill", this.toolInfo),
            4: new AddContainer(4, "Add Container", this.toolInfo),
            5: new AddItem(5, "Add Item", this.toolInfo),
            6: new ChunkTool(6, "Chunk Tool", this.toolInfo),
            7: new SelectTool(7, "Select", this.toolInfo)
        }
    }
    
    callToolEvents(eventName: string) {
        for (let toolId in this.tools) {
            let tool = this.tools[toolId]

            for (let eventBinding of tool.events) {
                if (eventBinding.name == eventName) {
                    eventBinding.call(tool)
                }
            }
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
        if (document.getElementById("tool-" + editor.selectedTool)) {
            document.getElementById("tool-" + editor.selectedTool).classList.remove("tool-selected")
        }
        editor.selectedTool = tool
        if (document.getElementById("tool-" + editor.selectedTool)) {
            document.getElementById("tool-" + editor.selectedTool).classList.add("tool-selected")
        }
    
        editor.loader.worlds[editor.loader.currentWorld].selection = []
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
        this.toolInfo.update(this.loader.worlds[this.loader.currentWorld], this.selectedTile, this.selectedLayer, this.mouseButtonPressed, this.lastMouseButtonPressed, this.selectedTool, isHoveringOverObject, this.hoveredStorage, this.hoveredItem)

        if (this.tools[this.selectedTool]) {
            this.tools[this.selectedTool].tick()
        }
    
        this.lastWorldMousePos = {"x": worldMousePos.x, "y": worldMousePos.y}
        this.lastMouseButtonPressed = JSON.parse(JSON.stringify(this.mouseButtonPressed))
        this.lastPressedKeys = JSON.parse(JSON.stringify(this.pressedKeys))
        //window.requestAnimationFrame(tick)
    }
}