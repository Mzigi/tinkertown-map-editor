import { Chunk } from "../objects/chunk.js"
import { Tile } from "../objects/tile.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

export class Pick extends Tool {
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

        if (tileAtMouse) {
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

                ti.setSelectedTile(tileToPick.tileAssetId, ti.editor)
            }
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}