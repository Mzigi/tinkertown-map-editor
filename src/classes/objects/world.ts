import { Loader } from "../../application-components/loader.js";
import { item_assetInfo } from "../../libraries/item-assetInfoToJson.js";
import { Camera } from "../camera.js";
import { DebugTimer } from "../debug-timer.js";
import { simpleView } from "../simpleView.js";
import { ToolHistory } from "../tools/tool-info.js";
import { Chunk } from "./chunk.js";
import { Inventory, InventoryFormat } from "./inventory.js";
import { InventoryItem } from "./inventoryItem.js";
import { Item } from "./item.js";
import { Tile } from "./tile.js";

//javascript globals 
declare var JSZip: any
declare var saveAs: any
declare var initSqlJs: any

declare var updateWorldList //bad solution

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

async function Wait(time: number): Promise<Number> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(time)
        }, time)
    })
}

function uuid() {
    return (1e7.toString()+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)
    );
}

class PlayerSave {
    puid: string
    
    health: number
    mana: number

    spawnPointX: number
    spawnPointY: number

    deathPointX: number
    deathPointY: number

    positionX: number
    positionY: number

    fromObject(playerSaveData: any) {
        this.puid = playerSaveData.Puid

        this.health = playerSaveData.Health
        this.mana = playerSaveData.Mana
        
        this.spawnPointX = playerSaveData.SpawnPointX
        this.spawnPointY = playerSaveData.SpawnPointY

        this.deathPointX = playerSaveData.DeathPointX
        this.deathPointY = playerSaveData.DeathPointY

        this.positionX = playerSaveData.PositionX
        this.positionY = playerSaveData.PositionY
    }
}

class BuildingDTO {
    id: string

    bottomLeft: Vector2
    topRight: Vector2

    rootX: number
    rootY: number
    rootZ: number

    townianId: number

    tilePositions: Array<Vector3>

    fromObject(buildingDTOData: any) {
        this.id = buildingDTOData.id

        this.bottomLeft = {"x": buildingDTOData.boundingboxbottomleftx, "y": buildingDTOData.boundingboxbottomlefty}
        this.topRight = {"x": buildingDTOData.boundingboxtoprightx, "y": buildingDTOData.boundingboxtoprighty}

        this.rootX = buildingDTOData.rootpositionx
        this.rootY = buildingDTOData.rootpositiony
        this.rootZ = buildingDTOData.rootpositionz

        this.townianId = buildingDTOData.townianid

        this.tilePositions = []
    }
}

class PointOfInterest {
    id: number
    type: number
    questId: string
    position: Vector2
    revealedForAllPlayers: number

    fromObject(pointOfInterestData: any) {
        this.id = pointOfInterestData.id
        this.type = pointOfInterestData.type
        this.questId = pointOfInterestData.questID
        this.position = {"x": pointOfInterestData.tilepositionx, "y": pointOfInterestData.tilepositiony}
        this.revealedForAllPlayers = pointOfInterestData.RevealedForAllPlayers
    }
}

class DiscoveryPointOfInterest { //i dont know what this actually is
    position: Vector2
    discoverer: string
    questId: string
    
    fromObject(discovererPOIData: any) {
        this.position = {"x": discovererPOIData.tilepositionx, "y": discovererPOIData.tilepositiony}
        this.discoverer = discovererPOIData.discoverer
        this.questId = discovererPOIData.questID
    }
}

class MinimapValue {
    position: Vector2
    tileAssetId: number
    dungeon: number

    fromObject(minimapValueData: any) {
        this.position = {"x": minimapValueData.x, "y": minimapValueData.y}
        this.tileAssetId = minimapValueData.tileAssetID
        this.dungeon = minimapValueData.dungeon
    }
}

export enum WorldFormat {
    Binary,
    Database,
}

export class World {
    playerSaves: {[key: string]: PlayerSave}

    containers: Array<Inventory> //tile containers
    otherContainers: {[key: string]: Inventory}

    chunks: Array<Chunk>
    dungeons: {[key: number]: Array<Chunk>}

    buildingDTOs: {[key: string]: BuildingDTO}
    pointsOfInterest: Array<PointOfInterest>
    discoveryPointsOfInterest: Array<DiscoveryPointOfInterest>
    minimapData: Array<MinimapValue>

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

    entrancePoint: Vector2

    //editor only
    chunkCache: Object
    toolHistory: any //deprecated
    private history: Array<ToolHistory>
    private historyIndex: number
    hidden: boolean
    highlightedChunk: Chunk | null
    camera: Camera
    format: WorldFormat
    uneditedFiles: {[key: string]: ArrayBuffer}
    selection: Array<Vector2>
    id: number
    loader: Loader
    recentlyEdited: boolean
    massInsertCache: {[key: string]: string}

    constructor(id: number, loader: Loader) {
        this.id = id
        this.loader = loader
        this.reset()
    }

