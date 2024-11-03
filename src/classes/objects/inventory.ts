import { Editor } from "../../application-components/editor.js";
import { item_assetInfo } from "../../libraries/item-assetInfoToJson.js";
import { simpleView } from "../simpleView.js";
import { ToolHistory } from "../tools/tool-info.js";
import { InventoryItem } from "./inventoryItem.js";
import { World } from "./world.js";

/*
INVENTORY

width: byte
height: byte
target: byte (only supports 1) (idk what this is)

containsItems: int16 (bool)
totalSlots: int16 (used for itemList length)

itemDataList: ITEM
*/

/*
ITEM
itemId: int16
itemCount: int16
slot: byte (because this is a byte max inventory size is 16x16 if you want to save properly)
*/

let inventoryWidthElement: any = document.getElementById("inventory-width")
let inventoryHeightElement: any = document.getElementById("inventory-height")

function validateNumberInput(evt) {
    var regex = /[0-9]/;
    if(!regex.test(evt.key) ) {
        evt.preventDefault()
    }
}

function validateSizeNumberInput(evt) {
    /*var regex = /[0-9]/;
    
    if (evt.srcElement.value > 16) {
        evt.preventDefault()
        evt.srcElement.value = 16
    }

    if (evt.type !== "change") {
        if (Number(evt.srcElement.value + evt.key) > 16) {
            evt.preventDefault()
        }
    }

    if(!regex.test(evt.key) ) {
        evt.preventDefault()
    }

    let newWidth = Number(inventoryWidthElement.value)
    if (!isNaN(newWidth) && newWidth > 0 && newWidth < 17) {
        openedStorage.width = newWidth
    }

    let newHeight = Number(inventoryHeightElement.value)
    if (!isNaN(newHeight) && newHeight > 0 && newHeight < 17) {
        openedStorage.height = newHeight
    }

    openedStorage.visualize()*/
}

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

function preventDrop(evt) {
    evt.preventDefault()
}

export enum InventoryFormat {
    Container,
    Player,
}

interface ItemInfo {
    id?: number
    count?: number
    slot: number
}

export class Inventory {

    width: number
    height: number
    target: InventoryFormat

    actorId: number

    chunkX: number
    chunkY: number

    x: number
    y: number
    z: number

    containsItems: boolean
    totalSlots: number

    itemDataList: Array<InventoryItem>

    //editor only
    filePath: string

    constructor() {
        this.reset()
        window["preventDrop"] = preventDrop
        window["validateNumberInput"] = validateNumberInput
    }

    reset() {
        this.width = 5
        this.height = 5
        this.target = InventoryFormat.Player

        //InventoryFormat.Player
        this.actorId = 0

        //InventoryFormat.Container
        this.chunkX = 0
        this.chunkY = 0
        this.x = 0
        this.y = 0
        this.z = 0

        this.containsItems = false
        this.totalSlots = 0

        this.itemDataList = []

        //editor only
        this.filePath = ""
    }

    getEditor(): Editor {
        return window["application"].editor
    }

    getFileName(): string {
        return String(this.x + this.chunkX * 10 + 500) + String(this.y + this.chunkY * 10 + 500) + String(this.y + this.chunkY * 10) + String(this.x + this.chunkX * 10)
    }

    fromBuffer(inventoryBuffer: ArrayBuffer) {
        this.reset()

        //actual loading
        let view = new simpleView(inventoryBuffer)
        
        this.width = view.readUint8()
        this.height = view.readUint8()
        this.target = view.readUint8()

        /*if (this.target !== 1) {
            console.warn("Inventory is incompatible!")
            this.reset()
            return "This isn't a player inventory file!"
        }*/

        switch (this.target) {
            case InventoryFormat.Player:
                this.actorId = view.readInt16()
                break;
            case InventoryFormat.Container:
                this.chunkX = view.readInt16()
                this.chunkY = view.readInt16()
                this.x = view.readUint8()
                this.y = view.readUint8()
                this.z = view.readUint8()
                break;
        }

        //this is incorrect, it doesnt represent if an inventory contains items
        this.containsItems = true //view.readInt16()
        if (this.containsItems) {
            this.totalSlots = view.readInt16()

            for (let i = 0; i < this.totalSlots; i++) {
                let beginConstant = 7
                if (this.target == InventoryFormat.Container) {
                    beginConstant = 12
                }
                let begin = beginConstant + i * 5
                let end = begin + 5

                let itemData = new InventoryItem()
                itemData.fromBuffer(inventoryBuffer.slice(begin,end))

                if (!item_assetInfo[itemData.id]) {
                    item_assetInfo[itemData.id] = {"uniqueID": itemData.id, "typeNumber": 0, "name": "#" + itemData.id, "localizedName": "#" + itemData.id, "description": "Unknown item with id #" + itemData.id, "localizedDescription": "Unknown item with id #" + itemData.id, "category": "Unused", "maxStacks": 99, "isKey": false}
                }

                this.itemDataList.push(itemData)
            }
        }

        return true
    }

