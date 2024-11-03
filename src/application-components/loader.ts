import { Chunk } from "../classes/objects/chunk.js"
import { Inventory } from "../classes/objects/inventory.js"
import { World, WorldFormat } from "../classes/objects/world.js"
import { Editor } from "./editor.js"

interface worldLink {
    file: string,
    name: string,
    hidden?: boolean,
}

declare var initSqlJs

export class Loader {
    editor: Editor

    worlds: Array<World> = [new World(0, this)]
    currentWorld: number = 0

    newButton: any = document.getElementById("navbar-new")
    importInput: any = document.getElementById("navbar-import")
    exportButton: any = document.getElementById("navbar-export")
    exportButton2: any = document.getElementById("navbar-export-2")
    helpButton: any = document.getElementById("navbar-help")
    worldSettingsButton: any = document.getElementById("navbar-world-settings")
    examplesButton: any = document.getElementById("navbar-examples")

    closeDialogButton: any = document.getElementById("close-dialog-help")
    closeExamplesDialogButton: any = document.getElementById("close-dialog-examples")
    closeWorldSettingsDialogButton: any = document.getElementById("close-dialog-world-settings")

    alertElement: HTMLElement = document.getElementById("alert")

    NEWUI = !(window.location.href.endsWith("old-index.html"))

    examples: Array<worldLink> = [
        {
            "file": "House in Forest",
            "name": "House in Forest",
        },
        {
            "file": "OneChunkChallenge",
            "name": "10x10 Forest and House Cutout",
        },
        {
            "file": "10x10 Lake",
            "name": "10x10 Lake in Forest",
        },
        {
            "file": "Statue Structure",
            "name": "Statue Structure",
        },
        {
            "file": "Small House",
            "name": "Small House",
        },
        {
            "file": "IslandSurvival",
            "name": "Large Island Survival",
        },
        {
            "file": "test storage",
            "name": "test storage",
            "hidden": true,
        },
        {
            "file": "earlytown6",
            "name": "Earlytown - 6",
        },
        {
            "file": "earlytown4",
            "name": "Earlytown - 4",
        },
        {
            "file": "earlytown3",
            "name": "Earlytown - 3",
        },
        {
            "file": "earlytown1",
            "name": "Earlytown - 1",
        },
    ]

