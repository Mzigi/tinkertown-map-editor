var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { item_assetInfo } from "../../libraries/item-assetInfoToJson.js";
import { Camera } from "../camera.js";
import { DebugTimer } from "../debug-timer.js";
import { simpleView } from "../simpleView.js";
import { Chunk } from "./chunk.js";
import { Inventory, InventoryFormat } from "./inventory.js";
import { InventoryItem } from "./inventoryItem.js";
import { Item } from "./item.js";
import { Tile } from "./tile.js";
var saveByteArray = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style", "display: none;");
    return function (data, name) {
        var blob = new Blob(data, { type: "octet/stream" }), url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
function readWorldVersion(view) {
    var version = {
        "Major": 0,
        "Minor": 0,
        "Patch": 0,
        "Build": "",
    };
    version.Major = view.readInt32();
    version.Minor = view.readInt32();
    version.Patch = view.readInt32();
    version.Build = view.readUtf8String();
    return version;
}
function writeWorldVersion(view, version) {
    view.writeInt32(version.Major);
    view.writeInt32(version.Minor);
    view.writeInt32(version.Patch);
    if (version.Build) {
        view.writeUtf8String(version.Build);
    }
    else {
        view.writeUint32(0);
    }
}
function Wait(time) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(time);
                    }, time);
                })];
        });
    });
}
function uuid() {
    return (1e7.toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
        return (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16);
    });
}
var PlayerSave = /** @class */ (function () {
    function PlayerSave() {
    }
    PlayerSave.prototype.fromObject = function (playerSaveData) {
        this.puid = playerSaveData.Puid;
        this.health = playerSaveData.Health;
        this.mana = playerSaveData.Mana;
        this.spawnPointX = playerSaveData.SpawnPointX;
        this.spawnPointY = playerSaveData.SpawnPointY;
        this.deathPointX = playerSaveData.DeathPointX;
        this.deathPointY = playerSaveData.DeathPointY;
        this.positionX = playerSaveData.PositionX;
        this.positionY = playerSaveData.PositionY;
    };
    return PlayerSave;
}());
var BuildingDTO = /** @class */ (function () {
    function BuildingDTO() {
    }
    BuildingDTO.prototype.fromObject = function (buildingDTOData) {
        this.id = buildingDTOData.id;
        this.bottomLeft = { "x": buildingDTOData.boundingboxbottomleftx, "y": buildingDTOData.boundingboxbottomlefty };
        this.topRight = { "x": buildingDTOData.boundingboxtoprightx, "y": buildingDTOData.boundingboxtoprighty };
        this.rootX = buildingDTOData.rootpositionx;
        this.rootY = buildingDTOData.rootpositiony;
        this.rootZ = buildingDTOData.rootpositionz;
        this.townianId = buildingDTOData.townianid;
        this.tilePositions = [];
    };
    return BuildingDTO;
}());
var PointOfInterest = /** @class */ (function () {
    function PointOfInterest() {
    }
    PointOfInterest.prototype.fromObject = function (pointOfInterestData) {
        this.id = pointOfInterestData.id;
        this.type = pointOfInterestData.type;
        this.questId = pointOfInterestData.questID;
        this.position = { "x": pointOfInterestData.tilepositionx, "y": pointOfInterestData.tilepositiony };
        this.revealedForAllPlayers = pointOfInterestData.RevealedForAllPlayers;
    };
    return PointOfInterest;
}());
var DiscoveryPointOfInterest = /** @class */ (function () {
    function DiscoveryPointOfInterest() {
    }
    DiscoveryPointOfInterest.prototype.fromObject = function (discovererPOIData) {
        this.position = { "x": discovererPOIData.tilepositionx, "y": discovererPOIData.tilepositiony };
        this.discoverer = discovererPOIData.discoverer;
        this.questId = discovererPOIData.questID;
    };
    return DiscoveryPointOfInterest;
}());
var MinimapValue = /** @class */ (function () {
    function MinimapValue() {
    }
    MinimapValue.prototype.fromObject = function (minimapValueData) {
        this.position = { "x": minimapValueData.x, "y": minimapValueData.y };
        this.tileAssetId = minimapValueData.tileAssetID;
        this.dungeon = minimapValueData.dungeon;
    };
    return MinimapValue;
}());
export var WorldFormat;
(function (WorldFormat) {
    WorldFormat[WorldFormat["Binary"] = 0] = "Binary";
    WorldFormat[WorldFormat["Database"] = 1] = "Database";
})(WorldFormat || (WorldFormat = {}));
var World = /** @class */ (function () {
    function World(id, loader) {
        this.id = id;
        this.loader = loader;
        this.reset();
    }
    World.prototype.reset = function () {
        this.playerSaves = {};
        this.containers = [];
        this.otherContainers = {};
        this.chunks = [];
        this.dungeons = {};
        this.buildingDTOs = {};
        this.pointsOfInterest = [];
        this.discoveryPointsOfInterest = [];
        this.minimapData = [];
        this.xMin = 0;
        this.yMin = 0;
        this.xMax = 1;
        this.yMax = 1;
        //world meta
        this.seed = Math.floor(Math.random() * 9999);
        this.name = "World " + this.seed;
        this.version = { "Major": 2, "Minor": 0, "Patch": 3, "Build": "\u0000" };
        this.highestUsedVersion = { "Major": 2, "Minor": 0, "Patch": 3, "Build": "\u0000" };
        this.hasBeenGenerated = true;
        //settings meta
        this.progression = false;
        this.friendlyFire = true;
        this.forestBarrierBroken = true;
        this.timescale = 72;
        this.NPCsOff = false;
        this.additionalParams = [
            "AmongUs",
            "TinaIsAFreeFarmer"
        ];
        //dungeon meta
        this.entrancePoint = { "x": 0, "y": 0 };
        //editor only
        this.chunkCache = {};
        this.toolHistory = [
            { "chunks": [] },
        ];
        this.history = [];
        this.historyIndex = 0;
        this.hidden = false;
        this.highlightedChunk = null;
        this.camera = new Camera(this.loader);
        this.camera.world = this;
        this.format = WorldFormat.Database;
        this.uneditedFiles = {};
        this.selection = [];
        this.recentlyEdited = false;
        this.massInsertCache = {};
    };
    World.prototype.getId = function () {
        return this.id;
    };
    World.prototype.clearChunks = function () {
        this.chunks = [];
    };
    World.prototype.getChunkIndexAt = function (x, y) {
        for (var i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === x && this.chunks[i].y === y) {
                return i;
            }
        }
        return null;
    };
    World.prototype.getChunkAt = function (x, y, chunksArray) {
        if (chunksArray === void 0) { chunksArray = this.chunks; }
        for (var i = 0; i < chunksArray.length; i++) {
            if (chunksArray[i].x === x && chunksArray[i].y === y) {
                return chunksArray[i];
            }
        }
        return null;
    };
    World.prototype.getChunkPosAtWorldPos = function (x, y) {
        var chunkX = Math.floor(x / 160);
        var chunkY = Math.floor(y / 160) * -1 - 1;
        return { "x": chunkX, "y": chunkY };
    };
    World.prototype.getWorldPosAtChunkPos = function (x, y) {
        var worldX = x * 160;
        var worldY = y * 160 * -1 - 1;
        return { "x": worldX, "y": worldY };
    };
    World.prototype.getWorldPosAtChunk = function (chunk) {
        return this.getWorldPosAtChunkPos(chunk.x, chunk.y);
    };
    World.prototype.getChunkAtWorldPos = function (x, y) {
        var chunkWorldPos = this.getChunkPosAtWorldPos(x, y);
        var chunkX = chunkWorldPos.x;
        var chunkY = chunkWorldPos.y;
        for (var i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === chunkX && this.chunks[i].y === chunkY) {
                return this.chunks[i];
            }
        }
        return null;
    };
    World.prototype.getChunkPosAtScreenPos = function (canvas, x, y) {
        var worldPos = this.camera.screenPosToWorldPos(canvas, x, y);
        var wx = worldPos.x;
        var wy = worldPos.y;
        wx = wx / 160;
        wy = wy / 160;
        wx = Math.floor(wx);
        wy = Math.floor(wy);
        wy *= -1;
        wy -= 1;
        return { "x": wx, "y": wy };
    };
    World.prototype.getChunkAtScreenPos = function (canvas, x, y) {
        var pos = this.getChunkPosAtScreenPos(canvas, x, y);
        return this.getChunkAt(pos.x, pos.y);
    };
    World.prototype.getChunkAndTilePosAtGlobalPos = function (x, y) {
        var chunkPos = { "x": Math.floor(x / 10), "y": Math.floor(y / 10) };
        var newX = Math.abs(x % 10);
        var newY = Math.abs(y % 10);
        if (x < 0) {
            newX = (9 - newX + 1) % 10;
        }
        if (y < 0) {
            newY = (9 - newY + 1) % 10;
        }
        return [chunkPos, { "x": newX, "y": newY }];
    };
    World.prototype.getGlobalPosAtChunkAndTilePos = function (chunkX, chunkY, tileX, tileY) {
        return { "x": tileX + chunkX * 10, "y": tileY + chunkY * 10 };
    };
    World.prototype.getContainerIndexAt = function (x, y, z) {
        var chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y);
        for (var i = 0; i < this.containers.length; i++) {
            var container = this.containers[i];
            if (container.chunkX == chunkAndTilePos[0].x &&
                container.chunkY == chunkAndTilePos[0].y &&
                container.x == chunkAndTilePos[1].x &&
                container.y == chunkAndTilePos[1].y &&
                container.z == z) {
                return i;
            }
        }
    };
    World.prototype.getContainerAt = function (x, y, z) {
        var containerIndex = this.getContainerIndexAt(x, y, z);
        if (containerIndex) {
            return this.containers[containerIndex];
        }
    };
    World.prototype.findTilesAtGlobalPos = function (x, y) {
        var chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y);
        var chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y);
        if (chunk) {
            return chunk.findTilesAtXY(chunkAndTilePos[1].x, chunkAndTilePos[1].y);
        }
        else {
            return [];
        }
    };
    World.prototype.findTileAtGlobalPos = function (x, y, z) {
        var tiles = this.findTilesAtGlobalPos(x, y);
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
            var tile = tiles_1[_i];
            if (tile.z === z) {
                return tile;
            }
        }
    };
    World.prototype.setTileAtGlobalPos = function (tile, x, y) {
        var chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y);
        var chunkPos = chunkAndTilePos[0];
        var tilePos = chunkAndTilePos[1];
        tile.x = tilePos.x;
        tile.y = tilePos.y;
        var newTileInfo = this.setTile(tile, chunkPos.x, chunkPos.y);
        return newTileInfo;
    };
    World.prototype.removeTileAtGlobalPos = function (x, y, z) {
        var chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y);
        var tilePos = chunkAndTilePos[1];
        var chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y);
        if (chunk) {
            return chunk.removeTileAt(tilePos.x, tilePos.y, z);
        }
    };
    World.prototype.removeTilesAtGlobalPosXY = function (x, y) {
        var chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y);
        var tilePos = chunkAndTilePos[1];
        var chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y);
        var removedTiles = [];
        if (chunk) {
            for (var _i = 0, _a = chunk.findTilesAtXY(tilePos.x, tilePos.y); _i < _a.length; _i++) {
                var tile = _a[_i];
                removedTiles.push(chunk.removeTileAt(tile.x, tile.y, tile.z));
            }
        }
        return removedTiles;
    };
    World.prototype.setTile = function (tile, chunkX, chunkY) {
        var createdChunk = false;
        var chunk = this.getChunkAt(chunkX, chunkY);
        if (!chunk) {
            chunk = new Chunk();
            chunk.x = chunkX;
            chunk.y = chunkY;
            this.addChunk(chunk);
            createdChunk = true;
        }
        chunk.setTile(tile);
        return [chunk, createdChunk];
    };
    World.prototype.setItem = function (item) {
        var chunk = this.getChunkAt(item.chunkX, item.chunkY);
        if (!chunk) {
            chunk = new Chunk();
            chunk.x = item.chunkX;
            chunk.y = item.chunkY;
            this.addChunk(chunk);
        }
        chunk.itemDataList.push(item);
        chunk.edited();
    };
    World.prototype.removeChunkAt = function (x, y) {
        var chunkIndex = this.getChunkIndexAt(x, y);
        if (chunkIndex != null) {
            this.chunks.splice(chunkIndex, 1);
        }
    };
    World.prototype.addChunk = function (chunk) {
        this.xMin = Math.min(this.xMin, chunk.x);
        this.xMax = Math.max(this.xMax, chunk.x);
        this.yMin = Math.min(this.yMin, chunk.y);
        this.yMax = Math.max(this.yMax, chunk.y);
        this.removeChunkAt(chunk.x, chunk.y);
        this.chunks.push(chunk);
    };
    World.prototype.addChunkDungeon = function (chunk, dungeonId) {
        if (!this.dungeons[dungeonId]) {
            this.dungeons[dungeonId] = [];
        }
        this.dungeons[dungeonId].push(chunk);
    };
    World.prototype.fillWithContainers = function () {
        var containerSize = 8;
        var placedItems = 0;
        var placedContainers = 1;
        var currentContainer = new Inventory();
        currentContainer.chunkX = 0;
        currentContainer.chunkY = 0;
        currentContainer.x = 0;
        currentContainer.y = 0;
        currentContainer.height = containerSize;
        currentContainer.width = containerSize;
        this.containers.push(currentContainer);
        for (var item in item_assetInfo) {
            console.log(item);
            if (Math.floor(placedItems / (containerSize * containerSize)) != placedContainers - 1) {
                currentContainer = new Inventory();
                //currentContainer.chunkX = Math.floor((placedContainers * 2) / 10)
                currentContainer.chunkX = 0;
                currentContainer.chunkY = 0;
                currentContainer.x = (placedContainers * 2) % 10;
                currentContainer.y = Math.floor(placedContainers / 5) * 2;
                currentContainer.height = containerSize;
                currentContainer.width = containerSize;
                this.containers.push(currentContainer);
                placedContainers += 1;
            }
            currentContainer.setIdAtSlot(placedItems % (containerSize * containerSize), Number(item_assetInfo[item].uniqueID));
            currentContainer.setCountAtSlot(placedItems % (containerSize * containerSize), 999);
            placedItems += 1;
        }
    };
    World.prototype.countTiles = function () {
        var tileCount = 0;
        for (var _i = 0, _a = this.chunks; _i < _a.length; _i++) {
            var chunk = _a[_i];
            for (var _b = 0, _c = chunk.getTiles(); _b < _c.length; _b++) {
                var tile = _c[_b];
                tileCount += 1;
            }
        }
        return tileCount;
    };
    World.prototype.fromBuffer = function (worldBuffer, byteOffset) {
        this.reset();
        var view = new simpleView(worldBuffer);
        view.viewOffset = byteOffset;
        //world meta
        this.name = view.readUtf8String();
        this.seed = view.readInt32();
        this.version = readWorldVersion(view);
        this.highestUsedVersion = readWorldVersion(view);
        this.hasBeenGenerated = view.readByteBool();
        //settings meta
        this.progression = view.readByteBool();
        this.friendlyFire = view.readByteBool();
        this.forestBarrierBroken = view.readByteBool();
        this.timescale = view.readInt32();
        this.NPCsOff = view.readByteBool();
        this.additionalParams = [];
        var additionalParamsLength = view.readUint16();
        for (var i = 0; i < additionalParamsLength; i++) {
            this.additionalParams.push(view.readUtf8String());
        }
        //chunks
        var chunksLength = view.readUint32();
        var chunkByteOffset = 0;
        for (var i = 0; i < chunksLength; i++) {
            var chunk = new Chunk();
            chunk.fromBuffer(view.buffer.slice(view.viewOffset + chunkByteOffset));
            chunkByteOffset += chunk.getByteSize();
            this.xMin = Math.min(this.xMin, chunk.x);
            this.yMin = Math.min(this.yMin, chunk.y);
            this.xMax = Math.max(this.xMax, chunk.x);
            this.yMax = Math.max(this.yMax, chunk.y);
            this.chunks.push(chunk);
        }
        view.viewOffset += chunkByteOffset;
        if (view.viewOffset - view.buffer.byteLength != 0) {
            //storage
            var containersLength = view.readUint16();
            for (var i = 0; i < containersLength; i++) {
                var container = new Inventory();
                container.fromBuffer(view.buffer.slice(view.viewOffset));
                view.viewOffset += container.getByteSize();
                this.containers.push(container);
            }
        }
        this.loader.updateWorldList();
    };
    World.prototype.writeToBuffer = function (writeBuffer, byteOffset) {
        var view = new simpleView(writeBuffer);
        view.viewOffset = byteOffset;
        //world meta
        view.writeUtf8String(this.name);
        view.writeInt32(this.seed);
        writeWorldVersion(view, this.version);
        writeWorldVersion(view, this.highestUsedVersion);
        view.writeByteBool(this.hasBeenGenerated);
        //settings meta
        view.writeByteBool(this.progression);
        view.writeByteBool(this.friendlyFire);
        view.writeByteBool(this.forestBarrierBroken);
        view.writeInt32(this.timescale);
        view.writeByteBool(this.NPCsOff);
        view.writeUint16(this.additionalParams.length);
        for (var i = 0; i < this.additionalParams.length; i++) {
            view.writeUtf8String(this.additionalParams[i]);
        }
        //chunks
        var chunkByteOffset = 0;
        view.writeUint32(this.chunks.length);
        for (var i = 0; i < this.chunks.length; i++) {
            this.chunks[i].writeToBuffer(view.buffer, view.viewOffset + chunkByteOffset);
            chunkByteOffset += this.chunks[i].getByteSize();
        }
        //containers
        view.viewOffset += chunkByteOffset;
        view.writeUint16(this.containers.length);
        for (var i = 0; i < this.containers.length; i++) {
            this.containers[i].writeToBuffer(view.buffer, view.viewOffset);
            view.viewOffset += this.containers[i].getByteSize();
        }
    };
    World.prototype.getByteSize = function () {
        //versions
        var versionByteSize = 16;
        if (this.version.Build) {
            versionByteSize += this.version.Build.length;
        }
        var highestUsedVersionByteSize = 16;
        if (this.highestUsedVersion.Build) {
            highestUsedVersionByteSize += this.highestUsedVersion.Build.length;
        }
        //additional params
        var additionalParamsByteSize = 2 + this.additionalParams.length * 4;
        for (var i = 0; i < this.additionalParams.length; i++) {
            additionalParamsByteSize += this.additionalParams[i].length;
        }
        //chunks
        var chunksByteSize = 0;
        for (var i = 0; i < this.chunks.length; i++) {
            chunksByteSize += this.chunks[i].getByteSize();
        }
        //containers
        var containersByteSize = 0;
        for (var i = 0; i < this.containers.length; i++) {
            containersByteSize += this.containers[i].getByteSize();
        }
        return 4 + this.name.length + 4 + versionByteSize + highestUsedVersionByteSize + 1 + 1 + 1 + 1 + 4 + 1 + 2 + additionalParamsByteSize + 4 + chunksByteSize + 2 + containersByteSize;
    };
    World.prototype.saveAsFile = function (isDatabase, isDungeon, hasItemPalette) {
        if (isDatabase === void 0) { isDatabase = false; }
        if (isDungeon === void 0) { isDungeon = false; }
        if (hasItemPalette === void 0) { hasItemPalette = true; }
        return __awaiter(this, void 0, void 0, function () {
            var zip, key, fileBuffer, fileWorldName, maxChunkX, maxChunkY, _i, _a, chunk, i, chunk, buffer, buffer, i, container, buffer, buffer, world_1, error_1, exportingDialog;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        zip = new JSZip();
                        //unknown files
                        if (!isDungeon) { //editor knows how to read all files used in dungeons
                            for (key in this.uneditedFiles) {
                                fileBuffer = this.uneditedFiles[key];
                                fileWorldName = key.split("/")[0];
                                zip.file(key.replace(fileWorldName + "/", ""), fileBuffer, { "binary": true });
                            }
                        }
                        if (!isDungeon) {
                            //world meta
                            zip.file("world.meta", JSON.stringify({
                                "name": this.name,
                                "seed": this.seed,
                                "version": this.version,
                                "highestUsedVersion": this.highestUsedVersion,
                                "hasBeenGenerated": this.hasBeenGenerated,
                            }));
                            //settings meta
                            zip.file("settings.meta", JSON.stringify({
                                "progression": this.progression,
                                "friendlyFire": this.friendlyFire,
                                "forestBarrierBroken": this.forestBarrierBroken,
                                "timescale": this.timescale,
                                "NPCsOff": this.NPCsOff,
                                "additionalParams": this.additionalParams,
                            }));
                        }
                        else {
                            maxChunkX = 0;
                            maxChunkY = 0;
                            for (_i = 0, _a = this.chunks; _i < _a.length; _i++) {
                                chunk = _a[_i];
                                if (chunk.getTiles().length > 0) {
                                    if (chunk.x > maxChunkX) {
                                        maxChunkX = chunk.x;
                                    }
                                    if (chunk.y > maxChunkY) {
                                        maxChunkY = chunk.y;
                                    }
                                    if (chunk.y < 0 || chunk.x < 0) {
                                        throw new Error("Chunk X or Y can't be negative when exporting map as Dungeon");
                                    }
                                }
                            }
                            zip.file("DungeonMeta.metadat", JSON.stringify({
                                "title": this.name,
                                "boundingBox": [maxChunkX, maxChunkY],
                                "entrancePoint": [this.entrancePoint.x, this.entrancePoint.y]
                            }));
                        }
                        if (!isDatabase || isDungeon) {
                            //chunks
                            for (i = 0; i < this.chunks.length; i++) {
                                chunk = this.chunks[i];
                                if (chunk.chunkHasBeenEdited || this.chunkCache[this.name + "/" + chunk.x + "_" + chunk.y + ".dat"] == null) {
                                    buffer = new ArrayBuffer(chunk.getByteSize());
                                    chunk.writeToBuffer(buffer, 0);
                                    zip.file(chunk.x + "_" + chunk.y + ".dat", buffer, { "binary": true });
                                    //saveByteArray([buffer], chunk.x + "_" + chunk.y + ".dat")
                                }
                                else {
                                    buffer = this.chunkCache[this.name + "/" + chunk.x + "_" + chunk.y + ".dat"];
                                    zip.file(chunk.x + "_" + chunk.y + ".dat", buffer, { "binary": true });
                                }
                            }
                            if (!isDungeon) {
                                //storage
                                for (i = 0; i < this.containers.length; i++) {
                                    container = this.containers[i];
                                    buffer = new ArrayBuffer(container.getByteSize());
                                    container.writeToBuffer(buffer, 0);
                                    zip.file(container.getFileName() + "inventory.dat", buffer, { "binary": true });
                                }
                            }
                        }
                        if (!isDatabase) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.toDatabase(isDungeon, hasItemPalette)];
                    case 1:
                        buffer = ((_b.sent()).export()).buffer;
                        zip.file(isDungeon ? "MapAddition.db" : "backups/world.dat", buffer, { "binary": true });
                        _b.label = 2;
                    case 2:
                        world_1 = this;
                        zip.generateAsync({ type: "blob" })
                            .then(function (content) {
                            // see FileSaver.js
                            saveAs(content, world_1.name + ".zip");
                        });
                        this.recentlyEdited = false;
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        if (this.loader) {
                            this.loader.alertText("Failed to export world: " + error_1, true, 6);
                        }
                        exportingDialog = document.getElementById("dialog-exporting");
                        exportingDialog.close();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    World.prototype.saveAsBufferFile = function () {
        var worldBuffer = new ArrayBuffer(this.getByteSize());
        this.writeToBuffer(worldBuffer, 0);
        saveByteArray([worldBuffer], this.name + ".ttworld");
    };
    World.prototype.fromDatabase = function (db, isDungeon) {
        return __awaiter(this, void 0, void 0, function () {
            var loadingDialog, existingTables, allTables, dbTileData, tileData, chunkPos, chunk, tile, dbBiomeEntryData, biomeEntryData, chunkAndTilePos, chunk, itemPaletteData, dbItemPaletteData, itemPalette, dbWorldItemData, worldItemData, worldItem, itemChunk, dbItemByInventory, itemByInventory, container, containerChunkAndTilePos, item, container, item, dbFogRevealData, fogRevealData, chunkAndTilePos, chunkArr, chunk, dbPlayerSaveData, playerSaveData, playerSave, dbBuildingDTOData, buildingDTOData, buildingDTO, dbBuildingTilesDTO, buildingTileDTOData, buildingDTOId, buildingDTO, dbPOI, POIData, poi, dbDiscoveryPOI, discoveryPOIData, discoveryPOI, dbMinimapData, minimapData, minimapValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loadingDialog = document.getElementById("dialog-loading");
                        if (loadingDialog) {
                            loadingDialog.showModal();
                        }
                        return [4 /*yield*/, Wait(1)];
                    case 1:
                        _a.sent();
                        console.log(db);
                        existingTables = [];
                        allTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
                        while (allTables.step()) {
                            existingTables.push(allTables.getAsObject().name);
                        }
                        allTables.free();
                        dbTileData = db.prepare("SELECT * FROM Tiles");
                        while (dbTileData.step()) {
                            tileData = dbTileData.getAsObject();
                            chunkPos = { "x": Math.floor(tileData.x / 10), "y": Math.floor(tileData.y / 10) };
                            chunk = this.getChunkAt(chunkPos.x, chunkPos.y);
                            if (!chunk) {
                                chunk = new Chunk();
                                chunk.x = chunkPos.x;
                                chunk.y = chunkPos.y;
                                if (tileData.dungeon === 0) {
                                    this.addChunk(chunk);
                                }
                                else {
                                    console.log("Creating dungeon chunk");
                                    this.addChunkDungeon(chunk, tileData.dungeon);
                                }
                            }
                            tile = new Tile();
                            tile.fromObject(tileData);
                            chunk.setTile(tile);
                        }
                        dbTileData.free();
                        dbBiomeEntryData = db.prepare("SELECT * FROM BiomeEntry");
                        while (dbBiomeEntryData.step()) {
                            biomeEntryData = dbBiomeEntryData.getAsObject();
                            chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(biomeEntryData.X, biomeEntryData.Y);
                            chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y);
                            if (chunk) {
                                chunk.biomeID = biomeEntryData.Biome;
                            }
                            else {
                                console.warn("Chunk missing for BiomeEntry at chunk [".concat(biomeEntryData.X, ", ").concat(biomeEntryData.Y, "]"));
                            }
                        }
                        dbBiomeEntryData.free();
                        if (!isDungeon) {
                            itemPaletteData = null;
                            if (existingTables.includes("Item")) {
                                //load item palette
                                itemPaletteData = {};
                                dbItemPaletteData = db.prepare("SELECT * FROM Item");
                                while (dbItemPaletteData.step()) {
                                    itemPalette = dbItemPaletteData.getAsObject();
                                    itemPaletteData[itemPalette.itemGuid] = { "id": itemPalette.itemAssetID, "count": itemPalette.count };
                                }
                                dbItemPaletteData.free();
                            }
                            dbWorldItemData = db.prepare("SELECT * FROM WorldItem");
                            while (dbWorldItemData.step()) {
                                worldItemData = dbWorldItemData.getAsObject();
                                worldItem = new Item();
                                worldItem.fromObject(worldItemData, itemPaletteData, this);
                                itemChunk = this.getChunkAt(worldItem.chunkX, worldItem.chunkY);
                                if (itemChunk) {
                                    itemChunk.itemDataList.push(worldItem);
                                    itemChunk.resetCacheImage();
                                }
                                else {
                                    console.warn("Chunk missing for item at chunk [".concat(worldItem.chunkX, ", ").concat(worldItem.chunkY, "]"));
                                }
                            }
                            dbWorldItemData.free();
                            dbItemByInventory = db.prepare("SELECT * FROM ItemByInventory") // WHERE actorGuid = 'tile
                            ;
                            while (dbItemByInventory.step()) {
                                itemByInventory = dbItemByInventory.getAsObject();
                                if (itemByInventory.actorGuid === "tile") { //container item
                                    container = this.getContainerAt(itemByInventory.tileX, itemByInventory.tileY, itemByInventory.tileZ);
                                    if (!container) {
                                        container = new Inventory();
                                        container.width = 5; //TODO: make these the actual inventory size
                                        container.height = 5;
                                        container.target = InventoryFormat.Container;
                                        containerChunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(itemByInventory.tileX, itemByInventory.tileY);
                                        container.chunkX = containerChunkAndTilePos[0].x;
                                        container.chunkY = containerChunkAndTilePos[0].y;
                                        container.x = containerChunkAndTilePos[1].x;
                                        container.y = containerChunkAndTilePos[1].y;
                                        container.z = itemByInventory.tileZ;
                                        container.inventoryType = itemByInventory.inventoryType;
                                        container.target = InventoryFormat.Container;
                                        this.containers.push(container);
                                    }
                                    item = new InventoryItem();
                                    item.slot = itemByInventory.inventoryIndex;
                                    if (itemPaletteData) {
                                        item.count = itemPaletteData[itemByInventory.itemGuid].count;
                                        item.id = itemPaletteData[itemByInventory.itemGuid].id;
                                    }
                                    else {
                                        item.count = itemByInventory.count;
                                        item.id = itemByInventory.itemAssetID;
                                    }
                                    container.addItem(item);
                                }
                                else { //player inventory (i hope), inventoryType = Armor or Inventory
                                    container = this.otherContainers[itemByInventory.actorGuid + "_" + itemByInventory.inventoryType];
                                    if (!container) {
                                        container = new Inventory();
                                        //doing this because its probably a playevenventory container
                                        container.width = 5;
                                        container.height = 5;
                                        container.target = InventoryFormat.Player;
                                        container.inventoryType = itemByInventory.inventoryType;
                                        this.otherContainers[itemByInventory.actorGuid + "_" + itemByInventory.inventoryType] = container;
                                    }
                                    item = new InventoryItem();
                                    item.slot = itemByInventory.inventoryIndex;
                                    if (itemPaletteData) {
                                        item.count = itemPaletteData[itemByInventory.itemGuid].count;
                                        item.id = itemPaletteData[itemByInventory.itemGuid].id;
                                    }
                                    else {
                                        item.count = itemByInventory.count;
                                        item.id = itemByInventory.itemAssetID;
                                    }
                                    container.addItem(item);
                                }
                            }
                            dbItemByInventory.free();
                            dbFogRevealData = db.prepare("SELECT * FROM FogReveal");
                            while (dbFogRevealData.step()) {
                                fogRevealData = dbFogRevealData.getAsObject();
                                chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(fogRevealData.x, fogRevealData.y);
                                chunkArr = this.chunks;
                                if (fogRevealData.dungeon !== 0) {
                                    chunkArr = this.dungeons[fogRevealData.dungeon];
                                    if (!chunkArr) {
                                        this.dungeons[fogRevealData.dungeon] = [];
                                        chunkArr = this.dungeons[fogRevealData.dungeon];
                                    }
                                }
                                chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y, chunkArr);
                                if (chunk) {
                                    chunk.revealed = true;
                                }
                                else {
                                    console.warn("Chunk missing for FogReveal at chunk [".concat(fogRevealData.x, ", ").concat(fogRevealData.y, "] at dungeon ").concat(fogRevealData.dungeon));
                                }
                            }
                            dbFogRevealData.free();
                            dbPlayerSaveData = db.prepare("SELECT * FROM PlayerSave");
                            while (dbPlayerSaveData.step()) {
                                playerSaveData = dbPlayerSaveData.getAsObject();
                                playerSave = new PlayerSave();
                                playerSave.fromObject(playerSaveData);
                                this.playerSaves[playerSave.puid] = playerSave;
                            }
                            dbPlayerSaveData.free();
                            dbBuildingDTOData = db.prepare("SELECT * FROM BuildingDTO");
                            while (dbBuildingDTOData.step()) {
                                buildingDTOData = dbBuildingDTOData.getAsObject();
                                buildingDTO = new BuildingDTO();
                                buildingDTO.fromObject(buildingDTOData);
                                this.buildingDTOs[buildingDTO.id] = buildingDTO;
                            }
                            dbBuildingDTOData.free();
                            dbBuildingTilesDTO = db.prepare("SELECT * FROM BuildingTilesDTO");
                            while (dbBuildingTilesDTO.step()) {
                                buildingTileDTOData = dbBuildingTilesDTO.getAsObject();
                                buildingDTOId = buildingTileDTOData.id;
                                buildingDTO = this.buildingDTOs[buildingDTOId];
                                if (buildingDTO) {
                                    buildingDTO.tilePositions.push({ "x": buildingTileDTOData.x, "y": buildingTileDTOData.y, "z": buildingTileDTOData.z });
                                }
                                else {
                                    console.warn("BuildingDTO ".concat(buildingDTOId, " missing for BuildingTileDTO at [").concat(buildingTileDTOData.x, ", ").concat(buildingTileDTOData.y, ", ").concat(buildingTileDTOData.z, "]"));
                                }
                            }
                            dbBuildingTilesDTO.free();
                            dbPOI = db.prepare("SELECT * FROM PointOfInterest");
                            while (dbPOI.step()) {
                                POIData = dbPOI.getAsObject();
                                poi = new PointOfInterest();
                                poi.fromObject(POIData);
                                this.pointsOfInterest.push(poi);
                            }
                            dbPOI.free();
                            dbDiscoveryPOI = db.prepare("SELECT * FROM DiscoveryPOI");
                            while (dbDiscoveryPOI.step()) {
                                discoveryPOIData = dbDiscoveryPOI.getAsObject();
                                discoveryPOI = new DiscoveryPointOfInterest();
                                discoveryPOI.fromObject(discoveryPOIData);
                                this.discoveryPointsOfInterest.push(discoveryPOI);
                            }
                            dbDiscoveryPOI.free();
                            dbMinimapData = db.prepare("SELECT * FROM Minimap");
                            while (dbMinimapData.step()) {
                                minimapData = dbMinimapData.getAsObject();
                                minimapValue = new MinimapValue();
                                minimapValue.fromObject(minimapData);
                                this.minimapData.push(minimapValue);
                            }
                            dbMinimapData.free();
                        }
                        //finished loading
                        if (loadingDialog) {
                            loadingDialog.close();
                        }
                        db.close();
                        console.log("Finished loading database world");
                        return [2 /*return*/];
                }
            });
        });
    };
    World.prototype.dbMassInsert = function (db, start, valueCount, values) {
        if (values.length > 0) {
            //create string like this (?,?,?)
            var toAddStr = "(";
            for (var i = 0; i < valueCount; i++) {
                toAddStr += "?,";
            }
            toAddStr = toAddStr.slice(0, -1) + "), ";
            //let endStr = toAddStr.repeat(values.length / valueCount)    //22.117s
            var endStr = ""; //22.072s
            for (var i = 0; i < values.length / valueCount; i++) {
                endStr += toAddStr;
            }
            //create final string
            var finalStr = start + endStr.slice(0, -2) + ";";
            //run database command
            /*console.log(finalStr)
            console.log(values)
            console.log(values.length)*/
            db.run(finalStr, values);
        }
    };
    World.prototype.dbCheckMassInsert = function (db, start, valueCount, values, isEnd, resetValues) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!((values.length / valueCount >= 999 - valueCount) || (values.length > 0 && isEnd))) return [3 /*break*/, 2];
                        this.dbMassInsert(db, start, valueCount, values);
                        //exportingPercentageElement.innerText = `Exporting world ${Math.floor(percentStart + percentCurrent * (progress / progressMax))}%`
                        resetValues();
                        return [4 /*yield*/, Wait(0.001)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    World.prototype.addToItemPalette = function (itemPalette, itemGuid, itemAssetID, count) {
        itemPalette.push(itemGuid, itemAssetID, count);
        return itemPalette;
    };
    World.prototype.toDatabase = function (isDungeon, hasItemPalette) {
        if (isDungeon === void 0) { isDungeon = false; }
        if (hasItemPalette === void 0) { hasItemPalette = true; }
        return __awaiter(this, void 0, void 0, function () {
            var startTime, SQL, exportingDialog, db, tilesTimer, start, values_1, resetValues, _i, _a, chunk, _b, _c, tile, tilePos, _d, _e, _f, _g, dungeonId, _h, _j, chunk, _k, _l, tile, tilePos, biomeEntryTimer, _m, _o, chunk, x, y, tilePos, itemsTimer, itemPalette, _p, _q, container, tilePos, _r, _s, item, itemGuid, _t, _u, _v, _w, otherContainerKey, actorGuidAndInventoryType, actorGuid, inventoryType, container, _x, _y, item, itemGuid, worldItemsTimer, _z, _0, chunk, _1, _2, item, tilePos, itemGuid, itemPaletteTimer, i, _3, _4, container, tilePos, _5, _6, item, _7, _8, _9, _10, otherContainerKey, actorGuidAndInventoryType, actorGuid, inventoryType, container, _11, _12, item, worldItemsTimer, _13, _14, chunk, _15, _16, item, tilePos, itemGuid, buildingDTOTimer, _17, _18, _19, _20, buildingDTOkey, buildingDTO, buildingDTOTilesTimer, _21, _22, _23, _24, buildingDTOkey, buildingDTO, _25, _26, tilePosition, discoveryPOITimer, _27, _28, discoveryPOI, fogRevealTimer, _29, _30, chunk, tilePos, _31, _32, _33, _34, dungeonId, _35, _36, chunk, tilePos, minimapTimer, _37, _38, minimapValue, playerSaveTimer, _39, _40, _41, _42, playerSaveKey, playerSave, POITimer, _43, _44, poi, endTime, totalTime;
            return __generator(this, function (_45) {
                switch (_45.label) {
                    case 0:
                        console.log("Started timer");
                        startTime = new Date().getTime();
                        SQL = window["SQL"];
                        console.log(SQL);
                        if (!SQL) {
                            initSqlJs({ locateFile: function (filename) { return "src/libraries/sql-wasm.wasm"; } }).then(function (SQL) {
                                window["SQL"] = SQL;
                            });
                            console.error("SQL was not initialized, it has been initialized now");
                        }
                        exportingDialog = document.getElementById("dialog-exporting");
                        //let exportingPercentageElement: HTMLElement | null = document.getElementById("dialog-exporting-percentage")
                        exportingDialog.showModal();
                        if (!SQL) return [3 /*break*/, 117];
                        return [4 /*yield*/, Wait(1000 / 60)]; //to show dialog
                    case 1:
                        _45.sent(); //to show dialog
                        db = new SQL.Database();
                        tilesTimer = new DebugTimer("Tiles");
                        db.run("CREATE TABLE Tiles(x int, y int, z int, hp int DEFAULT 10, memA int, dungeon int, memB int, rotation int, tileAssetID int, PRIMARY KEY (x,y,z))");
                        start = "INSERT INTO Tiles (x,y,z,hp,memA,dungeon,memB,rotation,tileAssetID) VALUES ";
                        values_1 = [];
                        resetValues = function () {
                            values_1 = [];
                        };
                        _i = 0, _a = this.chunks;
                        _45.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        chunk = _a[_i];
                        _b = 0, _c = chunk.getTiles();
                        _45.label = 3;
                    case 3:
                        if (!(_b < _c.length)) return [3 /*break*/, 6];
                        tile = _c[_b];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, tile.x, tile.y);
                        values_1.push(tilePos.x, tilePos.y, tile.z, tile.health, tile.memoryA, 0, tile.memoryB, tile.rotation, tile.tileAssetId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, false, resetValues)];
                    case 4:
                        _45.sent();
                        _45.label = 5;
                    case 5:
                        _b++;
                        return [3 /*break*/, 3];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        _d = this.dungeons;
                        _e = [];
                        for (_f in _d)
                            _e.push(_f);
                        _g = 0;
                        _45.label = 8;
                    case 8:
                        if (!(_g < _e.length)) return [3 /*break*/, 15];
                        _f = _e[_g];
                        if (!(_f in _d)) return [3 /*break*/, 14];
                        dungeonId = _f;
                        _h = 0, _j = this.dungeons[dungeonId];
                        _45.label = 9;
                    case 9:
                        if (!(_h < _j.length)) return [3 /*break*/, 14];
                        chunk = _j[_h];
                        _k = 0, _l = chunk.getTiles();
                        _45.label = 10;
                    case 10:
                        if (!(_k < _l.length)) return [3 /*break*/, 13];
                        tile = _l[_k];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, tile.x, tile.y);
                        values_1.push(tilePos.x, tilePos.y, tile.z, tile.health, tile.memoryA, dungeonId, tile.memoryB, tile.rotation, tile.tileAssetId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, false, resetValues)];
                    case 11:
                        _45.sent();
                        _45.label = 12;
                    case 12:
                        _k++;
                        return [3 /*break*/, 10];
                    case 13:
                        _h++;
                        return [3 /*break*/, 9];
                    case 14:
                        _g++;
                        return [3 /*break*/, 8];
                    case 15: 
                    //end insert
                    return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, true, resetValues)];
                    case 16:
                        //end insert
                        _45.sent();
                        tilesTimer.log();
                        biomeEntryTimer = new DebugTimer("BiomeEntry");
                        db.run("CREATE TABLE BiomeEntry(X int, Y int, Biome int, PRIMARY KEY (X,Y))");
                        start = "INSERT INTO BiomeEntry (X,Y,Biome) VALUES ";
                        _m = 0, _o = this.chunks;
                        _45.label = 17;
                    case 17:
                        if (!(_m < _o.length)) return [3 /*break*/, 24];
                        chunk = _o[_m];
                        x = 0;
                        _45.label = 18;
                    case 18:
                        if (!(x < 10)) return [3 /*break*/, 23];
                        y = 0;
                        _45.label = 19;
                    case 19:
                        if (!(y < 10)) return [3 /*break*/, 22];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, x, y);
                        values_1.push(tilePos.x, tilePos.y, chunk.biomeID);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, resetValues)];
                    case 20:
                        _45.sent();
                        _45.label = 21;
                    case 21:
                        y++;
                        return [3 /*break*/, 19];
                    case 22:
                        x++;
                        return [3 /*break*/, 18];
                    case 23:
                        _m++;
                        return [3 /*break*/, 17];
                    case 24: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, true, resetValues)];
                    case 25:
                        _45.sent();
                        biomeEntryTimer.log();
                        if (!!isDungeon) return [3 /*break*/, 116];
                        if (!hasItemPalette) return [3 /*break*/, 51];
                        itemsTimer = new DebugTimer("Items");
                        itemPalette = [];
                        db.run("CREATE TABLE \"Item\" ('itemGuid' varchar primary key not null, 'itemAssetID' integer, 'count' integer)");
                        // CONTAINERS AND INVENTORIES
                        db.run("CREATE TABLE \"ItemByInventory\" (\"tileX\" integer ,\"tileY\" integer ,\"tileZ\" integer ,\"actorGuid\" varchar ,\"inventoryType\" integer ,\"itemGuid\" varchar primary key not null ,\"inventoryIndex\" integer )");
                        start = "INSERT INTO ItemByInventory (tileX,tileY,tileZ,actorGuid,inventoryType,itemGuid,inventoryIndex) VALUES ";
                        _p = 0, _q = this.containers;
                        _45.label = 26;
                    case 26:
                        if (!(_p < _q.length)) return [3 /*break*/, 31];
                        container = _q[_p];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y);
                        _r = 0, _s = container.itemDataList;
                        _45.label = 27;
                    case 27:
                        if (!(_r < _s.length)) return [3 /*break*/, 30];
                        item = _s[_r];
                        itemGuid = uuid();
                        this.addToItemPalette(itemPalette, itemGuid, item.id, item.count);
                        values_1.push(tilePos.x, tilePos.y, container.z, "tile", 0, itemGuid, item.slot);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 7, values_1, false, resetValues)];
                    case 28:
                        _45.sent();
                        _45.label = 29;
                    case 29:
                        _r++;
                        return [3 /*break*/, 27];
                    case 30:
                        _p++;
                        return [3 /*break*/, 26];
                    case 31:
                        _t = this.otherContainers;
                        _u = [];
                        for (_v in _t)
                            _u.push(_v);
                        _w = 0;
                        _45.label = 32;
                    case 32:
                        if (!(_w < _u.length)) return [3 /*break*/, 37];
                        _v = _u[_w];
                        if (!(_v in _t)) return [3 /*break*/, 36];
                        otherContainerKey = _v;
                        actorGuidAndInventoryType = otherContainerKey.split("_");
                        actorGuid = actorGuidAndInventoryType[0];
                        inventoryType = Number(actorGuidAndInventoryType[1]);
                        container = this.otherContainers[otherContainerKey];
                        _x = 0, _y = container.itemDataList;
                        _45.label = 33;
                    case 33:
                        if (!(_x < _y.length)) return [3 /*break*/, 36];
                        item = _y[_x];
                        itemGuid = uuid();
                        this.addToItemPalette(itemPalette, itemGuid, item.id, item.count);
                        values_1.push(0, 0, 0, actorGuid, inventoryType, itemGuid, item.slot);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 7, values_1, false, resetValues)];
                    case 34:
                        _45.sent();
                        _45.label = 35;
                    case 35:
                        _x++;
                        return [3 /*break*/, 33];
                    case 36:
                        _w++;
                        return [3 /*break*/, 32];
                    case 37: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 7, values_1, true, resetValues)];
                    case 38:
                        _45.sent();
                        itemsTimer.log();
                        worldItemsTimer = new DebugTimer("WorldItems");
                        db.run("CREATE TABLE \"WorldItem\" (\"worldPositionX\" float ,\"worldPositionY\" float ,\"itemGuid\" varchar primary key not null )");
                        start = "INSERT INTO WorldItem (worldPositionX,worldPositionY,itemGuid) VALUES ";
                        _z = 0, _0 = this.chunks;
                        _45.label = 39;
                    case 39:
                        if (!(_z < _0.length)) return [3 /*break*/, 44];
                        chunk = _0[_z];
                        _1 = 0, _2 = chunk.itemDataList;
                        _45.label = 40;
                    case 40:
                        if (!(_1 < _2.length)) return [3 /*break*/, 43];
                        item = _2[_1];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y);
                        itemGuid = uuid();
                        this.addToItemPalette(itemPalette, itemGuid, item.id, item.count);
                        values_1.push(tilePos.x, tilePos.y, itemGuid);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, resetValues)];
                    case 41:
                        _45.sent();
                        _45.label = 42;
                    case 42:
                        _1++;
                        return [3 /*break*/, 40];
                    case 43:
                        _z++;
                        return [3 /*break*/, 39];
                    case 44: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, true, resetValues)];
                    case 45:
                        _45.sent();
                        worldItemsTimer.log();
                        itemPaletteTimer = new DebugTimer("ItemPalette");
                        start = "INSERT INTO Item (itemGuid,itemAssetID,count) VALUES ";
                        i = 0;
                        _45.label = 46;
                    case 46:
                        if (!(i < itemPalette.length)) return [3 /*break*/, 49];
                        values_1.push(itemPalette[i + 0], itemPalette[i + 1], itemPalette[i + 2]);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, resetValues)];
                    case 47:
                        _45.sent();
                        _45.label = 48;
                    case 48:
                        i += 3;
                        return [3 /*break*/, 46];
                    case 49: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, true, resetValues)];
                    case 50:
                        _45.sent();
                        itemPaletteTimer.log();
                        return [3 /*break*/, 72];
                    case 51:
                        // CONTAINERS AND INVENTORIES
                        db.run("CREATE TABLE \"ItemByInventory\" (tileX INTEGER, tileY INTEGER, tileZ INTEGER, actorGuid VARCHAR, inventoryType INTEGER, itemAssetID INTEGER, count INTEGER, inventoryIndex INTEGER)");
                        start = "INSERT INTO ItemByInventory (tileX,tileY,tileZ,actorGuid,inventoryType,itemAssetID,count,inventoryIndex) VALUES ";
                        _3 = 0, _4 = this.containers;
                        _45.label = 52;
                    case 52:
                        if (!(_3 < _4.length)) return [3 /*break*/, 57];
                        container = _4[_3];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y);
                        _5 = 0, _6 = container.itemDataList;
                        _45.label = 53;
                    case 53:
                        if (!(_5 < _6.length)) return [3 /*break*/, 56];
                        item = _6[_5];
                        values_1.push(tilePos.x, tilePos.y, container.z, "tile", container.inventoryType, item.id, item.count, item.slot);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 8, values_1, false, resetValues)];
                    case 54:
                        _45.sent();
                        _45.label = 55;
                    case 55:
                        _5++;
                        return [3 /*break*/, 53];
                    case 56:
                        _3++;
                        return [3 /*break*/, 52];
                    case 57:
                        _7 = this.otherContainers;
                        _8 = [];
                        for (_9 in _7)
                            _8.push(_9);
                        _10 = 0;
                        _45.label = 58;
                    case 58:
                        if (!(_10 < _8.length)) return [3 /*break*/, 63];
                        _9 = _8[_10];
                        if (!(_9 in _7)) return [3 /*break*/, 62];
                        otherContainerKey = _9;
                        actorGuidAndInventoryType = otherContainerKey.split("_");
                        actorGuid = actorGuidAndInventoryType[0];
                        inventoryType = Number(actorGuidAndInventoryType[1]);
                        container = this.otherContainers[otherContainerKey];
                        _11 = 0, _12 = container.itemDataList;
                        _45.label = 59;
                    case 59:
                        if (!(_11 < _12.length)) return [3 /*break*/, 62];
                        item = _12[_11];
                        values_1.push(0, 0, 0, actorGuid, inventoryType, item.id, item.count, item.slot);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 8, values_1, false, resetValues)];
                    case 60:
                        _45.sent();
                        _45.label = 61;
                    case 61:
                        _11++;
                        return [3 /*break*/, 59];
                    case 62:
                        _10++;
                        return [3 /*break*/, 58];
                    case 63: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 8, values_1, true, resetValues)
                        // WORLD ITEMS
                    ];
                    case 64:
                        _45.sent();
                        worldItemsTimer = new DebugTimer("WorldItems");
                        db.run("CREATE TABLE \"WorldItem\" (\"worldPositionX\" float ,\"worldPositionY\" float ,\"itemGuid\" varchar primary key not null , itemAssetID INTEGER NOT NULL DEFAULT 0, count INTEGER NOT NULL DEFAULT 0, dayDropped INTEGER DEFAULT 0)");
                        start = "INSERT INTO WorldItem (worldPositionX,worldPositionY,itemGuid,itemAssetID,count,dayDropped) VALUES ";
                        _13 = 0, _14 = this.chunks;
                        _45.label = 65;
                    case 65:
                        if (!(_13 < _14.length)) return [3 /*break*/, 70];
                        chunk = _14[_13];
                        _15 = 0, _16 = chunk.itemDataList;
                        _45.label = 66;
                    case 66:
                        if (!(_15 < _16.length)) return [3 /*break*/, 69];
                        item = _16[_15];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y);
                        itemGuid = uuid();
                        values_1.push(tilePos.x, tilePos.y, itemGuid, item.id, item.count, item.dayDropped);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 6, values_1, false, resetValues)];
                    case 67:
                        _45.sent();
                        _45.label = 68;
                    case 68:
                        _15++;
                        return [3 /*break*/, 66];
                    case 69:
                        _13++;
                        return [3 /*break*/, 65];
                    case 70: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 6, values_1, true, resetValues)];
                    case 71:
                        _45.sent();
                        worldItemsTimer.log();
                        _45.label = 72;
                    case 72:
                        buildingDTOTimer = new DebugTimer("BuildingDTO");
                        db.run("CREATE TABLE \"BuildingDTO\" (\"id\" varchar primary key not null ,\"boundingboxbottomlefty\" integer ,\"boundingboxbottomleftx\" integer ,\"boundingboxtoprighty\" integer ,\"boundingboxtoprightx\" integer ,\"rootpositionx\" integer ,\"rootpositiony\" integer ,\"rootpositionz\" integer ,\"townianid\" integer )");
                        start = "INSERT INTO BuildingDTO (id,boundingboxbottomlefty,boundingboxbottomleftx,boundingboxtoprighty,boundingboxtoprightx,rootpositionx,rootpositiony,rootpositionz,townianid) VALUES ";
                        _17 = this.buildingDTOs;
                        _18 = [];
                        for (_19 in _17)
                            _18.push(_19);
                        _20 = 0;
                        _45.label = 73;
                    case 73:
                        if (!(_20 < _18.length)) return [3 /*break*/, 76];
                        _19 = _18[_20];
                        if (!(_19 in _17)) return [3 /*break*/, 75];
                        buildingDTOkey = _19;
                        buildingDTO = this.buildingDTOs[buildingDTOkey];
                        values_1.push(buildingDTO.id, buildingDTO.bottomLeft.y, buildingDTO.bottomLeft.x, buildingDTO.topRight.y, buildingDTO.topRight.x, buildingDTO.rootX, buildingDTO.rootY, buildingDTO.rootZ, buildingDTO.townianId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, false, resetValues)];
                    case 74:
                        _45.sent();
                        _45.label = 75;
                    case 75:
                        _20++;
                        return [3 /*break*/, 73];
                    case 76: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, true, resetValues)];
                    case 77:
                        _45.sent();
                        buildingDTOTimer.log();
                        buildingDTOTilesTimer = new DebugTimer("BuildingDTOTiles");
                        db.run("CREATE TABLE BuildingTilesDTO (x int,y int,z int,id TEXT)");
                        start = "INSERT INTO BuildingTilesDTO (x,y,z,id) VALUES ";
                        _21 = this.buildingDTOs;
                        _22 = [];
                        for (_23 in _21)
                            _22.push(_23);
                        _24 = 0;
                        _45.label = 78;
                    case 78:
                        if (!(_24 < _22.length)) return [3 /*break*/, 83];
                        _23 = _22[_24];
                        if (!(_23 in _21)) return [3 /*break*/, 82];
                        buildingDTOkey = _23;
                        buildingDTO = this.buildingDTOs[buildingDTOkey];
                        _25 = 0, _26 = buildingDTO.tilePositions;
                        _45.label = 79;
                    case 79:
                        if (!(_25 < _26.length)) return [3 /*break*/, 82];
                        tilePosition = _26[_25];
                        values_1.push(tilePosition.x, tilePosition.y, tilePosition.x, buildingDTO.id);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, false, resetValues)];
                    case 80:
                        _45.sent();
                        _45.label = 81;
                    case 81:
                        _25++;
                        return [3 /*break*/, 79];
                    case 82:
                        _24++;
                        return [3 /*break*/, 78];
                    case 83: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, true, resetValues)];
                    case 84:
                        _45.sent();
                        buildingDTOTilesTimer.log();
                        discoveryPOITimer = new DebugTimer("DiscoveryPOI");
                        db.run("CREATE TABLE DiscoveryPOI (tilepositionx int, tilepositiony int, discoverer varchar(140), questID varchar(20), PRIMARY KEY (tilepositionx,tilepositiony,discoverer))");
                        start = "INSERT INTO DiscoveryPOI (tilepositionx,tilepositiony,discoverer,questID) VALUES ";
                        _27 = 0, _28 = this.discoveryPointsOfInterest;
                        _45.label = 85;
                    case 85:
                        if (!(_27 < _28.length)) return [3 /*break*/, 88];
                        discoveryPOI = _28[_27];
                        values_1.push(discoveryPOI.position.x, discoveryPOI.position.y, discoveryPOI.discoverer, discoveryPOI.questId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, false, resetValues)];
                    case 86:
                        _45.sent();
                        _45.label = 87;
                    case 87:
                        _27++;
                        return [3 /*break*/, 85];
                    case 88: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, true, resetValues)];
                    case 89:
                        _45.sent();
                        discoveryPOITimer.log();
                        fogRevealTimer = new DebugTimer("FogReveal");
                        db.run("CREATE TABLE FogReveal (x int, y int, dungeon int)");
                        start = "INSERT INTO FogReveal (x,y,dungeon) VALUES ";
                        _29 = 0, _30 = this.chunks;
                        _45.label = 90;
                    case 90:
                        if (!(_29 < _30.length)) return [3 /*break*/, 93];
                        chunk = _30[_29];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, 0, 0);
                        if (!chunk.revealed) return [3 /*break*/, 92];
                        values_1.push(tilePos.x, tilePos.y, 0);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, resetValues)];
                    case 91:
                        _45.sent();
                        _45.label = 92;
                    case 92:
                        _29++;
                        return [3 /*break*/, 90];
                    case 93:
                        _31 = this.dungeons;
                        _32 = [];
                        for (_33 in _31)
                            _32.push(_33);
                        _34 = 0;
                        _45.label = 94;
                    case 94:
                        if (!(_34 < _32.length)) return [3 /*break*/, 99];
                        _33 = _32[_34];
                        if (!(_33 in _31)) return [3 /*break*/, 98];
                        dungeonId = _33;
                        _35 = 0, _36 = this.dungeons[dungeonId];
                        _45.label = 95;
                    case 95:
                        if (!(_35 < _36.length)) return [3 /*break*/, 98];
                        chunk = _36[_35];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, 0, 0);
                        if (!chunk.revealed) return [3 /*break*/, 97];
                        values_1.push(tilePos.x, tilePos.y, dungeonId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, resetValues)];
                    case 96:
                        _45.sent();
                        _45.label = 97;
                    case 97:
                        _35++;
                        return [3 /*break*/, 95];
                    case 98:
                        _34++;
                        return [3 /*break*/, 94];
                    case 99: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, true, resetValues)];
                    case 100:
                        _45.sent();
                        fogRevealTimer.log();
                        minimapTimer = new DebugTimer("Minimap");
                        db.run("CREATE TABLE Minimap (x int, y int, tileAssetID int, dungeon int, PRIMARY KEY (x,y))");
                        start = "INSERT INTO Minimap (x,y,tileAssetID,dungeon) VALUES ";
                        _37 = 0, _38 = this.minimapData;
                        _45.label = 101;
                    case 101:
                        if (!(_37 < _38.length)) return [3 /*break*/, 104];
                        minimapValue = _38[_37];
                        values_1.push(minimapValue.position.x, minimapValue.position.y, minimapValue.tileAssetId, minimapValue.dungeon);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, false, resetValues)];
                    case 102:
                        _45.sent();
                        _45.label = 103;
                    case 103:
                        _37++;
                        return [3 /*break*/, 101];
                    case 104: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, true, resetValues)];
                    case 105:
                        _45.sent();
                        minimapTimer.log();
                        playerSaveTimer = new DebugTimer("PlayerSave");
                        db.run("CREATE TABLE \"PlayerSave\" (\"Puid\" varchar primary key not null ,\"Health\" integer ,\"Mana\" integer ,\"SpawnPointX\" float ,\"SpawnPointY\" float ,\"DeathPointX\" float ,\"DeathPointY\" float ,\"PositionX\" float ,\"PositionY\" float )");
                        start = "INSERT INTO PlayerSave (Puid,Health,Mana,SpawnPointX,SpawnPointY,DeathPointX,DeathPointY,PositionX,PositionY) VALUES ";
                        _39 = this.playerSaves;
                        _40 = [];
                        for (_41 in _39)
                            _40.push(_41);
                        _42 = 0;
                        _45.label = 106;
                    case 106:
                        if (!(_42 < _40.length)) return [3 /*break*/, 109];
                        _41 = _40[_42];
                        if (!(_41 in _39)) return [3 /*break*/, 108];
                        playerSaveKey = _41;
                        playerSave = this.playerSaves[playerSaveKey];
                        values_1.push(playerSave.puid, playerSave.health, playerSave.mana, playerSave.spawnPointX, playerSave.spawnPointY, playerSave.deathPointX, playerSave.deathPointY, playerSave.positionX, playerSave.positionY);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, false, resetValues)];
                    case 107:
                        _45.sent();
                        _45.label = 108;
                    case 108:
                        _42++;
                        return [3 /*break*/, 106];
                    case 109: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, true, resetValues)];
                    case 110:
                        _45.sent();
                        playerSaveTimer.log();
                        POITimer = new DebugTimer("POI");
                        db.run("CREATE TABLE PointOfInterest (tilepositionx int, tilepositiony int, id int, RevealedForAllPlayers int, type int, questID varchar(20), PRIMARY KEY (tilepositionx,tilepositiony, id, type, questID))");
                        start = "INSERT INTO PointOfInterest (tilepositionx,tilepositiony,id,RevealedForAllPlayers,type,questID) VALUES ";
                        _43 = 0, _44 = this.pointsOfInterest;
                        _45.label = 111;
                    case 111:
                        if (!(_43 < _44.length)) return [3 /*break*/, 114];
                        poi = _44[_43];
                        values_1.push(poi.position.x, poi.position.y, poi.id, poi.revealedForAllPlayers, poi.type, poi.questId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 6, values_1, false, resetValues)];
                    case 112:
                        _45.sent();
                        _45.label = 113;
                    case 113:
                        _43++;
                        return [3 /*break*/, 111];
                    case 114: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 6, values_1, true, resetValues)];
                    case 115:
                        _45.sent();
                        POITimer.log();
                        _45.label = 116;
                    case 116:
                        // END
                        exportingDialog.close();
                        endTime = new Date().getTime();
                        totalTime = (endTime - startTime) / 1000;
                        console.log("Generating world database file took ".concat(totalTime, " seconds"));
                        return [2 /*return*/, db];
                    case 117:
                        exportingDialog.close();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    World.prototype.addHistory = function (toolHistory) {
        console.log("ADDED HISTORY");
        this.history.splice(this.historyIndex + 1);
        this.history.push(toolHistory);
        this.historyIndex = this.history.length - 1;
        this.recentlyEdited = true;
    };
    World.prototype.undo = function () {
        /*for (let i = 0; i < this.toolHistory[this.toolHistory.length - 2].chunks.length; i++) {
            let chunk = this.toolHistory[this.toolHistory.length - 2].chunks[i]
            console.log(chunk)
            this.addChunk(chunk.clone())
        }

        this.toolHistory.pop()
        this.toolHistory.pop()

        this.toolHistory.push({"chunks":[]})*/
        if (this.canUndo()) {
            this.history[this.historyIndex].undo();
            this.historyIndex--;
        }
    };
    World.prototype.redo = function () {
        if (this.canRedo()) {
            this.history[this.historyIndex + 1].redo();
            this.historyIndex++;
        }
    };
    World.prototype.canUndo = function () {
        return this.history.length > this.historyIndex && this.historyIndex >= 0;
    };
    World.prototype.canRedo = function () {
        return this.history.length > this.historyIndex + 1;
    };
    return World;
}());
export { World };
//# sourceMappingURL=world.js.map