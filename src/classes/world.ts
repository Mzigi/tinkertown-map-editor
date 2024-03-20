"use-strict";
// @ts-check

//javascript globals
declare var JSZip: any
declare var saveAs: any

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

function readWorldVersion(view: simpleView): worldVersion {
    let version: worldVersion = {
        "Major": 0,
        "Minor": 0,
        "Patch": 0,
        "Build": "",
    }

    version.Major = view.readInt32()
    version.Minor = view.readInt32()
    version.Patch = view.readInt32()
    version.Build = view.readUtf8String()

    return version
}

function writeWorldVersion(view: simpleView, version: worldVersion) {
    view.writeInt32(version.Major)
    view.writeInt32(version.Minor)
    view.writeInt32(version.Patch)
    if (version.Build) {
        view.writeUtf8String(version.Build)
    } else {
        view.writeUint32(0)
    }
}

class World {
    containers: Array<Inventory>
    chunks: Array<Chunk>
    camera: Camera

    xMin: number
    yMin: number
    xMax: number
    yMax: number

    name: string
    seed: number

    version: worldVersion
    highestUsedVersion: worldVersion
    hasBeenGenerated: boolean

    progression: boolean
    friendlyFire: boolean
    forestBarrierBroken: boolean
    timescale: number
    NPCsOff: boolean
    additionalParams: Array<string>

    chunkCache: Object
    toolHistory: any
    hidden: boolean
    highlightedChunk: Chunk | null

    constructor() {
        this.reset()
    }

    reset() {
        this.containers = []
        this.chunks = []
        this.camera = new Camera()
        this.camera.world = this

        this.xMin = 0
        this.yMin = 0
        this.xMax = 1
        this.yMax = 1

        //world meta
        this.seed = Math.floor(Math.random() * 9999)
        this.name = "world" + this.seed
        this.version = {"Major":1,"Minor":0,"Patch":0,"Build":"\u0000"}
        this.highestUsedVersion = {"Major":0,"Minor":0,"Patch":0,"Build":"\u0000"}
        this.hasBeenGenerated = true

        //settings meta
        this.progression = false
        this.friendlyFire = true
        this.forestBarrierBroken = true
        this.timescale = 72
        this.NPCsOff = false
        this.additionalParams = [
            "AmongUs",
            "TinaIsAFreeFarmer"
        ]

        //editor only
        this.chunkCache = {}
        this.toolHistory = [
            {"chunks": []},
        ]
        this.hidden = false
        this.highlightedChunk = null
    }

    getId(): number {
        let id = 0

        for (let i = 0; i < worlds.length; i++) {
            if (worlds[i] == this) {
                id = i
            }
        }

        return id
    }

    clearChunks() {
        this.chunks = []
    }

