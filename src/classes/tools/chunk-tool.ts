import { Chunk } from "../objects/chunk.js"
import { Inventory, InventoryFormat } from "../objects/inventory.js"
import { Item } from "../objects/item.js"
import { Tile } from "../objects/tile.js"
import { EventBinding } from "./event-binding.js"
import { ToolHistory, ToolInfo } from "./tool-info.js"
import { Tool } from "./tool.js"

export class ChunkTool extends Tool {
    lastChunkAtMouse: Chunk
    lastTileAtMouse: Vector2
    lastWorldMousePos: Vector2

    chunkPopupElement: HTMLElement = document.getElementById("chunk-popup")
    chunkPopupTitleElement: HTMLElement = document.getElementById("chunk-popup-title")
    chunkToEdit: Chunk

    constructor(id: number, name: string, toolInfo: ToolInfo) {
        super(id, name, toolInfo)

        this.lastChunkAtMouse = null
        this.lastTileAtMouse = null
        this.lastWorldMousePos = null

        this.events = [
            new EventBinding("MouseButton0Up", (tool: ChunkTool) => {
                let chunkAtMouse = this.getChunkAtMouse()
                
                if (chunkAtMouse && this.toolInfo.selectedTool == this.id) {
                    this.chunkToEdit = chunkAtMouse
                    tool.openChunkMenu()
                }
            })
        ]

        window["editChunk"] = (fieldName: string) => {
            this.editChunk(fieldName, this)
        }
    }

    openChunkMenu() {
        let ti = this.toolInfo  
        let camera =  ti.camera
        let lastMousePos = camera.lastPosition

        if (this.chunkPopupElement) {
            this.chunkPopupElement.style.display = "block"
            this.chunkPopupElement.style.top = lastMousePos.y + "px"
            this.chunkPopupElement.style.left = lastMousePos.x + "px";

            (<HTMLInputElement>document.getElementById("chunk-popup-biomeid")).value = this.chunkToEdit.biomeID.toString();
            (<HTMLInputElement>document.getElementById("chunk-popup-isrevealed")).checked = this.chunkToEdit.revealed
        }

        if (this.chunkPopupTitleElement) {
            this.chunkPopupTitleElement.innerText = `Chunk at [${this.chunkToEdit.x},${this.chunkToEdit.y}]`
        }
    }

    editChunk(fieldName: string, tool: ChunkTool) {
        let chunkSettingValue: string = (<HTMLInputElement>document.getElementById("chunk-popup-" + fieldName)).value

        if (fieldName == "biomeid") {
            tool.chunkToEdit.biomeID = Math.floor(Number(chunkSettingValue))
        } else if (fieldName == "isrevealed") {
            tool.chunkToEdit.revealed = (<HTMLInputElement>document.getElementById("chunk-popup-" + fieldName)).checked
        }
    }

    tick() {
        //main
        let ti = this.toolInfo
        let world = ti.world

        if (ti.selectedTool !== this.id) {
            if (document.getElementById("chunk-popup")) {
                document.getElementById("chunk-popup").style.display = "none"
            }
            return
        }
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

        //chunk tool code
        if (ti.mouseButtonPressed[0]) {
            if (!ti.lastMouseButtonPressed[0]) {
                if (chunkAtMouse) {
                    console.log("cli")
                }
            }
        }

        if (chunkAtMouse) {
            world.highlightedChunk = chunkAtMouse
        }

        this.lastChunkAtMouse = chunkAtMouse
        this.lastWorldMousePos = worldMousePos
    }
}