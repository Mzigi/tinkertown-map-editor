import { Chunk } from "../objects/chunk.js"
import { Inventory, InventoryFormat } from "../objects/inventory.js"
import { Tile } from "../objects/tile.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

export class AddContainer extends Tool {
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
        if (!ti.mouseButtonPressed[0]) return
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

        let newContainer = null

        //add container tool code
        if (chunkAtMouse) {
            if (tileAtMouse) {
                let alreadyPlaced = false
    
                for (let i = 0; i < world.containers.length; i++) {
                    let container = world.containers[i]
                    if (container.x == tileAtMouse.x && container.y == tileAtMouse.y && container.chunkX == chunkAtMouse.x && container.chunkY == chunkAtMouse.y) {
                        alreadyPlaced = true
                    }
                }
    
                let highestTile = null
        
                let zPos = 0

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

                if (!alreadyPlaced) {
                    newContainer = new Inventory()
                    newContainer.chunkX = chunkAtMouse.x
                    newContainer.chunkY = chunkAtMouse.y
                    newContainer.x = tileAtMouse.x
                    newContainer.y = tileAtMouse.y
                    newContainer.z = zPos
                    newContainer.target = InventoryFormat.Container
    
                    world.containers.push(newContainer)
                }
            }
        }

        //add to history stack
        if (newContainer) {
            let undo = () => {
                for (let i = 0; i < world.containers.length; i++) {
                    if (world.containers[i] == newContainer) {
                        world.containers.splice(i,1)
                        break
                    }
                }
            }

            let redo = () => {
                world.containers.push(newContainer)
            }

            ti.world.addHistory(new ToolHistory(undo, redo))
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}