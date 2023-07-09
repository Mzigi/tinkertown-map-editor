"use-strict";
// @ts-check

var worlds: Array<World> = [new World()]
var uneditedFiles = {}
var currentWorld: number = 0

let newButton: any = document.getElementById("navbar-new")
let importInput: any = document.getElementById("navbar-import")
let exportButton: any = document.getElementById("navbar-export")
let helpButton: any = document.getElementById("navbar-help")
let worldSettingsButton: any = document.getElementById("navbar-world-settings")

let closeDialogButton: any = document.getElementById("close-dialog-help")
let closeWorldSettingsDialogButton: any = document.getElementById("close-dialog-world-settings")

const readBinaryFile = async (file: any, filePath: string) => {
    if (filePath.endsWith(".dat") && filePath.includes("_") && filePath.split("/").length < 3) { //chunk
        const buffer: ArrayBuffer = await file.arrayBuffer()

        let loadedChunk: Chunk = new Chunk()
        loadedChunk.fromBuffer(buffer)
        worlds[currentWorld].addChunk(loadedChunk)
        worlds[currentWorld].chunkCache[filePath] = buffer
    } else if (filePath.endsWith("world.meta")) { //world.meta
        let worldMeta: any = JSON.parse(file)
        worlds[currentWorld].name = worldMeta.name
        worlds[currentWorld].seed = worldMeta.seed
        worlds[currentWorld].version = worldMeta.version
        worlds[currentWorld].highestUsedVersion = worldMeta.highestUsedVersion
        worlds[currentWorld].hasBeenGenerated = worldMeta.hasBeenGenerated
    } else if (filePath.endsWith("settings.meta")) { //settings.meta
        let settingsMeta: any = JSON.parse(file)
        worlds[currentWorld].progression = settingsMeta.progression
        worlds[currentWorld].friendlyFire = settingsMeta.friendlyFire
        worlds[currentWorld].forestBarrierBroken = settingsMeta.forestBarrierBroken
        worlds[currentWorld].timescale = settingsMeta.timescale
        worlds[currentWorld].NPCsOff = settingsMeta.NPCsOff
        worlds[currentWorld].additionalParams = settingsMeta.additionalParams
    } else {
        const buffer: ArrayBuffer = await file.arrayBuffer()

        console.log("Editor doesn't know how to read " + filePath)
        uneditedFiles[filePath] = buffer
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
    worlds[currentWorld] = new World()
    uneditedFiles = {}
})

importInput.addEventListener("change", () => {
    if (importInput.files.length > 0) {
        worlds[currentWorld] = new World()
        uneditedFiles = {}
        for (let i = 0; i < importInput.files.length; i++) {
            //console.log(importInput.files[i].webkitRelativePath)
            if (importInput.files[i].webkitRelativePath.endsWith(".dat")) {
                readBinaryFile(importInput.files[i], importInput.files[i].webkitRelativePath)
            } else if (importInput.files[i].webkitRelativePath.endsWith(".meta")) {
                let fileReader = new FileReader()

                fileReader.onload = function(e) {
                    readBinaryFile(e.target.result, importInput.files[i].webkitRelativePath)
                }

                fileReader.readAsText(importInput.files[i])
            } else {
                readBinaryFile(importInput.files[i], importInput.files[i].webkitRelativePath)
            }
        }
    }
})

exportButton.addEventListener("click", () => {
    worlds[currentWorld].saveAsFile()
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