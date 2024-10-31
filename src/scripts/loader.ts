"use-strict";
// @ts-check

var worlds: Array<World> = [new World()]
var currentWorld: number = 0

let newButton: any = document.getElementById("navbar-new")
let importInput: any = document.getElementById("navbar-import")
let exportButton: any = document.getElementById("navbar-export")
let exportButton2: any = document.getElementById("navbar-export-2")
let helpButton: any = document.getElementById("navbar-help")
let worldSettingsButton: any = document.getElementById("navbar-world-settings")
let examplesButton: any = document.getElementById("navbar-examples")

let closeDialogButton: any = document.getElementById("close-dialog-help")
let closeExamplesDialogButton: any = document.getElementById("close-dialog-examples")
let closeWorldSettingsDialogButton: any = document.getElementById("close-dialog-world-settings")

const NEWUI = !(window.location.href.endsWith("old-index.html"))

interface worldLink {
    file: string,
    name: string,
    hidden?: boolean,
}

let examples: Array<worldLink> = [
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

const isDarkMode = () => 
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

var savedPrefereneces = null

function getPreference(key: string): string {
    if (savedPrefereneces == null) {
        savedPrefereneces = JSON.parse(localStorage.getItem("preferences"))
    }

    if (!savedPrefereneces) {
        savedPrefereneces = {}
    }

    if (!savedPrefereneces[key]) {
        /*if (["show-poi","tile-list-visible"].includes(key)) {
            savedPrefereneces[key] = "true"
        } else if (["canvas-debug-text"].includes(key)) {
            savedPrefereneces[key] = "false"
        } else*/ if (key == "theme") {
            if (isDarkMode()) {
                savedPrefereneces[key] = "dark"
            } else {
                savedPrefereneces[key] = "light"
            }
        }
    }

    return savedPrefereneces[key]
}

function setPreference(key: string, value: string | number | boolean) {
    if (savedPrefereneces == null) {
        savedPrefereneces = JSON.parse(localStorage.getItem("preferences"))
    }

    if (!savedPrefereneces) {
        savedPrefereneces = {}
    }

    savedPrefereneces[key] = value
    
    localStorage.setItem("preferences", JSON.stringify(savedPrefereneces))
}

function loadFromExampleLink(exampleLink: worldLink) {
    let loadingWorld = new World()
    loadingWorld.name = "Loading..."
    worlds[worlds.length] = loadingWorld
    currentWorld = worlds.length - 1

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
        alertText("Failed to fetch example", true, 3)
        updateWorldList()
    })
}

for (let i = 0; i < examples.length; i++) {
    if (!examples[i].hidden) {
            let listElement = document.createElement("li")

            let buttonElement = document.createElement("button")
            buttonElement.innerText = examples[i].name

            listElement.appendChild(buttonElement)

            buttonElement.addEventListener("click", () => {
                loadFromExampleLink(examples[i])
            })

            document.getElementById("examples-list").appendChild(listElement)
        if (NEWUI) {
            let buttonElement = document.createElement("button")
            buttonElement.innerText = examples[i].name
            buttonElement.classList.add("navbar-li")

            buttonElement.addEventListener("click", () => {
                loadFromExampleLink(examples[i])
            })

            document.getElementById("navbar-examples-buttons").appendChild(buttonElement)
        }
    }
}

const readBinaryFile = async (file: any, filePath: string, worldId: number) => {
    if (filePath.endsWith(".dat") && filePath.includes("_") && filePath.split("/").length < 3) { //chunk
        const buffer: ArrayBuffer = await file.arrayBuffer()

        if (worlds[worldId].format === WorldFormat.Binary) {
            let loadedChunk: Chunk = new Chunk()
            loadedChunk.fromBuffer(buffer)
            worlds[worldId].addChunk(loadedChunk)
            worlds[worldId].chunkCache[filePath] = buffer
        } else {
            console.warn("Attempted to load chunk file while world is in the Database format")
            worlds[worldId].uneditedFiles[filePath] = buffer
        }
    } else if (filePath.endsWith("world.meta")) { //world.meta
        let worldMeta: any = JSON.parse(file)
        worlds[worldId].name = worldMeta.name
        worlds[worldId].seed = worldMeta.seed
        worlds[worldId].version = worldMeta.version
        worlds[worldId].highestUsedVersion = worldMeta.highestUsedVersion
        if (!worlds[worldId].highestUsedVersion) {
            worlds[worldId].highestUsedVersion = worldMeta.version
        }
        worlds[worldId].hasBeenGenerated = worldMeta.hasBeenGenerated

        updateWorldList()
    } else if (filePath.endsWith("settings.meta")) { //settings.meta
        let settingsMeta: any = JSON.parse(file)
        worlds[worldId].progression = settingsMeta.progression
        worlds[worldId].friendlyFire = settingsMeta.friendlyFire
        worlds[worldId].forestBarrierBroken = settingsMeta.forestBarrierBroken
        worlds[worldId].timescale = settingsMeta.timescale
        worlds[worldId].NPCsOff = settingsMeta.NPCsOff
        worlds[worldId].additionalParams = settingsMeta.additionalParams
    } else if (filePath.endsWith("inventory.dat")) { //container
        const buffer: ArrayBuffer = await file.arrayBuffer()

        if (worlds[worldId].format === WorldFormat.Binary) {
            let loadedInventory: Inventory = new Inventory()
            loadedInventory.fromBuffer(buffer)
            loadedInventory.filePath = filePath
            
            worlds[worldId].containers.push(loadedInventory)
        } else {
            console.warn("Attempted to load inventory file while world is in the Database format")
            worlds[worldId].uneditedFiles[filePath] = buffer
        }
    } else {
        const buffer: ArrayBuffer = await file.arrayBuffer()

        console.log("Editor doesn't know how to read " + filePath)
        worlds[worldId].uneditedFiles[filePath] = buffer
    }
}

