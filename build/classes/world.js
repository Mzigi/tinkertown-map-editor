"use-strict";
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
var World = /** @class */ (function () {
    function World() {
        this.reset();
    }
    World.prototype.reset = function () {
        this.containers = [];
        this.chunks = [];
        this.camera = new Camera();
        this.camera.world = this;
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
    };
    World.prototype.getId = function () {
        var id = 0;
        for (var i = 0; i < worlds.length; i++) {
            if (worlds[i] == this) {
                id = i;
            }
        }
        return id;
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
    World.prototype.getChunkAt = function (x, y) {
        for (var i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x === x && this.chunks[i].y === y) {
                return this.chunks[i];
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
        worlds[currentWorld].containers.push(currentContainer);
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
                worlds[currentWorld].containers.push(currentContainer);
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
        updateWorldList();
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
    World.prototype.saveAsFile = function () {
        var zip = new JSZip();
        //chunks
        for (var i = 0; i < this.chunks.length; i++) {
            var chunk = this.chunks[i];
            if (chunk.chunkHasBeenEdited || this.chunkCache[this.name + "/" + chunk.x + "_" + chunk.y + ".dat"] == null) {
                var buffer = new ArrayBuffer(chunk.getByteSize());
                chunk.writeToBuffer(buffer, 0);
                zip.file(chunk.x + "_" + chunk.y + ".dat", buffer, { "binary": true });
                //saveByteArray([buffer], chunk.x + "_" + chunk.y + ".dat")
            }
            else {
                var buffer = this.chunkCache[this.name + "/" + chunk.x + "_" + chunk.y + ".dat"];
                zip.file(chunk.x + "_" + chunk.y + ".dat", buffer, { "binary": true });
            }
        }
        //storage
        for (var i = 0; i < this.containers.length; i++) {
            var container = this.containers[i];
            var buffer = new ArrayBuffer(container.getByteSize());
            container.writeToBuffer(buffer, 0);
            zip.file(container.getFileName() + "inventory.dat", buffer, { "binary": true });
        }
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
        //unknown files
        for (var key in uneditedFiles) {
            var fileBuffer = uneditedFiles[key];
            zip.file(key.replace(this.name + "/", ""), fileBuffer, { "binary": true });
        }
        //save the zip
        var world = this;
        zip.generateAsync({ type: "blob" })
            .then(function (content) {
            // see FileSaver.js
            saveAs(content, world.name + ".zip");
        });
    };
    World.prototype.saveAsBufferFile = function () {
        var worldBuffer = new ArrayBuffer(this.getByteSize());
        this.writeToBuffer(worldBuffer, 0);
        saveByteArray([worldBuffer], this.name + ".ttworld");
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
//# sourceMappingURL=world.js.map