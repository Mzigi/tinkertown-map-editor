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
import { Tool } from "./tool.js";
var Pick = /** @class */ (function (_super) {
    __extends(Pick, _super);
    function Pick(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        return _this;
    }
    Pick.prototype.tick = function () {
        //main
        var ti = this.toolInfo;
        if (ti.selectedTool !== this.id)
            return;
        if (!ti.mouseButtonPressed[0])
            return;
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
        if (tileAtMouse) {
            var zPos = selectedLayer;
            var highestTile = null;
            if (selectedLayer > -1) {
                zPos = selectedLayer;
            }
            else { //get highest layer if auto layer is on
                var highestZ = 0;
                for (var i = 0; i < chunkAtMouse.layers; i++) {
                    var testTile = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i);
                    if (chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, i)) {
                        highestZ = i;
                        highestTile = testTile;
                    }
                }
                highestZ = Math.min(highestZ, chunkAtMouse.layers);
                zPos = highestZ;
            }
            var tileToPick = chunkAtMouse.findTileAt(tileAtMouse.x, tileAtMouse.y, zPos);
            if (tileToPick != null) {
                var previousSlot = document.getElementById("list-slot-" + selectedTile);
                if (previousSlot) {
                    previousSlot.classList.remove("selected-slot");
                }
                var slot = document.getElementById("list-slot-" + tileToPick.tileAssetId);
                if (slot) {
                    slot.classList.add("selected-slot");
                }
                ti.setSelectedTile(tileToPick.tileAssetId, ti.editor);
            }
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return Pick;
}(Tool));
export { Pick };
//# sourceMappingURL=pick.js.map