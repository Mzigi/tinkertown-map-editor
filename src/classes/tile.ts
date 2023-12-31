"use-strict";
// @ts-check

class Tile {
    x: number
    y: number
    z: number

    health: number
    tileAssetId: number
    rotation: number

    memoryA: number
    memoryB: number

    constructor() {
        this.x = 0
        this.y = 0
        this.z = 0

        this.health = 10
        this.tileAssetId = 0
        this.rotation = 0

        this.memoryA = 0
        this.memoryB = 0
    }

    getName(): string | null {
        if (assetInfoLoaded) {
            if (assetInfo[this.tileAssetId]) {
                return assetInfo[this.tileAssetId].name
            }
        }

        return null
    }

    fromBuffer(tileBuffer: ArrayBuffer) {
        let view: simpleView = new simpleView(tileBuffer)
        this.x = view.readUint8() //left to right
        this.y = view.readUint8() //down to up
        this.z = view.readUint8() //bottom to top

        this.health = view.readInt16()
        this.tileAssetId = view.readInt16()
        this.rotation = view.readUint8()
        
        this.memoryA = view.readUint8()
        this.memoryB = view.readUint8()

        if (!assetInfoHelper.idExists(this.tileAssetId)) {
            console.warn("Tile with id " + this.tileAssetId + " was loaded in but isn't in assetInfo!")
        }
    }

    writeToBuffer(writeBuffer: ArrayBuffer, byteOffset: number) {
        let view: simpleView = new simpleView(writeBuffer)
        view.viewOffset = byteOffset
        
        view.writeUint8(this.x)
        view.writeUint8(this.y)
        view.writeUint8(this.z)

        view.writeInt16(this.health)
        view.writeInt16(this.tileAssetId)
        view.writeUint8(this.rotation)

        view.writeUint8(this.memoryA)
        view.writeUint8(this.memoryB)
    }

    getByteSize() {
        return 10
    }
}