import { Tool } from "./tool"

export class EventBinding {
    event: Function
    name: string

    constructor(name: string, event: Function) {
        this.name = name
        this.event = event
    }

    call(tool: Tool) {
        this.event(tool)
    }
}