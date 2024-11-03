/*
ITEM
itemId: int16
itemCount: int16
slot: byte (because this is a byte max inventory size is 16x16 if you want to save properly)
*/

import { simpleView } from "../simpleView.js"

export class InventoryItem {

    id: number
    count: number
    slot: number

    constructor() {
        this.id = 0
        this.count = 0
        this.slot = 0
    }

    fromBuffer(itemBuffer: ArrayBuffer) {
        let view = new simpleView(itemBuffer)
        this.id = view.readInt16()
        this.count = view.readInt16()
        this.slot = view.readUint8()
    }

    writeToBuffer(writeBuffer: ArrayBuffer, byteOffset: number) {
        let view = new simpleView(writeBuffer)
        view.viewOffset = byteOffset

        view.writeInt16(this.id)
        view.writeInt16(this.count)
        view.writeUint8(this.slot)
    }

    getByteSize() {
        return 5
    }

    clone(): InventoryItem {
        let newItem = new InventoryItem()

        newItem.id = this.id
        newItem.count = this.count
        newItem.slot = this.slot

        return newItem
    }
}