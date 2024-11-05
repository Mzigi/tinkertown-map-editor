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
    Paste,
}

enum MouseButtonState {
    None,
    Down,
    Held,
    Up
}

interface SelectToolClipboard {
    tilesToCopy: Array<[Tile, Vector2]>
    itemsToCopy: Array<[Item, Vector2]>
    containersToCopy: Array<[Inventory, Vector2]>

    lowX: number
    lowY: number
    highX: number
    highY: number

    width: number
    height: number
}

export class SelectTool extends Tool {
    lastChunkAtMouse: Chunk
    lastTileAtMouse: Vector2
    lastWorldMousePos: Vector2

    mouseDownStartPos = null
    selectToolState = SelectToolState.None
    originalSelection = null

    clipboard: SelectToolClipboard

    constructor(id: number, name: string, toolInfo: ToolInfo) {
        super(id, name, toolInfo)

        this.lastChunkAtMouse = null
        this.lastTileAtMouse = null
        this.lastWorldMousePos = null

        this.events = [
            new EventBinding("Delete", (tool: SelectTool) => {
                tool.onDelete()
            }),
            new EventBinding("Copy", (tool: SelectTool) => {
                tool.onCopy(false)
            }),
            new EventBinding("Cut", (tool: SelectTool) => {
                tool.onCopy(true)
            }),
            new EventBinding("Paste", (tool: SelectTool) => {
                tool.onPaste()
            }),
            new EventBinding("Deselect", (tool: SelectTool) => {
                tool.onDeselect()
            }),
            new EventBinding("Fill", (tool: SelectTool) => {
                tool.onFill()
            })
        ]
    }