    writeToBuffer(writeBuffer: ArrayBuffer, byteOffset: number) {
        let view = new simpleView(writeBuffer)
        view.viewOffset = byteOffset

        view.writeUint8(this.width)
        view.writeUint8(this.height)
        view.writeUint8(this.target)

        switch (this.target) {
            case InventoryFormat.Player:
                view.writeInt16(this.actorId)
                break;
            case InventoryFormat.Container:
                view.writeInt16(this.chunkX)
                view.writeInt16(this.chunkY)

                view.writeUint8(this.x)
                view.writeUint8(this.y)
                view.writeUint8(this.z)
                break;
        }
        
        this.totalSlots = this.itemDataList.length
        view.writeInt16(this.totalSlots)
        for (let i = 0; i < this.totalSlots; i++) {
            let itemByteOffset = view.viewOffset + i * 5
            if (this.target == InventoryFormat.Container) {
                itemByteOffset = view.viewOffset + i * 5
            }
            this.itemDataList[i].writeToBuffer(writeBuffer, itemByteOffset)
        }
    }

    getByteSize() {
        this.totalSlots = this.itemDataList.length;

        if (this.target == InventoryFormat.Player) {
            return 7 + this.totalSlots * 5
        } else if (this.target == InventoryFormat.Container) {
            return 12 + this.totalSlots * 5
        }
    }

    saveAsFile() {
        this.validateItems()
        let inventoryBuffer = new ArrayBuffer(this.getByteSize())
        this.writeToBuffer(inventoryBuffer, 0)
        saveByteArray([inventoryBuffer], "inventory.dat")
    }

    checkContainsItems() {
        this.containsItems = this.itemDataList.length > 0
    }

    validateItems() {
        let toSplice = []
        for (let i = 0; i < this.itemDataList.length; i++) {
            if ((this.itemDataList[i].slot + 1) > (this.width * this.height)) {
                toSplice.push(i)
            }
        }

        for (let i = toSplice.length - 1; i > -1; i--) {
            this.itemDataList.splice(toSplice[i],1)
        }

        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }
    
