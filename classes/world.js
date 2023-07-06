class World {
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

    getChunkIndexAt(x,y) {
        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === x && this.chunks[i].y === y) {
                return i
            }
        }
        return null
    }

    getChunkAt(x,y) {
        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === x && this.chunks[i].y === y) {
                return this.chunks[i]
            }
        }
        return null
    }

    getChunkPosAtWorldPos(x,y) {
        let chunkX = Math.floor(x / 160)
        let chunkY = Math.floor(y / 160) * -1 -1

        return {"x": chunkX, "y": chunkY}
    }

    getChunkAtWorldPos(x,y) {
        let chunkWorldPos = this.getChunkPosAtWorldPos(x,y)
        let chunkX = chunkWorldPos.x
        let chunkY = chunkWorldPos.y

        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === chunkX && this.chunks[i].y === chunkY) {
                return this.chunks[i]
            }
        }
        return null
    }

    getChunkPosAtScreenPos(canvas, x, y) {
        let worldPos = this.camera.screenPosToWorldPos(canvas, x,y)
        let wx = worldPos.x
        let wy = worldPos.y

        wx = wx / 160
        wy = wy / 160

        wx = Math.floor(wx)
        wy = Math.floor(wy)

        wy *= -1
        wy -= 1

        return {"x": wx, "y": wy}
    }

    getChunkAtScreenPos(canvas, x, y) {
        let pos = this.getChunkPosAtScreenPos(canvas, x, y)
        return this.getChunkAt(pos.x, pos.y)
    }

    removeChunkAt(x,y) {
        let chunkIndex = this.getChunkIndexAt(x,y)
        if (chunkIndex != null) {
            this.chunks.splice(chunkIndex,1)
        }
    }

    addChunk(chunk) {
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