    onFill() {
        //history info
        let removedTiles: Array<[Tile, Vector3]> = []
        let addedTiles: Array<[Tile, Chunk]> = []
        let createdChunks: Chunk[] = []

        //tool info
        let ti = this.toolInfo
        let world = ti.world
        let selectedLayer = ti.selectedLayer

        //main
        /*if (ti.selectedTool !== this.id) {
            this.clipboard = null
            return
        }*/
        if (world.selection.length < 2) return

        let lowX = Math.min(world.selection[0].x, world.selection[1].x)
        let highX = Math.max(world.selection[0].x, world.selection[1].x)

        let lowY = Math.min(world.selection[0].y, world.selection[1].y)
        let highY = Math.max(world.selection[0].y, world.selection[1].y)

        let lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0]
        let highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0]

        let tileId = ti.selectedTile

        let fillTiles: [Tile, Vector2][] = []

        for (let x = lowX; x <= highX; x++) {
            for (let y = lowY; y <= highY; y++) {
                let replacementTile = new Tile()
                /*replacementTile.x = x
                replacementTile.y = y*/
                replacementTile.z = Math.max(0, selectedLayer)
                replacementTile.tileAssetId = tileId

                fillTiles.push([replacementTile, {"x": x, "y": y}])
            }
        }

        //TILES
            //delete tiles in new area
            removedTiles = removedTiles.concat(this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world))

            //paste old tiles in new area
            let pasteAddedTilesAndCreatedChunks = this.pasteTiles(fillTiles, 0, 0, world)
            addedTiles = addedTiles.concat(pasteAddedTilesAndCreatedChunks[0])
            createdChunks = createdChunks.concat(pasteAddedTilesAndCreatedChunks[1])

        let undoInstructions: Function[] = []
        let redoInstructions: Function[] = []
        
        //tile and chunk
        undoInstructions.push(this.getAddedTilesUndoInstruction(addedTiles))
        undoInstructions.push(this.getRemovedTileUndoInstruction(removedTiles, world))
        undoInstructions.push(this.getCreatedChunksUndoInstruction(createdChunks, world))

        redoInstructions.push(this.getCreatedChunksRedoInstruction(createdChunks, world))
        redoInstructions.push(this.getRemovedTileRedoInstruction(removedTiles, world))
        redoInstructions.push(this.getAddedTilesRedoInstruction(addedTiles))

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

        this.selectToolState = SelectToolState.None
    }

    onDeselect() {
        this.selectToolState = SelectToolState.None
    }

    onPaste() {
        //tool info
        let ti = this.toolInfo
        let world = ti.world
        let selectedLayer = ti.selectedLayer

        //main
        //if (ti.selectedTool !== this.id) return
        if (!this.clipboard) return

        this.selectToolState = SelectToolState.Paste
        console.log("starting paste")
    }

    onCopy(shouldRemove: boolean = false) {
        //tool info
        let ti = this.toolInfo
        let world = ti.world
        let selectedLayer = ti.selectedLayer

        //main
        /*if (ti.selectedTool !== this.id) {
            this.clipboard = null
            return
        }*/
        if (world.selection.length < 2) return

        let lowX = Math.min(world.selection[0].x, world.selection[1].x)
        let highX = Math.max(world.selection[0].x, world.selection[1].x)

        let lowY = Math.min(world.selection[0].y, world.selection[1].y)
        let highY = Math.max(world.selection[0].y, world.selection[1].y)

        let lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0]
        let highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0]

        //TILES
            //copy & remove tiles
            let tilesToCopyAndRemoved = this.getTilesToCopyAndRemoved(lowX, highX, lowY, highY, selectedLayer, world, shouldRemove)
            let tilesToCopy: Array<[Tile, Vector2]> =  tilesToCopyAndRemoved[0]
            let removedTiles = tilesToCopyAndRemoved[1]
            
        //ITEMS
            //copy & remove items
            let itemsToCopyAndRemove = this.getItemsToCopyAndRemoved(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world, shouldRemove)
            let itemsToCopy: Array<[Item, Vector2]> = itemsToCopyAndRemove[0]
            let removedItems = itemsToCopyAndRemove[1]

        //CONTAINERS
            //copy & remove containers
            let containersToCopyAndRemove = this.getContainersToCopyAndRemoved(lowX, highX, lowY, highY, selectedLayer, world, shouldRemove)
            let containersToCopy: Array<[Inventory, Vector2]> = containersToCopyAndRemove[0]
            let removedContainers = containersToCopyAndRemove[1]

        if (shouldRemove) {
            //add to history stack
            let undoInstructions = []
            let redoInstructions = []

            if (removedTiles.length > 0 || removedItems.length > 0 || removedContainers.length > 0) {
                //tile and chunk
                undoInstructions.push(this.getRemovedTileUndoInstruction(removedTiles, world))
                redoInstructions.push(this.getRemovedTileRedoInstruction(removedTiles, world))

                //items
                undoInstructions.push(this.getRemovedItemsUndoInstruction(removedItems, world))
                redoInstructions.push(this.getRemovedItemsRedoInstruction(removedItems, world))

                //containers
                undoInstructions.push(this.getRemovedContainersUndoInstruction(removedContainers, world))
                redoInstructions.push(this.getRemovedContainersRedoInstruction(removedContainers, world))

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
            }
        }
        
        this.clipboard = {
            "tilesToCopy": this.cloneTilesToCopy(tilesToCopy),
            "itemsToCopy": this.cloneItemsToCopy(itemsToCopy),
            "containersToCopy": this.cloneContainersToCopy(containersToCopy),

            "lowX": lowX,
            "lowY": lowY,
            "highX": highX,
            "highY": highY,

            "width": highX - lowX,
            "height": highY - lowY
        }
        this.selectToolState = SelectToolState.None
        world.selection = []
    }

    onDelete() {
        //history info
        let removedTiles: Array<[Tile, Vector3]> = []
        let removedContainers: Array<Inventory> = []
        let removedItems: Array<Item> = []

        //tool info
        let ti = this.toolInfo
        let world = ti.world
        let selectedLayer = ti.selectedLayer

        if (ti.selectedTool !== this.id) return
        if (world.selection.length < 2) return

        //main
        let lowX = Math.min(world.selection[0].x, world.selection[1].x)
        let highX = Math.max(world.selection[0].x, world.selection[1].x)

        let lowY = Math.min(world.selection[0].y, world.selection[1].y)
        let highY = Math.max(world.selection[0].y, world.selection[1].y)

        let lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0]
        let highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0]

        //delete tiles in selection
        removedTiles = this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world)

        //delete containers in selection
        removedContainers = this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world)

        //delete items in selection
        removedItems = this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world)

        //add to history stack
        let undoInstructions = []
        let redoInstructions = []

        if (removedTiles.length > 0 || removedItems.length > 0 || removedContainers.length > 0) {
            //tile and chunk
            undoInstructions.push(this.getRemovedTileUndoInstruction(removedTiles, world))
            redoInstructions.push(this.getRemovedTileRedoInstruction(removedTiles, world))

            //items
            undoInstructions.push(this.getRemovedItemsUndoInstruction(removedItems, world))
            redoInstructions.push(this.getRemovedItemsRedoInstruction(removedItems, world))

            //containers
            undoInstructions.push(this.getRemovedContainersUndoInstruction(removedContainers, world))
            redoInstructions.push(this.getRemovedContainersRedoInstruction(removedContainers, world))

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
        }

        //remove selection
        world.selection = []
        this.selectToolState = SelectToolState.None
    }

    getAddedTilesUndoInstruction(addedTiles: Array<[Tile, Chunk]>): Function {
        return () => {
            for (let addedTileInfo of addedTiles) {
                let tileChunk = addedTileInfo[1]
                let tile = addedTileInfo[0]

                tileChunk.removeTileAt(tile.x, tile.y, tile.z)
            }
        }
    }

    getRemovedTileUndoInstruction(removedTiles: Array<[Tile, Vector3]>, world: World): Function {
        return () => {
            for (let removedTileInfo of removedTiles) {
                let removedTile = removedTileInfo[0]
                let removedTilePos = removedTileInfo[1]

                world.setTileAtGlobalPos(removedTile, removedTilePos.x, removedTilePos.y)
            }
        }
    }

    getCreatedChunksUndoInstruction(createdChunks: Chunk[], world: World): Function {
        return () => {
            for (let createdChunk of createdChunks) {
                world.removeChunkAt(createdChunk.x, createdChunk.y)
            }
        }
    }

    getCreatedChunksRedoInstruction(createdChunks: Chunk[], world: World): Function {
        return () => {
            for (let createdChunk of createdChunks) {
                world.addChunk(createdChunk)
            }
        }
    }

    getRemovedTileRedoInstruction(removedTiles: Array<[Tile, Vector3]>, world: World): Function {
        return () => {
            for (let removedTileInfo of removedTiles) {
                let removedTilePos = removedTileInfo[1]
        
                world.removeTileAtGlobalPos(removedTilePos.x, removedTilePos.y, removedTilePos.z)
            }
        }
    }

    getAddedTilesRedoInstruction(addedTiles: Array<[Tile, Chunk]>): Function {
        return () => {
            for (let addedTileInfo of addedTiles) {
                let tileChunk = addedTileInfo[1]
                let tile = addedTileInfo[0]
        
                tileChunk.setTile(tile)
            }
        }
    }

    getAddedItemsUndoInstruction(addedItems: Array<Item>, world: World): Function {
        return () => {
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
        }
    }

    getRemovedItemsUndoInstruction(removedItems: Array<Item>, world: World): Function {
        return () => {
            for (let removedItem of removedItems) {
                world.setItem(removedItem)
            }
        }
    }

    getAddedItemsRedoInstruction(addedItems: Array<Item>, world: World): Function {
        return () => {
            for (let addedItem of addedItems) {
                world.setItem(addedItem)
            }
        }
    }

    getRemovedItemsRedoInstruction(removedItems: Array<Item>, world: World): Function {
        return () => {
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
        }
    }

    getAddedContainersUndoInstruction(addedContainers: Array<Inventory>, world: World): Function {
        return () => {
            for (let addedContainer of addedContainers) {
                for (let i = 0; i < world.containers.length; i++) {
                    let container = world.containers[i]
        
                    if (container == addedContainer) {
                        world.containers.splice(i, 1)
                    }
                }
            }
        }
    }
    
    getRemovedContainersUndoInstruction(removedContainers: Array<Inventory>, world: World): Function {
        return () => {
            for (let removedContainer of removedContainers) {
                world.containers.push(removedContainer)
            }
        }
    }

    getRemovedContainersRedoInstruction(removedContainers: Array<Inventory>, world: World): Function {
        return () => {
            for (let removedContainer of removedContainers) {
                for (let i = 0; i < world.containers.length; i++) {
                    let container = world.containers[i]
        
                    if (container == removedContainer) {
                        world.containers.splice(i, 1)
                    }
                }
            }
        }
    }

    getAddedContainersRedoInstruction(addedContainers: Array<Inventory>, world: World): Function {
        return () => {
            for (let addedContainer of addedContainers) {
                world.containers.push(addedContainer)
            }
        }
    }

    removeTilesInSelection(lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World, shouldRemove: boolean = true): Array<[Tile, Vector3]> {
        let removedTiles: Array<[Tile, Vector3]> = []

        for (let x = lowX; x <= highX; x++) {
            for (let y = lowY; y <= highY; y++) {
                if (selectedLayer === -1) { //layer auto
                    let tempRemovedTiles = []
                    if (shouldRemove) {
                        tempRemovedTiles = world.removeTilesAtGlobalPosXY(x, y)
                    } else {
                        tempRemovedTiles = world.findTilesAtGlobalPos(x, y)
                    }
                    for (let removedTile of tempRemovedTiles) {
                        removedTiles.push([removedTile, {"x": x, "y": y, "z": removedTile.z}])
                    }
                } else {
                    let removedTile = null
                    if (shouldRemove) {
                        removedTile = world.removeTileAtGlobalPos(x, y, selectedLayer)
                    } else {
                        removedTile = world.findTileAtGlobalPos(x, y, selectedLayer)
                    }
                    if (removedTile) {
                        removedTiles.push([removedTile, {"x": x, "y": y, "z": removedTile.z}])
                    }
                }
            }
        }

        return removedTiles
    }

    removeContainersInSelection(lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World, shouldRemove: boolean = true): Array<Inventory> {
        let removedContainers: Array<Inventory> = []

        for (let i = 0; i < world.containers.length; i++) {
            let container = world.containers[i]

            if (container.z === selectedLayer || selectedLayer === -1) {
                let globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y)

                if (globalPos.x >= lowX && globalPos.x <= highX && globalPos.y >= lowY && globalPos.y <= highY) {
                    let removedContainer = world.containers[i]

                    if (shouldRemove) {
                        removedContainer = world.containers.splice(i, 1)[0]
                        i--
                    }

                    removedContainers.push(removedContainer)
                }
            }
        }

        return removedContainers
    }

    removeItemsInSelection(lowChunkPos: Vector2, highChunkPos: Vector2, lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World, shouldRemove: boolean = true): Array<Item> {
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
                            let removedItem = chunk.itemDataList[i]
                            if (shouldRemove) {
                                removedItem = chunk.itemDataList.splice(i, 1)[0]
                                chunk.edited()
                                i--
                            }
                            
                            removedItems.push(removedItem)
                        }
                    }
                }
            }
        }

        return removedItems
    }

    getTilesToCopyAndRemoved(lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World, shouldRemove: boolean = true): [[Tile, Vector2][],[Tile, Vector3][]] {
        let tilesToCopy: Array<[Tile, Vector2]> = []
        let removedTiles: Array<[Tile, Vector3]> = []

        let tempOldTiles = this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world, shouldRemove)
        for (let tileInfo of tempOldTiles) {
            let tile = tileInfo[0]
            let globalTilePos = tileInfo[1]
            tilesToCopy.push([tile.clone(), {"x": globalTilePos.x, "y": globalTilePos.y}])
            removedTiles.push([tile, {"x": globalTilePos.x, "y": globalTilePos.y, "z": tile.z}])
        }

        return [tilesToCopy, removedTiles]
    }

    getContainersToCopyAndRemoved(lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World, shouldRemove: boolean = true): [[Inventory, Vector2][],Inventory[]] {
        let containersToCopy: Array<[Inventory, Vector2]> = []
        let removedContainers: Array<Inventory> = []

        //copy and delete containers in old area
        let tempOldContainers = this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world, shouldRemove)
        for (let container of tempOldContainers) {
            let globalPos = world.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y)
            containersToCopy.push([container.clone(), globalPos])
            removedContainers.push(container)
        }

        return [containersToCopy, removedContainers]
    }

    getItemsToCopyAndRemoved(lowChunkPos: Vector2, highChunkPos: Vector2, lowX: number, highX: number, lowY: number, highY: number, selectedLayer: number, world: World, shouldRemove: boolean = true): [[Item, Vector2][],Item[]] {
        let removedItems: Array<Item> = []
        let itemsToCopy: Array<[Item, Vector2]> = []

        //copy and delete old items
        let tempOldItems = this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world, shouldRemove)
        for (let item of tempOldItems) {
            let itemGlobalPos = world.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y)
            itemsToCopy.push([item.clone(), itemGlobalPos])
            removedItems.push(item)
        }

        return [itemsToCopy, removedItems]
    }

    pasteTiles(tilesToCopy: [Tile, Vector2][], xDiff: number, yDiff: number, world: World): [[Tile, Chunk][], Chunk[]] {
        let addedTiles: Array<[Tile, Chunk]> = []
        let createdChunks: Array<Chunk> = []

        for (let tileInfo of tilesToCopy) {
            let tile = tileInfo[0]
            let tileGlobalPos = {"x": tileInfo[1].x + xDiff, "y": tileInfo[1].y + yDiff}

            let chunkAddedInfo = world.setTileAtGlobalPos(tile, tileGlobalPos.x, tileGlobalPos.y)
            addedTiles.push([tile, chunkAddedInfo[0]])
            if (chunkAddedInfo[1]) {
                createdChunks.push(chunkAddedInfo[0])
            }
        }

        return [addedTiles, createdChunks]
    }

    pasteContainers(containersToCopy: [Inventory, Vector2][], xDiff: number, yDiff: number, world: World): Inventory[] {
        let addedContainers: Array<Inventory> = []

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

        return addedContainers
    }

    pasteItems(itemsToCopy: [Item, Vector2][], xDiff: number, yDiff: number, world: World): Array<Item> {
        let addedItems: Array<Item> = []

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

        return addedItems
    }

    cloneTilesToCopy(tilesToCopy: [Tile, Vector2][]): [Tile, Vector2][] {
        let newTilesToCopy: [Tile, Vector2][] = []

        for (let tileInfo of tilesToCopy) {
            newTilesToCopy.push([tileInfo[0].clone(), {"x": tileInfo[1].x, "y": tileInfo[1].y}])
        }

        return newTilesToCopy
    }

    cloneContainersToCopy(containersToCopy: [Inventory, Vector2][]): [Inventory, Vector2][] {
        let newContainersToCopy: [Inventory, Vector2][] = []

        for (let containerInfo of containersToCopy) {
            newContainersToCopy.push([containerInfo[0].clone(), {"x": containerInfo[1].x, "y": containerInfo[1].y}])
        }

        return newContainersToCopy
    }

    cloneItemsToCopy(itemsToCopy: [Item, Vector2][]): [Item, Vector2][] {
        let newItemsToCopy: [Item, Vector2][] = []

        for (let itemInfo of itemsToCopy) {
            newItemsToCopy.push([itemInfo[0].clone(), {"x": itemInfo[1].x, "y": itemInfo[1].y}])
        }

        return newItemsToCopy
    }

    tick() {
        //history info
        let removedTiles: Array<[Tile, Vector3]> = []
        let addedTiles: Array<[Tile, Chunk]> = []
        let createdChunks: Chunk[] = []

        let removedItems: Array<Item> = []
        let addedItems: Array<Item> = []

        let removedContainers: Array<Inventory> = []
        let addedContainers: Array<Inventory> = []

        //main
        let ti = this.toolInfo
        let world = ti.world

        if (ti.selectedTool !== this.id) {
            this.selectToolState = SelectToolState.None
            world.selection = []
            return
        }

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

        if ((ti.isHoveringOverObject && mouseButtonState == MouseButtonState.Down) || (mouseButtonState > MouseButtonState.Down && this.selectToolState == SelectToolState.None && ti.isHoveringOverObject)) {
            this.selectToolState = SelectToolState.None
            world.selection = []
            return
        }
    
        let lowX = null
        let highX = null

        let lowY = null
        let highY = null

        let lowChunkPos = null
        let highChunkPos = null

        if (world.selection.length == 2) {
            lowX = Math.min(world.selection[0].x, world.selection[1].x)
            highX = Math.max(world.selection[0].x, world.selection[1].x)
    
            lowY = Math.min(world.selection[0].y, world.selection[1].y)
            highY = Math.max(world.selection[0].y, world.selection[1].y)

            lowChunkPos = world.getChunkAndTilePosAtGlobalPos(lowX, lowY)[0]
            highChunkPos = world.getChunkAndTilePosAtGlobalPos(highX, highY)[0]
    
            if (globalMousePos.x >= lowX && globalMousePos.x <= highX && globalMousePos.y >= lowY && globalMousePos.y <= highY) {
                mouseIsInSelection = true
            }
        }

        //logic
        switch (mouseButtonState) {
            case MouseButtonState.None:
                switch (this.selectToolState) {
                    case SelectToolState.Selected:
                        if (mouseIsInSelection) {
                            document.getElementById("2Dcanvas").style.cursor = "move"
                        }
                        break
                    case SelectToolState.Paste:
                        world.selection = []
                        world.selection[0] = {"x": globalMousePos.x, "y": globalMousePos.y}
                        world.selection[1] = {"x": globalMousePos.x + this.clipboard.width, "y": globalMousePos.y + this.clipboard.height}
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
    
                        let lowChunkPosOld = world.getChunkAndTilePosAtGlobalPos(lowXold, lowYold)[0]
                        let highChunkPosOld = world.getChunkAndTilePosAtGlobalPos(highXold, highYold)[0]
    
                        let xDiff = lowX - lowXold
                        let yDiff = lowY - lowYold
    
                        //TILES
                            //copy & remove tiles
                            let tilesToCopyAndRemoved = this.getTilesToCopyAndRemoved(lowXold, highXold, lowYold, highYold, selectedLayer, world)
                            let tilesToCopy: Array<[Tile, Vector2]> =  tilesToCopyAndRemoved[0]
                            removedTiles = removedTiles.concat(tilesToCopyAndRemoved[1])
        
                            //delete tiles in new area
                            removedTiles = removedTiles.concat(this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world))
        
                            //paste old tiles in new area
                            let addedTilesAndCreatedChunks = this.pasteTiles(tilesToCopy, xDiff, yDiff, world)
                            addedTiles = addedTiles.concat(addedTilesAndCreatedChunks[0])
                            createdChunks = createdChunks.concat(addedTilesAndCreatedChunks[1])
                        
                        //ITEMS
                            //copy & remove items
                            let itemsToCopyAndRemove = this.getItemsToCopyAndRemoved(lowChunkPosOld, highChunkPosOld, lowXold, highXold, lowYold, highYold, selectedLayer, world)
                            let itemsToCopy: Array<[Item, Vector2]> = itemsToCopyAndRemove[0]
                            removedItems = removedItems.concat(itemsToCopyAndRemove[1])

                            //delete items in new area
                            removedItems = removedItems.concat(this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world))
        
                            //paste old items in new area
                            addedItems = addedItems.concat(this.pasteItems(itemsToCopy, xDiff, yDiff, world))
    
                        //CONTAINERS
                            //copy & remove containers
                            let containersToCopyAndRemove = this.getContainersToCopyAndRemoved(lowXold, highXold, lowYold, highYold, selectedLayer, world)
                            let containersToCopy: Array<[Inventory, Vector2]> = containersToCopyAndRemove[0]
                            removedContainers = removedContainers.concat(containersToCopyAndRemove[1])

                            //delete containers in new area
                            removedContainers = removedContainers.concat(this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world))
        
                            //paste containers in new area
                            addedContainers = addedContainers.concat(this.pasteContainers(containersToCopy, xDiff, yDiff, world))
    
                        this.selectToolState = SelectToolState.None
                        break
                    case SelectToolState.Paste:
                        let xPasteDiff = lowX - this.clipboard.lowX
                        let yPasteDiff = lowY - this.clipboard.lowY
    
                        //TILES
                            //delete tiles in new area
                            removedTiles = removedTiles.concat(this.removeTilesInSelection(lowX, highX, lowY, highY, selectedLayer, world))
        
                            //paste old tiles in new area
                            let pasteAddedTilesAndCreatedChunks = this.pasteTiles(this.cloneTilesToCopy(this.clipboard.tilesToCopy), xPasteDiff, yPasteDiff, world)
                            addedTiles = addedTiles.concat(pasteAddedTilesAndCreatedChunks[0])
                            createdChunks = createdChunks.concat(pasteAddedTilesAndCreatedChunks[1])
                        
                        //ITEMS
                            //delete items in new area
                            removedItems = removedItems.concat(this.removeItemsInSelection(lowChunkPos, highChunkPos, lowX, highX, lowY, highY, selectedLayer, world))
        
                            //paste old items in new area
                            addedItems = addedItems.concat(this.pasteItems(this.cloneItemsToCopy(this.clipboard.itemsToCopy), xPasteDiff, yPasteDiff, world))
    
                        //CONTAINERS
                            //delete containers in new area
                            removedContainers = removedContainers.concat(this.removeContainersInSelection(lowX, highX, lowY, highY, selectedLayer, world))
        
                            //paste containers in new area
                            addedContainers = addedContainers.concat(this.pasteContainers(this.cloneContainersToCopy(this.clipboard.containersToCopy), xPasteDiff, yPasteDiff, world))    

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
        let undoInstructions: Array<Function> = []
        let redoInstructions: Array<Function> = []

        if (addedTiles.length > 0 ||
            removedTiles.length > 0 ||
            createdChunks.length > 0 ||
            addedItems.length > 0 ||
            removedItems.length > 0 ||
            addedContainers.length > 0 ||
            removedContainers.length > 0
        ) {
            //tile and chunk
            undoInstructions.push(this.getAddedTilesUndoInstruction(addedTiles))
            undoInstructions.push(this.getRemovedTileUndoInstruction(removedTiles, world))
            undoInstructions.push(this.getCreatedChunksUndoInstruction(createdChunks, world))

            redoInstructions.push(this.getCreatedChunksRedoInstruction(createdChunks, world))
            redoInstructions.push(this.getRemovedTileRedoInstruction(removedTiles, world))
            redoInstructions.push(this.getAddedTilesRedoInstruction(addedTiles))

            //items
            undoInstructions.push(this.getAddedItemsUndoInstruction(addedItems, world))
            undoInstructions.push(this.getRemovedItemsUndoInstruction(removedItems, world))

            redoInstructions.push(this.getRemovedItemsRedoInstruction(removedItems, world))
            redoInstructions.push(this.getAddedItemsRedoInstruction(addedItems, world))

            //containers
            undoInstructions.push(this.getAddedContainersUndoInstruction(addedContainers, world))
            undoInstructions.push(this.getRemovedContainersUndoInstruction(removedContainers, world))

            redoInstructions.push(this.getRemovedContainersRedoInstruction(removedContainers, world))
            redoInstructions.push(this.getAddedContainersRedoInstruction(addedContainers, world))

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
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}