import { Editor } from "../../application-components/editor.js"
import { Camera } from "../camera.js"
import { Inventory } from "../objects/inventory.js"
import { Item } from "../objects/item.js"
import { World } from "../objects/world.js"

export class ToolHistory {
    undo: Function
    redo: Function

    constructor(undo: Function, redo: Function) {
        this.undo = undo
        this.redo = redo
    }
}

export class ToolInfo {
    editor: Editor

    world: World
    camera: Camera
    canvas: HTMLCanvasElement

    selectedTile: number
    selectedLayer: number

    setSelectedTile: Function
    setSelectedLayer: Function

    mouseButtonPressed: {[key: number]: boolean}
    lastMouseButtonPressed: {[key: number]: boolean}

    selectedTool: number
    isHoveringOverObject: boolean

    hoveredStorage: Inventory
    hoveredItem: Item

    constructor(world: World, canvas: HTMLCanvasElement, selectedTile: number, selectedLayer: number, setSelectedTile: Function, setSelectedLayer: Function, editor: Editor, mouseButtonPressed, lastMouseButtonPressed, selectedTool, isHoveringOverObject) {
        this.world = world
        this.camera = world.camera
        this.canvas = canvas

        this.selectedTile = selectedTile
        this.selectedLayer = selectedLayer

        this.setSelectedTile = setSelectedTile
        this.setSelectedLayer = setSelectedLayer

        this.editor = editor

        this.mouseButtonPressed = mouseButtonPressed
        this.lastMouseButtonPressed = lastMouseButtonPressed

        this.selectedTool = selectedTool
        this.isHoveringOverObject = isHoveringOverObject
    }

    update(world: World, selectedTile: number, selectedLayer: number, mouseButtonPressed, lastMouseButtonPressed, selectedTool, isHoveringOverObject, hoveredStorage, hoveredItem) {
        this.world = world
        this.camera = world.camera

        this.selectedTile = selectedTile
        this.selectedLayer = selectedLayer

        this.mouseButtonPressed = mouseButtonPressed
        this.lastMouseButtonPressed = lastMouseButtonPressed

        this.selectedTool = selectedTool
        this.isHoveringOverObject = isHoveringOverObject

        this.hoveredStorage = hoveredStorage
        this.hoveredItem = hoveredItem
    }
}