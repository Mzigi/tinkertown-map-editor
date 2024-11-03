import { Chunk } from "../objects/chunk.js"
import { Inventory, InventoryFormat } from "../objects/inventory.js"
import { Item } from "../objects/item.js"
import { Tile } from "../objects/tile.js"
import { World } from "../objects/world.js"
import { EventBinding } from "./event-binding.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

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

export class SelectTool extends Tool {
    lastChunkAtMouse: Chunk
    lastTileAtMouse: Vector2
    lastWorldMousePos: Vector2

    mouseDownStartPos = null
    selectToolState = SelectToolState.None
    originalSelection = null

    constructor(id: number, name: string, toolInfo: ToolInfo) {
        super(id, name, toolInfo)

        this.lastChunkAtMouse = null
        this.lastTileAtMouse = null
        this.lastWorldMousePos = null

        this.events = [
            new EventBinding("Delete", (tool: SelectTool) => {
                //history info
                let removedTiles: Array<[Tile, Vector3]> = []
                let removedContainers: Array<Inventory> = []
                let removedItems: Array<Item> = []

                //tool info
                let ti = tool.toolInfo
                let world = ti.world
                let selectedLayer = ti.selectedLayer

                //main
                let lowX = Math.min(world.selection[0].x, world.selection[1].x)
                let highX = Math.max(world.selection[0].x, world.selection[1].x)

                let lowY = Math.min(world.selection[0].y, world.selection[1].y)
                let highY = Math.max(world.selection[0].y, world.selection[1].y)

                let lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0]
                let highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0]

                //delete tiles in selection
                removedTiles = tool.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world)

                //delete containers in selection
                removedContainers = tool.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world)

