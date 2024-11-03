import { Chunk } from "../objects/chunk.js"
import { EventBinding } from "./event-binding.js"
import { ToolInfo } from "./tool-info.js"

export class Tool {
    id: number
    name: string
    
    toolInfo: ToolInfo
    events: Array<EventBinding>
    
    constructor(toolId: number, toolName: string, toolInfo: ToolInfo) {
        this.id = toolId
        this.name = toolName
        this.toolInfo = toolInfo
        this.events = []
    }

    getWorldMousePos(): Vector2 {
        return this.toolInfo.camera.screenPosToWorldPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), this.toolInfo.camera.lastPosition.x, this.toolInfo.camera.lastPosition.y)
    }

    getChunkAtMouse(): Chunk | null {
        let worldMousePos = this.getWorldMousePos()
        return this.toolInfo.world.getChunkAtWorldPos(worldMousePos.x, worldMousePos.y)
    }

    tick() {console.error("Virtual method tick() called")}
}