    constructor() {
        for (let i = 0; i < this.examples.length; i++) {
            if (!this.examples[i].hidden) {
                    let listElement = document.createElement("li")
    
                    let buttonElement = document.createElement("button")
                    buttonElement.innerText = this.examples[i].name
    
                    listElement.appendChild(buttonElement)
    
                    buttonElement.addEventListener("click", () => {
                        this.loadFromExampleLink(this.examples[i])
                    })
    
                    document.getElementById("examples-list").appendChild(listElement)
                if (this.NEWUI) {
                    let buttonElement = document.createElement("button")
                    buttonElement.innerText = this.examples[i].name
                    buttonElement.classList.add("navbar-li")
    
                    buttonElement.addEventListener("click", () => {
                        this.loadFromExampleLink(this.examples[i])
                    })
    
                    document.getElementById("navbar-examples-buttons").appendChild(buttonElement)
                }
            }
        }

        this.newButton.addEventListener("click", () => {
            this.currentWorld = this.worlds.length
            this.worlds[this.currentWorld] = new World(this.currentWorld, this)
            this.updateWorldList()
            this.worlds[this.currentWorld].uneditedFiles = {}
        })
    
        initSqlJs({locateFile: filename => `src/libraries/sql-wasm.wasm`}).then((SQL) => { 
            window["SQL"] = SQL
    
            console.log(SQL)
            console.log("Initialized SQL.js")
    
            let loader = this

            this.importInput.addEventListener("change", () => {
                if (this.importInput.files.length > 0) {
                    let thisWorldId = loader.worlds.length
                    loader.worlds[thisWorldId] = new World(thisWorldId, loader)
                    loader.worlds[thisWorldId].format = WorldFormat.Binary
    
                    loader.currentWorld = thisWorldId
                    
                    loader.worlds[thisWorldId].uneditedFiles = {}
    
                    //check if world is database
                    for (let file of loader.importInput.files) {
                        if (file.webkitRelativePath.endsWith("world.dat")) {
                            loader.worlds[loader.currentWorld].format = WorldFormat.Database
                        }
                    }
    
                    console.log("Loading world with format " + loader.worlds[loader.currentWorld].format)
    
                    for (let i = 0; i < loader.importInput.files.length; i++) {
                        console.log(loader.importInput.files[i].webkitRelativePath)
    
                        //console.log(importInput.files[i].webkitRelativePath)
                        if (loader.importInput.files[i].webkitRelativePath.endsWith("world.dat") || loader.importInput.files[i].webkitRelativePath.endsWith("MapAddition.db")) {
                            //readBinaryFile(importInput2.files[i], importInput2.files[i].webkitRelativePath, thisWorldId)
                            let fileReader = new FileReader()
    
                            fileReader.onload = (e) => {
                                let uint8data = new Uint8Array(<ArrayBufferLike>fileReader.result)
                                let dataBase = new SQL.Database(uint8data)
                                loader.worlds[thisWorldId].fromDatabase(dataBase, loader.importInput.files[i].webkitRelativePath.endsWith("MapAddition.db"))
                            }
                            fileReader.readAsArrayBuffer(loader.importInput.files[i])
                        } else if (loader.importInput.files[i].webkitRelativePath.endsWith(".dat")) {
                            loader.readBinaryFile(loader.importInput.files[i], loader.importInput.files[i].webkitRelativePath, thisWorldId)
                        } else if (loader.importInput.files[i].webkitRelativePath.endsWith(".meta")) {
                            let fileReader = new FileReader()
    
                            fileReader.onload = (e) => {
                                loader.readBinaryFile(e.target.result, loader.importInput.files[i].webkitRelativePath, thisWorldId)
                            }
    
                            fileReader.readAsText(loader.importInput.files[i])
                        } else {
                            loader.readBinaryFile(loader.importInput.files[i], loader.importInput.files[i].webkitRelativePath, thisWorldId)
                        }
                    }
                }
    
                loader.updateWorldList()
            })
        })
    
        this.exportButton.addEventListener("click", () => {
            this.worlds[this.currentWorld].saveAsFile()
        })
    
        this.exportButton2.addEventListener("click", () => {
            this.worlds[this.currentWorld].saveAsFile(true)
        })
    
        this.helpButton.addEventListener("click", () => {
            (<HTMLDialogElement>document.getElementById("dialog-help")).showModal()
        })
    
        this.closeDialogButton.addEventListener("click", () => {
            (<HTMLDialogElement>document.getElementById("dialog-help")).close()
        })
    
        this.worldSettingsButton.addEventListener("click", () => {
            for (let key in this.worlds[this.currentWorld]) {
                if (document.getElementById("world-settings-" + key)) {
                    if (typeof(this.worlds[this.currentWorld][key]) != "object") {
                        (<HTMLInputElement>document.getElementById("world-settings-" + key)).value = this.worlds[this.currentWorld][key]
                    } else {
                        (<HTMLInputElement>document.getElementById("world-settings-" + key)).value = JSON.stringify(this.worlds[this.currentWorld][key])
                    }
                }
            }
            (<HTMLDialogElement>document.getElementById("dialog-world-settings")).showModal()
        })
    
        this.closeWorldSettingsDialogButton.addEventListener("click", () => {
            (<HTMLDialogElement>document.getElementById("dialog-world-settings")).close()
        })
    
        this.examplesButton.addEventListener("click", () => {
            (<HTMLDialogElement>document.getElementById("dialog-examples")).showModal()
        })
    
        this.closeExamplesDialogButton.addEventListener("click", () => {
            (<HTMLDialogElement>document.getElementById("dialog-examples")).close()
        })
    }

