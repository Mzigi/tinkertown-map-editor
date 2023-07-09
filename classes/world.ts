"use-strict";
// @ts-check

//javascript globals
declare var JSZip: any
declare var saveAs: any

class World {
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

    constructor() {
        this.chunks = []
        this.camera = new Camera()

        this.xMin = 0
        this.yMin = 0
        this.xMax = 1
        this.yMax = 1

        //world meta
        this.name = "world" + Math.floor(Math.random() * 9999)
        this.seed = 0
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

    getChunkAt(x: number,y: number): Chunk | null {
        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === x && this.chunks[i].y === y) {
                return this.chunks[i]
            }
        }
        return null
    }

    getChunkPosAtWorldPos(x: number,y: number): Vector2 {
        let chunkX: number = Math.floor(x / 160)
        let chunkY: number = Math.floor(y / 160) * -1 -1

        return {"x": chunkX, "y": chunkY}
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
}