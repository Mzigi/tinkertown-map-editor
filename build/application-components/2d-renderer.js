import { assetInfo } from "../libraries/assetInfoToJson.js";
import { item_assetInfo } from "../libraries/item-assetInfoToJson.js";
var Renderer = /** @class */ (function () {
    function Renderer(imageHolder, loader, canvasElement) {
        this.chunksDrawnThisFrame = 0;
        this.chunkDrawLimit = 128;
        this.maxCacheTimeout = 128;
        this.LastTime = Date.now() / 1000;
        this.TotalTime = 0;
        this.FPS = 60;
        this.FPSCounter = 0;
        this.FPSTimer = 0;
        this.RendererSettings = {
            useChunkCache: true,
        };
        //this.canvasElement = <HTMLCanvasElement>document.getElementById("2Dcanvas")
        this.loader = loader;
        this.worlds = this.loader.worlds;
        this.imageHolder = imageHolder;
        this.images = imageHolder.images;
        this.canvasElement = canvasElement;
        this.ctx = this.canvasElement.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
    }
    Renderer.prototype.componentToHex = function (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };
    Renderer.prototype.isChunkOnScreen = function (chunk, camera) {
        return true;
        var x1 = (12 + chunk.x * 10) * 16;
        var y1 = (12 + chunk.y * 10) * -16;
        var x2 = (0 + chunk.x * 10) * 16;
        var y2 = (0 + chunk.y * 10) * -16;
        var x3 = (5 + chunk.x * 10) * 16;
        var y3 = (5 + chunk.y * 10) * -16;
        if (camera.isPositionOnScreen(this.canvasElement, x1, y1)
            || camera.isPositionOnScreen(this.canvasElement, x2, y2)
            || camera.isPositionOnScreen(this.canvasElement, x1, y2)
            || camera.isPositionOnScreen(this.canvasElement, x2, y1)
            || camera.isPositionOnScreen(this.canvasElement, x3, y3)
            || camera.isPositionOnScreen(this.canvasElement, x1, y3)) {
            return true;
        }
        return false;
    };
    Renderer.prototype.drawTile = function (tile, chunk, camera) {
        var tileInfo = assetInfo[tile.tileAssetId];
        if (tileInfo) {
            var sx = tileInfo.xMin * 16;
            var sy = tileInfo.yMin * 16;
            var sWidth = (tileInfo.xMax - tileInfo.xMin) * 16;
            var sHeight = (tileInfo.yMax - tileInfo.yMin) * 16;
            var dx = (tile.x + chunk.x * 10) * 16;
            dx += sWidth / 2;
            var dy = (tile.y + chunk.y * 10) * -16;
            dy -= sHeight / 2;
            if (this.images["assets/Tilesets/" + tileInfo.tileset + ".png"]) {
                camera.drawImageCropped(this.canvasElement, this.ctx, this.images["assets/Tilesets/" + tileInfo.tileset + ".png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
            }
        }
        else {
            //draw unknown
            var sx = 0;
            var sy = 0;
            var sWidth = 16;
            var sHeight = 16;
            var dx = (tile.x + chunk.x * 10) * 16;
            dx += sWidth / 2;
            var dy = (tile.y + chunk.y * 10) * -16;
            dy -= sHeight / 2;
            camera.drawImageCropped(this.canvasElement, this.ctx, this.images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
        }
    };
    Renderer.prototype.drawItemCache = function (item, cacheCtx) {
        var itemInfo = item_assetInfo[item.id];
        if (itemInfo) {
            var sx = itemInfo.rectX;
            var sy = itemInfo.rectY;
            var sWidth = itemInfo.rectW;
            var sHeight = itemInfo.rectH;
            var dx = (item.x) * 16 + 32;
            var dy = (item.y) * -16 + 32;
            dy -= sHeight;
            dy += 16 * 10;
            var image = this.images["assets/Tilesets/" + itemInfo.tileset + ".png"];
            if (image) {
                cacheCtx.drawImage(image, sx, image.naturalHeight - sy - sHeight, sWidth, sHeight, dx, dy, sWidth, sHeight);
            }
            else {
                dy = (item.y) * -16 + 32;
                dy += 16 * 10 - 16;
                cacheCtx.drawImage(this.images["assets/Tilesets/unknown.png"], 0, 0, 16, 16, dx, dy, sWidth, sHeight);
            }
            cacheCtx.fillStyle = "#ffffff";
            cacheCtx.fillText(String(item.count), dx, dy + 20);
        }
    };
    Renderer.prototype.drawStorage = function (inventory, camera) {
        var dx = (inventory.x + inventory.chunkX * 10) * 16;
        dx += 8;
        var dy = (inventory.y + inventory.chunkY * 10) * -16;
        dy -= 8;
        camera.drawImage(this.canvasElement, this.ctx, this.images["assets/storage-small.png"], dx, dy, 16, 16);
    };
    Renderer.prototype.drawTileCache = function (tile, cacheCtx) {
        var tileInfo = assetInfo[tile.tileAssetId];
        if (tileInfo) {
            var sx = tileInfo.xMin * 16;
            var sy = tileInfo.yMin * 16;
            var sWidth = (tileInfo.xMax - tileInfo.xMin) * 16;
            var sHeight = (tileInfo.yMax - tileInfo.yMin) * 16;
            var dx = (tile.x) * 16 + 32;
            //dx += sWidth / 2
            var dy = (tile.y) * -16 + 32;
            dy -= sHeight;
            dy += 16 * 10;
            var tileImg = this.images["assets/Tilesets/" + tileInfo.tileset + ".png"];
            if (tileImg) {
                cacheCtx.drawImage(tileImg, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
            }
            else if (this.images["assets/Tilesets/unknown.png"]) {
                //draw unknown
                sx = 0;
                sy = 0;
                sWidth = 16;
                sHeight = 16;
                dx = (tile.x) * 16 + 32;
                //dx += sWidth / 2
                dy = (tile.y) * -16 + 32;
                //dy -= sHeight / 2
                dy -= sHeight;
                dy += 16 * 10;
                cacheCtx.drawImage(this.images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
            }
        }
        else if (this.images["assets/Tilesets/unknown.png"]) {
            //draw unknown
            var sx = 0;
            var sy = 0;
            var sWidth = 16;
            var sHeight = 16;
            var dx = (tile.x) * 16 + 32;
            //dx += sWidth / 2
            var dy = (tile.y) * -16 + 32;
            //dy -= sHeight / 2
            dy -= sHeight;
            dy += 16 * 10;
            cacheCtx.drawImage(this.images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
        }
    };
    Renderer.prototype.drawChunkCache = function (chunk) {
        var cacheCanvasElement = document.createElement("canvas");
        cacheCanvasElement.setAttribute("style", "width:224px; height:224px; image-rendering: pixelated;");
        cacheCanvasElement.hidden = true;
        cacheCanvasElement.width = 224;
        cacheCanvasElement.height = 224;
        var cacheCtx = cacheCanvasElement.getContext("2d");
        cacheCtx.imageSmoothingEnabled = false;
        cacheCtx.fillStyle = "#000000";
        cacheCtx.clearRect(0, 0, 2740, 2740);
        //Tiles
        for (var layerIndex = 0; layerIndex < chunk.layers; layerIndex++) {
            for (var y = chunk.height; y >= 0; y--) {
                for (var x = 0; x < chunk.width; x++) {
                    var tile = chunk.findTileAt(x, y, layerIndex);
                    if (tile) {
                        this.drawTileCache(tile, cacheCtx);
                    }
                }
            }
        }
        //Items
        for (var i = 0; i < chunk.itemDataList.length; i++) {
            this.drawItemCache(chunk.itemDataList[i], cacheCtx);
        }
        chunk.cacheImage = cacheCanvasElement;
        /*let cacheSource = cacheCanvasElement.toDataURL("image/png")
    
        chunk.cacheImage = new Image()
        chunk.cacheImage.src = cacheSource*/
    };
    Renderer.prototype.drawChunk = function (chunk, camera) {
        /*if (!chunk.cacheImage) {
            for (let layerIndex = 0; layerIndex < chunk.layers; layerIndex++) {
                for (let y = chunk.height; y >= 0; y--) {
                    for (let x = 0; x < chunk.width; x++) {
                        let tile = chunk.findTileAt(x,y,layerIndex)
                        if (tile) {
                            drawTile(tile, chunk, camera)
                        }
                    }
                }
            }
    
            drawChunkCache(chunk)
        } else {
            drawChunkCache(chunk)
            let dx = (chunk.x * 10) * 16
            let dy = (chunk.y * 10) * -16
    
            camera.drawImageCropped(canvasElement, ctx, chunk.cacheImage, 0, 0, 160, 160, dx, dy, 160, 160)
        }*/
        if (this.RendererSettings.useChunkCache) {
            if (!chunk.cacheImage && this.chunksDrawnThisFrame < this.chunkDrawLimit) {
                this.drawChunkCache(chunk);
                this.chunksDrawnThisFrame += 1;
            }
            var dx = chunk.x * 160;
            dx += 160 / 2;
            var dy = chunk.y * -160;
            dy -= 160 / 2;
            if (chunk.cacheImage) {
                camera.drawImage(this.canvasElement, this.ctx, chunk.cacheImage, dx, dy, 224, 224);
            }
            else {
                dx = chunk.x * 160;
                dx += 160 / 2;
                dy = chunk.y * -160;
                dy -= 160 / 2;
                this.ctx.fillStyle = "#000000";
                /*ctx.font = (160 * camera.zoom) + "px Arial"
                dx += chunk.x * 160
                camera.drawText(canvas, ctx, chunk.x + "_" + chunk.y, dx, dy, 160)*/
                var tileToDraw = chunk.findTileAt(0, 0, 0);
                if (tileToDraw) {
                    var tileInfo = assetInfo[tileToDraw.tileAssetId];
                    if (tileInfo) {
                        var sx = tileInfo.xMin * 16;
                        var sy = tileInfo.yMin * 16;
                        var sWidth = (tileInfo.xMax - tileInfo.xMin) * 16;
                        var sHeight = (tileInfo.yMax - tileInfo.yMin) * 16;
                        camera.drawImageCropped(this.canvasElement, this.ctx, this.images["assets/Tilesets/" + tileInfo.tileset + ".png"], sx, sy, sWidth, sHeight, dx, dy, 160, 160);
                    }
                }
                else {
                    camera.drawRect(this.canvasElement, this.ctx, dx, dy, 160, 160);
                }
            }
        }
        else {
            for (var layerIndex = 0; layerIndex < chunk.layers; layerIndex++) {
                for (var y = chunk.height; y >= 0; y--) {
                    for (var x = 0; x < chunk.width; x++) {
                        var tile = chunk.findTileAt(x, y, layerIndex);
                        if (tile) {
                            this.drawTile(tile, chunk, camera);
                        }
                    }
                }
            }
        }
        if (this.worlds[this.loader.currentWorld].highlightedChunk == chunk) {
            camera.drawImage(this.canvasElement, this.ctx, this.images["assets/highlightedChunk.png"], chunk.x * 160 + 80, chunk.y * -160 - 80, 160, 160);
        }
    };
    //check a few things before actually drawing chunk
    Renderer.prototype.drawChunkCheck = function (chunk, world) {
        if (chunk) {
            if (this.isChunkOnScreen(chunk, world.camera)) { //chunk on screen
                chunk.cacheTimeout = Date.now() / 1000;
                this.drawChunk(chunk, world.camera);
            }
            else { //chunk off screen
                //delete cached render of chunk if its been off screen for long enough
                if (Date.now() / 1000 - chunk.cacheTimeout > this.maxCacheTimeout) {
                    chunk.resetCacheImage();
                }
            }
        }
    };
    Renderer.prototype.drawWorld = function (canvas, world) {
        if (world.camera.zoom < 0.25) { //if camera is zoomed out a lot
            //old render loop (cheaper but might render chunks in the wrong order)
            for (var i = 0; i < world.chunks.length; i++) {
                var chunk = world.chunks[i];
                this.drawChunkCheck(chunk, world);
            }
        }
        else {
            //new correct order render loop
            var topLeftCornerWorldPos = world.camera.screenPosToWorldPos(canvas, 0, 0);
            var bottomRightCornerWorldPos = world.camera.screenPosToWorldPos(canvas, canvas.width, canvas.height);
            topLeftCornerWorldPos = world.getChunkPosAtWorldPos(topLeftCornerWorldPos.x, topLeftCornerWorldPos.y);
            bottomRightCornerWorldPos = world.getChunkPosAtWorldPos(bottomRightCornerWorldPos.x, bottomRightCornerWorldPos.y);
            var xMin = Math.max(world.xMin, topLeftCornerWorldPos.x);
            var xMax = Math.min(world.xMax, bottomRightCornerWorldPos.x);
            //doing this slightly differently because y is flipped
            var yMax = Math.max(world.yMin, topLeftCornerWorldPos.y);
            var yMin = Math.min(world.yMax, bottomRightCornerWorldPos.y);
            //draw chunk grid
            for (var x = topLeftCornerWorldPos.x; x < bottomRightCornerWorldPos.x + 2; x++) {
                for (var y = bottomRightCornerWorldPos.y; y < topLeftCornerWorldPos.y + 1; y++) {
                    if ((x + y % 2) % 2 == 0) {
                        //when camera approaches 0.25 alpha should become 0
                        var alpha = Math.min((world.camera.zoom - 0.25) * 4, 1);
                        if (this.loader.getPreference("theme") === "dark") {
                            this.ctx.fillStyle = "rgba(30, 31, 33, " + alpha + ")";
                        }
                        else {
                            this.ctx.fillStyle = "rgba(202, 202, 202, " + alpha + ")";
                        }
                        world.camera.drawRect(this.canvasElement, this.ctx, x * 160 - 80, y * -160 - 80, 160, 160);
                    }
                }
            }
            //draw chunks
            xMax += 2;
            xMin -= 3;
            yMax += 2;
            yMin -= 3;
            for (var x = xMax; x > xMin; x--) {
                for (var y = yMax; y > yMin; y--) {
                    var chunk = world.getChunkAt(x, y);
                    this.drawChunkCheck(chunk, world);
                }
            }
            //console.log("X: " + xMin + " - " + xMax)
            //console.log("Y: " + yMin + " - " + yMax)
            //draw storage icons
            for (var i = 0; i < world.containers.length; i++) {
                this.drawStorage(world.containers[i], this.worlds[this.loader.currentWorld].camera);
            }
        }
        //draw points of interest
        if (world.camera.zoom <= 0.35 && this.loader.getPreference("show-poi") === "true") {
            for (var _i = 0, _a = world.pointsOfInterest; _i < _a.length; _i++) {
                var poi = _a[_i];
                world.camera.drawImage(this.canvasElement, this.ctx, this.images["assets/poi3.png"], poi.position.x * 16 - 8, poi.position.y * -16 - 8, 1600 / 4, 1600 / 4);
            }
        }
        //draw selection
        if (world.selection.length === 2) {
            var lowX = Math.min(world.selection[0].x, world.selection[1].x);
            var highX = Math.max(world.selection[0].x, world.selection[1].x);
            var lowY = Math.min(world.selection[0].y, world.selection[1].y);
            var highY = Math.max(world.selection[0].y, world.selection[1].y);
            // corners
            var topLeft = { "x": lowX * 16 + 8, "y": highY * -16 - 8 };
            var topRight = { "x": highX * 16 + 8, "y": highY * -16 - 8 };
            var bottomLeft = { "x": lowX * 16 + 8, "y": lowY * -16 - 8 };
            var bottomRight = { "x": highX * 16 + 8, "y": lowY * -16 - 8 };
            this.ctx.fillStyle = "rgba(255,255,255,0.3)";
            //topleft
            if (Math.abs(topLeft.x - topRight.x) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, topLeft.x + 16, topLeft.y, 16, 16);
            }
            if (Math.abs(topLeft.y - bottomLeft.y) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, topLeft.x, topLeft.y + 16, 16, 16);
            }
            world.camera.drawRect(this.canvasElement, this.ctx, topLeft.x, topLeft.y, 16, 16);
            //topright
            if (Math.abs(topLeft.x - topRight.x) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, topRight.x - 16, topRight.y, 16, 16);
            }
            if (Math.abs(topLeft.y - bottomLeft.y) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, topRight.x, topRight.y + 16, 16, 16);
            }
            world.camera.drawRect(this.canvasElement, this.ctx, topRight.x, topRight.y, 16, 16);
            //bottomleft
            if (Math.abs(topLeft.x - topRight.x) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, bottomLeft.x + 16, bottomLeft.y, 16, 16);
            }
            if (Math.abs(topLeft.y - bottomLeft.y) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, bottomLeft.x, bottomLeft.y - 16, 16, 16);
            }
            world.camera.drawRect(this.canvasElement, this.ctx, bottomLeft.x, bottomLeft.y, 16, 16);
            //bottomright
            if (Math.abs(topLeft.x - topRight.x) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, bottomRight.x - 16, bottomRight.y, 16, 16);
            }
            if (Math.abs(topLeft.y - bottomLeft.y) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, bottomRight.x, bottomRight.y - 16, 16, 16);
            }
            world.camera.drawRect(this.canvasElement, this.ctx, bottomRight.x, bottomRight.y, 16, 16);
            //fill
            var width = Math.abs(topRight.x - topLeft.x);
            var height = Math.abs(topLeft.y - bottomLeft.y);
            this.ctx.fillStyle = "rgba(255,255,255,0.15)";
            world.camera.drawRect(this.canvasElement, this.ctx, topLeft.x + width / 2, topLeft.y + height / 2, width + 16, height + 16);
            /*
            world.camera.drawRect(canvasElement, ctx, highX * 16 + 8, highY * -16 -8, 16, 16)
            world.camera.drawRect(canvasElement, ctx, highX * 16 + 8, lowY * -16 -8, 16, 16)
            world.camera.drawRect(canvasElement, ctx, lowX * 16 + 8, highY * -16 -8, 16, 16)
            world.camera.drawRect(canvasElement, ctx, lowX * 16 + 8, lowY * -16 -8, 16, 16)
            */
        }
        //remove old image caches every 5 seconds
        if (this.TotalTime % 5 === 0) {
            for (var i = 0; i < world.chunks.length; i++) {
                var chunk = world.chunks[i];
                if (Date.now() / 1000 - chunk.cacheTimeout > this.maxCacheTimeout) {
                    chunk.resetCacheImage();
                }
            }
        }
    };
    Renderer.prototype.render = function () {
        var world = this.worlds[this.loader.currentWorld];
        var camera = world.camera;
        var CurrentTime = Date.now() / 1000;
        var ElapsedTime = CurrentTime - this.LastTime;
        this.TotalTime += ElapsedTime;
        this.FPSTimer += ElapsedTime;
        this.FPSCounter += 1;
        if (this.FPSTimer >= 1) {
            this.FPS = this.FPSCounter;
            this.FPSCounter = 0;
            this.FPSTimer = 0;
        }
        this.chunksDrawnThisFrame = 0;
        /*if (currentWorld !== null) {
            if (worlds[currentWorld].camera.zoom > 1) {
                chunkDrawLimit = 24
            } else if (worlds[currentWorld].camera.zoom > 0.5) {
                chunkDrawLimit = 16
            } else {
                chunkDrawLimit = 8
            }
        } else {
            chunkDrawLimit = 4
        }*/
        this.canvasElement.width = this.canvasElement.clientWidth;
        this.canvasElement.height = this.canvasElement.clientHeight;
        this.ctx.clearRect(0, 0, 10000, 10000);
        /*let placeToDrawCorner = worlds[currentWorld].camera.screenPosToWorldPos(canvasElement, worlds[currentWorld].camera.lastPosition.x, worlds[currentWorld].camera.lastPosition.y)
        let chunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(placeToDrawCorner.x, placeToDrawCorner.y)
        if (chunkAtMouse) {
            console.log(chunkAtMouse.getTilePosAtWorldPos(placeToDrawCorner.x, placeToDrawCorner.y))
            //console.log(placeToDrawCorner.x)
        }*/
        if (this.loader.currentWorld !== null) {
            if (this.worlds[this.loader.currentWorld]) {
                this.drawWorld(this.canvasElement, this.worlds[this.loader.currentWorld]);
            }
        }
        //fps counter
        if (this.loader.getPreference("canvas-debug-text") === "true") {
            this.ctx.fillStyle = "#ffffff";
            if (this.loader.getPreference("theme") === "light") {
                this.ctx.fillStyle = "#000000";
            }
            this.ctx.font = "32px pixellari";
            this.ctx.fillText("FPS: " + this.FPS.toString(), 0, this.canvasElement.height - 128);
            var worldMousePos = this.worlds[this.loader.currentWorld].camera.screenPosToWorldPos(document.getElementById("2Dcanvas"), camera.lastPosition.x, camera.lastPosition.y);
            var chunkAndTilePos = this.worlds[this.loader.currentWorld].getChunkAndTilePosAtGlobalPos(worldMousePos.x / 16, (worldMousePos.y / 16) * -1);
            var chunkPos = chunkAndTilePos[0];
            var tilePos = chunkAndTilePos[1];
            var globalTilePos = this.worlds[this.loader.currentWorld].getGlobalPosAtChunkAndTilePos(chunkPos.x, chunkPos.y, Math.floor(tilePos.x), Math.floor(tilePos.y));
            var chunkAtMouse = this.worlds[this.loader.currentWorld].getChunkAt(chunkPos.x, chunkPos.y);
            //relative tile position = [${Math.floor(tilePos.x)}, ${Math.floor(tilePos.y)}] 
            this.ctx.fillText("BIOME: ".concat((chunkAtMouse === null || chunkAtMouse === void 0 ? void 0 : chunkAtMouse.biomeID) || "N/A"), 0, this.canvasElement.height - 96);
            this.ctx.fillText("CHUNK REVEALED: ".concat((chunkAtMouse === null || chunkAtMouse === void 0 ? void 0 : chunkAtMouse.revealed) ? "TRUE" : "FALSE"), 0, this.canvasElement.height - 64);
            this.ctx.fillText("CHUNK: [".concat(chunkPos.x, ", ").concat(chunkPos.y, "]"), 0, this.canvasElement.height);
            if (chunkAtMouse) {
                tilePos = { "x": Math.floor(tilePos.x), "y": Math.floor(tilePos.y) };
                var highestTile = null;
                var highestZ = 0;
                for (var i = 0; i < chunkAtMouse.layers; i++) {
                    var testTile = chunkAtMouse.findTileAt(tilePos.x, tilePos.y, i);
                    if (chunkAtMouse.findTileAt(tilePos.x, tilePos.y, i)) {
                        highestZ = i;
                        highestTile = testTile;
                    }
                }
                if (highestTile) {
                    this.ctx.fillText("TILE: [".concat(globalTilePos.x, ", ").concat(globalTilePos.y, ", ").concat(highestZ, "]"), 0, this.canvasElement.height - 32);
                    highestZ += 1;
                    var tileNameAndId = "#" + highestTile.tileAssetID;
                    if (assetInfo[highestTile.tileAssetId]) {
                        var tileInfo = assetInfo[highestTile.tileAssetId];
                        tileNameAndId = tileInfo.name + "#" + highestTile.tileAssetId;
                    }
                    //console.log(tileNameAndId)
                    this.ctx.fillText(tileNameAndId, camera.lastPosition.x, camera.lastPosition.y);
                    this.ctx.fillText("HP: ".concat(highestTile.health, " ROT: ").concat(highestTile.rotation, " A: ").concat(highestTile.memoryA, " B: ").concat(highestTile.memoryB), camera.lastPosition.x, camera.lastPosition.y + 32);
                }
                else {
                    this.ctx.fillText("TILE: [".concat(globalTilePos.x, ", ").concat(globalTilePos.y, "]"), 0, this.canvasElement.height - 32);
                }
            }
            else {
                this.ctx.fillText("TILE: [".concat(globalTilePos.x, ", ").concat(globalTilePos.y, "]"), 0, this.canvasElement.height - 32);
            }
        }
        /*worlds[currentWorld].camera.drawRect(canvasElement, ctx, placeToDrawCorner.x, placeToDrawCorner.y, 100, 100)
        ctx.fillStyle = "#000000"
        ctx.fillRect(0,0, 100, 100)*/
        this.LastTime = CurrentTime;
        //window.requestAnimationFrame(this.render)
        document.getElementsByTagName("title")[0].innerText = world.name + " - Tinkertown Map Editor";
    };
    return Renderer;
}());
export { Renderer };
//# sourceMappingURL=2d-renderer.js.map