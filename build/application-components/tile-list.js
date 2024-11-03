import { ToolHistory } from "../classes/tools/tool-info.js";
import { assetInfoHelper } from "../libraries/assetInfoHelper.js";
import { item_assetInfoHelper } from "../libraries/item-assetInfoHelper.js";
var TileList = /** @class */ (function () {
    function TileList(imageHolder, editor) {
        var _this = this;
        this.alertElement = document.getElementById("alert");
        this.itemListCategory = document.getElementById("item-list-category");
        this.itemListResultCount = document.getElementById("item-list-result-count");
        this.itemList = document.getElementById("item-list");
        this.smallItemList = document.getElementById("small-item-list");
        this.editor = editor;
        this.imageHolder = imageHolder;
        this.images = imageHolder.images;
        //add categories
        var categories = assetInfoHelper.getExistingCategories();
        for (var i = 0; i < categories.length; i++) {
            if (categories[i] != "") {
                var option = document.createElement("option");
                option.value = categories[i];
                option.innerText = categories[i];
                this.itemListCategory.appendChild(option);
            }
        }
        this.smallItemList.ondragover = function (evt) {
            evt.preventDefault();
        };
        this.smallItemList.ondrop = function (e) {
            var originalSlot = e.dataTransfer.getData("originalSlot");
            var inventory = _this.editor.openedStorage;
            var world = _this.editor.loader.getCurrentWorld();
            if (originalSlot != "") {
                originalSlot = Number(originalSlot);
                if (inventory) {
                    var originalSlotInfo_1 = inventory.getSlotInfo(originalSlot);
                    inventory.removeItemAtSlot(originalSlot);
                    inventory.visualize(_this.images, _this.editor.slotSize);
                    if (world) {
                        world.addHistory(new ToolHistory(function () {
                            inventory.setSlotInfo(originalSlotInfo_1);
                            inventory.visualize(_this.images, _this.editor.slotSize, world);
                            _this.editor.positionInventory();
                        }, function () {
                            inventory.removeItemAtSlot(originalSlot);
                            inventory.visualize(_this.images, _this.editor.slotSize, world);
                            _this.editor.positionInventory();
                        }));
                    }
                }
                else if (_this.editor.openedItemStorage) {
                    _this.editor.openedItemStorage.removeItemAtSlot(originalSlot);
                    _this.editor.openedItemStorage.visualize(_this.images, _this.editor.slotSize);
                }
            }
        };
        window["updateSearch"] = function () {
            _this.updateSearch();
        };
        window["updateItemSearch"] = function () {
            _this.updateItemSearch();
        };
        this.updateSearch();
        this.updateItemSearch();
    }
    TileList.prototype.updateSearch = function () {
        var _this = this;
        var tileList = this;
        setTimeout(function () {
            var search = document.getElementById("item-list-searchbar").value || "";
            var category = document.getElementById("item-list-category").value;
            var searchItems = assetInfoHelper.findInfosBySearch(search);
            var resultItems = JSON.parse(JSON.stringify(searchItems));
            /*if (search === "") {
                resultItems = JSON.parse(JSON.stringify(assetInfo))
            }*/
            if (category !== "") {
                var newResultItems = [];
                for (var i in resultItems) {
                    if (resultItems[i].category === category) {
                        newResultItems.push(resultItems[i]);
                    }
                }
                resultItems = JSON.parse(JSON.stringify(newResultItems));
            }
            //clear item list
            tileList.itemList.innerHTML = "";
            var _loop_1 = function (i) {
                var itemInfo = resultItems[i];
                if (itemInfo) {
                    //the slot
                    var slot_1 = document.createElement("div");
                    slot_1.classList.add("list-slot");
                    slot_1.setAttribute("id", "list-slot-" + itemInfo.uniqueID);
                    slot_1.ondragstart = function (evt) {
                        evt.dataTransfer.setData("uniqueID", itemInfo.uniqueID);
                    };
                    slot_1.setAttribute("currentItemId", itemInfo.uniqueID);
                    //slot outline when selected
                    if (itemInfo.uniqueID == tileList.editor.selectedTile) {
                        slot_1.classList.add("selected-slot");
                    }
                    //select tile when click
                    slot_1.addEventListener("click", function () {
                        var previousSlot = document.getElementById("list-slot-" + tileList.editor.selectedTile);
                        if (previousSlot) {
                            previousSlot.classList.remove("selected-slot");
                        }
                        slot_1.classList.add("selected-slot");
                        tileList.editor.selectedTile = Number(slot_1.getAttribute("currentItemId"));
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
                    slot_1.title = itemTitle;
                    itemImage.title = itemTitle;
                    //loading image
                    if (itemInfo.tileset != "" && itemInfo.tileset != undefined && tileList.images["assets/Tilesets/".concat(itemInfo.tileset, ".png")]) {
                        var image = tileList.images["assets/Tilesets/".concat(itemInfo.tileset, ".png")];
                        //calculate spritesheet size and position
                        var rectW = (itemInfo.xMax - itemInfo.xMin) * 16;
                        var rectH = (itemInfo.yMax - itemInfo.yMin) * 16;
                        var rectX = (itemInfo.xMin) * 16;
                        var rectY = -(itemInfo.yMin) * 16 - rectH;
                        var backgroundSizeX = (image.naturalWidth / rectW) * tileList.editor.slotSize;
                        var backgroundSizeY = (image.naturalHeight / rectH) * tileList.editor.slotSize;
                        var backgroundPosX = (backgroundSizeX / image.naturalWidth) * rectX;
                        var backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - rectY - rectH);
                        itemImage.setAttribute("style", "background-image: url(assets/Tilesets/".concat(itemInfo.tileset, ".png); background-position: -").concat(backgroundPosX, "px -").concat(backgroundPosY, "px; background-size: ").concat(backgroundSizeX, "px ").concat(backgroundSizeY, "px;"));
                    }
                    else { //set it to unknown image
                        itemImage.src = "assets/unknown.png";
                    }
                    var itemText = document.createElement("span");
                    itemText.classList.add("item-name");
                    itemText.innerText = itemInfo.localizedName || itemInfo.name;
                    slot_1.appendChild(itemImage);
                    slot_1.appendChild(itemText);
                    tileList.itemList.appendChild(slot_1);
                }
            };
            //add items
            for (var i in resultItems) {
                _loop_1(i);
            }
            if (Math.abs(resultItems.length) !== 1) {
                _this.itemListResultCount.innerText = resultItems.length + " results";
            }
            else {
                _this.itemListResultCount.innerText = resultItems.length + " result";
            }
        }, 10);
    };
    TileList.prototype.updateItemSearch = function () {
        console.log("Loading item list");
        var tileList = this;
        setTimeout(function () {
            var search = document.getElementById("small-item-list-searchbar").value || "";
            var category = "";
            var searchItems = item_assetInfoHelper.findInfosBySearch(search);
            var resultItems = JSON.parse(JSON.stringify(searchItems));
            /*if (search === "") {
                resultItems = JSON.parse(JSON.stringify(assetInfo))
            }*/
            if (category !== "") {
                var newResultItems = [];
                for (var i in resultItems) {
                    if (resultItems[i].category === category) {
                        newResultItems.push(resultItems[i]);
                    }
                }
                resultItems = JSON.parse(JSON.stringify(newResultItems));
            }
            //clear item list
            tileList.smallItemList.innerHTML = "";
            var _loop_2 = function (i) {
                var itemInfo = resultItems[i];
                if (itemInfo) {
                    //the slot
                    var slot = document.createElement("div");
                    slot.classList.add("list-slot");
                    slot.setAttribute("id", "item-list-slot-" + itemInfo.uniqueID);
                    slot.draggable = true;
                    slot.ondragstart = function (evt) {
                        evt.dataTransfer.setData("uniqueID", itemInfo.uniqueID);
                    };
                    slot.setAttribute("currentItemId", itemInfo.uniqueID);
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
                    slot.title = itemTitle;
                    itemImage.title = itemTitle;
                    //loading image
                    if (itemInfo.tileset != "" && itemInfo.tileset != undefined && tileList.images["assets/Tilesets/".concat(itemInfo.tileset, ".png")]) {
                        var image = tileList.images["assets/Tilesets/".concat(itemInfo.tileset, ".png")];
                        //calculate spritesheet size and position
                        var backgroundSizeX = (image.naturalWidth / itemInfo.rectW) * tileList.editor.slotSize;
                        var backgroundSizeY = (image.naturalHeight / itemInfo.rectH) * tileList.editor.slotSize;
                        var backgroundPosX = (backgroundSizeX / image.naturalWidth) * itemInfo.rectX;
                        var backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - itemInfo.rectY - itemInfo.rectH);
                        //bruh
                        itemImage.setAttribute("style", "background-image: url(assets/Tilesets/".concat(itemInfo.tileset, ".png); background-position: -").concat(backgroundPosX, "px -").concat(backgroundPosY, "px; background-size: ").concat(backgroundSizeX, "px ").concat(backgroundSizeY, "px;"));
                    }
                    else { //set it to unknown image
                        itemImage.src = "assets/unknown.png";
                    }
                    var itemText = document.createElement("span");
                    itemText.classList.add("item-name");
                    itemText.innerText = itemInfo.localizedName || itemInfo.name;
                    slot.appendChild(itemImage);
                    slot.appendChild(itemText);
                    tileList.smallItemList.appendChild(slot);
                }
            };
            //add items
            for (var i in resultItems) {
                _loop_2(i);
            }
        }, 10);
    };
    TileList.prototype.update = function () {
        var rootElement = document.querySelector(":root");
        rootElement.style.setProperty("--screen-width", window.innerWidth + "px");
        //window.requestAnimationFrame(update)
    };
    return TileList;
}());
export { TileList };
//# sourceMappingURL=tile-list.js.map