"use-strict";

class Tile {
    constructor() {
        this.x = 0
        this.y = 0
        this.z = 0

        this.health = 10
        this.tileAssetid = 0
        this.rotation = 0

        this.memoryA = 0
        this.memoryB = 0
    }

    getName() {
        if (assetInfoLoaded) {
            if (assetInfo[this.tileAssetid]) {
                assetInfo[this.tileAssetid].name
            }
        }
        return this.tileAssetid.toString()
    }

    fromBuffer(tileBuffer) {
        let view = new simpleView(tileBuffer)
        this.x = view.readUint8() //left to right
        this.y = view.readUint8() //down to up
        this.z = view.readUint8() //bottom to top

        this.health = view.readInt16()
        this.tileAssetid = view.readInt16()
        this.rotation = view.readUint8()
        
        this.memoryA = view.readUint8()
        this.memoryB = view.readUint8()

        if (!assetInfoHelper.idExists(this.tileAssetid)) {
            console.warn("Tile with id " + this.tileAssetid + " was loaded in but isn't in assetInfo!")
        }
    }

    writeToBuffer(writeBuffer, byteOffset) {
        let view = new simpleView(writeBuffer)
        view.viewOffset = byteOffset
        
        view.writeUint8(this.x)
        view.writeUint8(this.y)
        view.writeUint8(this.z)

        view.writeInt16(this.health)
        view.writeInt16(this.tileAssetid)
        view.writeUint8(this.rotation)

        view.writeUint8(this.memoryA)
        view.writeUint8(this.memoryB)
    }

    getByteSize() {
        return 10
    }
}