    getChunkIndexAt(x: number,y: number): number | null {
        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === x && this.chunks[i].y === y) {
                return i
            }
        }
        return null
    }

    getChunkAt(x: number, y: number): Chunk | null {
        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === x && this.chunks[i].y === y) {
                return this.chunks[i]
            }
        }
        return null
    }

    getChunkPosAtWorldPos(x: number, y: number): Vector2 {
        let chunkX: number = Math.floor(x / 160)
        let chunkY: number = Math.floor(y / 160) * -1 -1

        return {"x": chunkX, "y": chunkY}
    }

    getWorldPosAtChunkPos(x: number, y: number): Vector2 {
        let worldX: number = x * 160
        let worldY: number = y * 160 * -1 -1

        return {"x": worldX, "y": worldY}
    }

    getWorldPosAtChunk(chunk: Chunk): Vector2 {
        return this.getWorldPosAtChunkPos(chunk.x, chunk.y)
    }

    getChunkAtWorldPos(x: number,y: number): Chunk | null {
        let chunkWorldPos: Vector2 = this.getChunkPosAtWorldPos(x,y)
        let chunkX: number = chunkWorldPos.x
        let chunkY: number = chunkWorldPos.y

        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === chunkX && this.chunks[i].y === chunkY) {
                return this.chunks[i]
            }
        }
        return null
    }

    getChunkPosAtScreenPos(canvas: HTMLCanvasElement, x: number, y: number): Vector2 {
        let worldPos: Vector2 = this.camera.screenPosToWorldPos(canvas, x,y)
        let wx: number = worldPos.x
        let wy: number = worldPos.y

        wx = wx / 160
        wy = wy / 160

        wx = Math.floor(wx)
        wy = Math.floor(wy)

        wy *= -1
        wy -= 1

        return {"x": wx, "y": wy}
    }

    getChunkAtScreenPos(canvas: HTMLCanvasElement, x: number, y: number): Chunk | null {
        let pos = this.getChunkPosAtScreenPos(canvas, x, y)
        return this.getChunkAt(pos.x, pos.y)
    }

    removeChunkAt(x: number,y: number) {
        let chunkIndex: any = this.getChunkIndexAt(x,y)
        if (chunkIndex != null) {
            this.chunks.splice(chunkIndex,1)
        }
    }

    addChunk(chunk: Chunk) {
        this.xMin = Math.min(this.xMin, chunk.x)
        this.xMax = Math.max(this.xMax, chunk.x)

        this.yMin = Math.min(this.yMin, chunk.y)
        this.yMax = Math.max(this.yMax, chunk.y)

        this.removeChunkAt(chunk.x,chunk.y)

        this.chunks.push(chunk)
    }

    fromBuffer(worldBuffer: ArrayBuffer, byteOffset: number) {
        this.reset()

        let view: simpleView = new simpleView(worldBuffer)
        view.viewOffset = byteOffset

        //world meta
        this.name = view.readUtf8String()
        this.seed = view.readInt32()
        this.version = readWorldVersion(view)
        this.highestUsedVersion = readWorldVersion(view)
        this.hasBeenGenerated = view.readByteBool()

        //settings meta
        this.progression = view.readByteBool()
        this.friendlyFire = view.readByteBool()
        this.forestBarrierBroken = view.readByteBool()
        this.timescale = view.readInt32()
        this.NPCsOff = view.readByteBool()

        this.additionalParams = []
        let additionalParamsLength = view.readUint16()
        for (let i = 0; i < additionalParamsLength; i++) {
            this.additionalParams.push(view.readUtf8String())
        }

        //chunks
        let chunksLength = view.readUint32()
        let chunkByteOffset = 0

        for (let i = 0; i < chunksLength; i++) {
            let chunk = new Chunk()
            chunk.fromBuffer(view.buffer.slice(view.viewOffset + chunkByteOffset))
            chunkByteOffset += chunk.getByteSize()

            this.xMin = Math.min(this.xMin, chunk.x)
            this.yMin = Math.min(this.yMin, chunk.y)

            this.xMax = Math.max(this.xMax, chunk.x)
            this.yMax = Math.max(this.yMax, chunk.y)

            this.chunks.push(chunk)
        }

        view.viewOffset += chunkByteOffset

        if (view.viewOffset - view.buffer.byteLength != 0) {
            //storage
            let containersLength = view.readUint16()
            for (let i = 0; i < containersLength; i++) {
                let container = new Inventory()
                container.fromBuffer(view.buffer.slice(view.viewOffset))
                view.viewOffset += container.getByteSize()

                this.containers.push(container)
            }
        }

        updateWorldList()
    }

    writeToBuffer(writeBuffer: ArrayBuffer, byteOffset: number) {
        let view: simpleView = new simpleView(writeBuffer)
        view.viewOffset = byteOffset

        //world meta
        view.writeUtf8String(this.name)
        view.writeInt32(this.seed)
        writeWorldVersion(view, this.version)
        writeWorldVersion(view, this.highestUsedVersion)
        view.writeByteBool(this.hasBeenGenerated)

        //settings meta
        view.writeByteBool(this.progression)
        view.writeByteBool(this.friendlyFire)
        view.writeByteBool(this.forestBarrierBroken)
        view.writeInt32(this.timescale)
        view.writeByteBool(this.NPCsOff)
        view.writeUint16(this.additionalParams.length)
        for (let i = 0; i < this.additionalParams.length; i++) {
            view.writeUtf8String(this.additionalParams[i])
        }

        //chunks
        let chunkByteOffset = 0

        view.writeUint32(this.chunks.length)
        for (let i = 0; i < this.chunks.length; i++) {
            this.chunks[i].writeToBuffer(view.buffer, view.viewOffset + chunkByteOffset)
            chunkByteOffset += this.chunks[i].getByteSize()
        }

        //containers
        view.viewOffset += chunkByteOffset
        view.writeUint16(this.containers.length)
        for (let i = 0; i < this.containers.length; i++) {
            this.containers[i].writeToBuffer(view.buffer, view.viewOffset)
            view.viewOffset += this.containers[i].getByteSize()
        }
    }

    getByteSize(): number {
        //versions
        let versionByteSize: number = 16
        if (this.version.Build) {
            versionByteSize += this.version.Build.length
        }

        let highestUsedVersionByteSize: number = 16
        if (this.highestUsedVersion.Build) {
            highestUsedVersionByteSize += this.highestUsedVersion.Build.length
        }

        //additional params
        let additionalParamsByteSize: number = 2 + this.additionalParams.length * 4
        for (let i = 0; i < this.additionalParams.length; i++) {
            additionalParamsByteSize += this.additionalParams[i].length
        }

        //chunks
        let chunksByteSize: number = 0
        for (let i = 0; i < this.chunks.length; i++) {
            chunksByteSize += this.chunks[i].getByteSize()
        }

        //containers
        let containersByteSize: number = 0
        for (let i = 0; i < this.containers.length; i++) {
            containersByteSize += this.containers[i].getByteSize()
        }

        return 4 + this.name.length + 4 + versionByteSize + highestUsedVersionByteSize + 1 + 1 + 1 + 1 + 4 + 1 + 2 + additionalParamsByteSize + 4 + chunksByteSize + 2 + containersByteSize
    }

    saveAsFile() {
        let zip = new JSZip()

        //chunks
        for (let i = 0; i < this.chunks.length; i++) {
            let chunk = this.chunks[i]

            if (chunk.chunkHasBeenEdited || this.chunkCache[this.name + "/" + chunk.x + "_" + chunk.y + ".dat"] == null) {
                let buffer = new ArrayBuffer(chunk.getByteSize())
                chunk.writeToBuffer(buffer,0)
                zip.file(chunk.x + "_" + chunk.y + ".dat", buffer, {"binary":true})
                //saveByteArray([buffer], chunk.x + "_" + chunk.y + ".dat")
            } else {
                let buffer = this.chunkCache[this.name + "/" + chunk.x + "_" + chunk.y + ".dat"]
                zip.file(chunk.x + "_" + chunk.y + ".dat", buffer, {"binary":true})
            }
        }

        //storage
        for (let i = 0; i < this.containers.length; i++) {
            let container = this.containers[i]

            let buffer = new ArrayBuffer(container.getByteSize())
            container.writeToBuffer(buffer, 0)
            zip.file(container.getFileName() + "inventory.dat", buffer, {"binary":true})
        }

        //world meta
        zip.file("world.meta", JSON.stringify(
            {
                "name": this.name,
                "seed": this.seed,
                "version": this.version,
                "highestUsedVersion": this.highestUsedVersion,
                "hasBeenGenerated": this.hasBeenGenerated,
            }
        ))
        //settings meta
        zip.file("settings.meta", JSON.stringify(
            {
                "progression": this.progression,
                "friendlyFire": this.friendlyFire,
                "forestBarrierBroken": this.forestBarrierBroken,
                "timescale": this.timescale,
                "NPCsOff": this.NPCsOff,
                "additionalParams": this.additionalParams,
            }
        ))

        //unknown files
        for (let key in uneditedFiles) {
            let fileBuffer = uneditedFiles[key]
            zip.file(key.replace(this.name + "/",""), fileBuffer, {"binary": true})
        }

        //save the zip
        let world = this

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            // see FileSaver.js
            saveAs(content, world.name + ".zip");
        });
    }

    saveAsBufferFile() {
        let worldBuffer = new ArrayBuffer(this.getByteSize())
        this.writeToBuffer(worldBuffer, 0)

        saveByteArray([worldBuffer], this.name + ".ttworld")
    }

    undoOnce() {
        for (let i = 0; i < this.toolHistory[this.toolHistory.length - 2].chunks.length; i++) {
            let chunk = this.toolHistory[this.toolHistory.length - 2].chunks[i]
            console.log(chunk)
            this.addChunk(chunk.clone())
        }

        this.toolHistory.pop()
        this.toolHistory.pop()

        this.toolHistory.push({"chunks":[]})
    }
}