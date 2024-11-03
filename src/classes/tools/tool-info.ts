import { Camera } from "../camera.js"
import { World } from "../objects/world.js"

export class ToolInfo {
    world: World
    camera: Camera
    canvas: HTMLCanvasElement

    selectedTile: number
    selectedLayer: number

    setSelectedTile: Function
    setSelectedLayer: Function

    mouseButtonPressed: {[key: number]: boolean}
    lastMouseButtonPressed: {[key: number]: boolean}

    constructor(world: World, canvas: HTMLCanvasElement, selectedTile: number, selectedLayer: number, setSelectedTile: Function, setSelectedLayer: Function) {
        this.world = world
        this.camera = world.camera
        this.canvas = canvas

        this.selectedTile = selectedTile
        this.selectedLayer = selectedLayer

        this.setSelectedTile = setSelectedTile
        this.setSelectedLayer = setSelectedLayer
    }

    update(world: World, selectedTile: number, selectedLayer: number, mouseButtonPressed, lastMouseButtonPressed) {
        this.world = world
        this.camera = world.camera

        this.selectedTile = selectedTile
        this.selectedLayer = selectedLayer

        this.mouseButtonPressed = mouseButtonPressed
        this.lastMouseButtonPressed = lastMouseButtonPressed
    }
}