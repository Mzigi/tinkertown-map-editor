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
        this.name = "world" + this.seed;
        this.version = { "Major": 1, "Minor": 0, "Patch": 0, "Build": "\u0000" };
        this.highestUsedVersion = { "Major": 0, "Minor": 0, "Patch": 0, "Build": "\u0000" };
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
        //editor only
        this.chunkCache = {};
        this.toolHistory = [
            { "chunks": [] },
        ];
        this.hidden = false;
        this.highlightedChunk = null;
        this.camera = new Camera(this.loader);
        this.camera.world = this;
        this.format = WorldFormat.Database;
        this.uneditedFiles = {};
        this.selection = [];
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
        var x = tileX + chunkX * 10;
        var y = tileY + chunkY * 10;
        return { "x": x, "y": y };
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
        this.setTile(tile, chunkPos.x, chunkPos.y);
    };
    World.prototype.removeTileAtGlobalPos = function (x, y, z) {
        var chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y);
        var tilePos = chunkAndTilePos[1];
        var chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y);
        if (chunk) {
            chunk.removeTileAt(tilePos.x, tilePos.y, z);
        }
    };
    World.prototype.removeTilesAtGlobalPosXY = function (x, y) {
        var chunkAndTilePos = this.getChunkAndTilePosAtGlobalPos(x, y);
        var tilePos = chunkAndTilePos[1];
        var chunk = this.getChunkAt(chunkAndTilePos[0].x, chunkAndTilePos[0].y);
        if (chunk) {
            for (var _i = 0, _a = chunk.findTilesAtXY(tilePos.x, tilePos.y); _i < _a.length; _i++) {
                var tile = _a[_i];
                chunk.removeTileAt(tile.x, tile.y, tile.z);
            }
        }
    };
    World.prototype.setTile = function (tile, chunkX, chunkY) {
        var chunk = this.getChunkAt(chunkX, chunkY);
        if (!chunk) {
            chunk = new Chunk();
            chunk.x = chunkX;
            chunk.y = chunkY;
            this.addChunk(chunk);
        }
        chunk.setTile(tile);
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
    World.prototype.saveAsFile = function (isDatabase) {
        if (isDatabase === void 0) { isDatabase = false; }
        return __awaiter(this, void 0, void 0, function () {
            var zip, key, fileBuffer, fileWorldName, i, chunk, buffer, buffer, i, container, buffer, buffer, world_1, error_1, exportingDialog;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        zip = new JSZip();
                        //unknown files
                        for (key in this.uneditedFiles) {
                            fileBuffer = this.uneditedFiles[key];
                            fileWorldName = key.split("/")[0];
                            zip.file(key.replace(fileWorldName + "/", ""), fileBuffer, { "binary": true });
                        }
                        if (!!isDatabase) return [3 /*break*/, 1];
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
                        //storage
                        for (i = 0; i < this.containers.length; i++) {
                            container = this.containers[i];
                            buffer = new ArrayBuffer(container.getByteSize());
                            container.writeToBuffer(buffer, 0);
                            zip.file(container.getFileName() + "inventory.dat", buffer, { "binary": true });
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.toDatabase()];
                    case 2:
                        buffer = ((_a.sent()).export()).buffer;
                        zip.file("backups/world.dat", buffer, { "binary": true });
                        _a.label = 3;
                    case 3:
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
                        world_1 = this;
                        zip.generateAsync({ type: "blob" })
                            .then(function (content) {
                            // see FileSaver.js
                            saveAs(content, world_1.name + ".zip");
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        if (this.loader) {
                            this.loader.alertText("Failed to export world: " + error_1, true, 6);
                        }
                        exportingDialog = document.getElementById("dialog-exporting");
                        exportingDialog.close();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
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
            var loadingDialog, dbTileData, tileData, chunkPos, chunk, tile, dbBiomeEntryData, biomeEntryData, chunkAndTilePos, chunk, itemPaletteData, dbItemPaletteData, itemPalette, dbWorldItemData, worldItemData, worldItem, itemChunk, dbItemByInventory, itemByInventory, container, containerChunkAndTilePos, item, container, item, dbFogRevealData, fogRevealData, chunkAndTilePos, chunkArr, chunk, dbPlayerSaveData, playerSaveData, playerSave, dbBuildingDTOData, buildingDTOData, buildingDTO, dbBuildingTilesDTO, buildingTileDTOData, buildingDTOId, buildingDTO, dbPOI, POIData, poi, dbDiscoveryPOI, discoveryPOIData, discoveryPOI, dbMinimapData, minimapData, minimapValue;
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
                            itemPaletteData = {};
                            dbItemPaletteData = db.prepare("SELECT * FROM Item");
                            while (dbItemPaletteData.step()) {
                                itemPalette = dbItemPaletteData.getAsObject();
                                itemPaletteData[itemPalette.itemGuid] = { "id": itemPalette.itemAssetID, "count": itemPalette.count };
                            }
                            dbItemPaletteData.free();
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
                                        container.target = InventoryFormat.Container;
                                        this.containers.push(container);
                                    }
                                    item = new InventoryItem();
                                    item.slot = itemByInventory.inventoryIndex;
                                    item.count = itemPaletteData[itemByInventory.itemGuid].count;
                                    item.id = itemPaletteData[itemByInventory.itemGuid].id;
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
                                        this.otherContainers[itemByInventory.actorGuid + "_" + itemByInventory.inventoryType] = container;
                                    }
                                    item = new InventoryItem();
                                    item.slot = itemByInventory.inventoryIndex;
                                    item.count = itemPaletteData[itemByInventory.itemGuid].count;
                                    item.id = itemPaletteData[itemByInventory.itemGuid].id;
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
            var endStr = "";
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
    World.prototype.toDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var SQL, exportingDialog, db, start, values_1, _i, _a, chunk, _b, _c, tile, tilePos, _d, _e, _f, _g, dungeonId, _h, _j, chunk, _k, _l, tile, tilePos, itemPalette, _m, _o, container, tilePos, _p, _q, item, itemGuid, _r, _s, _t, _u, otherContainerKey, actorGuidAndInventoryType, actorGuid, inventoryType, container, _v, _w, item, itemGuid, _x, _y, chunk, _z, _0, item, tilePos, itemGuid, i, _1, _2, _3, _4, buildingDTOkey, buildingDTO, _5, _6, _7, _8, buildingDTOkey, buildingDTO, _9, _10, tilePosition, _11, _12, discoveryPOI, _13, _14, chunk, x, y, tilePos, _15, _16, chunk, tilePos, _17, _18, _19, _20, dungeonId, _21, _22, chunk, tilePos, _23, _24, minimapValue, _25, _26, _27, _28, playerSaveKey, playerSave, _29, _30, poi;
            return __generator(this, function (_31) {
                switch (_31.label) {
                    case 0:
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
                        if (!SQL) return [3 /*break*/, 94];
                        return [4 /*yield*/, Wait(1000 / 60)]; //to show dialog
                    case 1:
                        _31.sent(); //to show dialog
                        db = new SQL.Database();
                        // TILES
                        db.run("CREATE TABLE Tiles(x int, y int, z int, hp int DEFAULT 10, memA int, dungeon int, memB int, rotation int, tileAssetID int, PRIMARY KEY (x,y,z))");
                        start = "INSERT INTO Tiles (x,y,z,hp,memA,dungeon,memB,rotation,tileAssetID) VALUES ";
                        values_1 = [];
                        _i = 0, _a = this.chunks;
                        _31.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        chunk = _a[_i];
                        _b = 0, _c = chunk.getTiles();
                        _31.label = 3;
                    case 3:
                        if (!(_b < _c.length)) return [3 /*break*/, 6];
                        tile = _c[_b];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, tile.x, tile.y);
                        values_1.push(tilePos.x, tilePos.y, tile.z, tile.health, tile.memoryA, 0, tile.memoryB, tile.rotation, tile.tileAssetId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, false, function () { values_1 = []; })];
                    case 4:
                        _31.sent();
                        _31.label = 5;
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
                        _31.label = 8;
                    case 8:
                        if (!(_g < _e.length)) return [3 /*break*/, 15];
                        _f = _e[_g];
                        if (!(_f in _d)) return [3 /*break*/, 14];
                        dungeonId = _f;
                        _h = 0, _j = this.dungeons[dungeonId];
                        _31.label = 9;
                    case 9:
                        if (!(_h < _j.length)) return [3 /*break*/, 14];
                        chunk = _j[_h];
                        _k = 0, _l = chunk.getTiles();
                        _31.label = 10;
                    case 10:
                        if (!(_k < _l.length)) return [3 /*break*/, 13];
                        tile = _l[_k];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, tile.x, tile.y);
                        values_1.push(tilePos.x, tilePos.y, tile.z, tile.health, tile.memoryA, dungeonId, tile.memoryB, tile.rotation, tile.tileAssetId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, false, function () { values_1 = []; })];
                    case 11:
                        _31.sent();
                        _31.label = 12;
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
                    return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, true, function () { values_1 = []; })
                        // ITEMS
                    ];
                    case 16:
                        //end insert
                        _31.sent();
                        itemPalette = [];
                        db.run("CREATE TABLE \"Item\" ('itemGuid' varchar primary key not null, 'itemAssetID' integer, 'count' integer)");
                        // CONTAINERS AND INVENTORIES
                        db.run("CREATE TABLE \"ItemByInventory\" (\"tileX\" integer ,\"tileY\" integer ,\"tileZ\" integer ,\"actorGuid\" varchar ,\"inventoryType\" integer ,\"itemGuid\" varchar primary key not null ,\"inventoryIndex\" integer )");
                        start = "INSERT INTO ItemByInventory (tileX,tileY,tileZ,actorGuid,inventoryType,itemGuid,inventoryIndex) VALUES ";
                        _m = 0, _o = this.containers;
                        _31.label = 17;
                    case 17:
                        if (!(_m < _o.length)) return [3 /*break*/, 22];
                        container = _o[_m];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(container.chunkX, container.chunkY, container.x, container.y);
                        _p = 0, _q = container.itemDataList;
                        _31.label = 18;
                    case 18:
                        if (!(_p < _q.length)) return [3 /*break*/, 21];
                        item = _q[_p];
                        itemGuid = uuid();
                        this.addToItemPalette(itemPalette, itemGuid, item.id, item.count);
                        values_1.push(tilePos.x, tilePos.y, container.z, "tile", 0, itemGuid, item.slot);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 7, values_1, false, function () { values_1 = []; })];
                    case 19:
                        _31.sent();
                        _31.label = 20;
                    case 20:
                        _p++;
                        return [3 /*break*/, 18];
                    case 21:
                        _m++;
                        return [3 /*break*/, 17];
                    case 22:
                        _r = this.otherContainers;
                        _s = [];
                        for (_t in _r)
                            _s.push(_t);
                        _u = 0;
                        _31.label = 23;
                    case 23:
                        if (!(_u < _s.length)) return [3 /*break*/, 28];
                        _t = _s[_u];
                        if (!(_t in _r)) return [3 /*break*/, 27];
                        otherContainerKey = _t;
                        actorGuidAndInventoryType = otherContainerKey.split("_");
                        actorGuid = actorGuidAndInventoryType[0];
                        inventoryType = Number(actorGuidAndInventoryType[1]);
                        container = this.otherContainers[otherContainerKey];
                        _v = 0, _w = container.itemDataList;
                        _31.label = 24;
                    case 24:
                        if (!(_v < _w.length)) return [3 /*break*/, 27];
                        item = _w[_v];
                        itemGuid = uuid();
                        this.addToItemPalette(itemPalette, itemGuid, item.id, item.count);
                        values_1.push(0, 0, 0, actorGuid, inventoryType, itemGuid, item.slot);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 7, values_1, false, function () { values_1 = []; })];
                    case 25:
                        _31.sent();
                        _31.label = 26;
                    case 26:
                        _v++;
                        return [3 /*break*/, 24];
                    case 27:
                        _u++;
                        return [3 /*break*/, 23];
                    case 28: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 7, values_1, true, function () { values_1 = []; })
                        // WORLD ITEMS
                    ];
                    case 29:
                        _31.sent();
                        // WORLD ITEMS
                        db.run("CREATE TABLE \"WorldItem\" (\"worldPositionX\" float ,\"worldPositionY\" float ,\"itemGuid\" varchar primary key not null )");
                        start = "INSERT INTO WorldItem (worldPositionX,worldPositionY,itemGuid) VALUES ";
                        _x = 0, _y = this.chunks;
                        _31.label = 30;
                    case 30:
                        if (!(_x < _y.length)) return [3 /*break*/, 35];
                        chunk = _y[_x];
                        _z = 0, _0 = chunk.itemDataList;
                        _31.label = 31;
                    case 31:
                        if (!(_z < _0.length)) return [3 /*break*/, 34];
                        item = _0[_z];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(item.chunkX, item.chunkY, item.x, item.y);
                        itemGuid = uuid();
                        this.addToItemPalette(itemPalette, itemGuid, item.id, item.count);
                        values_1.push(tilePos.x, tilePos.y, itemGuid);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, function () { values_1 = []; })];
                    case 32:
                        _31.sent();
                        _31.label = 33;
                    case 33:
                        _z++;
                        return [3 /*break*/, 31];
                    case 34:
                        _x++;
                        return [3 /*break*/, 30];
                    case 35: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, true, function () { values_1 = []; })
                        // ITEM PALETTE
                    ];
                    case 36:
                        _31.sent();
                        // ITEM PALETTE
                        start = "INSERT INTO Item (itemGuid,itemAssetID,count) VALUES ";
                        i = 0;
                        _31.label = 37;
                    case 37:
                        if (!(i < itemPalette.length)) return [3 /*break*/, 40];
                        values_1.push(itemPalette[i + 0], itemPalette[i + 1], itemPalette[i + 2]);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, function () { values_1 = []; })];
                    case 38:
                        _31.sent();
                        _31.label = 39;
                    case 39:
                        i += 3;
                        return [3 /*break*/, 37];
                    case 40: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, true, function () { values_1 = []; })
                        // BUILDING DTO
                    ];
                    case 41:
                        _31.sent();
                        // BUILDING DTO
                        db.run("CREATE TABLE \"BuildingDTO\" (\"id\" varchar primary key not null ,\"boundingboxbottomlefty\" integer ,\"boundingboxbottomleftx\" integer ,\"boundingboxtoprighty\" integer ,\"boundingboxtoprightx\" integer ,\"rootpositionx\" integer ,\"rootpositiony\" integer ,\"rootpositionz\" integer ,\"townianid\" integer )");
                        start = "INSERT INTO BuildingDTO (id,boundingboxbottomlefty,boundingboxbottomleftx,boundingboxtoprighty,boundingboxtoprightx,rootpositionx,rootpositiony,rootpositionz,townianid) VALUES ";
                        _1 = this.buildingDTOs;
                        _2 = [];
                        for (_3 in _1)
                            _2.push(_3);
                        _4 = 0;
                        _31.label = 42;
                    case 42:
                        if (!(_4 < _2.length)) return [3 /*break*/, 45];
                        _3 = _2[_4];
                        if (!(_3 in _1)) return [3 /*break*/, 44];
                        buildingDTOkey = _3;
                        buildingDTO = this.buildingDTOs[buildingDTOkey];
                        values_1.push(buildingDTO.id, buildingDTO.bottomLeft.y, buildingDTO.bottomLeft.x, buildingDTO.topRight.y, buildingDTO.topRight.x, buildingDTO.rootX, buildingDTO.rootY, buildingDTO.rootZ, buildingDTO.townianId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, false, function () { values_1 = []; })];
                    case 43:
                        _31.sent();
                        _31.label = 44;
                    case 44:
                        _4++;
                        return [3 /*break*/, 42];
                    case 45: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, true, function () { values_1 = []; })
                        // BUILDING DTO TILES
                    ];
                    case 46:
                        _31.sent();
                        // BUILDING DTO TILES
                        db.run("CREATE TABLE BuildingTilesDTO (x int,y int,z int,id TEXT)");
                        start = "INSERT INTO BuildingTilesDTO (x,y,z,id) VALUES ";
                        _5 = this.buildingDTOs;
                        _6 = [];
                        for (_7 in _5)
                            _6.push(_7);
                        _8 = 0;
                        _31.label = 47;
                    case 47:
                        if (!(_8 < _6.length)) return [3 /*break*/, 52];
                        _7 = _6[_8];
                        if (!(_7 in _5)) return [3 /*break*/, 51];
                        buildingDTOkey = _7;
                        buildingDTO = this.buildingDTOs[buildingDTOkey];
                        _9 = 0, _10 = buildingDTO.tilePositions;
                        _31.label = 48;
                    case 48:
                        if (!(_9 < _10.length)) return [3 /*break*/, 51];
                        tilePosition = _10[_9];
                        values_1.push(tilePosition.x, tilePosition.y, tilePosition.x, buildingDTO.id);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, false, function () { values_1 = []; })];
                    case 49:
                        _31.sent();
                        _31.label = 50;
                    case 50:
                        _9++;
                        return [3 /*break*/, 48];
                    case 51:
                        _8++;
                        return [3 /*break*/, 47];
                    case 52: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, true, function () { values_1 = []; })
                        //DISCOVERY POI
                    ];
                    case 53:
                        _31.sent();
                        //DISCOVERY POI
                        db.run("CREATE TABLE DiscoveryPOI (tilepositionx int, tilepositiony int, discoverer varchar(140), questID varchar(20), PRIMARY KEY (tilepositionx,tilepositiony,discoverer))");
                        start = "INSERT INTO DiscoveryPOI (tilepositionx,tilepositiony,discoverer,questID) VALUES ";
                        _11 = 0, _12 = this.discoveryPointsOfInterest;
                        _31.label = 54;
                    case 54:
                        if (!(_11 < _12.length)) return [3 /*break*/, 57];
                        discoveryPOI = _12[_11];
                        values_1.push(discoveryPOI.position.x, discoveryPOI.position.y, discoveryPOI.discoverer, discoveryPOI.questId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, false, function () { values_1 = []; })];
                    case 55:
                        _31.sent();
                        _31.label = 56;
                    case 56:
                        _11++;
                        return [3 /*break*/, 54];
                    case 57: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, true, function () { values_1 = []; })
                        //BIOME ENTRY
                    ];
                    case 58:
                        _31.sent();
                        //BIOME ENTRY
                        db.run("CREATE TABLE BiomeEntry(X int, Y int, Biome int, PRIMARY KEY (X,Y))");
                        start = "INSERT INTO BiomeEntry (X,Y,Biome) VALUES ";
                        _13 = 0, _14 = this.chunks;
                        _31.label = 59;
                    case 59:
                        if (!(_13 < _14.length)) return [3 /*break*/, 66];
                        chunk = _14[_13];
                        x = 0;
                        _31.label = 60;
                    case 60:
                        if (!(x < 10)) return [3 /*break*/, 65];
                        y = 0;
                        _31.label = 61;
                    case 61:
                        if (!(y < 10)) return [3 /*break*/, 64];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, x, y);
                        values_1.push(tilePos.x, tilePos.y, chunk.biomeID);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, function () { values_1 = []; })];
                    case 62:
                        _31.sent();
                        _31.label = 63;
                    case 63:
                        y++;
                        return [3 /*break*/, 61];
                    case 64:
                        x++;
                        return [3 /*break*/, 60];
                    case 65:
                        _13++;
                        return [3 /*break*/, 59];
                    case 66: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, true, function () { values_1 = []; })
                        //FOG REVEAL
                    ];
                    case 67:
                        _31.sent();
                        //FOG REVEAL
                        db.run("CREATE TABLE FogReveal (x int, y int, dungeon int)");
                        start = "INSERT INTO FogReveal (x,y,dungeon) VALUES ";
                        _15 = 0, _16 = this.chunks;
                        _31.label = 68;
                    case 68:
                        if (!(_15 < _16.length)) return [3 /*break*/, 71];
                        chunk = _16[_15];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, 0, 0);
                        if (!chunk.revealed) return [3 /*break*/, 70];
                        values_1.push(tilePos.x, tilePos.y, 0);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, function () { values_1 = []; })];
                    case 69:
                        _31.sent();
                        _31.label = 70;
                    case 70:
                        _15++;
                        return [3 /*break*/, 68];
                    case 71:
                        _17 = this.dungeons;
                        _18 = [];
                        for (_19 in _17)
                            _18.push(_19);
                        _20 = 0;
                        _31.label = 72;
                    case 72:
                        if (!(_20 < _18.length)) return [3 /*break*/, 77];
                        _19 = _18[_20];
                        if (!(_19 in _17)) return [3 /*break*/, 76];
                        dungeonId = _19;
                        _21 = 0, _22 = this.dungeons[dungeonId];
                        _31.label = 73;
                    case 73:
                        if (!(_21 < _22.length)) return [3 /*break*/, 76];
                        chunk = _22[_21];
                        tilePos = this.getGlobalPosAtChunkAndTilePos(chunk.x, chunk.y, 0, 0);
                        if (!chunk.revealed) return [3 /*break*/, 75];
                        values_1.push(tilePos.x, tilePos.y, dungeonId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, false, function () { values_1 = []; })];
                    case 74:
                        _31.sent();
                        _31.label = 75;
                    case 75:
                        _21++;
                        return [3 /*break*/, 73];
                    case 76:
                        _20++;
                        return [3 /*break*/, 72];
                    case 77: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 3, values_1, true, function () { values_1 = []; })
                        // MINIMAP
                    ];
                    case 78:
                        _31.sent();
                        // MINIMAP
                        db.run("CREATE TABLE Minimap (x int, y int, tileAssetID int, dungeon int, PRIMARY KEY (x,y))");
                        start = "INSERT INTO Minimap (x,y,tileAssetID,dungeon) VALUES ";
                        _23 = 0, _24 = this.minimapData;
                        _31.label = 79;
                    case 79:
                        if (!(_23 < _24.length)) return [3 /*break*/, 82];
                        minimapValue = _24[_23];
                        values_1.push(minimapValue.position.x, minimapValue.position.y, minimapValue.tileAssetId, minimapValue.dungeon);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, false, function () { values_1 = []; })];
                    case 80:
                        _31.sent();
                        _31.label = 81;
                    case 81:
                        _23++;
                        return [3 /*break*/, 79];
                    case 82: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 4, values_1, true, function () { values_1 = []; })
                        // PLAYER SAVE
                    ];
                    case 83:
                        _31.sent();
                        // PLAYER SAVE
                        db.run("CREATE TABLE \"PlayerSave\" (\"Puid\" varchar primary key not null ,\"Health\" integer ,\"Mana\" integer ,\"SpawnPointX\" float ,\"SpawnPointY\" float ,\"DeathPointX\" float ,\"DeathPointY\" float ,\"PositionX\" float ,\"PositionY\" float )");
                        start = "INSERT INTO PlayerSave (Puid,Health,Mana,SpawnPointX,SpawnPointY,DeathPointX,DeathPointY,PositionX,PositionY) VALUES ";
                        _25 = this.playerSaves;
                        _26 = [];
                        for (_27 in _25)
                            _26.push(_27);
                        _28 = 0;
                        _31.label = 84;
                    case 84:
                        if (!(_28 < _26.length)) return [3 /*break*/, 87];
                        _27 = _26[_28];
                        if (!(_27 in _25)) return [3 /*break*/, 86];
                        playerSaveKey = _27;
                        playerSave = this.playerSaves[playerSaveKey];
                        values_1.push(playerSave.puid, playerSave.health, playerSave.mana, playerSave.spawnPointX, playerSave.spawnPointY, playerSave.deathPointX, playerSave.deathPointY, playerSave.positionX, playerSave.positionY);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, false, function () { values_1 = []; })];
                    case 85:
                        _31.sent();
                        _31.label = 86;
                    case 86:
                        _28++;
                        return [3 /*break*/, 84];
                    case 87: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 9, values_1, true, function () { values_1 = []; })
                        // POI
                    ];
                    case 88:
                        _31.sent();
                        // POI
                        db.run("CREATE TABLE PointOfInterest (tilepositionx int, tilepositiony int, id int, RevealedForAllPlayers int, type int, questID varchar(20), PRIMARY KEY (tilepositionx,tilepositiony, id, type, questID))");
                        start = "INSERT INTO PointOfInterest (tilepositionx,tilepositiony,id,RevealedForAllPlayers,type,questID) VALUES ";
                        _29 = 0, _30 = this.pointsOfInterest;
                        _31.label = 89;
                    case 89:
                        if (!(_29 < _30.length)) return [3 /*break*/, 92];
                        poi = _30[_29];
                        values_1.push(poi.position.x, poi.position.y, poi.id, poi.revealedForAllPlayers, poi.type, poi.questId);
                        return [4 /*yield*/, this.dbCheckMassInsert(db, start, 6, values_1, false, function () { values_1 = []; })];
                    case 90:
                        _31.sent();
                        _31.label = 91;
                    case 91:
                        _29++;
                        return [3 /*break*/, 89];
                    case 92: return [4 /*yield*/, this.dbCheckMassInsert(db, start, 6, values_1, true, function () { values_1 = []; })
                        // END
                    ];
                    case 93:
                        _31.sent();
                        // END
                        exportingDialog.close();
                        return [2 /*return*/, db];
                    case 94:
                        exportingDialog.close();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    World.prototype.undoOnce = function () {
        for (var i = 0; i < this.toolHistory[this.toolHistory.length - 2].chunks.length; i++) {
            var chunk = this.toolHistory[this.toolHistory.length - 2].chunks[i];
            console.log(chunk);
            this.addChunk(chunk.clone());
        }
        this.toolHistory.pop();
        this.toolHistory.pop();
        this.toolHistory.push({ "chunks": [] });
    };
    return World;
}());
export { World };
function async() {
    throw new Error("Function not implemented.");
}
//# sourceMappingURL=world.js.map