/*loadButton.addEventListener("mousedown",() => {
    for (let i = 0; i < fileChooser.files.length; i++) {
        const file = fileChooser.files[i]
        if (file) {
            readBinaryFile(file)
        }
    }
})*/

newButton.addEventListener("click", () => {
    currentWorld = worlds.length
    worlds[currentWorld] = new World()
    updateWorldList()
    worlds[currentWorld].uneditedFiles = {}
})

initSqlJs({locateFile: filename => `src/libraries/sql-wasm.wasm`}).then((SQL) => { 
    window["SQL"] = SQL

    console.log(SQL)
    console.log("Initialized SQL")

    importInput.addEventListener("change", () => {
        if (importInput.files.length > 0) {
            let thisWorldId = worlds.length
            worlds[thisWorldId] = new World()
            worlds[thisWorldId].format = WorldFormat.Binary

            currentWorld = thisWorldId
            
            worlds[thisWorldId].uneditedFiles = {}

            //check if world is database
            for (let file of importInput.files) {
                if (file.webkitRelativePath.endsWith("world.dat")) {
                    worlds[currentWorld].format = WorldFormat.Database
                }
            }

            console.log("Loading world with format " + worlds[currentWorld].format)

            for (let i = 0; i < importInput.files.length; i++) {
                console.log(importInput.files[i].webkitRelativePath)

                //console.log(importInput.files[i].webkitRelativePath)
                if (importInput.files[i].webkitRelativePath.endsWith("world.dat") || importInput.files[i].webkitRelativePath.endsWith("MapAddition.db")) {
                    //readBinaryFile(importInput2.files[i], importInput2.files[i].webkitRelativePath, thisWorldId)
                    let fileReader = new FileReader()

                    fileReader.onload = function(e) {
                        let uint8data = new Uint8Array(<ArrayBufferLike>fileReader.result)
                        let dataBase = new SQL.Database(uint8data)
                        worlds[thisWorldId].fromDatabase(dataBase, importInput.files[i].webkitRelativePath.endsWith("MapAddition.db"))
                    }
                    fileReader.readAsArrayBuffer(importInput.files[i])
                } else if (importInput.files[i].webkitRelativePath.endsWith(".dat")) {
                    readBinaryFile(importInput.files[i], importInput.files[i].webkitRelativePath, thisWorldId)
                } else if (importInput.files[i].webkitRelativePath.endsWith(".meta")) {
                    let fileReader = new FileReader()

                    fileReader.onload = function(e) {
                        readBinaryFile(e.target.result, importInput.files[i].webkitRelativePath, thisWorldId)
                    }

                    fileReader.readAsText(importInput.files[i])
                } else {
                    readBinaryFile(importInput.files[i], importInput.files[i].webkitRelativePath, thisWorldId)
                }
            }
        }

        updateWorldList()
    })
})

exportButton.addEventListener("click", () => {
    worlds[currentWorld].saveAsFile()
})

exportButton2.addEventListener("click", () => {
    worlds[currentWorld].saveAsFile(true)
})

helpButton.addEventListener("click", () => {
    (<HTMLDialogElement>document.getElementById("dialog-help")).showModal()
})

closeDialogButton.addEventListener("click", () => {
    (<HTMLDialogElement>document.getElementById("dialog-help")).close()
})

worldSettingsButton.addEventListener("click", () => {
    for (let key in worlds[currentWorld]) {
        if (document.getElementById("world-settings-" + key)) {
            if (typeof(worlds[currentWorld][key]) != "object") {
                (<HTMLInputElement>document.getElementById("world-settings-" + key)).value = worlds[currentWorld][key]
            } else {
                (<HTMLInputElement>document.getElementById("world-settings-" + key)).value = JSON.stringify(worlds[currentWorld][key])
            }
        }
    }
    (<HTMLDialogElement>document.getElementById("dialog-world-settings")).showModal()
})

closeWorldSettingsDialogButton.addEventListener("click", () => {
    (<HTMLDialogElement>document.getElementById("dialog-world-settings")).close()
})

examplesButton.addEventListener("click", () => {
    (<HTMLDialogElement>document.getElementById("dialog-examples")).showModal()
})

closeExamplesDialogButton.addEventListener("click", () => {
    (<HTMLDialogElement>document.getElementById("dialog-examples")).close()
})

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