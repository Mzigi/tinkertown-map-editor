import { Chunk } from "../objects/chunk.js"
import { Tile } from "../objects/tile.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

export class Erase extends Tool {
    lastChunkAtMouse: Chunk
    lastTileAtMouse: Vector2
    lastWorldMousePos: Vector2

    constructor(id: number, name: string, toolInfo: ToolInfo) {
        super(id, name, toolInfo)

        this.lastChunkAtMouse = null
        this.lastTileAtMouse = null
        this.lastWorldMousePos = null
    }

    tick() {
        //history info
        let removedTile = null
        let removedStorage = null
        let removedItem = null
        
        //main
        let ti = this.toolInfo
        let world = ti.world

        if (ti.selectedTool !== this.id) return
        if (!ti.mouseButtonPressed[0]) return

        let chunkAtMouse = this.getChunkAtMouse()
        let worldMousePos = this.getWorldMousePos()

        let tileAtMouse = null
        if (chunkAtMouse) {
            tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)
        }

        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y)
        }

        if (!ti.isHoveringOverObject) {
            if (tileAtMouse) {
                //check if tile was already just erased here
                let shouldPlaceAgain = true
        
                if (this.lastChunkAtMouse && chunkAtMouse.x == this.lastChunkAtMouse.x && chunkAtMouse.y == this.lastChunkAtMouse.y) {
                    if (tileAtMouse.x == this.lastTileAtMouse.x && tileAtMouse.y == this.lastTileAtMouse.y) {
                        shouldPlaceAgain = false
                    }
                }
        
                //delete the tile
                if (shouldPlaceAgain) {
                    let zPos = ti.selectedLayer
        
                    let highestTile = null
        
                    if (ti.selectedLayer > -1) {
                        zPos = ti.selectedLayer
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
                    removedTile = chunkAtMouse.removeTileAt(tileAtMouse.x, tileAtMouse.y, zPos)
                }
            }
        } else if (ti.hoveredStorage) { //erase storage
            for (let i = 0; i < world.containers.length; i++) {
                if (world.containers[i] == ti.hoveredStorage) {
                    removedStorage = world.containers.splice(i,1)[0]
                    break
                }
            }
        } else if (ti.hoveredItem && chunkAtMouse) { //erase item
            for (let i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                if (chunkAtMouse.itemDataList[i] == ti.hoveredItem) {
                    removedItem = chunkAtMouse.itemDataList.splice(i,1)[0]
                    chunkAtMouse.edited()
                    break
                }
            }
        }

        //add to history stack
        let undo = null
        let redo = null

        if (removedTile) {
            undo = () => {
                chunkAtMouse.setTile(removedTile)
            }

            redo = () => {
                chunkAtMouse.removeTileAt(removedTile.x, removedTile.y, removedTile.z)
            }
        }

        if (removedStorage) {
            undo = () => {
                world.containers.push(removedStorage)
            }

            redo = () => {
                for (let i = 0; i < world.containers.length; i++) {
                    if (world.containers[i] == removedStorage) {
                        world.containers.splice(i,1)
                        break
                    }
                }
            }
        }

        if (removedItem) {
            undo = () => {
                chunkAtMouse.itemDataList.push(removedItem)
                chunkAtMouse.edited()
            }

            redo = () => {
                for (let i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                    if (chunkAtMouse.itemDataList[i] == removedItem) {
                        chunkAtMouse.itemDataList.splice(i,1)[0]
                        chunkAtMouse.edited()
                        break
                    }
                }
            }
        }

        if (undo) {
            world.addHistory(new ToolHistory(undo, redo))
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}