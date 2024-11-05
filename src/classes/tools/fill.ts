import { Chunk } from "../objects/chunk.js"
import { Tile } from "../objects/tile.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

export class Fill extends Tool {
    lastChunkAtMouse: Chunk
    lastTileAtMouse: Vector2
    lastWorldMousePos: Vector2

    constructor(id: number, name: string, toolInfo: ToolInfo) {
        super(id, name, toolInfo)

        this.lastChunkAtMouse = null
        this.lastTileAtMouse = null
        this.lastWorldMousePos = null
    }

    objectIncludesTilePos(obj: any, x: number, y: number) {
        if (!obj[x]) {
            return false
        }
    
        return obj[x][y]
    }
    
    tilePosIsValid(tilePos: Vector2) {
        return (tilePos.x >= 0 && tilePos.x <= 9 && tilePos.y >= 0 && tilePos.y <= 9)
    }

    tick() {
        //history info
        let didCreateNewChunk = false
        let originalTiles: Tile[] = []
        let replacementTiles: Tile[] = []

        //main
        let ti = this.toolInfo

        if (ti.selectedTool !== this.id) return
        if (!ti.mouseButtonPressed[0]) return
        //if (ti.isHoveringOverObject) return

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

        //fill tool code
        let world = ti.world

        //create new chunk if there is none
        if (chunkAtMouse == null) {
            didCreateNewChunk = true

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
    
            if (tileIdToFlood === ti.selectedTile) {
                return
            }

            let openTiles = [highestTile]
            let closedTiles = {}
    
            while (openTiles.length > 0) {
                let currentTile = openTiles[0]

                if (currentTile.tileAssetId == tileIdToFlood && currentTile.z == layerIdToFlood) {
                    let replacementTile = new Tile()
                    replacementTile.x = currentTile.x
                    replacementTile.y = currentTile.y
                    replacementTile.z = layerIdToFlood
                    replacementTile.tileAssetId = selectedTile

                    let originalTile = chunkAtMouse.setTile(replacementTile)
                    replacementTiles.push(replacementTile)
                    
                    if (originalTile) {
                        originalTiles.push(originalTile)
                    }

                    //west
                    let westTile = {"x": currentTile.x - 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined}
                    westTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x - 1, currentTile.y, currentTile.z)?.tileAssetId
                    if (this.tilePosIsValid(westTile)) {
                        if (!this.objectIncludesTilePos(closedTiles, westTile.x, westTile.y)) {
                            openTiles.push(westTile)
                            if (!closedTiles[westTile.x]) {
                                closedTiles[westTile.x] = {}
                            }
        
                            closedTiles[westTile.x][westTile.y] = true
                        }
                    }

                    //east
                    let eastTile = {"x": currentTile.x + 1, "y": currentTile.y, "z": currentTile.z, "tileAssetId": undefined}
                    eastTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x + 1, currentTile.y, currentTile.z)?.tileAssetId
                    if (this.tilePosIsValid(eastTile)) {
                        if (!this.objectIncludesTilePos(closedTiles, eastTile.x, eastTile.y)) {
                            openTiles.push(eastTile)
                            if (!closedTiles[eastTile.x]) {
                                closedTiles[eastTile.x] = {}
                            }
        
                            closedTiles[eastTile.x][eastTile.y] = true
                        }
                    }

                    //north
                    let northTile = {"x": currentTile.x, "y": currentTile.y + 1, "z": currentTile.z, "tileAssetId": undefined}
                    northTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x, currentTile.y + 1, currentTile.z)?.tileAssetId
                    if (this.tilePosIsValid(northTile)) {
                        if (!this.objectIncludesTilePos(closedTiles, northTile.x, northTile.y)) {
                            openTiles.push(northTile)
                            if (!closedTiles[northTile.x]) {
                                closedTiles[northTile.x] = {}
                            }
        
                            closedTiles[northTile.x][northTile.y] = true
                        }
                    }

                    //south
                    let southTile = {"x": currentTile.x, "y": currentTile.y - 1, "z": currentTile.z, "tileAssetId": undefined}
                    southTile.tileAssetId = chunkAtMouse.findTileAt(currentTile.x, currentTile.y - 1, currentTile.z)?.tileAssetId
                    if (this.tilePosIsValid(southTile)) {
                        if (!this.objectIncludesTilePos(closedTiles, southTile.x, southTile.y)) {
                            openTiles.push(southTile)
                            if (!closedTiles[southTile.x]) {
                                closedTiles[southTile.x] = {}
                            }
        
                            closedTiles[southTile.x][southTile.y] = true
                        }
                    }
                }
            
    
                openTiles.splice(0,1)
            }
        }

        //add to history stack
        let didChangeSomething = didCreateNewChunk || replacementTiles.length > 0 || originalTiles.length > 0

        if (didChangeSomething) {
            let undo = () => {
                for (let replacementTile of replacementTiles) {
                    chunkAtMouse.removeTileAt(replacementTile.x, replacementTile.y, replacementTile.z)
                }

                for (let originalTile of originalTiles) {
                    chunkAtMouse.setTile(originalTile)
                }

                if (didCreateNewChunk) {
                    ti.world.removeChunkAt(chunkAtMouse.x, chunkAtMouse.y)
                }
            }

            let redo = () => {
                if (didCreateNewChunk) {
                    ti.world.addChunk(chunkAtMouse)
                }

                for (let originalTile of originalTiles) {
                    chunkAtMouse.removeTileAt(originalTile.x, originalTile.y, originalTile.z)
                }

                for (let replacementTile of replacementTiles) {
                    chunkAtMouse.setTile(replacementTile)
                }
            }

            ti.world.addHistory(new ToolHistory(undo, redo))
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}