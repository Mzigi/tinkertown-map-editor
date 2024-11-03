import { Chunk } from "../objects/chunk.js"
import { Inventory, InventoryFormat } from "../objects/inventory.js"
import { Item } from "../objects/item.js"
import { Tile } from "../objects/tile.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

export class ChunkTool extends Tool {
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
        let world = ti.world

        if (ti.selectedTool !== this.id) return
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

        //chunk tool code
        if (ti.mouseButtonPressed[0]) {
            if (!ti.lastMouseButtonPressed[0]) {
                if (chunkAtMouse) {
                    console.log("cli")
                }
            }
        } else {
            if (chunkAtMouse) {
                world.highlightedChunk = chunkAtMouse
            }
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}