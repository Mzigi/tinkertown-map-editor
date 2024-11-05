var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { EventBinding } from "./event-binding.js";
import { Tool } from "./tool.js";
var ChunkTool = /** @class */ (function (_super) {
    __extends(ChunkTool, _super);
    function ChunkTool(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.chunkPopupElement = document.getElementById("chunk-popup");
        _this.chunkPopupTitleElement = document.getElementById("chunk-popup-title");
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        _this.events = [
            new EventBinding("MouseButton0Up", function (tool) {
                var chunkAtMouse = _this.getChunkAtMouse();
                if (chunkAtMouse && _this.toolInfo.selectedTool == _this.id) {
                    _this.chunkToEdit = chunkAtMouse;
                    tool.openChunkMenu();
                }
            })
        ];
        window["editChunk"] = function (fieldName) {
            _this.editChunk(fieldName, _this);
        };
        return _this;
    }
    ChunkTool.prototype.openChunkMenu = function () {
        var ti = this.toolInfo;
        var camera = ti.camera;
        var lastMousePos = camera.lastPosition;
        if (this.chunkPopupElement) {
            this.chunkPopupElement.style.display = "block";
            this.chunkPopupElement.style.top = lastMousePos.y + "px";
            this.chunkPopupElement.style.left = lastMousePos.x + "px";
            document.getElementById("chunk-popup-biomeid").value = this.chunkToEdit.biomeID.toString();
            document.getElementById("chunk-popup-isrevealed").checked = this.chunkToEdit.revealed;
        }
        if (this.chunkPopupTitleElement) {
            this.chunkPopupTitleElement.innerText = "Chunk at [".concat(this.chunkToEdit.x, ",").concat(this.chunkToEdit.y, "]");
        }
    };
    ChunkTool.prototype.editChunk = function (fieldName, tool) {
        var chunkSettingValue = document.getElementById("chunk-popup-" + fieldName).value;
        if (fieldName == "biomeid") {
            tool.chunkToEdit.biomeID = Math.floor(Number(chunkSettingValue));
        }
        else if (fieldName == "isrevealed") {
            tool.chunkToEdit.revealed = document.getElementById("chunk-popup-" + fieldName).checked;
        }
    };
    ChunkTool.prototype.tick = function () {
        //main
        var ti = this.toolInfo;
        var world = ti.world;
        if (ti.selectedTool !== this.id) {
            if (document.getElementById("chunk-popup")) {
                document.getElementById("chunk-popup").style.display = "none";
            }
            return;
        }
        //if (ti.isHoveringOverObject) return
        var selectedLayer = ti.selectedLayer;
        var selectedTile = ti.selectedTile;
        var chunkAtMouse = this.getChunkAtMouse();
        var worldMousePos = this.getWorldMousePos();
        var tileAtMouse = null;
        if (chunkAtMouse) {
            tileAtMouse = chunkAtMouse.getTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
        }
        if (this.lastChunkAtMouse) {
            this.lastTileAtMouse = this.lastChunkAtMouse.getTilePosAtWorldPos(this.lastWorldMousePos.x, this.lastWorldMousePos.y);
        }
        //chunk tool code
        if (ti.mouseButtonPressed[0]) {
            if (!ti.lastMouseButtonPressed[0]) {
                if (chunkAtMouse) {
                    console.log("cli");
                }
            }
        }
        if (chunkAtMouse) {
            world.highlightedChunk = chunkAtMouse;
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return ChunkTool;
}(Tool));
export { ChunkTool };
//# sourceMappingURL=chunk-tool.js.map