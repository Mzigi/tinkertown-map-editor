import { Chunk } from "../objects/chunk.js"
import { Inventory, InventoryFormat } from "../objects/inventory.js"
import { Item } from "../objects/item.js"
import { Tile } from "../objects/tile.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

export class AddItem extends Tool {
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

        let newItem = null

        //add item tool code
        if (chunkAtMouse) {
            if (tileAtMouse) {
                let alreadyPlaced = false
    
                for (let i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                    let item = chunkAtMouse.itemDataList[i]
                    if (Math.floor(item.x) == tileAtMouse.x && Math.floor(item.y) == tileAtMouse.y && item.chunkX == chunkAtMouse.x && item.chunkY == chunkAtMouse.y) {
                        alreadyPlaced = true
                    }
                }
    
                if (!alreadyPlaced) {
                    newItem = new Item()
                    newItem.chunkX = chunkAtMouse.x
                    newItem.chunkY = chunkAtMouse.y
    
                    let exactTileAtMouse = chunkAtMouse.getExactTilePosAtWorldPos(worldMousePos.x, worldMousePos.y)
                    newItem.x = tileAtMouse.x
                    newItem.y = tileAtMouse.y
    
                    chunkAtMouse.itemDataList.push(newItem)
    
                    chunkAtMouse.edited()
    
                    //console.log(chunkAtMouse)
                }
            }
        }

        //add to history stack
        if (newItem) {
            let undo = () => {
                for (let i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                    if (chunkAtMouse.itemDataList[i] == newItem) {
                        chunkAtMouse.itemDataList.splice(i,1)
                        chunkAtMouse.edited()
                        break
                    }
                }
            }

            let redo = () => {
                chunkAtMouse.itemDataList.push(newItem)
                chunkAtMouse.edited()
            }

            ti.world.addHistory(new ToolHistory(undo, redo))
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}