    setIdAtSlot(slot: number, id: number) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            if (item.slot == slot) {
                item.id = id
                return
            }
        }
        
        let item = new InventoryItem()
        item.id = id
        item.slot = slot
        this.itemDataList.push(item)
        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }

    setCountAtSlot(slot: number, count: number) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            if (item.slot == slot) {
                item.count = count
                return
            }
        }

        let item = new InventoryItem()
        item.count = count
        item.slot = slot
        this.itemDataList.push(item)
        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }

    removeItemAtSlot(slot: number) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            if (item.slot == slot) {
                this.itemDataList.splice(i, 1)
            }
        }
        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }

    getItemAtSlot(slot: number) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            if (item.slot == slot) {
                return item
            }
        }
    }

    getSlotInfo(slot: number): ItemInfo {
        let item = this.getItemAtSlot(slot)

        if (item) {
            return {"id": item.id, "count": item.count, "slot": slot}
        } else {
            return {"slot": slot}
        }
    }

    setSlotInfo(info: any) {
        if (info.id) {
            this.setIdAtSlot(info.slot, info.id)
            this.setCountAtSlot(info.slot, info.count)
        } else {
            this.removeItemAtSlot(info.slot)
        }
    }

    addItem(item: InventoryItem) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item2 = this.itemDataList[i]
            if (item2.slot == item.slot) {
                this.itemDataList.splice(i, 1)
            }
        }
        this.itemDataList.push(item)
        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }

    clone(): Inventory {
        let newInventory = new Inventory()
        
        newInventory.width = this.width
        newInventory.height = this.height
        newInventory.target = this.target

        newInventory.actorId = this.actorId

        newInventory.chunkX = this.chunkX
        newInventory.chunkY = this.chunkY

        newInventory.x = this.x
        newInventory.y = this.y
        newInventory.z = this.z

        newInventory.containsItems = this.containsItems
        newInventory.totalSlots = this.totalSlots
        
        for (let item of this.itemDataList) {
            newInventory.itemDataList.push(item.clone())
        }

        newInventory.filePath = this.filePath

        return newInventory
    }

    visualize(images:{[key: string]: HTMLImageElement}, slotSize: number, world: World = null) {
        //find elements
        let rootElement = <HTMLHtmlElement>document.querySelector(":root")

        let inventoryElement = document.getElementById("inventory")
        inventoryElement.innerHTML = ""

        //set width and height element
        let invWidthElement = <HTMLInputElement>document.getElementById("inventory-width")
        let invHeightElement = <HTMLInputElement>document.getElementById("inventory-height")
        invWidthElement.value = String(this.width)
        invHeightElement.value = String(this.height)

        //set variables
        rootElement.style.setProperty("--inventory-width", String(this.width))

        //set correct columns
        let columnsString = ""
        for (let i = 0; i < this.width; i++) {
            if (i === 0) {
                columnsString += "auto"
            } else {
                columnsString += " auto"
            }
        }
        rootElement.style.setProperty("--inventory-columns", columnsString)
        
        //add slots
        for (let i = 0; i < this.width * this.height; i++) {
            let slot = document.createElement("div")
            slot.setAttribute("id", "slot" + i)
            slot.setAttribute("slot", String(i))
            slot.classList.add("slot")

            let inventory = this

            //slot dropped event listener
            slot.ondrop = function(evt) {
                let originalId = Number(evt.dataTransfer.getData("uniqueID"))
                let originalSlot: any = evt.dataTransfer.getData("originalSlot")
                let originalCount = Number(evt.dataTransfer.getData("originalCount"))

                let currentSlot = Number(slot.getAttribute("slot"))
                let currentSlotInfo = inventory.getSlotInfo(currentSlot)

                if (originalSlot != "") { //if dragging one item in inventory to another place
                    let currentItem = inventory.getItemAtSlot(currentSlot)

                    originalSlot = Number(originalSlot)

                    let originalSlotInfo = inventory.getSlotInfo(originalSlot)

                    if (currentItem) {
                        let currentId = currentItem.id
                        let currentCount = currentItem.count

                        inventory.setIdAtSlot(currentSlot, originalId)
                        inventory.setCountAtSlot(currentSlot, originalCount)

                        inventory.setIdAtSlot(originalSlot, currentId)
                        inventory.setCountAtSlot(originalSlot, currentCount)

                        if (world) {
                            world.addHistory(new ToolHistory(
                                () => {
                                    inventory.setSlotInfo(currentSlotInfo)
                                    inventory.setSlotInfo(originalSlotInfo)

                                    inventory.visualize(images, slotSize, world)
                                    inventory.getEditor().positionInventory()
                                },
                                () => {
                                    inventory.setIdAtSlot(currentSlot, originalId)
                                    inventory.setCountAtSlot(currentSlot, originalCount)

                                    inventory.setIdAtSlot(originalSlot, currentId)
                                    inventory.setCountAtSlot(originalSlot, currentCount)

                                    inventory.visualize(images, slotSize, world)
                                    inventory.getEditor().positionInventory()
                                }
                            ))
                        }
                    } else {
                        inventory.removeItemAtSlot(originalSlot)
                        inventory.setIdAtSlot(currentSlot, originalId)
                        inventory.setCountAtSlot(currentSlot, originalCount)

                        if (world) {
                            world.addHistory(new ToolHistory(
                                () => {
                                    inventory.setSlotInfo(currentSlotInfo)
                                    inventory.setSlotInfo(originalSlotInfo)

                                    inventory.visualize(images, slotSize, world)
                                    inventory.getEditor().positionInventory()
                                },
                                () => {
                                    inventory.removeItemAtSlot(originalSlot)
                                    inventory.setIdAtSlot(currentSlot, originalId)
                                    inventory.setCountAtSlot(currentSlot, originalCount)

                                    inventory.visualize(images, slotSize, world)
                                    inventory.getEditor().positionInventory()
                                }
                            ))
                        }
                    }
                } else { //if youre dragging from item list
                    inventory.setCountAtSlot(currentSlot, 1)
                    inventory.setIdAtSlot(currentSlot, originalId)

                    if (world) {
                        world.addHistory(new ToolHistory(
                            () => {
                                inventory.setSlotInfo(currentSlotInfo)

                                inventory.visualize(images, slotSize, world)
                                inventory.getEditor().positionInventory()
                            },
                            () => {
                                inventory.setCountAtSlot(currentSlot, 1)
                                inventory.setIdAtSlot(currentSlot, originalId)

                                inventory.visualize(images, slotSize, world)
                                inventory.getEditor().positionInventory()
                            }
                        ))
                    }
                }
                inventory.visualize(images, slotSize, world)
            }
            slot.ondragover = function(evt) {
                evt.preventDefault()
            }
            slot.innerHTML = `<input class="item-amount" type="number" placeholder="0" onkeypress='validateNumberInput(event)' ondrop="preventDrop(event)" hidden>`

            inventoryElement.appendChild(slot)
        }

        //add items
        for (let i = 0; i < this.totalSlots; i++) {
            let item = this.itemDataList[i]
            let itemInfo = item_assetInfo[item.id]

            if (itemInfo) {
                let slotElement = document.getElementById("slot" + item.slot)
                if (slotElement) {
                    slotElement.classList.add("contains-item")
                    slotElement.draggable = true
                    slotElement.setAttribute("uniqueID", itemInfo.uniqueID)
                    slotElement.ondragstart = function(evt) {
                        evt.dataTransfer.setData("uniqueID", itemInfo.uniqueID)
                        evt.dataTransfer.setData("originalSlot", String(item.slot))
                        evt.dataTransfer.setData("originalCount", String(item.count))
                    }
                    
                    let itemAmountElement = <HTMLInputElement>slotElement.querySelector(".item-amount")
                    itemAmountElement.hidden = false
                    itemAmountElement.value = String(item.count)

                    //item amount change event listener
                    let inventory = this

                    let originalCount = item.count

                    itemAmountElement.addEventListener("change", function(e) {
                        inventory.setCountAtSlot(item.slot, Number(itemAmountElement.value))
                        if (world) {
                            world.addHistory(new ToolHistory(
                                () => {
                                    inventory.setCountAtSlot(item.slot, originalCount)
                                    inventory.visualize(images, slotSize, world)
                                    inventory.getEditor().positionInventory()
                                },
                                () => {
                                    inventory.setCountAtSlot(item.slot, Number(itemAmountElement.value))
                                    inventory.visualize(images, slotSize, world)
                                    inventory.getEditor().positionInventory()
                                }
                            ))
                        }
                    })
                    itemAmountElement.addEventListener("keyup", function(e) {
                        inventory.setCountAtSlot(item.slot, Number(itemAmountElement.value))
                        if (world) {
                            world.addHistory(new ToolHistory(
                                () => {
                                    inventory.setCountAtSlot(item.slot, originalCount)
                                    inventory.visualize(images, slotSize, world)
                                    inventory.getEditor().positionInventory()
                                },
                                () => {
                                    inventory.setCountAtSlot(item.slot, Number(itemAmountElement.value))
                                    inventory.visualize(images, slotSize, world)
                                    inventory.getEditor().positionInventory()
                                }
                            ))
                        }
                    })

                    //add image
                    let itemImage = document.createElement("img")
                    itemImage.classList.add("inventory-item-image")
                    itemImage.src = "assets/transparent.png"
                    itemImage.draggable = false
                    
                    //title for when hovering over image
                    let itemTitle = (itemInfo.name || itemInfo.localizedName) + "#" + itemInfo.uniqueID
                    if (itemInfo.category != "") {
                        itemTitle = itemTitle + " (" + itemInfo.category + ")"
                    }
                    itemImage.alt = itemTitle
                    itemImage.title = itemTitle
                    
                    if (itemInfo.tileset != "" && itemInfo.tileset != undefined) {
                        let image = images[`assets/Tilesets/${itemInfo.tileset}.png`]

                        //calculate spritesheet size and position
                        let backgroundSizeX = (image.naturalWidth / itemInfo.rectW) * slotSize
                        let backgroundSizeY = (image.naturalHeight / itemInfo.rectH) * slotSize

                        let backgroundPosX = (backgroundSizeX / image.naturalWidth) * itemInfo.rectX
                        let backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - itemInfo.rectY - itemInfo.rectH)

                        itemImage.setAttribute("style", `background-image: url(assets/Tilesets/${itemInfo.tileset}.png); background-position: -${String(backgroundPosX)}px -${String(backgroundPosY)}px; background-size: ${String(backgroundSizeX)}px ${String(backgroundSizeY)}px;`) 
                    } else { //set it to unknown image
                        itemImage.src = "assets/unknown.png"
                    }

                    slotElement.appendChild(itemImage)
                }
            } else {
                alert("Item with id " + item.id + " is missing from the database and will be deleted")
            }
        }

        //update inventory list position
        document.getElementById("small-item-list-container").style.display = ""
        document.getElementById("small-item-list-container").style.left = (document.getElementById("inventory-container").style.left + document.getElementById("inventory-container").clientWidth) + "px"
    }
}