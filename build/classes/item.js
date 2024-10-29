//24 bytes
//itemId (16 bit int)
//index (16 bit int)
//chunk x (32 bit int)
//chunk y (32 bit int)
//?? (should be 0x0000)
//count (16 bit int)
//tile pos x (float 32)
//tile pos y (float 32)
var Item = /** @class */ (function () {
    function Item() {
        this.reset();
    }
    Item.prototype.reset = function () {
        this.id = 0;
        this.index = 0;
        this.chunkX = 0;
        this.chunkY = 0;
        this.unkownInt1 = 0;
        this.count = 1;
        this.x = 0;
        this.y = 0;
    };
    Item.prototype.getName = function () {
        if (item_assetInfoLoaded) {
            if (item_assetInfo[this.id]) {
                return item_assetInfo[this.id].name;
            }
        }
        return null;
    };
    Item.prototype.fromBuffer = function (itemBuffer) {
        var view = new simpleView(itemBuffer);
        this.id = view.readInt16();
        this.index = view.readInt16();
        this.chunkX = view.readInt32();
        this.chunkY = view.readInt32();
        this.unkownInt1 = view.readInt16();
        if (this.unkownInt1 == 0) {
            this.count = view.readInt16();
            this.x = view.readFloat32();
            this.y = view.readFloat32();
        }
        else {
            console.error("Failed to load item with id " + this.id + " at chunk [" + this.chunkX + ", " + this.chunkY + "] due to an invalid unkownInt1 value!");
        }
        if (!item_assetInfoHelper.idExists(this.id)) {
            console.warn("Item with id " + this.id + " was loaded in but isn't in assetInfo!");
        }
    };
    Item.prototype.writeToBuffer = function (writeBuffer, byteOffset, index) {
        var view = new simpleView(writeBuffer);
        view.viewOffset = byteOffset;
        view.writeInt16(this.id);
        view.writeInt16(this.index);
        view.writeInt32(this.chunkX);
        view.writeInt32(this.chunkY);
        view.writeInt16(0); //unkownInt1
        view.writeInt16(this.count);
        view.writeFloat32(this.x);
        view.writeFloat32(this.y);
    };
    Item.prototype.getByteSize = function () {
        return 24;
    };
    Item.prototype.fromObject = function (worldItemData, itemPaletteData) {
        var itemGuid = worldItemData.itemGuid;
        var chunkAndTilePos = worlds[currentWorld].getChunkAndTilePosAtWorldPos(worldItemData.worldPositionX, worldItemData.worldPositionY);
        this.chunkX = chunkAndTilePos[0].x;
        this.chunkY = chunkAndTilePos[0].y;
        this.x = chunkAndTilePos[1].x;
        this.y = chunkAndTilePos[1].y;
        this.count = itemPaletteData[itemGuid].count;
        this.id = itemPaletteData[itemGuid].id;
    };
    return Item;
}());
//# sourceMappingURL=item.js.map