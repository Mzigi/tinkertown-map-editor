import { ToolHistory } from "../classes/tools/tool-info.js"
import { assetInfoHelper } from "../libraries/assetInfoHelper.js"
import { item_assetInfoHelper } from "../libraries/item-assetInfoHelper.js"
import { Editor } from "./editor.js"
import { ImageHolder } from "./image-loader.js"

export class TileList {
    imageHolder: ImageHolder
    editor: Editor
    images: {[key: string]: HTMLImageElement}

    alertElement = document.getElementById("alert")

    itemListCategory = document.getElementById("item-list-category")
    itemListResultCount = document.getElementById("item-list-result-count")
    itemList = document.getElementById("item-list")
    smallItemList = document.getElementById("small-item-list")

    constructor(imageHolder: ImageHolder, editor: Editor) {
        this.editor = editor
        this.imageHolder = imageHolder
        this.images = imageHolder.images

        //add categories
        let categories = assetInfoHelper.getExistingCategories()
        for (let i = 0; i < categories.length; i++) {
            if (categories[i] != "") {
                let option = document.createElement("option")
                option.value = categories[i]
                option.innerText = categories[i]

                this.itemListCategory.appendChild(option)
            }
        }

        this.smallItemList.ondragover = function(evt) {
            evt.preventDefault()
        }

        this.smallItemList.ondrop = (e) => {
            let originalSlot: any = e.dataTransfer.getData("originalSlot")
            let inventory = this.editor.openedStorage
            let world = this.editor.loader.getCurrentWorld()

            if (originalSlot != "") {
                originalSlot = Number(originalSlot)
        
                if (inventory) {
                    let originalSlotInfo = inventory.getSlotInfo(originalSlot)

                    inventory.removeItemAtSlot(originalSlot)
                    inventory.visualize(this.images, this.editor.slotSize)

                    if (world) {
                        world.addHistory(new ToolHistory(
                            () => {
                                inventory.setSlotInfo(originalSlotInfo)
                                inventory.visualize(this.images, this.editor.slotSize, world)
                                this.editor.positionInventory()
                            },
                            () => {
                                inventory.removeItemAtSlot(originalSlot)
                                inventory.visualize(this.images, this.editor.slotSize, world)
                                this.editor.positionInventory()
                            }
                        ))
                    }
                } else if (this.editor.openedItemStorage) {
                    this.editor.openedItemStorage.removeItemAtSlot(originalSlot)
                    this.editor.openedItemStorage.visualize(this.images, this.editor.slotSize)
                }
            }
        }

        window["updateSearch"] = () => {
            this.updateSearch()
        }
        window["updateItemSearch"] = () => {
            this.updateItemSearch()
        }

        this.updateSearch()
        this.updateItemSearch()
    }

    updateSearch() {
        let tileList = this

        setTimeout(() => {
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
            tileList.itemList.innerHTML = ""
        
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
                    if (itemInfo.uniqueID == tileList.editor.selectedTile) {
                        slot.classList.add("selected-slot")
                    }
        
                    //select tile when click
                    slot.addEventListener("click", () => {
                        let previousSlot = document.getElementById("list-slot-" + tileList.editor.selectedTile)
                        if (previousSlot) {
                            previousSlot.classList.remove("selected-slot")
                        }
    
                        slot.classList.add("selected-slot")
                        tileList.editor.selectedTile = Number(slot.getAttribute("currentItemId"))
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
                    itemImage.title = itemTitle
    
                    //loading image
                    if (itemInfo.tileset != "" && itemInfo.tileset != undefined && tileList.images[`assets/Tilesets/${itemInfo.tileset}.png`]) {
                        let image = tileList.images[`assets/Tilesets/${itemInfo.tileset}.png`]
        
                        //calculate spritesheet size and position
                        let rectW = (itemInfo.xMax - itemInfo.xMin) * 16
                        let rectH = (itemInfo.yMax - itemInfo.yMin) * 16
    
                        let rectX = (itemInfo.xMin) * 16
                        let rectY = -(itemInfo.yMin) * 16 - rectH
    
                        let backgroundSizeX = (image.naturalWidth / rectW) * tileList.editor.slotSize
                        let backgroundSizeY = (image.naturalHeight / rectH) * tileList.editor.slotSize
        
                        let backgroundPosX = (backgroundSizeX / image.naturalWidth) * rectX
                        let backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - rectY - rectH)
        
                        itemImage.setAttribute("style",`background-image: url(assets/Tilesets/${itemInfo.tileset}.png); background-position: -${backgroundPosX}px -${backgroundPosY}px; background-size: ${backgroundSizeX}px ${backgroundSizeY}px;`)
                    } else { //set it to unknown image
                        itemImage.src = "assets/unknown.png"
                    }
        
                    let itemText = document.createElement("span")
                    itemText.classList.add("item-name")
                    itemText.innerText = itemInfo.localizedName || itemInfo.name
        
                    slot.appendChild(itemImage)
                    slot.appendChild(itemText)
                    tileList.itemList.appendChild(slot)
                }
            }
    
            if (Math.abs(resultItems.length) !== 1) {
                this.itemListResultCount.innerText = resultItems.length + " results"
            } else {
                this.itemListResultCount.innerText = resultItems.length + " result"
            }
        },10)
    }

    updateItemSearch() {
        console.log("Loading item list")
    
        let tileList = this

        setTimeout(() => {
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
            tileList.smallItemList.innerHTML = ""
        
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
                    itemImage.title = itemTitle
    
                    //loading image
                    if (itemInfo.tileset != "" && itemInfo.tileset != undefined && tileList.images[`assets/Tilesets/${itemInfo.tileset}.png`]) {
                        let image = tileList.images[`assets/Tilesets/${itemInfo.tileset}.png`]
        
                        //calculate spritesheet size and position
                        let backgroundSizeX = (image.naturalWidth / itemInfo.rectW) * tileList.editor.slotSize
                        let backgroundSizeY = (image.naturalHeight / itemInfo.rectH) * tileList.editor.slotSize
        
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
                    tileList.smallItemList.appendChild(slot)
                }
            }
        },10)
    }

    update() {
        let rootElement = (<HTMLElement>document.querySelector(":root"))
        rootElement.style.setProperty("--screen-width", window.innerWidth + "px")
    
        //window.requestAnimationFrame(update)
    }
}