    reset() {
        this.playerSaves = {}
        
        this.containers = []
        this.otherContainers = {}

        this.chunks = []
        this.dungeons = {}

        this.buildingDTOs = {}
        this.pointsOfInterest = []
        this.discoveryPointsOfInterest = []
        this.minimapData = []

        this.xMin = 0
        this.yMin = 0
        this.xMax = 1
        this.yMax = 1

        //world meta
        this.seed = Math.floor(Math.random() * 9999)
        this.name = "World " + this.seed
        this.version = {"Major":2,"Minor":0,"Patch":3,"Build":"\u0000"}
        this.highestUsedVersion = {"Major":2,"Minor":0,"Patch":3,"Build":"\u0000"}
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

        //dungeon meta
        this.entrancePoint = {"x": 0, "y": 0}

        //editor only
        this.chunkCache = {}
        this.toolHistory = [
            {"chunks": []},
        ]
        this.history = []
        this.historyIndex = 0
        this.hidden = false
        this.highlightedChunk = null
        this.camera = new Camera(this.loader)
        this.camera.world = this
        this.format = WorldFormat.Database
        this.uneditedFiles = {}
        this.selection = []
        this.recentlyEdited = false
        this.massInsertCache = {}
    }

    getId(): number {
        return this.id
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

    getChunkAt(x: number, y: number, chunksArray = this.chunks): Chunk | null {
        for (let i = 0; i < chunksArray.length; i++) {
            if (chunksArray[i].x === x && chunksArray[i].y === y) {
                return chunksArray[i]
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

    getChunkAndTilePosAtGlobalPos(x: number, y: number): Vector2[] {
        let chunkPos = {"x": Math.floor(x / 10), "y": Math.floor(y / 10)}

        let newX = Math.abs(x % 10)
        let newY = Math.abs(y % 10)

        if (x < 0) {
            newX = (9 - newX + 1) % 10
        }

        if (y < 0) {
            newY = (9 - newY + 1) % 10
        }

        return [chunkPos, {"x": newX, "y": newY}]
    }

    getGlobalPosAtChunkAndTilePos(chunkX: number, chunkY: number, tileX: number, tileY: number): Vector2 {
        return {"x": tileX + chunkX * 10, "y": tileY + chunkY * 10}
    }

    getContainerIndexAt(x: number, y: number, z: number): null | number {
        let chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y)

        for (let i = 0; i < this.containers.length; i++) {
            let container = this.containers[i]

            if (container.chunkX == chunkAndTilePos[0].x &&
                container.chunkY == chunkAndTilePos[0].y &&
                container.x == chunkAndTilePos[1].x &&
                container.y == chunkAndTilePos[1].y &&
                container.z == z
            ) {
                return i
            }
        }
    }

    getContainerAt(x: number, y: number, z: number): Inventory | null {
        let containerIndex = this.getContainerIndexAt(x,y,z)
        
        if (containerIndex) {
            return this.containers[containerIndex]
        }
    }

    findTilesAtGlobalPos(x: number, y: number): Array<Tile> {
        let chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y)

        let chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y)

        if (chunk) {
            return chunk.findTilesAtXY(chunkAndTilePos[1].x, chunkAndTilePos[1].y)
        } else {
            return []
        }
    }

    findTileAtGlobalPos(x: number, y: number, z: number): Tile | null {
        let tiles = this.findTilesAtGlobalPos(x, y)

        for (let tile of tiles) {
            if (tile.z === z) {
                return tile
            }
        }
    }

    setTileAtGlobalPos(tile: Tile, x: number, y: number): [Chunk, boolean] {
        let chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y)
        let chunkPos = chunkAndTilePos[0]
        let tilePos = chunkAndTilePos[1]

        tile.x = tilePos.x
        tile.y = tilePos.y

        let newTileInfo = this.setTile(tile, chunkPos.x, chunkPos.y)

        return newTileInfo
    }

    removeTileAtGlobalPos(x: number, y: number, z: number): Tile | null {
        let chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y)
        let tilePos = chunkAndTilePos[1]

