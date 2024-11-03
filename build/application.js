import { Renderer } from "./application-components/2d-renderer.js";
import { Editor } from "./application-components/editor.js";
import { ImageHolder } from "./application-components/image-loader.js";
import { Loader } from "./application-components/loader.js";
import { TileList } from "./application-components/tile-list.js";
var Application = /** @class */ (function () {
    function Application() {
        this.canvasElement = document.getElementById("2Dcanvas");
    }
    Application.prototype.init = function () {
        //loader
        this.loader = new Loader();
        //images
        this.imageHolder = new ImageHolder();
        //editor
        this.editor = new Editor(this.loader, this.imageHolder);
        //renderer
        this.renderer = new Renderer(this.imageHolder, this.loader, this.canvasElement, this.editor);
        //tile list
        this.tileList = new TileList(this.imageHolder, this.editor);
        this.loader.editor = this.editor;
        this.imageHolder.loadImages(this.tileList);
        this.tick(this);
    };
    Application.prototype.tick = function (application) {
        try {
            application.editor.tick();
            application.renderer.render();
            window.requestAnimationFrame(function () {
                application.tick(application);
            });
        }
        catch (error) {
            this.loader.alertText("The map editor has crashed: " + error, true, 99999);
        }
    };
    return Application;
}());
export { Application };
var application = new Application();
application.init();
window["application"] = application;
//# sourceMappingURL=application.js.map