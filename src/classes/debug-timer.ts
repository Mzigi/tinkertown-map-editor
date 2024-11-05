export class DebugTimer {
    startTime: number
    name: string

    constructor(name: string) {
        this.name = name
        this.startTime = performance.now()
    }

    getTime() {
        return (performance.now() - this.startTime)
    }

    log(name?: string) {
        console.log(`${name || this.name} took ${this.getTime() / 1000}s`)
    }
}