class EventBinding {
    event: Function
    name: string

    constructor(name, event) {
        this.name = name
        this.event = event
    }

    call(tool) {
        this.event(tool)
    }
}