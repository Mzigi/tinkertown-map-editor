import { item_assetInfo } from "../../libraries/item-assetInfoToJson.js";
import { simpleView } from "../simpleView.js";
import { InventoryItem } from "./inventoryItem.js";
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
var inventoryWidthElement = document.getElementById("inventory-width");
var inventoryHeightElement = document.getElementById("inventory-height");
function validateNumberInput(evt) {
    var regex = /[0-9]/;
    if (!regex.test(evt.key)) {
        evt.preventDefault();
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
    a.setAttribute("style", "display: none;");
    return function (data, name) {
        var blob = new Blob(data, { type: "octet/stream" }), url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
function preventDrop(evt) {
    evt.preventDefault();
}
export var InventoryFormat;
(function (InventoryFormat) {
    InventoryFormat[InventoryFormat["Container"] = 0] = "Container";
    InventoryFormat[InventoryFormat["Player"] = 1] = "Player";
})(InventoryFormat || (InventoryFormat = {}));
var Inventory = /** @class */ (function () {
    function Inventory() {
        this.reset();
        window["preventDrop"] = preventDrop;
    }
    Inventory.prototype.reset = function () {
        this.width = 5;
        this.height = 5;
        this.target = InventoryFormat.Player;
        //InventoryFormat.Player
        this.actorId = 0;
        //InventoryFormat.Container
        this.chunkX = 0;
        this.chunkY = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.containsItems = false;
        this.totalSlots = 0;
        this.itemDataList = [];
        //editor only
        this.filePath = "";
    };
    Inventory.prototype.getFileName = function () {
        return String(this.x + this.chunkX * 10 + 500) + String(this.y + this.chunkY * 10 + 500) + String(this.y + this.chunkY * 10) + String(this.x + this.chunkX * 10);
    };
    Inventory.prototype.fromBuffer = function (inventoryBuffer) {
        this.reset();
        //actual loading
        var view = new simpleView(inventoryBuffer);
        this.width = view.readUint8();
        this.height = view.readUint8();
        this.target = view.readUint8();
        /*if (this.target !== 1) {
            console.warn("Inventory is incompatible!")
            this.reset()
            return "This isn't a player inventory file!"
        }*/
        switch (this.target) {
            case InventoryFormat.Player:
                this.actorId = view.readInt16();
                break;
            case InventoryFormat.Container:
                this.chunkX = view.readInt16();
                this.chunkY = view.readInt16();
                this.x = view.readUint8();
                this.y = view.readUint8();
                this.z = view.readUint8();
                break;
        }
        //this is incorrect, it doesnt represent if an inventory contains items
        this.containsItems = true; //view.readInt16()
        if (this.containsItems) {
            this.totalSlots = view.readInt16();
            for (var i = 0; i < this.totalSlots; i++) {
                var beginConstant = 7;
                if (this.target == InventoryFormat.Container) {
                    beginConstant = 12;
                }
                var begin = beginConstant + i * 5;
                var end = begin + 5;
                var itemData = new InventoryItem();
                itemData.fromBuffer(inventoryBuffer.slice(begin, end));
                if (!item_assetInfo[itemData.id]) {
                    item_assetInfo[itemData.id] = { "uniqueID": itemData.id, "typeNumber": 0, "name": "#" + itemData.id, "localizedName": "#" + itemData.id, "description": "Unknown item with id #" + itemData.id, "localizedDescription": "Unknown item with id #" + itemData.id, "category": "Unused", "maxStacks": 99, "isKey": false };
                }
                this.itemDataList.push(itemData);
            }
        }
        return true;
    };
    Inventory.prototype.writeToBuffer = function (writeBuffer, byteOffset) {
        var view = new simpleView(writeBuffer);
        view.viewOffset = byteOffset;
        view.writeUint8(this.width);
        view.writeUint8(this.height);
        view.writeUint8(this.target);
        switch (this.target) {
            case InventoryFormat.Player:
                view.writeInt16(this.actorId);
                break;
            case InventoryFormat.Container:
                view.writeInt16(this.chunkX);
                view.writeInt16(this.chunkY);
                view.writeUint8(this.x);
                view.writeUint8(this.y);
                view.writeUint8(this.z);
                break;
        }
        this.totalSlots = this.itemDataList.length;
        view.writeInt16(this.totalSlots);
        for (var i = 0; i < this.totalSlots; i++) {
            var itemByteOffset = view.viewOffset + i * 5;
            if (this.target == InventoryFormat.Container) {
                itemByteOffset = view.viewOffset + i * 5;
            }
            this.itemDataList[i].writeToBuffer(writeBuffer, itemByteOffset);
        }
    };
    Inventory.prototype.getByteSize = function () {
        this.totalSlots = this.itemDataList.length;
        if (this.target == InventoryFormat.Player) {
            return 7 + this.totalSlots * 5;
        }
        else if (this.target == InventoryFormat.Container) {
            return 12 + this.totalSlots * 5;
        }
    };
    Inventory.prototype.saveAsFile = function () {
        this.validateItems();
        var inventoryBuffer = new ArrayBuffer(this.getByteSize());
        this.writeToBuffer(inventoryBuffer, 0);
        saveByteArray([inventoryBuffer], "inventory.dat");
    };
    Inventory.prototype.checkContainsItems = function () {
        if (this.itemDataList.length > 0) {
            this.containsItems = true;
        }
        else {
            this.containsItems = false;
        }
    };
    Inventory.prototype.validateItems = function () {
        var toSplice = [];
        for (var i = 0; i < this.itemDataList.length; i++) {
            if ((this.itemDataList[i].slot + 1) > (this.width * this.height)) {
                toSplice.push(i);
            }
        }
        for (var i = toSplice.length - 1; i > -1; i--) {
            this.itemDataList.splice(toSplice[i], 1);
        }
        this.totalSlots = this.itemDataList.length;
        this.checkContainsItems();
    };
    Inventory.prototype.setIdAtSlot = function (slot, id) {
        for (var i = 0; i < this.itemDataList.length; i++) {
            var item_1 = this.itemDataList[i];
            if (item_1.slot == slot) {
                item_1.id = id;
                return;
            }
        }
        var item = new InventoryItem();
        item.id = id;
        item.slot = slot;
        this.itemDataList.push(item);
        this.totalSlots = this.itemDataList.length;
        this.checkContainsItems();
    };
    Inventory.prototype.setCountAtSlot = function (slot, count) {
        for (var i = 0; i < this.itemDataList.length; i++) {
            var item_2 = this.itemDataList[i];
            if (item_2.slot == slot) {
                item_2.count = count;
                return;
            }
        }
        var item = new InventoryItem();
        item.count = count;
        item.slot = slot;
        this.itemDataList.push(item);
        this.totalSlots = this.itemDataList.length;
        this.checkContainsItems();
    };
    Inventory.prototype.removeItemAtSlot = function (slot) {
        for (var i = 0; i < this.itemDataList.length; i++) {
            var item = this.itemDataList[i];
            if (item.slot == slot) {
                this.itemDataList.splice(i, 1);
            }
        }
        this.totalSlots = this.itemDataList.length;
        this.checkContainsItems();
    };
    Inventory.prototype.getItemAtSlot = function (slot) {
        for (var i = 0; i < this.itemDataList.length; i++) {
            var item = this.itemDataList[i];
            if (item.slot == slot) {
                return item;
            }
        }
    };
    Inventory.prototype.addItem = function (item) {
        for (var i = 0; i < this.itemDataList.length; i++) {
            var item2 = this.itemDataList[i];
            if (item2.slot == item.slot) {
                this.itemDataList.splice(i, 1);
            }
        }
        this.itemDataList.push(item);
        this.totalSlots = this.itemDataList.length;
        this.checkContainsItems();
    };
    Inventory.prototype.clone = function () {
        var newInventory = new Inventory();
        newInventory.width = this.width;
        newInventory.height = this.height;
        newInventory.target = this.target;
        newInventory.actorId = this.actorId;
        newInventory.chunkX = this.chunkX;
        newInventory.chunkY = this.chunkY;
        newInventory.x = this.x;
        newInventory.y = this.y;
        newInventory.z = this.z;
        newInventory.containsItems = this.containsItems;
        newInventory.totalSlots = this.totalSlots;
        for (var _i = 0, _a = this.itemDataList; _i < _a.length; _i++) {
            var item = _a[_i];
            newInventory.itemDataList.push(item.clone());
        }
        newInventory.filePath = this.filePath;
        return newInventory;
    };
    Inventory.prototype.visualize = function (images, slotSize) {
        //find elements
        var rootElement = document.querySelector(":root");
        var inventoryElement = document.getElementById("inventory");
        inventoryElement.innerHTML = "";
        //set width and height element
        var invWidthElement = document.getElementById("inventory-width");
        var invHeightElement = document.getElementById("inventory-height");
        invWidthElement.value = String(this.width);
        invHeightElement.value = String(this.height);
        //set variables
        rootElement.style.setProperty("--inventory-width", String(this.width));
        //set correct columns
        var columnsString = "";
        for (var i = 0; i < this.width; i++) {
            if (i === 0) {
                columnsString += "auto";
            }
            else {
                columnsString += " auto";
            }
        }
        rootElement.style.setProperty("--inventory-columns", columnsString);
        var _loop_1 = function (i) {
            var slot = document.createElement("div");
            slot.setAttribute("id", "slot" + i);
            slot.setAttribute("slot", String(i));
            slot.classList.add("slot");
            var inventory = this_1;
            //slot dropped event listener
            slot.ondrop = function (evt) {
                var originalId = Number(evt.dataTransfer.getData("uniqueID"));
                var originalSlot = evt.dataTransfer.getData("originalSlot");
                var originalCount = Number(evt.dataTransfer.getData("originalCount"));
                var currentSlot = Number(slot.getAttribute("slot"));
                if (originalSlot != "") { //if dragging one item in inventory to another place
                    var currentItem = inventory.getItemAtSlot(currentSlot);
                    originalSlot = Number(originalSlot);
                    if (currentItem) {
                        var currentId = currentItem.id;
                        var currentCount = currentItem.count;
                        inventory.setIdAtSlot(currentSlot, originalId);
                        inventory.setCountAtSlot(currentSlot, originalCount);
                        inventory.setIdAtSlot(originalSlot, currentId);
                        inventory.setCountAtSlot(originalSlot, currentCount);
                    }
                    else {
                        inventory.removeItemAtSlot(originalSlot);
                        inventory.setIdAtSlot(currentSlot, originalId);
                        inventory.setCountAtSlot(currentSlot, originalCount);
                    }
                }
                else { //if youre dragging from item list
                    inventory.setCountAtSlot(currentSlot, 1);
                    inventory.setIdAtSlot(currentSlot, originalId);
                }
                inventory.visualize(images, slotSize);
            };
            slot.ondragover = function (evt) {
                evt.preventDefault();
            };
            slot.innerHTML = "<input class=\"item-amount\" type=\"number\" placeholder=\"0\" onkeypress='validateNumberInput(event)' ondrop=\"preventDrop(event)\" hidden>";
            inventoryElement.appendChild(slot);
        };
        var this_1 = this;
        //add slots
        for (var i = 0; i < this.width * this.height; i++) {
            _loop_1(i);
        }
        var _loop_2 = function (i) {
            var item = this_2.itemDataList[i];
            var itemInfo = item_assetInfo[item.id];
            if (itemInfo) {
                var slotElement = document.getElementById("slot" + item.slot);
                if (slotElement) {
                    slotElement.classList.add("contains-item");
                    slotElement.draggable = true;
                    slotElement.setAttribute("uniqueID", itemInfo.uniqueID);
                    slotElement.ondragstart = function (evt) {
                        evt.dataTransfer.setData("uniqueID", itemInfo.uniqueID);
                        evt.dataTransfer.setData("originalSlot", String(item.slot));
                        evt.dataTransfer.setData("originalCount", String(item.count));
                    };
                    var itemAmountElement_1 = slotElement.querySelector(".item-amount");
                    itemAmountElement_1.hidden = false;
                    itemAmountElement_1.value = String(item.count);
                    //item amount change event listener
                    var inventory_1 = this_2;
                    itemAmountElement_1.addEventListener("change", function (e) {
                        inventory_1.setCountAtSlot(item.slot, Number(itemAmountElement_1.value));
                    });
                    itemAmountElement_1.addEventListener("keyup", function (e) {
                        inventory_1.setCountAtSlot(item.slot, Number(itemAmountElement_1.value));
                    });
                    //add image
                    var itemImage = document.createElement("img");
                    itemImage.classList.add("inventory-item-image");
                    itemImage.src = "assets/transparent.png";
                    itemImage.draggable = false;
                    //title for when hovering over image
                    var itemTitle = (itemInfo.name || itemInfo.localizedName) + "#" + itemInfo.uniqueID;
                    if (itemInfo.category != "") {
                        itemTitle = itemTitle + " (" + itemInfo.category + ")";
                    }
                    itemImage.alt = itemTitle;
                    itemImage.title = itemTitle;
                    if (itemInfo.tileset != "" && itemInfo.tileset != undefined) {
                        var image = images["assets/Tilesets/".concat(itemInfo.tileset, ".png")];
                        //calculate spritesheet size and position
                        var backgroundSizeX = (image.naturalWidth / itemInfo.rectW) * slotSize;
                        var backgroundSizeY = (image.naturalHeight / itemInfo.rectH) * slotSize;
                        var backgroundPosX = (backgroundSizeX / image.naturalWidth) * itemInfo.rectX;
                        var backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - itemInfo.rectY - itemInfo.rectH);
                        itemImage.setAttribute("style", "background-image: url(assets/Tilesets/".concat(itemInfo.tileset, ".png); background-position: -").concat(String(backgroundPosX), "px -").concat(String(backgroundPosY), "px; background-size: ").concat(String(backgroundSizeX), "px ").concat(String(backgroundSizeY), "px;"));
                    }
                    else { //set it to unknown image
                        itemImage.src = "assets/unknown.png";
                    }
                    slotElement.appendChild(itemImage);
                }
            }
            else {
                alert("Item with id " + item.id + " is missing from the database and will be deleted");
            }
        };
        var this_2 = this;
        //add items
        for (var i = 0; i < this.totalSlots; i++) {
            _loop_2(i);
        }
        //update inventory list position
        document.getElementById("small-item-list-container").style.display = "";
        document.getElementById("small-item-list-container").style.left = (document.getElementById("inventory-container").style.left + document.getElementById("inventory-container").clientWidth) + "px";
    };
    return Inventory;
}());
export { Inventory };
//# sourceMappingURL=inventory.js.map