        let chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y)

        if (chunk) {
            return chunk.removeTileAt(tilePos.x, tilePos.y, z)
        }
    }

    removeTilesAtGlobalPosXY(x: number, y: number): Array<Tile> {
        let chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y)
        let tilePos = chunkAndTilePos[1]

        let chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y)

        let removedTiles = []

        if (chunk) {
            for (let tile of chunk.findTilesAtXY(tilePos.x, tilePos.y)) {
                removedTiles.push(chunk.removeTileAt(tile.x, tile.y, tile.z))
            }
        }

        return removedTiles
    }

    setTile(tile: Tile, chunkX: number, chunkY: number): [Chunk, boolean] {
        let createdChunk = false

        let chunk = this.getChunkAt(chunkX, chunkY)
        if (!chunk) {
            chunk = new Chunk()
            chunk.x = chunkX
            chunk.y = chunkY
            this.addChunk(chunk)
            createdChunk = true
        }

        chunk.setTile(tile)

        return [chunk, createdChunk]
    }

    setItem(item: Item) {
        let chunk = this.getChunkAt(item.chunkX, item.chunkY)
        if (!chunk) {
            chunk = new Chunk()
            chunk.x = item.chunkX
            chunk.y = item.chunkY
            this.addChunk(chunk)
        }

        chunk.itemDataList.push(item)
        chunk.edited()
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

    addChunkDungeon(chunk: Chunk, dungeonId: number) {
        if (!this.dungeons[dungeonId]) {
            this.dungeons[dungeonId] = []
        }

        this.dungeons[dungeonId].push(chunk)
    }

    fillWithContainers() {
        let containerSize = 8

        let placedItems = 0
        let placedContainers = 1
        let currentContainer = new Inventory()
        currentContainer.chunkX = 0
        currentContainer.chunkY = 0
        currentContainer.x = 0
        currentContainer.y = 0
        currentContainer.height = containerSize
        currentContainer.width = containerSize
        this.containers.push(currentContainer)

        for (let item in item_assetInfo) {
            console.log(item)
            if (Math.floor(placedItems / (containerSize*containerSize)) != placedContainers - 1) {
                currentContainer = new Inventory()
                //currentContainer.chunkX = Math.floor((placedContainers * 2) / 10)
                currentContainer.chunkX = 0
                currentContainer.chunkY = 0
                currentContainer.x = (placedContainers * 2) % 10
                currentContainer.y = Math.floor(placedContainers / 5) * 2
                currentContainer.height = containerSize
                currentContainer.width = containerSize
                this.containers.push(currentContainer)
                placedContainers += 1
            }
            
            currentContainer.setIdAtSlot(placedItems % (containerSize*containerSize), Number(item_assetInfo[item].uniqueID))
            currentContainer.setCountAtSlot(placedItems % (containerSize*containerSize), 999)

            placedItems += 1
        }
    }

    countTiles(): number {
        let tileCount: number = 0

        for (let chunk of this.chunks) {
            for (let tile of chunk.getTiles()) {
                tileCount += 1
            }
        }

        return tileCount
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

        this.loader.updateWorldList()
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

    async saveAsFile(isDatabase = false, isDungeon = false, hasItemPalette = true) {
        try {
            let zip = new JSZip()

            //unknown files
            if (!isDungeon) { //editor knows how to read all files used in dungeons
                for (let key in this.uneditedFiles) {
                    let fileBuffer = this.uneditedFiles[key]
                    let fileWorldName = key.split("/")[0]
                    zip.file(key.replace(fileWorldName + "/",""), fileBuffer, {"binary": true})
                }
            }

            if (!isDungeon) {
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
            } else {
                let maxChunkX = 0
                let maxChunkY = 0
                
                for (let chunk of this.chunks) {
                    if (chunk.getTiles().length > 0) {
                        if (chunk.x > maxChunkX) {
                            maxChunkX = chunk.x
                        }
                        
                        if (chunk.y > maxChunkY) {
                            maxChunkY = chunk.y
                        }

                        if (chunk.y < 0 || chunk.x < 0) {
                            throw new Error("Chunk X or Y can't be negative when exporting map as Dungeon")
                        }
                    }
                }

                zip.file("DungeonMeta.metadat", JSON.stringify(
                    {
                        "title": this.name,
                        "boundingBox": [maxChunkX, maxChunkY],
                        "entrancePoint":[this.entrancePoint.x, this.entrancePoint.y]
                    }
                ))
            }

            if (!isDatabase || isDungeon) {
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

                if (!isDungeon) {
                    //storage
                    for (let i = 0; i < this.containers.length; i++) {
                        let container = this.containers[i]

                        let buffer = new ArrayBuffer(container.getByteSize())
                        container.writeToBuffer(buffer, 0)
                        zip.file(container.getFileName() + "inventory.dat", buffer, {"binary":true})
                    }
                }
            }
            
            if (isDatabase) {
                let buffer = ((await this.toDatabase(isDungeon, hasItemPalette)).export()).buffer
                zip.file(isDungeon ? "MapAddition.db" : "backups/world.dat", buffer, {"binary":true})
            }

            //save the zip
            let world = this

            zip.generateAsync({type:"blob"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, world.name + ".zip");
            });

            this.recentlyEdited = false
        } catch (error) {
            if (this.loader) {
                this.loader.alertText("Failed to export world: " + error, true, 6)
            }
            let exportingDialog: HTMLDialogElement | null = <HTMLDialogElement>document.getElementById("dialog-exporting")

            exportingDialog.close()
        }
    }

    saveAsBufferFile() {
        let worldBuffer = new ArrayBuffer(this.getByteSize())
        this.writeToBuffer(worldBuffer, 0)

        saveByteArray([worldBuffer], this.name + ".ttworld")
    }

    async fromDatabase(db: any, isDungeon: boolean) {
        let loadingDialog: HTMLDialogElement | null = <HTMLDialogElement>document.getElementById("dialog-loading")
        
        if (loadingDialog) {
            loadingDialog.showModal()
        }

        await Wait(1)

        console.log(db)

        //get table list
        let existingTables = []

        let allTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'")
        while (allTables.step()) {
            existingTables.push(allTables.getAsObject().name)
        }
        allTables.free()

        //load tiles
        let dbTileData = db.prepare("SELECT * FROM Tiles")

        while (dbTileData.step()) {
            let tileData = dbTileData.getAsObject()

            let chunkPos = {"x": Math.floor(tileData.x / 10), "y": Math.floor(tileData.y / 10)}
            let chunk = this.getChunkAt(chunkPos.x, chunkPos.y)
            if (!chunk) {
                chunk = new Chunk()
                chunk.x = chunkPos.x
                chunk.y = chunkPos.y

                if (tileData.dungeon === 0) {
                    this.addChunk(chunk)
                } else {
                    console.log("Creating dungeon chunk")
                    this.addChunkDungeon(chunk, tileData.dungeon)
                }
            }

            let tile = new Tile()
            tile.fromObject(tileData)
            chunk.setTile(tile)
        }

        dbTileData.free()

        //biomes
        let dbBiomeEntryData = db.prepare("SELECT * FROM BiomeEntry")

        while (dbBiomeEntryData.step()) {
            let biomeEntryData = dbBiomeEntryData.getAsObject()

            let chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(biomeEntryData.X, biomeEntryData.Y)
            let chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y)

            if (chunk) {
                chunk.biomeID = biomeEntryData.Biome
            } else {
                console.warn(`Chunk missing for BiomeEntry at chunk [${biomeEntryData.X}, ${biomeEntryData.Y}]`)
            }
        }

        dbBiomeEntryData.free()

        if (!isDungeon) {
            let itemPaletteData = null

            if (existingTables.includes("Item")) {
                //load item palette
                itemPaletteData = {}

                let dbItemPaletteData = db.prepare("SELECT * FROM Item")

                while (dbItemPaletteData.step()) {
                    let itemPalette = dbItemPaletteData.getAsObject()

                    itemPaletteData[itemPalette.itemGuid] = {"id": itemPalette.itemAssetID, "count": itemPalette.count}
                }

                dbItemPaletteData.free()
            }

            //load world items (ground items)
            let dbWorldItemData = db.prepare("SELECT * FROM WorldItem")

            while (dbWorldItemData.step()) {
                let worldItemData = dbWorldItemData.getAsObject()

                let worldItem = new Item()
                worldItem.fromObject(worldItemData, itemPaletteData, this)

                let itemChunk = this.getChunkAt(worldItem.chunkX, worldItem.chunkY)

                if (itemChunk) {
                    itemChunk.itemDataList.push(worldItem)
                    itemChunk.resetCacheImage()
                } else {
                    console.warn(`Chunk missing for item at chunk [${worldItem.chunkX}, ${worldItem.chunkY}]`)
                }
            }

            dbWorldItemData.free()

            //load storage items
            let dbItemByInventory = db.prepare("SELECT * FROM ItemByInventory") // WHERE actorGuid = 'tile

            while (dbItemByInventory.step()) {
                let itemByInventory = dbItemByInventory.getAsObject()

                if (itemByInventory.actorGuid === "tile") { //container item
                    let container = this.getContainerAt(itemByInventory.tileX, itemByInventory.tileY, itemByInventory.tileZ)
                    if (!container) {
                        container = new Inventory()
                        container.width = 5 //TODO: make these the actual inventory size
                        container.height = 5
                        container.target = InventoryFormat.Container
                        
                        let containerChunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(itemByInventory.tileX, itemByInventory.tileY)
                        container.chunkX = containerChunkAndTilePos[0].x
                        container.chunkY = containerChunkAndTilePos[0].y
                        container.x = containerChunkAndTilePos[1].x
                        container.y = containerChunkAndTilePos[1].y
                        container.z = itemByInventory.tileZ
                        container.inventoryType = itemByInventory.inventoryType
                        container.target = InventoryFormat.Container

                        this.containers.push(container)
                    }

                    let item = new InventoryItem()
                    item.slot = itemByInventory.inventoryIndex
                    if (itemPaletteData) {
                        item.count = itemPaletteData[itemByInventory.itemGuid].count
                        item.id = itemPaletteData[itemByInventory.itemGuid].id
                    } else {
                        item.count = itemByInventory.count
                        item.id = itemByInventory.itemAssetID
                    }

                    container.addItem(item)
                } else { //player inventory (i hope), inventoryType = Armor or Inventory
                    let container = this.otherContainers[itemByInventory.actorGuid + "_" + itemByInventory.inventoryType]
                    if (!container) {
                        container = new Inventory()

                        //doing this because its probably a playevenventory container
                        container.width = 5
                        container.height = 5
                        container.target = InventoryFormat.Player
                        container.inventoryType = itemByInventory.inventoryType

                        this.otherContainers[itemByInventory.actorGuid + "_" + itemByInventory.inventoryType] = container
                    }

                    let item = new InventoryItem()
                    item.slot = itemByInventory.inventoryIndex
                    if (itemPaletteData) {
                        item.count = itemPaletteData[itemByInventory.itemGuid].count
                        item.id = itemPaletteData[itemByInventory.itemGuid].id
                    } else {
                        item.count = itemByInventory.count
                        item.id = itemByInventory.itemAssetID
                    }

                    container.addItem(item)
                }
            }

            dbItemByInventory.free()

            //load fogreveal
            let dbFogRevealData = db.prepare("SELECT * FROM FogReveal")

            while (dbFogRevealData.step()) {
                let fogRevealData = dbFogRevealData.getAsObject()

                let chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(fogRevealData.x, fogRevealData.y)

                //dungeon compatability
                let chunkArr = this.chunks
                if (fogRevealData.dungeon !== 0) {
                    chunkArr = this.dungeons[fogRevealData.dungeon]
                    if (!chunkArr) {
                        this.dungeons[fogRevealData.dungeon] = []
                        chunkArr = this.dungeons[fogRevealData.dungeon]
                    }
                }

                let chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y, chunkArr)

                if (chunk) {
                    chunk.revealed = true
                } else {
                    console.warn(`Chunk missing for FogReveal at chunk [${fogRevealData.x}, ${fogRevealData.y}] at dungeon ${fogRevealData.dungeon}`)
                }
            }

            dbFogRevealData.free()

            //player save
            let dbPlayerSaveData = db.prepare("SELECT * FROM PlayerSave")

            while (dbPlayerSaveData.step()) {
                let playerSaveData = dbPlayerSaveData.getAsObject()

                let playerSave = new PlayerSave()
                playerSave.fromObject(playerSaveData)

                this.playerSaves[playerSave.puid] = playerSave
            }

            dbPlayerSaveData.free()

            //BuildingDTO
            let dbBuildingDTOData = db.prepare("SELECT * FROM BuildingDTO")

            while (dbBuildingDTOData.step()) {
                let buildingDTOData = dbBuildingDTOData.getAsObject()

                let buildingDTO = new BuildingDTO()
                buildingDTO.fromObject(buildingDTOData)

                this.buildingDTOs[buildingDTO.id] = buildingDTO
            }

            dbBuildingDTOData.free()

            //BuildingTilesDTO
            let dbBuildingTilesDTO = db.prepare("SELECT * FROM BuildingTilesDTO")

            while (dbBuildingTilesDTO.step()) {
                let buildingTileDTOData = dbBuildingTilesDTO.getAsObject()

                let buildingDTOId = buildingTileDTOData.id
                let buildingDTO = this.buildingDTOs[buildingDTOId]

                if (buildingDTO) {
                    buildingDTO.tilePositions.push({"x": buildingTileDTOData.x, "y": buildingTileDTOData.y, "z": buildingTileDTOData.z})
                } else {
                    console.warn(`BuildingDTO ${buildingDTOId} missing for BuildingTileDTO at [${buildingTileDTOData.x}, ${buildingTileDTOData.y}, ${buildingTileDTOData.z}]`)
                }
            }

            dbBuildingTilesDTO.free()

            //poi
            let dbPOI = db.prepare("SELECT * FROM PointOfInterest")

            while (dbPOI.step()) {
                let POIData = dbPOI.getAsObject()

                let poi = new PointOfInterest()
                poi.fromObject(POIData)

                this.pointsOfInterest.push(poi)
            }

            dbPOI.free()

            //discovery poi (i dont know what this is)
            let dbDiscoveryPOI = db.prepare("SELECT * FROM DiscoveryPOI")

            while (dbDiscoveryPOI.step()) {
                let discoveryPOIData = dbDiscoveryPOI.getAsObject()

                let discoveryPOI = new DiscoveryPointOfInterest()
                discoveryPOI.fromObject(discoveryPOIData)

                this.discoveryPointsOfInterest.push(discoveryPOI)
            }

            dbDiscoveryPOI.free()

            //minimap (i dont know what this is)
            let dbMinimapData = db.prepare("SELECT * FROM Minimap")
            
            while (dbMinimapData.step()) {
                let minimapData = dbMinimapData.getAsObject()

                let minimapValue = new MinimapValue()
                minimapValue.fromObject(minimapData)

                this.minimapData.push(minimapValue)
            }

            dbMinimapData.free()
        }

        //finished loading
        if (loadingDialog) {
            loadingDialog.close()
        }

        db.close()

        console.log("Finished loading database world")
    }

    dbMassInsert(db: any, start: string, valueCount: number, values: Array<any>) {
        if (values.length > 0) {
            //create string like this (?,?,?)
            let toAddStr = "("

            for (let i = 0; i < valueCount; i++) {
                toAddStr += "?,"
            }

            toAddStr = toAddStr.slice(0,-1) + "), "

            //let endStr = toAddStr.repeat(values.length / valueCount)    //22.117s
            let endStr = ""        //22.072s
            for (let i = 0; i < values.length / valueCount; i++) {
                endStr += toAddStr
            }

            //create final string
            let finalStr = start + endStr.slice(0, -2) + ";"
            //run database command
            /*console.log(finalStr)
            console.log(values)
            console.log(values.length)*/

            db.run(finalStr, values)
        }
    }

    async dbCheckMassInsert(db: any, start: string, valueCount: number, values: Array<any>, isEnd: boolean, resetValues: any) {
        if ((values.length / valueCount >= 999 - valueCount) || (values.length > 0 && isEnd)) {
            this.dbMassInsert(db, start, valueCount, values)
            //exportingPercentageElement.innerText = `Exporting world ${Math.floor(percentStart + percentCurrent * (progress / progressMax))}%`
            resetValues()
            await Wait(0.001)
        }
    }

    addToItemPalette(itemPalette: any, itemGuid: string, itemAssetID: number, count: number): Array<any> {
        itemPalette.push(itemGuid, itemAssetID, count)
        return itemPalette
    }

    async toDatabase(isDungeon: boolean = false, hasItemPalette: boolean = true): Promise<any | null> {
        console.log("Started timer")
        let startTime = new Date().getTime()

        let SQL = window["SQL"]
        console.log(SQL)
        
        if (!SQL) {
            initSqlJs({locateFile: filename => `src/libraries/sql-wasm.wasm`}).then((SQL) => { 
                window["SQL"] = SQL
            })
            console.error("SQL was not initialized, it has been initialized now")
        }

        let exportingDialog: HTMLDialogElement | null = <HTMLDialogElement>document.getElementById("dialog-exporting")
        //let exportingPercentageElement: HTMLElement | null = document.getElementById("dialog-exporting-percentage")

        exportingDialog.showModal()

        if (SQL) {
            await Wait(1000 / 60) //to show dialog
            
            let db = new SQL.Database()

            // TILES
            let tilesTimer = new DebugTimer("Tiles")

            db.run("CREATE TABLE Tiles(x int, y int, z int, hp int DEFAULT 10, memA int, dungeon int, memB int, rotation int, tileAssetID int, PRIMARY KEY (x,y,z))")

            
            let start = "INSERT INTO Tiles (x,y,z,hp,memA,dungeon,memB,rotation,tileAssetID) VALUES "
            let values = []

            let resetValues = () => {
                values = []
            }

            //main world chunks
            for (let chunk of this.chunks) {
                for (let tile of chunk.getTiles()) {
                    let tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, tile.x, tile.y)

                    values.push(tilePos.x, tilePos.y, tile.z, tile.health, tile.memoryA, 0, tile.memoryB, tile.rotation, tile.tileAssetId)

                    await this.dbCheckMassInsert(db, start, 9, values, false, resetValues)
                }
            }

            //dungeon chunks
            for (let dungeonId in this.dungeons) {
                for (let chunk of this.dungeons[dungeonId]) {
                    for (let tile of chunk.getTiles()) {
                        let tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, tile.x, tile.y)

                        values.push(tilePos.x, tilePos.y, tile.z, tile.health, tile.memoryA, dungeonId, tile.memoryB, tile.rotation, tile.tileAssetId)

                        await this.dbCheckMassInsert(db, start, 9, values, false, resetValues)
                    }
                }
            }

            //end insert
            await this.dbCheckMassInsert(db, start, 9, values, true, resetValues)

            tilesTimer.log()

            //BIOME ENTRY
            let biomeEntryTimer = new DebugTimer("BiomeEntry")

            db.run(`CREATE TABLE BiomeEntry(X int, Y int, Biome int, PRIMARY KEY (X,Y))`)

            start = `INSERT INTO BiomeEntry (X,Y,Biome) VALUES `

            for (let chunk of this.chunks) {
                for (let x = 0; x < 10; x++) {
                    for (let y = 0; y < 10; y++) {
                        let tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, x, y)

                        values.push(tilePos.x, tilePos.y, chunk.biomeID)
                        await this.dbCheckMassInsert(db, start, 3, values, false, resetValues)
                    }
                }
            }

            await this.dbCheckMassInsert(db, start, 3, values, true, resetValues)

            biomeEntryTimer.log()

            if (!isDungeon) {
                if (hasItemPalette) {
                    // ITEMS
                    let itemsTimer = new DebugTimer("Items")
                    let itemPalette = []

                    db.run(`CREATE TABLE "Item" ('itemGuid' varchar primary key not null, 'itemAssetID' integer, 'count' integer)`)

                    // CONTAINERS AND INVENTORIES
                    db.run(`CREATE TABLE "ItemByInventory" ("tileX" integer ,"tileY" integer ,"tileZ" integer ,"actorGuid" varchar ,"inventoryType" integer ,"itemGuid" varchar primary key not null ,"inventoryIndex" integer )`)

                    start = "INSERT INTO ItemByInventory (tileX,tileY,tileZ,actorGuid,inventoryType,itemGuid,inventoryIndex) VALUES "

                    //containers
                    for (let container of this.containers) {
                        let tilePos = this.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y)

                        for (let item of container.itemDataList) {
                            let itemGuid = uuid()
                            this.addToItemPalette(itemPalette, itemGuid, item.id, item.count)

                            values.push(tilePos.x, tilePos.y, container.z, "tile", 0, itemGuid, item.slot)

                            await this.dbCheckMassInsert(db, start, 7, values, false, resetValues)
                        }
                    }

                    //player inventories
                    for (let otherContainerKey in this.otherContainers) {
                        let actorGuidAndInventoryType = otherContainerKey.split("_")
                        let actorGuid = actorGuidAndInventoryType[0]
                        let inventoryType = Number(actorGuidAndInventoryType[1])

                        let container = this.otherContainers[otherContainerKey]

                        for (let item of container.itemDataList) {
                            let itemGuid = uuid()
                            this.addToItemPalette(itemPalette, itemGuid, item.id, item.count)

                            values.push(0, 0, 0, actorGuid, inventoryType, itemGuid, item.slot)

                            await this.dbCheckMassInsert(db, start, 7, values, false, resetValues)
                        }
                    }

                    await this.dbCheckMassInsert(db, start, 7, values, true, resetValues)

                    itemsTimer.log()

                    // WORLD ITEMS
                    let worldItemsTimer = new DebugTimer("WorldItems")

                    db.run(`CREATE TABLE "WorldItem" ("worldPositionX" float ,"worldPositionY" float ,"itemGuid" varchar primary key not null )`)

                    start = `INSERT INTO WorldItem (worldPositionX,worldPositionY,itemGuid) VALUES `
                    
                    for (let chunk of this.chunks) {
                        for (let item of chunk.itemDataList) {
                            let tilePos = this.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y)

                            let itemGuid = uuid()
                            this.addToItemPalette(itemPalette, itemGuid, item.id, item.count)

                            values.push(tilePos.x, tilePos.y, itemGuid)
                            await this.dbCheckMassInsert(db, start, 3, values, false, resetValues)
                        }
                    }

                    await this.dbCheckMassInsert(db, start, 3, values, true, resetValues)

                    worldItemsTimer.log()

                    // ITEM PALETTE
                    let itemPaletteTimer = new DebugTimer("ItemPalette")

                    start = `INSERT INTO Item (itemGuid,itemAssetID,count) VALUES `

                    for (let i = 0; i < itemPalette.length; i += 3) {
                        values.push(itemPalette[i + 0], itemPalette[i + 1], itemPalette[i + 2])
                        await this.dbCheckMassInsert(db, start, 3, values, false, resetValues)
                    }

                    await this.dbCheckMassInsert(db, start, 3, values, true, resetValues)

                    itemPaletteTimer.log()
                } else { //2.0.3 and after
                    // CONTAINERS AND INVENTORIES
                    db.run(`CREATE TABLE "ItemByInventory" (tileX INTEGER, tileY INTEGER, tileZ INTEGER, actorGuid VARCHAR, inventoryType INTEGER, itemAssetID INTEGER, count INTEGER, inventoryIndex INTEGER)`)

                    start = "INSERT INTO ItemByInventory (tileX,tileY,tileZ,actorGuid,inventoryType,itemAssetID,count,inventoryIndex) VALUES "

                    //containers
                    for (let container of this.containers) {
                        let tilePos = this.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y)

                        for (let item of container.itemDataList) {
                            values.push(tilePos.x, tilePos.y, container.z, "tile", container.inventoryType, item.id, item.count, item.slot)

                            await this.dbCheckMassInsert(db, start, 8, values, false, resetValues)
                        }
                    }

                    //player inventories
                    for (let otherContainerKey in this.otherContainers) {
                        let actorGuidAndInventoryType = otherContainerKey.split("_")
                        let actorGuid = actorGuidAndInventoryType[0]
                        let inventoryType = Number(actorGuidAndInventoryType[1])

                        let container = this.otherContainers[otherContainerKey]

                        for (let item of container.itemDataList) {
                            values.push(0, 0, 0, actorGuid, inventoryType, item.id, item.count, item.slot)

                            await this.dbCheckMassInsert(db, start, 8, values, false, resetValues)
                        }
                    }

                    await this.dbCheckMassInsert(db, start, 8, values, true, resetValues)

                    // WORLD ITEMS
                    let worldItemsTimer = new DebugTimer("WorldItems")

                    db.run(`CREATE TABLE "WorldItem" ("worldPositionX" float ,"worldPositionY" float ,"itemGuid" varchar primary key not null , itemAssetID INTEGER NOT NULL DEFAULT 0, count INTEGER NOT NULL DEFAULT 0, dayDropped INTEGER DEFAULT 0)`)

                    start = `INSERT INTO WorldItem (worldPositionX,worldPositionY,itemGuid,itemAssetID,count,dayDropped) VALUES `
                    
                    for (let chunk of this.chunks) {
                        for (let item of chunk.itemDataList) {
                            let tilePos = this.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y)

                            let itemGuid = uuid()
                            
                            values.push(tilePos.x, tilePos.y, itemGuid, item.id, item.count, item.dayDropped)
                            await this.dbCheckMassInsert(db, start, 6, values, false, resetValues)
                        }
                    }

                    await this.dbCheckMassInsert(db, start, 6, values, true, resetValues)

                    worldItemsTimer.log()
                }

                // BUILDING DTO
                let buildingDTOTimer = new DebugTimer("BuildingDTO")

                db.run(`CREATE TABLE "BuildingDTO" ("id" varchar primary key not null ,"boundingboxbottomlefty" integer ,"boundingboxbottomleftx" integer ,"boundingboxtoprighty" integer ,"boundingboxtoprightx" integer ,"rootpositionx" integer ,"rootpositiony" integer ,"rootpositionz" integer ,"townianid" integer )`)

                start = `INSERT INTO BuildingDTO (id,boundingboxbottomlefty,boundingboxbottomleftx,boundingboxtoprighty,boundingboxtoprightx,rootpositionx,rootpositiony,rootpositionz,townianid) VALUES `

                for (let buildingDTOkey in this.buildingDTOs) {
                    let buildingDTO = this.buildingDTOs[buildingDTOkey]

                    values.push(buildingDTO.id, buildingDTO.bottomLeft.y, buildingDTO.bottomLeft.x, buildingDTO.topRight.y, buildingDTO.topRight.x, buildingDTO.rootX, buildingDTO.rootY, buildingDTO.rootZ, buildingDTO.townianId)
                    await this.dbCheckMassInsert(db, start, 9, values, false, resetValues)
                }

                await this.dbCheckMassInsert(db, start, 9, values, true, resetValues)

                buildingDTOTimer.log()

                // BUILDING DTO TILES
                let buildingDTOTilesTimer = new DebugTimer("BuildingDTOTiles")

                db.run(`CREATE TABLE BuildingTilesDTO (x int,y int,z int,id TEXT)`)

                start = `INSERT INTO BuildingTilesDTO (x,y,z,id) VALUES `

                for (let buildingDTOkey in this.buildingDTOs) {
                    let buildingDTO = this.buildingDTOs[buildingDTOkey]

                    for (let tilePosition of buildingDTO.tilePositions) {
                        values.push(tilePosition.x, tilePosition.y, tilePosition.x, buildingDTO.id)
                        await this.dbCheckMassInsert(db, start, 4, values, false, resetValues)
                    }
                }

                await this.dbCheckMassInsert(db, start, 4, values, true, resetValues)

                buildingDTOTilesTimer.log()

                //DISCOVERY POI
                let discoveryPOITimer = new DebugTimer("DiscoveryPOI")

                db.run(`CREATE TABLE DiscoveryPOI (tilepositionx int, tilepositiony int, discoverer varchar(140), questID varchar(20), PRIMARY KEY (tilepositionx,tilepositiony,discoverer))`)

                start = `INSERT INTO DiscoveryPOI (tilepositionx,tilepositiony,discoverer,questID) VALUES `

                for (let discoveryPOI of this.discoveryPointsOfInterest) {
                    values.push(discoveryPOI.position.x, discoveryPOI.position.y, discoveryPOI.discoverer, discoveryPOI.questId)
                    await this.dbCheckMassInsert(db, start, 4, values, false, resetValues)
                }

                await this.dbCheckMassInsert(db, start, 4, values, true, resetValues)

                discoveryPOITimer.log()

                //FOG REVEAL
                let fogRevealTimer = new DebugTimer("FogReveal")

                db.run(`CREATE TABLE FogReveal (x int, y int, dungeon int)`)

                start = `INSERT INTO FogReveal (x,y,dungeon) VALUES `

                for (let chunk of this.chunks) {
                    let tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, 0, 0)

                    if (chunk.revealed) {
                        values.push(tilePos.x, tilePos.y, 0)
                        await this.dbCheckMassInsert(db, start, 3, values, false, resetValues)
                    }
                }

                for (let dungeonId in this.dungeons) {
                    for (let chunk of this.dungeons[dungeonId]) {
                        let tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, 0, 0)

                        if (chunk.revealed) {
                            values.push(tilePos.x, tilePos.y, dungeonId)
                            await this.dbCheckMassInsert(db, start, 3, values, false, resetValues)
                        }
                    }
                }

                await this.dbCheckMassInsert(db, start, 3, values, true, resetValues)

                fogRevealTimer.log()

                // MINIMAP
                let minimapTimer = new DebugTimer("Minimap")

                db.run(`CREATE TABLE Minimap (x int, y int, tileAssetID int, dungeon int, PRIMARY KEY (x,y))`)

                start = `INSERT INTO Minimap (x,y,tileAssetID,dungeon) VALUES `

                for (let minimapValue of this.minimapData) {
                    values.push(minimapValue.position.x, minimapValue.position.y, minimapValue.tileAssetId, minimapValue.dungeon)
                    await this.dbCheckMassInsert(db, start, 4, values, false, resetValues)
                }

                await this.dbCheckMassInsert(db, start, 4, values, true, resetValues)

                minimapTimer.log()

                // PLAYER SAVE
                let playerSaveTimer = new DebugTimer("PlayerSave")

                db.run(`CREATE TABLE "PlayerSave" ("Puid" varchar primary key not null ,"Health" integer ,"Mana" integer ,"SpawnPointX" float ,"SpawnPointY" float ,"DeathPointX" float ,"DeathPointY" float ,"PositionX" float ,"PositionY" float )`)

                start = `INSERT INTO PlayerSave (Puid,Health,Mana,SpawnPointX,SpawnPointY,DeathPointX,DeathPointY,PositionX,PositionY) VALUES `

                for (let playerSaveKey in this.playerSaves) {
                    let playerSave = this.playerSaves[playerSaveKey]

                    values.push(playerSave.puid, playerSave.health, playerSave.mana, playerSave.spawnPointX, playerSave.spawnPointY, playerSave.deathPointX, playerSave.deathPointY, playerSave.positionX, playerSave.positionY)
                    await this.dbCheckMassInsert(db, start, 9, values, false, resetValues)
                }

                await this.dbCheckMassInsert(db, start, 9, values, true, resetValues)

                playerSaveTimer.log()

                // POI
                let POITimer = new DebugTimer("POI")

                db.run(`CREATE TABLE PointOfInterest (tilepositionx int, tilepositiony int, id int, RevealedForAllPlayers int, type int, questID varchar(20), PRIMARY KEY (tilepositionx,tilepositiony, id, type, questID))`)

                start = `INSERT INTO PointOfInterest (tilepositionx,tilepositiony,id,RevealedForAllPlayers,type,questID) VALUES `

                for (let poi of this.pointsOfInterest) {
                    values.push(poi.position.x, poi.position.y, poi.id, poi.revealedForAllPlayers, poi.type, poi.questId)
                    await this.dbCheckMassInsert(db, start, 6, values, false, resetValues)
                }

                await this.dbCheckMassInsert(db, start, 6, values, true, resetValues)

                POITimer.log()
            }

            // END
            exportingDialog.close()

            let endTime = new Date().getTime()
            let totalTime = (endTime - startTime) / 1000

            console.log(`Generating world database file took ${totalTime} seconds`)
            return db
        }
        
        exportingDialog.close()

        return null
    }

    addHistory(toolHistory: ToolHistory) {
        console.log("ADDED HISTORY")

        this.history.splice(this.historyIndex + 1)
        this.history.push(toolHistory)
        this.historyIndex = this.history.length - 1
        
        this.recentlyEdited = true
    }

    undo() {
        /*for (let i = 0; i < this.toolHistory[this.toolHistory.length - 2].chunks.length; i++) {
            let chunk = this.toolHistory[this.toolHistory.length - 2].chunks[i]
            console.log(chunk)
            this.addChunk(chunk.clone())
        }

        this.toolHistory.pop()
        this.toolHistory.pop()

        this.toolHistory.push({"chunks":[]})*/
        if (this.canUndo()) {
            this.history[this.historyIndex].undo()
            this.historyIndex--
        }
    }

    redo() {
        if (this.canRedo()) {
            this.history[this.historyIndex + 1].redo()
            this.historyIndex++
        }
    }

    canUndo(): boolean {
        return this.history.length > this.historyIndex && this.historyIndex >= 0
    }

    canRedo(): boolean {
        return this.history.length > this.historyIndex + 1
    }
}