    createWorldElement(worldId: number): HTMLButtonElement {
        let thisWorld = this.worlds[worldId]
    
        let worldButton = document.createElement("button")
        worldButton.classList.add("world")
        worldButton.setAttribute("world-id", String(worldId))
    
        let worldTitle = document.createElement("span")
        worldTitle.classList.add("world-name")
        worldTitle.innerText = thisWorld.name
    
        worldButton.appendChild(worldTitle)
    
        let closeButton = document.createElement("button")
        closeButton.classList.add("material-symbols-outlined")
        closeButton.classList.add("world-close")
        closeButton.innerText = "close"
    
        worldButton.appendChild(closeButton)
    
        closeButton.addEventListener("click", () => {
            document.getElementById("remove-world-title").innerText = "Remove " + thisWorld.name + "?";
            (<HTMLDialogElement>document.getElementById("dialog-confirm-close")).showModal()
    
            function RemoveWorld() {
                thisWorld.reset()
                thisWorld.hidden = true
                
                if (worldId == this.loader.currentWorld) {
                    this.findFirstVisibleWorld()
                }
                this.loader.updateWorldList();
    
                (<HTMLDialogElement>document.getElementById("dialog-confirm-close")).close()
    
                document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", RemoveWorld)
                document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", CancelRemove)
            }
    
            function CancelRemove() {
                (<HTMLDialogElement>document.getElementById("dialog-confirm-close")).close()
    
                document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", RemoveWorld)
                document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", CancelRemove)
            }
    
            document.getElementById("dialog-confirm-close-confirm").addEventListener("click", RemoveWorld)
            document.getElementById("dialog-confirm-close-cancel").addEventListener("click", CancelRemove)
        })
    
        if (worldId != this.currentWorld) {
            worldButton.classList.add("world-unloaded")
        }
    
        worldButton.addEventListener("click", () => {
            if (!this.worlds[worldId].hidden) {
                this.currentWorld = worldId
                this.updateWorldList()
            }
        })
    
        return worldButton
    }

    updateWorldList() {
        if (this.NEWUI) {
            //remove all elements
            document.getElementById("worldlist").innerHTML = ""
    
            //add new ones
            //let currentWorldElement = createWorldElement(currentWorld)
    
            //document.getElementById("worldlist").appendChild(currentWorldElement)
    
            for (let i = 0; i < this.worlds.length; i++) {
                if (!this.worlds[i].hidden) {
                    document.getElementById("worldlist").appendChild(this.createWorldElement(i))
                }
            }
        }
    }

    isDarkMode = () => 
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    savedPrefereneces = null

    getPreference(key: string): string {
        if (this.savedPrefereneces == null) {
            this.savedPrefereneces = JSON.parse(localStorage.getItem("preferences"))
        }

        if (!this.savedPrefereneces) {
            this.savedPrefereneces = {}
        }

        if (!this.savedPrefereneces[key]) {
            /*if (["show-poi","tile-list-visible"].includes(key)) {
                savedPrefereneces[key] = "true"
            } else if (["canvas-debug-text"].includes(key)) {
                savedPrefereneces[key] = "false"
            } else*/ if (key == "theme") {
                if (this.isDarkMode()) {
                    this.savedPrefereneces[key] = "dark"
                } else {
                    this.savedPrefereneces[key] = "light"
                }
            }
        }

        return this.savedPrefereneces[key]
    }

    setPreference(key: string, value: string | number | boolean) {
        if (this.savedPrefereneces == null) {
            this.savedPrefereneces = JSON.parse(localStorage.getItem("preferences"))
        }

        if (!this.savedPrefereneces) {
            this.savedPrefereneces = {}
        }

        this.savedPrefereneces[key] = value
        
        localStorage.setItem("preferences", JSON.stringify(this.savedPrefereneces))
    }

    loadFromExampleLink(exampleLink: worldLink) {
        let loadingWorld = new World(this.worlds.length, this)
        loadingWorld.name = "Loading..."
        this.worlds[this.worlds.length] = loadingWorld
        this.currentWorld = this.worlds.length - 1

        let hrefWithoutHtml = window.location.href.replace("index.html","")
        let fetchUrl = hrefWithoutHtml + "assets/Worlds/" + exampleLink.file + ".ttworld"
        console.log("Fetching example world from " + fetchUrl);

        (<HTMLDialogElement>document.getElementById("dialog-examples")).close();
        (<HTMLDialogElement>document.getElementById("dialog-loading")).showModal();

        fetch("./assets/Worlds/" + exampleLink.file + ".ttworld").then(response => {
            response.arrayBuffer().then(worldBuffer => {
                loadingWorld.fromBuffer(worldBuffer, 0);
                (<HTMLDialogElement>document.getElementById("dialog-loading")).close();
            })
        }).catch(error => {
            console.warn(error);
            (<HTMLDialogElement>document.getElementById("dialog-loading")).close();
            this.alertText("Failed to fetch example", true, 3)
            this.updateWorldList()
        })
    }

