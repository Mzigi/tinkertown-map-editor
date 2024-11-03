import { Chunk } from "../objects/chunk.js"
import { Tile } from "../objects/tile.js"
import { Tool } from "./tool.js"

export class Draw extends Tool {
    lastChunkAtMouse: Chunk
    lastTileAtMouse: Vector2
    lastWorldMousePos: Vector2

    constructor(id: number, name: string) {
        super(id, name)

        this.lastChunkAtMouse = null
        this.lastTileAtMouse = null
        this.lastWorldMousePos = null
    }

    tick() {
        let selectedLayer = this.toolInfo.selectedLayer
        let selectedTile = this.toolInfo.selectedTile

        let chunkAtMouse = this.getChunkAtMouse()
        let worldMousePos = this.getWorldMousePos()

        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y)
        }

        //create new chunk if there is none
        if (chunkAtMouse == null) {
            let chunkPos = this.toolInfo.world.getChunkPosAtWorldPos(worldMousePos.x, worldMousePos.y)
            chunkAtMouse = new Chunk()
            chunkAtMouse.x = chunkPos.x
            chunkAtMouse.y = chunkPos.y
            this.toolInfo.world.addChunk(chunkAtMouse)
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
        if (tileAtMouse && shouldPlaceAgain || !this.toolInfo.lastMouseButtonPressed[0]) {
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

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}