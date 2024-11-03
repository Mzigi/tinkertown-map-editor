import { Chunk } from "../objects/chunk.js"
import { Tile } from "../objects/tile.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

export class Draw extends Tool {
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
        let didCreateNewChunk = false
        let originalTile = null
        let didChangeSomething = false

        //main
        let ti = this.toolInfo

        if (ti.selectedTool !== this.id) return
        if (!ti.mouseButtonPressed[0]) return
        if (ti.isHoveringOverObject) return

        let selectedLayer = ti.selectedLayer
        let selectedTile = ti.selectedTile

        let chunkAtMouse = this.getChunkAtMouse()
        let worldMousePos = this.getWorldMousePos()

        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y)
        }

        //create new chunk if there is none
        if (chunkAtMouse == null) {
            didCreateNewChunk = true
            didChangeSomething = true
            let chunkPos = ti.world.getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y)
            chunkAtMouse = new Chunk()
            chunkAtMouse.x = chunkPos.x
            chunkAtMouse.y = chunkPos.y
            ti.world.addChunk(chunkAtMouse)
        }
        let tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)

        //check if tile was already just placed here
        let shouldPlaceAgain = true

        if (this.lastChunkAtMouse && chunkAtMouse.x == this.lastChunkAtMouse.x && chunkAtMouse.y == this.lastChunkAtMouse.y) {
            if (tileAtMouse.x == this.lastTileAtMouse.x && tileAtMouse.y == this.lastTileAtMouse.y) {
                shouldPlaceAgain = false
            }
        }

        //replace the tile with the selected one
        let replacementTile = null

        if (tileAtMouse && shouldPlaceAgain || !ti.lastMouseButtonPressed[0]) {
            replacementTile = new Tile()
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
                    originalTile = chunkAtMouse.setTile(replacementTile)
                    didChangeSomething = true
                }
            } else {
                originalTile = chunkAtMouse.setTile(replacementTile)
                didChangeSomething = true
            }
        }

        //add to history stack
        if (didChangeSomething) {
            let undo = () => {
                if (originalTile) {
                    chunkAtMouse.setTile(originalTile)
                } else if (replacementTile) {
                    chunkAtMouse.removeTileAt(replacementTile.x, replacementTile.y, replacementTile.z)
                }

                if (didCreateNewChunk) {
                    ti.world.removeChunkAt(chunkAtMouse.x, chunkAtMouse.y)
                }
            }

            let redo = () => {
                if (didCreateNewChunk) {
                    ti.world.addChunk(chunkAtMouse)
                }

                if (replacementTile) {
                    chunkAtMouse.setTile(replacementTile)
                }
            }

            ti.world.addHistory(new ToolHistory(undo, redo))
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}