    async readBinaryFile(file: any, filePath: string, worldId: number) {
        if (filePath.endsWith(".dat") && filePath.includes("_") && filePath.split("/").length < 3) { //chunk
            const buffer: ArrayBuffer = await file.arrayBuffer()

            if (this.worlds[worldId].format === WorldFormat.Binary) {
                let loadedChunk: Chunk = new Chunk()
                loadedChunk.fromBuffer(buffer)
                this.worlds[worldId].addChunk(loadedChunk)
                this.worlds[worldId].chunkCache[filePath] = buffer
            } else {
                console.warn("Attempted to load chunk file while world is in the Database format")
                this.worlds[worldId].uneditedFiles[filePath] = buffer
            }
        } else if (filePath.endsWith("world.meta")) { //world.meta
            let worldMeta: any = JSON.parse(file)
            this.worlds[worldId].name = worldMeta.name
            this.worlds[worldId].seed = worldMeta.seed
            this.worlds[worldId].version = worldMeta.version
            this.worlds[worldId].highestUsedVersion = worldMeta.highestUsedVersion
            if (!this.worlds[worldId].highestUsedVersion) {
                this.worlds[worldId].highestUsedVersion = worldMeta.version
            }
            this.worlds[worldId].hasBeenGenerated = worldMeta.hasBeenGenerated

            this.updateWorldList()
        } else if (filePath.endsWith("settings.meta")) { //settings.meta
            let settingsMeta: any = JSON.parse(file)
            this.worlds[worldId].progression = settingsMeta.progression
            this.worlds[worldId].friendlyFire = settingsMeta.friendlyFire
            this.worlds[worldId].forestBarrierBroken = settingsMeta.forestBarrierBroken
            this.worlds[worldId].timescale = settingsMeta.timescale
            this.worlds[worldId].NPCsOff = settingsMeta.NPCsOff
            this.worlds[worldId].additionalParams = settingsMeta.additionalParams
        } else if (filePath.endsWith("inventory.dat")) { //container
            const buffer: ArrayBuffer = await file.arrayBuffer()

            if (this.worlds[worldId].format === WorldFormat.Binary) {
                let loadedInventory: Inventory = new Inventory()
                loadedInventory.fromBuffer(buffer)
                loadedInventory.filePath = filePath
                
                this.worlds[worldId].containers.push(loadedInventory)
            } else {
                console.warn("Attempted to load inventory file while world is in the Database format")
                this.worlds[worldId].uneditedFiles[filePath] = buffer
            }
        } else {
            const buffer: ArrayBuffer = await file.arrayBuffer()

            console.log("Editor doesn't know how to read " + filePath)
            this.worlds[worldId].uneditedFiles[filePath] = buffer
        }
    }

    alertText(text: string, isError: boolean, time: number) {
        console.warn(text)
        
        this.alertElement.innerText = text
        if (isError) {
            this.alertElement.classList.add("errorAlert")
        } else {
            this.alertElement.classList.remove("errorAlert")
        }
        this.alertElement.classList.add("alertOn")
    
        let loader = this

        setTimeout(() => {
            loader.alertElement.classList.remove("alertOn")
        }, time * 1000)
    }

    /*loadButton.addEventListener("mousedown",() => {
        for (let i = 0; i < fileChooser.files.length; i++) {
            const file = fileChooser.files[i]
            if (file) {
                readBinaryFile(file)
            }
        }
    })*/
}

/*
BROKEN ID'S
35
21
*/

/*let filledChunk = new Chunk()
filledChunk.x = 0
filledChunk.y = 0
filledChunk.fillWithIdsBetween(0,99)
filledChunk.saveAsFile()

let filledChunk2 = new Chunk()
filledChunk2.x = 1
filledChunk2.y = 0
filledChunk2.fillWithIdsBetween(100,199)
filledChunk2.saveAsFile()

let filledChunk3 = new Chunk()
filledChunk3.x = 0
filledChunk3.y = 1
filledChunk3.fillWithIdsBetween(200,299)
filledChunk3.saveAsFile()

let filledChunk4 = new Chunk()
filledChunk4.x = 1
filledChunk4.y = 1
filledChunk4.fillWithIdsBetween(300,399)
filledChunk4.saveAsFile()*/

/*let chunk236 = new Chunk()
chunk236.x = 0
chunk236.y = 0
chunk236.fillWithId(236)
chunk236.saveAsFile()

let chunk294 = new Chunk()
chunk294.x = 1
chunk294.y = 0
chunk294.fillWithId(294)
chunk294.saveAsFile()*/