                //delete items in selection
                removedItems = tool.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world)

                //add to history stack
                let undoInstructions = []
                let redoInstructions = []

                //tile and chunk
                if (removedTiles.length > 0 ) {
                    undoInstructions.push(() => { //undo
                        for (let removedTileInfo of removedTiles) {
                            let removedTile = removedTileInfo[0]
                            let removedTilePos = removedTileInfo[1]
            
                            world.setTileAtGlobalPos(removedTile, removedTilePos.x, removedTilePos.y)
                        }
                    })
                    redoInstructions.push(() => { //redo
                        for (let removedTileInfo of removedTiles) {
                            let removedTilePos = removedTileInfo[1]

                            world.removeTileAtGlobalPos(removedTilePos.x, removedTilePos.y, removedTilePos.z)
                        }
                    })
                }

                //items
                if (removedItems.length > 0) {
                    undoInstructions.push(() => {
                        for (let removedItem of removedItems) {
                            world.setItem(removedItem)
                        }
                    })

                    redoInstructions.push(() => {
                        for (let removedItem of removedItems) {
                            let chunk = world.getChunkAt(removedItem.chunkX, removedItem.chunkY)
            
                            if (chunk) {
                                for (let i = 0; i < chunk.itemDataList.length; i++) {
                                    let item = chunk.itemDataList[i]

                                    if (item == removedItem) {
                                        chunk.itemDataList.splice(i, 1)
                                        chunk.edited()
                                    }
                                }
                            }
                        }
                    })
                }

                //containers
                if (removedContainers.length > 0) {
                    undoInstructions.push(() => {
                        for (let removedContainer of removedContainers) {
                            world.containers.push(removedContainer)
                        }
                    })

                    redoInstructions.push(() => {
                        for (let removedContainer of removedContainers) {
                            for (let i = 0; i < world.containers.length; i++) {
                                let container = world.containers[i]

                                if (container == removedContainer) {
                                    world.containers.splice(i, 1)
                                }
                            }
                        }
                    })
                }

                //undo/redo final
                if (undoInstructions.length > 0) {
                    let undo = () => {
                        for (let undoInstruction of undoInstructions) {
                            undoInstruction()
                        }
                    }

                    let redo = () => {
                        for (let redoInstruction of redoInstructions) {
                            redoInstruction()
                        }
                    }

                    ti.world.addHistory(new ToolHistory(undo, redo))
                }

                //remove selection
                world.selection = []
                tool.selectToolState = SelectToolState.None
            })
        ]
    }

    removeTilesInSelection(lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World): Array<[Tile, Vector3]> {
        let removedTiles: Array<[Tile, Vector3]> = []

        for (let x = lowX; x <= highX; x++) {
            for (let y = lowY; y <= highY; y++) {
                if (selectedLayer === -1) { //layer auto
                    let tempRemovedTiles = world.removeTilesAtGlobalPosXY(x, y)
                    for (let removedTile of tempRemovedTiles) {
                        removedTiles.push([removedTile, {"x": x, "y": y, "z": removedTile.z}])
                    }
                } else {
                    let removedTile = world.removeTileAtGlobalPos(x, y, selectedLayer)
                    if (removedTile) {
                        removedTiles.push([removedTile, {"x": x, "y": y, "z": removedTile.z}])
                    }
                }
            }
        }

        return removedTiles
    }

    removeContainersInSelection(lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World): Array<Inventory> {
        let removedContainers: Array<Inventory> = []

        for (let i = 0; i < world.containers.length; i++) {
            let container = world.containers[i]

            if (container.z === selectedLayer || selectedLayer === -1) {
                let globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y)

                if (globalPos.x >= lowX && globalPos.x <= highX && globalPos.y >= lowY && globalPos.y <= highY) {
                    let removedContainer = world.containers.splice(i, 1)[0]
                    removedContainers.push(removedContainer)
                    i--
                }
            }
        }

        return removedContainers
    }

    removeItemsInSelection(lowChunkPos: Vector2, highChunkPos: Vector2, lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World): Array<Item> {
        let removedItems = []
        
        if (selectedLayer !== -1) {
            return removedItems
        }

        for (let chunkX = lowChunkPos.x; chunkX <= highChunkPos.x; chunkX++) {
            for (let chunkY = lowChunkPos.y; chunkY <= highChunkPos.y; chunkY++) {
                let chunk = world.getChunkAt(chunkX, chunkY)

                if (chunk) {
                    for (let i = 0; i < chunk.itemDataList.length; i++) {
                        let item = chunk.itemDataList[i]

                        let itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(chunkX, chunkY, item.x, item.y)

                        if (itemGlobalPos.x > lowX && itemGlobalPos.x <= highX && itemGlobalPos.y > lowY && itemGlobalPos.y <= highY) {
                            let removedItem = chunk.itemDataList.splice(i, 1)[0]
                            removedItems.push(removedItem)
                            chunk.edited()
                            i--
                        }
                    }
                }
            }
        }

        return removedItems
    }

    tick() {
        //history info
        let removedTiles: Array<[Tile, Vector3]> = []
        let addedTiles: Array<[Tile, Chunk]> = []
        let createdChunks = []

        let removedItems: Array<Item> = []
        let addedItems: Array<Item> = []

        let removedContainers: Array<Inventory> = []
        let addedContainers: Array<Inventory> = []

        //main
        let ti = this.toolInfo
        let world = ti.world

        if (ti.selectedTool !== this.id) {
            this.selectToolState = SelectToolState.None
            return
        }
        
        if (ti.isHoveringOverObject) return

        let selectedLayer = ti.selectedLayer
        let selectedTile = ti.selectedTile

        let chunkAtMouse = this.getChunkAtMouse()
        let worldMousePos = this.getWorldMousePos()

        let tileAtMouse = null
        if (chunkAtMouse) {
            tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)
        }

        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y)
        }

        let newItem = null

        //select tool code
        let camera = world.camera

        let isMouseButtonPressed = ti.mouseButtonPressed[0]
        let lastMouseButtonPressed = ti.lastMouseButtonPressed
    
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
                if (this.selectToolState == SelectToolState.Selected && mouseIsInSelection) {
                    document.getElementById("2Dcanvas").style.cursor = "move"
                }
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
                        console.log("MOVING SELECTION")
                        console.log(this.originalSelection)
                        console.log(world.selection)

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
    
                        let tempOldTiles = this.removeTilesInSelection(lowXold, highXold, lowYold, highYold, selectedLayer, world)
                        for (let tileInfo of tempOldTiles) {
                            let tile = tileInfo[0]
                            let globalTilePos = tileInfo[1]
                            tilesToCopy.push([tile.clone(), {"x": globalTilePos.x, "y": globalTilePos.y}])
                            removedTiles.push([tile, {"x": globalTilePos.x, "y": globalTilePos.y, "z": tile.z}])
                        }
    
                        //delete tiles in new area
                        let tempTiles = this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world)
                        for (let tileInfo of tempTiles) {
                            let tile = tileInfo[0]
                            let globalTilePos = tileInfo[1]
                            removedTiles.push([tile, {"x": globalTilePos.x, "y": globalTilePos.y, "z": tile.z}])
                        }
    
                        //put the old tiles in the new place
                        for (let tileInfo of tilesToCopy) {
                            let tile = tileInfo[0]
                            let tileGlobalPos = {"x": tileInfo[1].x + xDiff, "y": tileInfo[1].y + yDiff}
    
                            let chunkAddedInfo = world.setTileAtGlobalPos(tile, tileGlobalPos.x, tileGlobalPos.y)
                            addedTiles.push([tile, chunkAddedInfo[0]])
                            if (chunkAddedInfo[1]) {
                                createdChunks.push(chunkAddedInfo[0])
                            }
                        }
                        
                        //move items
                        let itemsToCopy: Array<[Item, Vector2]> = []
    
                        //copy and delete old items
                        let tempOldItems = this.removeItemsInSelection(lowChunkPosOld, highChunkPosOld, lowXold, highXold, lowYold, highYold, selectedLayer, world)
                        for (let item of tempOldItems) {
                            let itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y)
                            itemsToCopy.push([item.clone(), itemGlobalPos])
                            removedItems.push(item)
                        }
    
                        //delete items in new area
                        let tempItems = this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world)
                        for (let item of tempItems) {
                            removedItems.push(item)
                        }
    
                        //put old items in new area
                        for (let itemInfo of itemsToCopy) {
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
                            addedItems.push(item)
                        }
    
                        //containers
                        let containersToCopy: Array<[Inventory, Vector2]> = []
    
                        //copy and delete containers in old area
                        let tempOldContainers = this.removeContainersInSelection(lowXold, highXold, lowYold, highYold, selectedLayer, world)
                        for (let container of tempOldContainers) {
                            let globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y)
                            containersToCopy.push([container.clone(), globalPos])
                            removedContainers.push(container)
                        }

                        //delete containers in new area
                        let tempContainers = this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world)
                        for (let container of tempContainers) {
                            removedContainers.push(container)
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
                            addedContainers.push(container)
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

            document.getElementById("2Dcanvas").style.cursor = "move"
        }

        //add to history stack
        let undoInstructions = []
        let redoInstructions = []

        //tile and chunk
        if (removedTiles.length > 0 || addedTiles.length > 0 || createdChunks.length > 0) {
            undoInstructions.push(() => { //undo
                for (let addedTileInfo of addedTiles) {
                    let tileChunk = addedTileInfo[1]
                    let tile = addedTileInfo[0]
    
                    tileChunk.removeTileAt(tile.x, tile.y, tile.z)
                }
    
                for (let removedTileInfo of removedTiles) {
                    let removedTile = removedTileInfo[0]
                    let removedTilePos = removedTileInfo[1]
    
                    world.setTileAtGlobalPos(removedTile, removedTilePos.x, removedTilePos.y)
                }

                for (let createdChunk of createdChunks) {
                    world.removeChunkAt(createdChunk.x, createdChunk.y)
                }
            })
            redoInstructions.push(() => { //redo
                for (let createdChunk of createdChunks) {
                    world.addChunk(createdChunk)
                }

                for (let removedTileInfo of removedTiles) {
                    let removedTilePos = removedTileInfo[1]

                    world.removeTileAtGlobalPos(removedTilePos.x, removedTilePos.y, removedTilePos.z)
                }

                for (let addedTileInfo of addedTiles) {
                    let tileChunk = addedTileInfo[1]
                    let tile = addedTileInfo[0]

                    tileChunk.setTile(tile)
                }
            })
        }

        //items
        if (removedItems.length > 0 || addedItems.length > 0) {
            undoInstructions.push(() => {
                for (let addedItem of addedItems) {
                    let chunk = world.getChunkAt(addedItem.chunkX, addedItem.chunkY)
    
                    if (chunk) {
                        for (let i = 0; i < chunk.itemDataList.length; i++) {
                            let item = chunk.itemDataList[i]

                            if (item == addedItem) {
                                chunk.itemDataList.splice(i, 1)
                                chunk.edited()
                            }
                        }
                    }
                }

                for (let removedItem of removedItems) {
                    world.setItem(removedItem)
                }
            })

            redoInstructions.push(() => {
                for (let removedItem of removedItems) {
                    let chunk = world.getChunkAt(removedItem.chunkX, removedItem.chunkY)
    
                    if (chunk) {
                        for (let i = 0; i < chunk.itemDataList.length; i++) {
                            let item = chunk.itemDataList[i]

                            if (item == removedItem) {
                                chunk.itemDataList.splice(i, 1)
                                chunk.edited()
                            }
                        }
                    }
                }

                for (let addedItem of addedItems) {
                    world.setItem(addedItem)
                }
            })
        }

        //containers
        if (removedContainers.length > 0 || addedContainers.length > 0) {
            undoInstructions.push(() => {
                for (let addedContainer of addedContainers) {
                    for (let i = 0; i < world.containers.length; i++) {
                        let container = world.containers[i]

                        if (container == addedContainer) {
                            world.containers.splice(i, 1)
                        }
                    }
                }

                for (let removedContainer of removedContainers) {
                    world.containers.push(removedContainer)
                }
            })

            redoInstructions.push(() => {
                for (let removedContainer of removedContainers) {
                    for (let i = 0; i < world.containers.length; i++) {
                        let container = world.containers[i]

                        if (container == removedContainer) {
                            world.containers.splice(i, 1)
                        }
                    }
                }

                for (let addedContainer of addedContainers) {
                    world.containers.push(addedContainer)
                }
            })
        }

        //undo/redo final
        if (undoInstructions.length > 0) {
            let undo = () => {
                for (let undoInstruction of undoInstructions) {
                    undoInstruction()
                }
            }

            let redo = () => {
                for (let redoInstruction of redoInstructions) {
                    redoInstruction()
                }
            }

            ti.world.addHistory(new ToolHistory(undo, redo))
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}