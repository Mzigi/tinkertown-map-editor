/*
ITEM
itemId: int16
itemCount: int16
slot: byte (because this is a byte max inventory size is 16x16 if you want to save properly)
*/
import { simpleView } from "../simpleView.js";
var InventoryItem = /** @class */ (function () {
    function InventoryItem() {
        this.id = 0;
        this.count = 0;
        this.slot = 0;
    }
    InventoryItem.prototype.fromBuffer = function (itemBuffer) {
        var view = new simpleView(itemBuffer);
        this.id = view.readInt16();
        this.count = view.readInt16();
        this.slot = view.readUint8();
    };
    InventoryItem.prototype.writeToBuffer = function (writeBuffer, byteOffset) {
        var view = new simpleView(writeBuffer);
        view.viewOffset = byteOffset;
        view.writeInt16(this.id);
        view.writeInt16(this.count);
        view.writeUint8(this.slot);
    };
    InventoryItem.prototype.getByteSize = function () {
        return 5;
    };
    InventoryItem.prototype.clone = function () {
        var newItem = new InventoryItem();
        newItem.id = this.id;
        newItem.count = this.count;
        newItem.slot = this.slot;
        return newItem;
    };
    return InventoryItem;
}());
export { InventoryItem };
//# sourceMappingURL=inventoryItem.js.map