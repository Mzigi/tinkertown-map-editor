"use-strict";
// @ts-check

var slotSize: number = 64

let alertElement = document.getElementById("alert")

let itemListCategory = document.getElementById("item-list-category")
let itemListResultCount = document.getElementById("item-list-result-count")
let itemList = document.getElementById("item-list")
let smallItemList = document.getElementById("small-item-list")

//add categories
let categories = assetInfoHelper.getExistingCategories()
for (let i = 0; i < categories.length; i++) {
    let option = document.createElement("option")
    option.value = categories[i]
    option.innerText = categories[i]

    itemListCategory.appendChild(option)
}

function updateSearch() {
    setTimeout(function() {
        let search: string = (<HTMLInputElement>document.getElementById("item-list-searchbar")).value || ""
        let category: string = (<HTMLInputElement>document.getElementById("item-list-category")).value
    
        let searchItems = assetInfoHelper.findInfosBySearch(search)
    
        let resultItems = JSON.parse(JSON.stringify(searchItems))
    
        /*if (search === "") {
            resultItems = JSON.parse(JSON.stringify(assetInfo))
        }*/
    
        if (category !== "") {
            let newResultItems = []
            for (let i in resultItems) {
                if (resultItems[i].category === category) {
                    newResultItems.push(resultItems[i])
                }
            }
            resultItems = JSON.parse(JSON.stringify(newResultItems))
        }
    
        //clear item list
        itemList.innerHTML = ""
    
        //add items
        for (let i in resultItems) {
            let itemInfo = resultItems[i]
    
            if (itemInfo) {
                //the slot
                let slot = document.createElement("div")
                slot.classList.add("list-slot")
                slot.setAttribute("id","list-slot-" + itemInfo.uniqueID)
    
                slot.ondragstart = function(evt) {
                    evt.dataTransfer.setData("uniqueID", itemInfo.uniqueID)
                }

                slot.setAttribute("currentItemId",itemInfo.uniqueID)

                //slot outline when selected
                if (itemInfo.uniqueID == selectedTile) {
                    slot.classList.add("selected-slot")
                }
    
                //select tile when click
                slot.addEventListener("click", () => {
                    let previousSlot = document.getElementById("list-slot-" + selectedTile)
                    if (previousSlot) {
                        previousSlot.classList.remove("selected-slot")
                    }

                    slot.classList.add("selected-slot")
                    selectedTile = Number(slot.getAttribute("currentItemId"))
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
                slot.title = itemTitle

                //loading image
                if (itemInfo.tileset != "" && itemInfo.tileset != undefined && images[`assets/Tilesets/${itemInfo.tileset}.png`]) {
                    let image = images[`assets/Tilesets/${itemInfo.tileset}.png`]
    
                    //calculate spritesheet size and position
                    let rectW = (itemInfo.xMax - itemInfo.xMin) * 16
                    let rectH = (itemInfo.yMax - itemInfo.yMin) * 16

                    let rectX = (itemInfo.xMin) * 16
                    let rectY = -(itemInfo.yMin) * 16 - rectH

                    let backgroundSizeX = (image.naturalWidth / rectW) * slotSize
                    let backgroundSizeY = (image.naturalHeight / rectH) * slotSize
    
                    let backgroundPosX = (backgroundSizeX / image.naturalWidth) * rectX
                    let backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - rectY - rectH)
    
                    //bruh
                    itemImage.setAttribute("style",`background-image: url(assets/Tilesets/${itemInfo.tileset}.png); background-position: -${backgroundPosX}px -${backgroundPosY}px; background-size: ${backgroundSizeX}px ${backgroundSizeY}px;`)
                } else { //set it to unknown image
                    itemImage.src = "assets/unknown.png"
                }
    
                let itemText = document.createElement("span")
                itemText.classList.add("item-name")
                itemText.innerText = itemInfo.localizedName || itemInfo.name
    
                slot.appendChild(itemImage)
                slot.appendChild(itemText)
                itemList.appendChild(slot)
            }
        }

        if (Math.abs(resultItems.length) !== 1) {
            itemListResultCount.innerText = resultItems.length + " results"
        } else {
            itemListResultCount.innerText = resultItems.length + " result"
        }
    },10)
}

updateSearch()


function updateItemSearch() {
    setTimeout(function() {
        let search: string = (<HTMLInputElement>document.getElementById("small-item-list-searchbar")).value || ""
        let category: string = ""
    
        let searchItems = item_assetInfoHelper.findInfosBySearch(search)
    
        let resultItems = JSON.parse(JSON.stringify(searchItems))
    
        /*if (search === "") {
            resultItems = JSON.parse(JSON.stringify(assetInfo))
        }*/
    
        if (category !== "") {
            let newResultItems = []
            for (let i in resultItems) {
                if (resultItems[i].category === category) {
                    newResultItems.push(resultItems[i])
                }
            }
            resultItems = JSON.parse(JSON.stringify(newResultItems))
        }
    
        //clear item list
        smallItemList.innerHTML = ""
    
        //add items
        for (let i in resultItems) {
            let itemInfo = resultItems[i]
    
            if (itemInfo) {
                //the slot
                let slot = document.createElement("div")
                slot.classList.add("list-slot")
                slot.setAttribute("id","item-list-slot-" + itemInfo.uniqueID)
                slot.draggable = true
    
                slot.ondragstart = function(evt) {
                    evt.dataTransfer.setData("uniqueID", itemInfo.uniqueID)
                }

                slot.setAttribute("currentItemId",itemInfo.uniqueID)

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
                slot.title = itemTitle

                //loading image
                if (itemInfo.tileset != "" && itemInfo.tileset != undefined && images[`assets/Tilesets/${itemInfo.tileset}.png`]) {
                    let image = images[`assets/Tilesets/${itemInfo.tileset}.png`]
    
                    //calculate spritesheet size and position
                    let backgroundSizeX = (image.naturalWidth / itemInfo.rectW) * slotSize
                    let backgroundSizeY = (image.naturalHeight / itemInfo.rectH) * slotSize
    
                    let backgroundPosX = (backgroundSizeX / image.naturalWidth) * itemInfo.rectX
                    let backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - itemInfo.rectY - itemInfo.rectH)
    
                    //bruh
                    itemImage.setAttribute("style",`background-image: url(assets/Tilesets/${itemInfo.tileset}.png); background-position: -${backgroundPosX}px -${backgroundPosY}px; background-size: ${backgroundSizeX}px ${backgroundSizeY}px;`)
                } else { //set it to unknown image
                    itemImage.src = "assets/unknown.png"
                }
    
                let itemText = document.createElement("span")
                itemText.classList.add("item-name")
                itemText.innerText = itemInfo.localizedName || itemInfo.name
    
                slot.appendChild(itemImage)
                slot.appendChild(itemText)
                smallItemList.appendChild(slot)
            }
        }
    },10)
}

updateItemSearch()

smallItemList.ondragover = function(evt) {
    evt.preventDefault()
}
smallItemList.ondrop = function(evt) {
    let originalSlot: any = evt.dataTransfer.getData("originalSlot")
    
    if (originalSlot != "") {
        originalSlot = Number(originalSlot)

        if (openedStorage) {
            openedStorage.removeItemAtSlot(originalSlot)
            openedStorage.visualize()
        } else if (openedItemStorage) {
            openedItemStorage.removeItemAtSlot(originalSlot)
            openedItemStorage.visualize()
        }
    }
}

function update() {
    let rootElement = (<HTMLElement>document.querySelector(":root"))
    rootElement.style.setProperty("--screen-width", window.innerWidth + "px")

    window.requestAnimationFrame(update)
}

update()