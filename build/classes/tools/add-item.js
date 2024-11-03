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
import { Item } from "../objects/item.js";
import { ToolHistory } from "./tool-info.js";
import { Tool } from "./tool.js";
var AddItem = /** @class */ (function (_super) {
    __extends(AddItem, _super);
    function AddItem(id, name, toolInfo) {
        var _this = _super.call(this, id, name, toolInfo) || this;
        _this.lastChunkAtMouse = null;
        _this.lastTileAtMouse = null;
        _this.lastWorldMousePos = null;
        return _this;
    }
    AddItem.prototype.tick = function () {
        //main
        var ti = this.toolInfo;
        var world = ti.world;
        if (ti.selectedTool !== this.id)
            return;
        if (!ti.mouseButtonPressed[0])
            return;
        if (ti.isHoveringOverObject)
            return;
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
        var newItem = null;
        //add item tool code
        if (chunkAtMouse) {
            if (tileAtMouse) {
                var alreadyPlaced = false;
                for (var i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                    var item = chunkAtMouse.itemDataList[i];
                    if (Math.floor(item.x) == tileAtMouse.x && Math.floor(item.y) == tileAtMouse.y && item.chunkX == chunkAtMouse.x && item.chunkY == chunkAtMouse.y) {
                        alreadyPlaced = true;
                    }
                }
                if (!alreadyPlaced) {
                    newItem = new Item();
                    newItem.chunkX = chunkAtMouse.x;
                    newItem.chunkY = chunkAtMouse.y;
                    var exactTileAtMouse = chunkAtMouse.getExactTilePosAtWorldPos(worldMousePos.x, worldMousePos.y);
                    newItem.x = tileAtMouse.x;
                    newItem.y = tileAtMouse.y;
                    chunkAtMouse.itemDataList.push(newItem);
                    chunkAtMouse.edited();
                    //console.log(chunkAtMouse)
                }
            }
        }
        //add to history stack
        if (newItem) {
            var undo = function () {
                for (var i = 0; i < chunkAtMouse.itemDataList.length; i++) {
                    if (chunkAtMouse.itemDataList[i] == newItem) {
                        chunkAtMouse.itemDataList.splice(i, 1);
                        chunkAtMouse.edited();
                        break;
                    }
                }
            };
            var redo = function () {
                chunkAtMouse.itemDataList.push(newItem);
                chunkAtMouse.edited();
            };
            ti.world.addHistory(new ToolHistory(undo, redo));
        }
        this.lastChunkAtMouse = chunkAtMouse;
        this.lastWorldMousePos = worldMousePos;
    };
    return AddItem;
}(Tool));
export { AddItem };
//# sourceMappingURL=add-item.js.map