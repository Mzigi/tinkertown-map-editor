import { Renderer } from "./application-components/2d-renderer.js"
import { Editor } from "./application-components/editor.js"
import { ImageHolder } from "./application-components/image-loader.js"
import { Loader } from "./application-components/loader.js"
import { TileList } from "./application-components/tile-list.js"

export class Application {
    imageHolder: ImageHolder
    renderer: Renderer
    tileList: TileList
    editor: Editor
    loader: Loader

    canvasElement: HTMLCanvasElement

    constructor() {
        this.canvasElement = <HTMLCanvasElement>document.getElementById("2Dcanvas")
    }

    init() {
        //loader
        this.loader = new Loader()
        
        //images
        this.imageHolder = new ImageHolder()

        //editor
        this.editor = new Editor(this.loader, this.imageHolder)

        //renderer
        this.renderer = new Renderer(this.imageHolder, this.loader, this.canvasElement, this.editor)

        //tile list
        this.tileList = new TileList(this.imageHolder, this.editor)

        this.loader.editor = this.editor
        this.imageHolder.loadImages(this.tileList)
        this.tick(this)
    }

    tick(application: Application) {
        try {
            application.editor.tick()
            application.renderer.render()
            window.requestAnimationFrame(() => {
                application.tick(application)
            })
        } catch(error) {
            this.loader.alertText("The map editor has crashed: " + error, true, 99999)
        }
    }
}

var application = new Application()
application.init()

window["application"] = application