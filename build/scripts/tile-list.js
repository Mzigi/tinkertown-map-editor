"use-strict";
// @ts-check
var slotSize = 64;
var alertElement = document.getElementById("alert");
var itemListCategory = document.getElementById("item-list-category");
var itemListResultCount = document.getElementById("item-list-result-count");
var itemList = document.getElementById("item-list");
var smallItemList = document.getElementById("small-item-list");
//add categories
var categories = assetInfoHelper.getExistingCategories();
for (var i = 0; i < categories.length; i++) {
    var option = document.createElement("option");
    option.value = categories[i];
    option.innerText = categories[i];
    itemListCategory.appendChild(option);
}
function updateSearch() {
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
        itemList.innerHTML = "";
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
                if (itemInfo.uniqueID == selectedTile) {
                    slot_1.classList.add("selected-slot");
                }
                //select tile when click
                slot_1.addEventListener("click", function () {
                    var previousSlot = document.getElementById("list-slot-" + selectedTile);
                    if (previousSlot) {
                        previousSlot.classList.remove("selected-slot");
                    }
                    slot_1.classList.add("selected-slot");
                    selectedTile = Number(slot_1.getAttribute("currentItemId"));
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
                //loading image
                if (itemInfo.tileset != "" && itemInfo.tileset != undefined && images["assets/Tilesets/".concat(itemInfo.tileset, ".png")]) {
                    var image = images["assets/Tilesets/".concat(itemInfo.tileset, ".png")];
                    //calculate spritesheet size and position
                    var rectW = (itemInfo.xMax - itemInfo.xMin) * 16;
                    var rectH = (itemInfo.yMax - itemInfo.yMin) * 16;
                    var rectX = (itemInfo.xMin) * 16;
                    var rectY = -(itemInfo.yMin) * 16 - rectH;
                    var backgroundSizeX = (image.naturalWidth / rectW) * slotSize;
                    var backgroundSizeY = (image.naturalHeight / rectH) * slotSize;
                    var backgroundPosX = (backgroundSizeX / image.naturalWidth) * rectX;
                    var backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - rectY - rectH);
                    //bruh
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
                itemList.appendChild(slot_1);
            }
        };
        //add items
        for (var i in resultItems) {
            _loop_1(i);
        }
        if (Math.abs(resultItems.length) !== 1) {
            itemListResultCount.innerText = resultItems.length + " results";
        }
        else {
            itemListResultCount.innerText = resultItems.length + " result";
        }
    }, 10);
}
updateSearch();
function updateItemSearch() {
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
        smallItemList.innerHTML = "";
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
                //loading image
                if (itemInfo.tileset != "" && itemInfo.tileset != undefined && images["assets/Tilesets/".concat(itemInfo.tileset, ".png")]) {
                    var image = images["assets/Tilesets/".concat(itemInfo.tileset, ".png")];
                    //calculate spritesheet size and position
                    var backgroundSizeX = (image.naturalWidth / itemInfo.rectW) * slotSize;
                    var backgroundSizeY = (image.naturalHeight / itemInfo.rectH) * slotSize;
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
                smallItemList.appendChild(slot);
            }
        };
        //add items
        for (var i in resultItems) {
            _loop_2(i);
        }
    }, 10);
}
updateItemSearch();
smallItemList.ondragover = function (evt) {
    evt.preventDefault();
};
smallItemList.ondrop = function (evt) {
    var originalSlot = evt.dataTransfer.getData("originalSlot");
    if (originalSlot != "") {
        originalSlot = Number(originalSlot);
        if (openedStorage) {
            openedStorage.removeItemAtSlot(originalSlot);
            openedStorage.visualize();
        }
        else if (openedItemStorage) {
            openedItemStorage.removeItemAtSlot(originalSlot);
            openedItemStorage.visualize();
        }
    }
};
function update() {
    var rootElement = document.querySelector(":root");
    rootElement.style.setProperty("--screen-width", window.innerWidth + "px");
    window.requestAnimationFrame(update);
}
update();
//# sourceMappingURL=tile-list.js.map