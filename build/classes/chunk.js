var saveByteArray = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style", "display: none;");
    return function (data, name) {
        var blob = new Blob(data, { type: "octet/stream" }), url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
var Chunk = /** @class */ (function () {
    function Chunk() {
        this.tileDataList = [];
        this.itemDataList = [];
        this.x = 0;
        this.y = 0;
        this.width = 10;
        this.height = 10;
        this.layers = 11; //amount of layers + 1
        this.biomeID = 3;
        this.revealed = false;
        this.tileDataList = [];
        this.itemDataList = [];
        //not saved (only used by editor)
        this.cacheImage = null;
        this.cacheTimeout = 0;
        this.chunkHasBeenEdited = true;
        this.undoEdited = false;
    }
    Chunk.prototype.resetCacheImage = function () {
        if (this.cacheImage) {
            this.cacheImage.remove();
            this.cacheImage = null;
            this.cacheTimeout = Date.now() / 1000;
        }
    };
    Chunk.prototype.clearTiles = function () {
        this.tileDataList = [];
        this.cacheImage = null;
        this.chunkHasBeenEdited = true;
        this.undoEdited = true;
        this.resetCacheImage();
    };
    Chunk.prototype.findTileIndexAt = function (x, y, z) {
        for (var i = 0; i < this.tileDataList.length; i++) {
            var currentTile = this.tileDataList[i];
            if (currentTile.x == x && currentTile.y == y && currentTile.z == z) {
                return i;
            }
        }
        return null;
    };
    Chunk.prototype.findTileAt = function (x, y, z) {
        var index = this.findTileIndexAt(x, y, z);
        if (index !== null) {
            return this.tileDataList[index];
        }
        return null;
    };
    Chunk.prototype.removeTileAt = function (x, y, z) {
        var tileIndex = this.findTileIndexAt(x, y, z);
        if (tileIndex != null) {
            this.tileDataList.splice(tileIndex, 1);
            this.chunkHasBeenEdited = true;
            this.undoEdited = true;
            this.resetCacheImage();
        }
    };
    Chunk.prototype.getTilePosAtWorldPos = function (x, y) {
        var tileX = Math.floor(x / 16) % 10;
        if (this.x < 0) {
            tileX = (9 + (Math.floor(x / 16) % 10 + 1)) % 10;
        }
        var tileY = ((Math.floor(y / 16) * -1 - 1) % 10);
        if (this.y < 0) {
            tileY = (9 + ((Math.floor(y / 16) * -1 - 1) % 10 + 1)) % 10;
        }
        return { "x": tileX, "y": tileY };
    };
    Chunk.prototype.getExactTilePosAtWorldPos = function (x, y) {
        var tileX = (x / 16) % 10;
        if (this.x < 0) {
            tileX = (9 + ((x / 16) % 10 + 1)) % 10;
        }
        var tileY = (((y / 16) * -1 - 1) % 10);
        if (this.y < 0) {
            tileY = (9 + (((y / 16) * -1 - 1) % 10 + 1)) % 10;
        }
        return { "x": tileX, "y": tileY };
    };
    Chunk.prototype.getOffGridTilePosAtWorldPos = function (x, y) {
        var tileX = (x / 16) % 10;
        if (this.x < 0) {
            tileX = (9 + ((x / 16) % 10 + 1)) % 10;
        }
        var tileY = (((y / 16) * -1 - 1) % 10);
        if (this.y < 0) {
            tileY = (9 + (((y / 16) * -1 - 1) % 10 + 1)) % 10;
        }
        return { "x": tileX, "y": tileY };
    };
    Chunk.prototype.getTileAtWorldPos = function (x, y, z) {
        var tileWorldPos = this.getTilePosAtWorldPos(x, y);
        var tileX = tileWorldPos.x;
        var tileY = tileWorldPos.y;
        return this.findTileAt(tileX, tileY, z);
    };
    Chunk.prototype.setTile = function (tile) {
        this.removeTileAt(tile.x, tile.y, tile.z);
        this.tileDataList.push(tile);
        if (tile.z + 1 > this.layers) {
            this.layers = tile.z + 1;
        }
        this.chunkHasBeenEdited = true;
        this.undoEdited = true;
        this.resetCacheImage();
    };
    Chunk.prototype.getTiles = function () {
        return this.tileDataList;
    };
    Chunk.prototype.fromBuffer = function (chunkBuffer) {
        //clear array/lists
        this.tileDataList = [];
        this.itemDataList = [];
        //regular values
        var view = new simpleView(chunkBuffer);
        this.x = view.readInt16();
        this.y = view.readInt16();
        this.width = view.readUint8();
        this.height = view.readUint8();
        this.layers = view.readUint8();
        this.biomeID = view.readUint8();
        //tile data list - order (height > width > layer)
        var tileDataListLength = view.readInt16();
        for (var i = 0; i < tileDataListLength; i++) {
            var begin = 10 + i * 10;
            var end = begin + 10;
            var tileData = new Tile();
            tileData.fromBuffer(chunkBuffer.slice(begin, end));
            this.tileDataList.push(tileData);
        }
        //item data list
        view.viewOffset += tileDataListLength * 10;
        var itemDataListLength = view.readInt16();
        var itemDataListByteSize = 0;
        for (var i = 0; i < itemDataListLength; i++) {
            var itemData = new Item();
            itemData.fromBuffer(chunkBuffer.slice(view.viewOffset + itemDataListByteSize, view.viewOffset + itemDataListByteSize + 24));
            this.itemDataList.push(itemData);
            itemDataListByteSize += itemData.getByteSize();
        }
        this.chunkHasBeenEdited = false;
        this.undoEdited = true;
        this.resetCacheImage();
    };
    Chunk.prototype.writeToBuffer = function (writeBuffer, byteOffset) {
        var view = new simpleView(writeBuffer);
        view.viewOffset = byteOffset;
        view.writeInt16(this.x);
        view.writeInt16(this.y);
        view.writeUint8(this.width);
        view.writeUint8(this.height);
        view.writeUint8(this.layers);
        view.writeUint8(this.biomeID);
        //tile data list
        view.writeInt16(this.tileDataList.length);
        var listOffset = view.viewOffset;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                for (var z = 0; z < this.layers; z++) {
                    var tileIndex = this.findTileIndexAt(x, y, z);
                    if (tileIndex !== null) {
                        var tileObject = this.tileDataList[tileIndex];
                        tileObject.writeToBuffer(writeBuffer, listOffset);
                        listOffset += tileObject.getByteSize();
                    }
                }
            }
        }
        //item data list
        view.viewOffset = listOffset;
        view.writeInt16(this.itemDataList.length);
        for (var i = 0; i < this.itemDataList.length; i++) {
            var item = this.itemDataList[i];
            item.writeToBuffer(writeBuffer, view.viewOffset, i);
            view.viewOffset += item.getByteSize();
        }
    };
    Chunk.prototype.getByteSize = function () {
        return 12 + 10 * this.tileDataList.length + 24 * this.itemDataList.length;
    };
    Chunk.prototype.saveAsFile = function () {
        var buffer = new ArrayBuffer(this.getByteSize());
        this.writeToBuffer(buffer, 0);
        saveByteArray([buffer], this.x + "_" + this.y + ".dat");
    };
    Chunk.prototype.fillWithIdsBetween = function (startId, endId) {
        this.clearTiles();
        var currentId = startId;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                if (assetInfoHelper.idExists(currentId)) {
                    var currentTile = new Tile();
                    currentTile.x = x;
                    currentTile.y = y;
                    currentTile.tileAssetId = currentId;
                    this.tileDataList.push(currentTile);
                }
                currentId += 1;
                if (currentId > endId) {
                    return;
                }
            }
        }
        this.chunkHasBeenEdited = true;
        this.undoEdited = true;
        this.resetCacheImage();
    };
    Chunk.prototype.fillWithId = function (Id) {
        this.clearTiles();
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var currentTile = new Tile();
                currentTile.x = x;
                currentTile.y = y;
                currentTile.tileAssetId = Id;
                this.tileDataList.push(currentTile);
            }
        }
        this.chunkHasBeenEdited = true;
        this.undoEdited = true;
        this.resetCacheImage();
    };
    Chunk.prototype.clone = function () {
        var newChunk = new Chunk();
        newChunk.x = this.x;
        newChunk.y = this.y;
        newChunk.width = this.width;
        newChunk.height = this.height;
        newChunk.layers = this.layers;
        newChunk.biomeID = this.biomeID;
        for (var i = 0; i < this.tileDataList.length; i++) {
            newChunk.tileDataList.push(this.tileDataList[i].clone());
        }
        return newChunk;
    };
    return Chunk;
}());
//# sourceMappingURL=chunk.js.map