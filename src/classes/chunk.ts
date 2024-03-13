var saveByteArray = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style","display: none;")
    return function (data: BlobPart[], name: string) {
        var blob = new Blob(data, {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

class Chunk {
    x: number
    y: number

    width: number
    height: number

    layers: number
    biomeID: number

    private tileDataList: Array<Tile> = []
    itemDataList: Array<Item> = []

    cacheImage: HTMLCanvasElement
    cacheTimeout: number
    chunkHasBeenEdited: boolean
    undoEdited: boolean

    constructor () {
        this.x = 0
        this.y = 0

        this.width = 10
        this.height = 10
        
        this.layers = 11 //amount of layers + 1
        this.biomeID = 3

        this.tileDataList = []
        this.itemDataList = []

        //not saved (only used by editor)
        this.cacheImage = null
        this.cacheTimeout = 0
        this.chunkHasBeenEdited = true
        this.undoEdited = false
    }

    resetCacheImage() {
        if (this.cacheImage) {
            this.cacheImage.remove()
            this.cacheImage = null
            this.cacheTimeout = Date.now() / 1000
        }
    }

    clearTiles() {
        this.tileDataList = []
        this.cacheImage = null
        this.chunkHasBeenEdited = true
        this.undoEdited = true
        this.resetCacheImage()
    }

    findTileIndexAt(x: number,y: number,z: number): null | number {
        for (let i = 0; i < this.tileDataList.length; i++) {
            let currentTile = this.tileDataList[i]
            if (currentTile.x == x && currentTile.y == y && currentTile.z == z) {
                return i
            }
        }

        return null
    }

    findTileAt(x: number,y: number,z: number): null | Tile {
        let index = this.findTileIndexAt(x,y,z)
        if (index !== null) {
            return this.tileDataList[index]
        }

        return null
    }

    removeTileAt(x: number,y: number,z: number) {
        let tileIndex = this.findTileIndexAt(x,y,z)
        
        if (tileIndex != null) {
            this.tileDataList.splice(tileIndex,1)
            this.chunkHasBeenEdited = true
            this.undoEdited = true
            this.resetCacheImage()
        }
    }

    getTilePosAtWorldPos(x: number, y: number) {
        let tileX = Math.floor(x / 16) % 10
        if (this.x < 0) {
            tileX = (9 + (Math.floor(x / 16) % 10 + 1)) % 10
        }
        let tileY = ((Math.floor(y / 16) * -1 -1) % 10)
        if (this.y < 0) {
            tileY = (9 + ((Math.floor(y / 16) * -1 -1) % 10 + 1)) % 10
        }
        
        return {"x":tileX, "y":tileY}
    }

    getExactTilePosAtWorldPos(x: number, y: number) {
        let tileX = (x / 16) % 10
        if (this.x < 0) {
            tileX = (9 + ((x / 16) % 10 + 1)) % 10
        }
        let tileY = (((y / 16) * -1 -1) % 10)
        if (this.y < 0) {
            tileY = (9 + (((y / 16) * -1 -1) % 10 + 1)) % 10
        }
        
        return {"x":tileX, "y":tileY}
    }

    getOffGridTilePosAtWorldPos(x: number, y: number) {
        let tileX = (x / 16) % 10
        if (this.x < 0) {
            tileX = (9 + ((x / 16) % 10 + 1)) % 10
        }
        let tileY = (((y / 16) * -1 -1) % 10)
        if (this.y < 0) {
            tileY = (9 + (((y / 16) * -1 -1) % 10 + 1)) % 10
        }
        
        return {"x":tileX, "y":tileY}
    }

    getTileAtWorldPos(x: number,y: number,z: number) {
        let tileWorldPos = this.getTilePosAtWorldPos(x,y)
        let tileX = tileWorldPos.x
        let tileY = tileWorldPos.y
        
        return this.findTileAt(tileX,tileY,z)
    }

    setTile(tile: Tile) {
        this.removeTileAt(tile.x,tile.y,tile.z)
        this.tileDataList.push(tile)
        if (tile.z + 1 > this.layers) {
            this.layers = tile.z + 1
        }

        this.chunkHasBeenEdited = true
        this.undoEdited = true
        this.resetCacheImage()
    }

    fromBuffer(chunkBuffer: ArrayBuffer) {
        //clear array/lists
        this.tileDataList = []
        this.itemDataList = []

        //regular values
        let view = new simpleView(chunkBuffer)
        this.x = view.readInt16()
        this.y = view.readInt16()
        this.width = view.readUint8()
        this.height = view.readUint8()
        this.layers = view.readUint8()
        this.biomeID = view.readUint8()

        //tile data list - order (height > width > layer)
        let tileDataListLength = view.readInt16()
        for (let i = 0; i < tileDataListLength; i++) {
            let begin = 10 + i * 10
            let end = begin + 10

            let tileData = new Tile()
            tileData.fromBuffer(chunkBuffer.slice(begin,end))
            
            this.tileDataList.push(tileData)
        }

        //item data list
        view.viewOffset += tileDataListLength * 10

        let itemDataListLength = view.readInt16()

        let itemDataListByteSize = 0

        for (let i = 0; i < itemDataListLength; i++) {
            let itemData = new Item()
            itemData.fromBuffer(chunkBuffer.slice(view.viewOffset + itemDataListByteSize,view.viewOffset + itemDataListByteSize + 24))

            this.itemDataList.push(itemData)

            itemDataListByteSize += itemData.getByteSize()
        }

        this.chunkHasBeenEdited = false
        this.undoEdited = true

        this.resetCacheImage()
    }

    writeToBuffer(writeBuffer: ArrayBuffer, byteOffset: number) {
        let view: simpleView = new simpleView(writeBuffer)
        view.viewOffset = byteOffset

        view.writeInt16(this.x)
        view.writeInt16(this.y)
        view.writeUint8(this.width)
        view.writeUint8(this.height)
        view.writeUint8(this.layers)
        view.writeUint8(this.biomeID)

        //tile data list
        view.writeInt16(this.tileDataList.length)

        let listOffset = view.viewOffset

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                for (let z = 0; z < this.layers; z++) {
                    let tileIndex = this.findTileIndexAt(x,y,z)
                    if (tileIndex !== null) {
                        let tileObject = this.tileDataList[tileIndex]
                        tileObject.writeToBuffer(writeBuffer, listOffset)
                        listOffset += tileObject.getByteSize()
                    }
                }
            }
        }

        //item data list
        view.viewOffset = listOffset
        view.writeInt16(this.itemDataList.length)

        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            item.writeToBuffer(writeBuffer, view.viewOffset, i)
            view.viewOffset += item.getByteSize()
        }
    }

    getByteSize() {
        return 12 + 10 * this.tileDataList.length + 24 * this.itemDataList.length
    }

    saveAsFile() {
        let buffer: ArrayBuffer = new ArrayBuffer(this.getByteSize())
        this.writeToBuffer(buffer,0)
        saveByteArray([buffer], this.x + "_" + this.y + ".dat")
    }

    fillWithIdsBetween(startId: number,endId: number) {
        this.clearTiles()

        let currentId = startId

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (assetInfoHelper.idExists(currentId)) {
                    let currentTile = new Tile()
                    currentTile.x = x
                    currentTile.y = y
                    currentTile.tileAssetId = currentId

                    this.tileDataList.push(currentTile)
                }

                currentId += 1

                if (currentId > endId) {
                    return
                }
            }
        } 

        this.chunkHasBeenEdited = true
        this.undoEdited = true
        this.resetCacheImage()
    }

    fillWithId(Id: number) {
        this.clearTiles()

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let currentTile: Tile = new Tile()
                currentTile.x = x
                currentTile.y = y
                currentTile.tileAssetId = Id

                this.tileDataList.push(currentTile)
            }
        } 

        this.chunkHasBeenEdited = true
        this.undoEdited = true
        this.resetCacheImage()
    }

    clone(): Chunk {
        let newChunk = new Chunk()

        newChunk.x = this.x
        newChunk.y = this.y

        newChunk.width = this.width
        newChunk.height = this.height

        newChunk.layers = this.layers
        newChunk.biomeID = this.biomeID

        for (let i = 0; i < this.tileDataList.length; i++) {
            newChunk.tileDataList.push(this.tileDataList[i].clone())
        }

        return newChunk
    }
}