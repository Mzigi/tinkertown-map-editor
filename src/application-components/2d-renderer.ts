import { Camera } from "../classes/camera.js"
import { Chunk } from "../classes/objects/chunk.js"
import { Inventory } from "../classes/objects/inventory.js"
import { Item } from "../classes/objects/item.js"
import { Tile } from "../classes/objects/tile.js"
import { World } from "../classes/objects/world.js"
import { assetInfo } from "../libraries/assetInfoToJson.js"
import { item_assetInfo } from "../libraries/item-assetInfoToJson.js"
import { Editor } from "./editor.js"
import { ImageHolder } from "./image-loader.js"
import { Loader } from "./loader.js"

export class Renderer {
    loader: Loader
    imageHolder: ImageHolder
    editor: Editor

    worlds: Array<World>
    images: {[key: string]: HTMLImageElement}

    canvasElement: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    chunksDrawnThisFrame: number = 0
    chunkDrawLimit: number = 128
    maxCacheTimeout: number = 128

    LastTime: number = Date.now() / 1000
    TotalTime: number = 0
    FPS: number = 60
    FPSCounter: number = 0
    FPSTimer: number = 0

    RendererSettings: {[key: string]: boolean} = {
        useChunkCache: true,
    }

    constructor(imageHolder: ImageHolder, loader: Loader, canvasElement: HTMLCanvasElement, editor: Editor) {
        //this.canvasElement = <HTMLCanvasElement>document.getElementById("2Dcanvas")
        this.loader = loader
        this.editor = editor
        this.worlds = this.loader.worlds
        this.imageHolder = imageHolder
        this.images = imageHolder.images
        this.canvasElement = canvasElement
        this.ctx = this.canvasElement.getContext("2d")
        this.ctx.imageSmoothingEnabled = false
    }

    private componentToHex(c: number) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    isChunkOnScreen(chunk: Chunk, camera: Camera): boolean {
        return true
    
        let x1: number = (12 + chunk.x * 10) * 16
        let y1: number = (12 + chunk.y * 10) * -16
    
        let x2: number = (0 + chunk.x * 10) * 16
        let y2: number = (0 + chunk.y * 10) * -16
    
        let x3: number = (5 + chunk.x * 10) * 16
        let y3: number = (5 + chunk.y * 10) * -16
    
        if (
            camera.isPositionOnScreen(this.canvasElement, x1, y1)
         || camera.isPositionOnScreen(this.canvasElement, x2, y2)
         || camera.isPositionOnScreen(this.canvasElement, x1, y2)
         || camera.isPositionOnScreen(this.canvasElement, x2, y1)
         || camera.isPositionOnScreen(this.canvasElement, x3, y3)
         || camera.isPositionOnScreen(this.canvasElement, x1, y3)
         ) {
            return true
        }
    
        return false
    }

    drawTile(tile: Tile, chunk: Chunk, camera: Camera) {
        let tileInfo = assetInfo[tile.tileAssetId]
        if (tileInfo) {
            let sx: number = tileInfo.xMin * 16
            let sy: number = tileInfo.yMin * 16
            let sWidth: number = (tileInfo.xMax - tileInfo.xMin) * 16
            let sHeight: number = (tileInfo.yMax - tileInfo.yMin) * 16
    
            let dx: number = (tile.x + chunk.x * 10) * 16
            dx += sWidth / 2
            let dy: number = (tile.y + chunk.y * 10) * -16
            dy -= sHeight / 2
            
    
            if (this.images["assets/Tilesets/" + tileInfo.tileset + ".png"]) {
                camera.drawImageCropped(this.canvasElement, this.ctx, this.images["assets/Tilesets/" + tileInfo.tileset + ".png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
            }
        } else {
            //draw unknown
            let sx: number = 0
            let sy: number = 0
            let sWidth: number = 16
            let sHeight: number = 16
    
            let dx: number = (tile.x + chunk.x * 10) * 16
            dx += sWidth / 2
            let dy: number = (tile.y + chunk.y * 10) * -16
            dy -= sHeight / 2
            
            camera.drawImageCropped(this.canvasElement, this.ctx, this.images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
        }
    }

    drawItemCache(item: Item, cacheCtx: CanvasRenderingContext2D) {
        let itemInfo = item_assetInfo[item.id]
        if (itemInfo) {
            let sx: number = itemInfo.rectX
            let sy: number = itemInfo.rectY
            let sWidth: number = itemInfo.rectW
            let sHeight: number = itemInfo.rectH
    
            let dx: number = (item.x) * 16 + 32
            let dy: number = (item.y) * -16 + 32
            dy -= sHeight
            dy += 16 * 10
    
            let image = this.images["assets/Tilesets/" + itemInfo.tileset + ".png"]
    
            if (image) {
                cacheCtx.drawImage(image, sx, image.naturalHeight - sy - sHeight, sWidth, sHeight, dx, dy, sWidth, sHeight)
            } else {
                dy = (item.y) * -16 + 32
                dy += 16 * 10 - 16
                
                cacheCtx.drawImage(this.images["assets/Tilesets/unknown.png"], 0, 0, 16, 16, dx, dy, sWidth, sHeight)
            }
    
            cacheCtx.fillStyle = "#ffffff"
            cacheCtx.fillText(String(item.count), dx, dy + 20)
        }
    }

    drawStorage(inventory: Inventory, camera: Camera) {
        let dx: number = (inventory.x + inventory.chunkX * 10) * 16
        dx += 8
        let dy: number = (inventory.y + inventory.chunkY * 10) * -16
        dy -= 8
    
        camera.drawImage(this.canvasElement, this.ctx, this.images["assets/storage-small.png"], dx, dy, 16, 16)
    }

    drawTileCache(tile: Tile, cacheCtx: CanvasRenderingContext2D) {
        let tileInfo = assetInfo[tile.tileAssetId]
        if (tileInfo) {
            let sx: number = tileInfo.xMin * 16
            let sy: number = tileInfo.yMin * 16
            let sWidth: number = (tileInfo.xMax - tileInfo.xMin) * 16
            let sHeight: number = (tileInfo.yMax - tileInfo.yMin) * 16
    
            let dx: number = (tile.x) * 16 + 32
            //dx += sWidth / 2
            let dy: number = (tile.y) * -16 + 32
            dy -= sHeight
            dy += 16 * 10
            
            let tileImg = this.images["assets/Tilesets/" + tileInfo.tileset + ".png"]
    
            if (tileImg) {
                cacheCtx.drawImage(tileImg, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
            } else if (this.images["assets/Tilesets/unknown.png"]) {
                //draw unknown
                sx = 0
                sy = 0
                sWidth = 16
                sHeight = 16
    
                dx = (tile.x) * 16 + 32
                //dx += sWidth / 2
                dy = (tile.y) * -16 + 32
                //dy -= sHeight / 2
                dy -= sHeight
                dy += 16 * 10
                
                cacheCtx.drawImage(this.images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
            }
        } else if (this.images["assets/Tilesets/unknown.png"]) {
            //draw unknown
            let sx: number = 0
            let sy: number = 0
            let sWidth: number = 16
            let sHeight: number = 16
    
            let dx: number = (tile.x) * 16 + 32
            //dx += sWidth / 2
            let dy: number = (tile.y) * -16 + 32
            //dy -= sHeight / 2
            dy -= sHeight
            dy += 16 * 10
            
            cacheCtx.drawImage(this.images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
        }
    }

    drawChunkCache(chunk: Chunk) {
        let cacheCanvasElement: HTMLCanvasElement = <HTMLCanvasElement>document.createElement("canvas")
        cacheCanvasElement.setAttribute("style","width:224px; height:224px; image-rendering: pixelated;")
        cacheCanvasElement.hidden = true
        cacheCanvasElement.width = 224
        cacheCanvasElement.height = 224
    
        let cacheCtx: CanvasRenderingContext2D = cacheCanvasElement.getContext("2d")
        cacheCtx.imageSmoothingEnabled = false
        cacheCtx.fillStyle = "#000000"
        cacheCtx.clearRect(0,0, 2740,2740)
    
        //Tiles
        for (let layerIndex = 0; layerIndex < chunk.layers; layerIndex++) {
            for (let y = chunk.height; y >= 0; y--) {
                for (let x = 0; x < chunk.width; x++) {
                    let tile: Tile|null = chunk.findTileAt(x,y,layerIndex)
                    if (tile) {
                        this.drawTileCache(tile, cacheCtx)
                    }
                }
            }
        }
    
        //Items
        for (let i = 0; i < chunk.itemDataList.length; i++) {
            this.drawItemCache(chunk.itemDataList[i], cacheCtx)
        }
    
        chunk.cacheImage = cacheCanvasElement
        /*let cacheSource = cacheCanvasElement.toDataURL("image/png")
    
        chunk.cacheImage = new Image()
        chunk.cacheImage.src = cacheSource*/
    }

    drawChunk(chunk: Chunk, camera: Camera) {
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
                this.drawChunkCache(chunk)
                this.chunksDrawnThisFrame += 1
            }
    
            let dx: number = chunk.x * 160
            dx += 160 / 2
            let dy: number = chunk.y * -160
            dy -= 160 / 2
    
            if (chunk.cacheImage) {
                camera.drawImage(this.canvasElement, this.ctx, chunk.cacheImage, dx, dy, 224, 224)
            } else {
                dx = chunk.x * 160
                dx += 160 / 2
                dy = chunk.y * -160
                dy -= 160 / 2
                this.ctx.fillStyle = "#000000"
                /*ctx.font = (160 * camera.zoom) + "px Arial"
                dx += chunk.x * 160
                camera.drawText(canvas, ctx, chunk.x + "_" + chunk.y, dx, dy, 160)*/
                let tileToDraw: Tile|null = chunk.findTileAt(0,0,0)
                if (tileToDraw) {
                    let tileInfo = assetInfo[tileToDraw.tileAssetId]
                    
                    if (tileInfo) {
                        let sx: number = tileInfo.xMin * 16
                        let sy: number = tileInfo.yMin * 16
                        let sWidth: number = (tileInfo.xMax - tileInfo.xMin) * 16
                        let sHeight: number = (tileInfo.yMax - tileInfo.yMin) * 16
    
                        camera.drawImageCropped(this.canvasElement, this.ctx, this.images["assets/Tilesets/" + tileInfo.tileset + ".png"], sx, sy, sWidth, sHeight, dx, dy, 160, 160)
                    }
                } else {
                    camera.drawRect(this.canvasElement, this.ctx, dx, dy, 160, 160)
                }
            }
        } else {
            for (let layerIndex = 0; layerIndex < chunk.layers; layerIndex++) {
                for (let y = chunk.height; y >= 0; y--) {
                    for (let x = 0; x < chunk.width; x++) {
                        let tile: Tile|null = chunk.findTileAt(x,y,layerIndex)
                        if (tile) {
                            this.drawTile(tile, chunk, camera)
                        }
                    }
                }
            }
        }
    
        if (this.worlds[this.loader.currentWorld].highlightedChunk == chunk) {
            camera.drawImage(this.canvasElement, this.ctx, this.images["assets/highlightedChunk.png"], chunk.x * 160 + 80, chunk.y * -160 - 80, 160, 160)
        }
    }

    //check a few things before actually drawing chunk
    drawChunkCheck(chunk: Chunk, world: World) {
        if (chunk) {
            if (this.isChunkOnScreen(chunk, world.camera)) { //chunk on screen
                chunk.cacheTimeout = Date.now() / 1000
                this.drawChunk(chunk, world.camera)
            } else { //chunk off screen
                //delete cached render of chunk if its been off screen for long enough
                if (Date.now() / 1000 - chunk.cacheTimeout > this.maxCacheTimeout) {
                    chunk.resetCacheImage()
                }
            }
        }
    }

    drawWorld(canvas: HTMLCanvasElement, world: World) {
        if (world.camera.zoom < 0.25) { //if camera is zoomed out a lot
            //old render loop (cheaper but might render chunks in the wrong order)
            for (let i = 0; i < world.chunks.length; i++) {
                let chunk = world.chunks[i]
    
                this.drawChunkCheck(chunk, world)
            }
        } else {
            //new correct order render loop
            let topLeftCornerWorldPos: Vector2 = world.camera.screenPosToWorldPos(canvas, 0, 0)
            let bottomRightCornerWorldPos: Vector2 = world.camera.screenPosToWorldPos(canvas, canvas.width, canvas.height)
    
            topLeftCornerWorldPos = world.getChunkPosAtWorldPos(topLeftCornerWorldPos.x, topLeftCornerWorldPos.y)
            bottomRightCornerWorldPos = world.getChunkPosAtWorldPos(bottomRightCornerWorldPos.x, bottomRightCornerWorldPos.y)
    
            let xMin: number = Math.max(world.xMin, topLeftCornerWorldPos.x)
            let xMax: number = Math.min(world.xMax, bottomRightCornerWorldPos.x)
    
            //doing this slightly differently because y is flipped
            let yMax: number = Math.max(world.yMin, topLeftCornerWorldPos.y)
            let yMin: number = Math.min(world.yMax, bottomRightCornerWorldPos.y)
    
            //draw chunk grid
            for (let x = topLeftCornerWorldPos.x; x < bottomRightCornerWorldPos.x + 2; x++) {
                for (let y = bottomRightCornerWorldPos.y; y < topLeftCornerWorldPos.y + 1; y++) {
                    if ((x + y%2) % 2 == 0) {
                        //when camera approaches 0.25 alpha should become 0
                        let alpha = Math.min((world.camera.zoom - 0.25) * 4, 1)
                        
                        if (this.loader.getPreference("theme") === "dark") {
                            this.ctx.fillStyle = "rgba(30, 31, 33, " + alpha + ")"
                        } else {
                            this.ctx.fillStyle = "rgba(202, 202, 202, " + alpha + ")"
                        }
                        world.camera.drawRect(this.canvasElement, this.ctx, x * 160 - 80, y * -160 - 80, 160, 160)
                    }
                }
            }
    
            //draw chunks
            xMax += 2
            xMin -= 3
    
            yMax += 2
            yMin -= 3
    
            for (let x = xMax; x > xMin; x--) {
                for (let y = yMax; y > yMin; y--) {
                    let chunk: Chunk|null = world.getChunkAt(x,y)
                    
                    this.drawChunkCheck(chunk, world)
                }
            }
            //console.log("X: " + xMin + " - " + xMax)
            //console.log("Y: " + yMin + " - " + yMax)
    
            //draw storage icons
            for (let i = 0; i < world.containers.length; i++) {
                this.drawStorage(world.containers[i], this.worlds[this.loader.currentWorld].camera)
            }
        }
    
        //draw points of interest
        if (world.camera.zoom <= 0.35 && this.loader.getPreference("show-poi") === "true") {
            for (let poi of world.pointsOfInterest) {
                world.camera.drawImage(this.canvasElement, this.ctx, this.images["assets/poi3.png"], poi.position.x * 16 - 8, poi.position.y * -16 - 8, 1600 / 4, 1600 / 4)
            }
        }
    
        //draw selection
        if (world.selection.length === 2) {
            let lowX = Math.min(world.selection[0].x, world.selection[1].x)
            let highX = Math.max(world.selection[0].x, world.selection[1].x)
    
            let lowY = Math.min(world.selection[0].y, world.selection[1].y)
            let highY = Math.max(world.selection[0].y, world.selection[1].y)
            
            // corners
            let topLeft = {"x": lowX * 16 + 8, "y": highY * -16 - 8}
            let topRight = {"x": highX * 16 + 8, "y": highY * -16 - 8}
            let bottomLeft = {"x": lowX * 16 + 8, "y": lowY * -16 - 8}
            let bottomRight = {"x": highX * 16 + 8, "y": lowY * -16 - 8}
    
            this.ctx.fillStyle = "rgba(255,255,255,0.3)"
    
            //topleft
            if (Math.abs(topLeft.x - topRight.x) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, topLeft.x + 16, topLeft.y, 16, 16)
            }
            if (Math.abs(topLeft.y - bottomLeft.y) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, topLeft.x, topLeft.y + 16, 16, 16)
            }
            world.camera.drawRect(this.canvasElement, this.ctx, topLeft.x, topLeft.y, 16, 16)
    
            //topright
            if (Math.abs(topLeft.x - topRight.x) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, topRight.x - 16, topRight.y, 16, 16)
            }
            if (Math.abs(topLeft.y - bottomLeft.y) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, topRight.x, topRight.y + 16, 16, 16)
            }
            world.camera.drawRect(this.canvasElement, this.ctx, topRight.x, topRight.y, 16, 16)
    
            //bottomleft
            if (Math.abs(topLeft.x - topRight.x) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, bottomLeft.x + 16, bottomLeft.y, 16, 16)
            }
            if (Math.abs(topLeft.y - bottomLeft.y) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, bottomLeft.x, bottomLeft.y - 16, 16, 16)
            }
            world.camera.drawRect(this.canvasElement, this.ctx, bottomLeft.x, bottomLeft.y, 16, 16)
    
            //bottomright
            if (Math.abs(topLeft.x - topRight.x) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, bottomRight.x - 16, bottomRight.y, 16, 16)
            }
            if (Math.abs(topLeft.y - bottomLeft.y) > 0) {
                world.camera.drawRect(this.canvasElement, this.ctx, bottomRight.x, bottomRight.y - 16, 16, 16)
            }
            world.camera.drawRect(this.canvasElement, this.ctx, bottomRight.x, bottomRight.y, 16, 16)
    
            //fill
            let width = Math.abs(topRight.x - topLeft.x)
            let height = Math.abs(topLeft.y - bottomLeft.y)
            
            this.ctx.fillStyle ="rgba(255,255,255,0.15)"
            world.camera.drawRect(this.canvasElement, this.ctx, topLeft.x + width/2, topLeft.y + height/2, width + 16, height + 16)
    
            /*
            world.camera.drawRect(canvasElement, ctx, highX * 16 + 8, highY * -16 -8, 16, 16)
            world.camera.drawRect(canvasElement, ctx, highX * 16 + 8, lowY * -16 -8, 16, 16)
            world.camera.drawRect(canvasElement, ctx, lowX * 16 + 8, highY * -16 -8, 16, 16)
            world.camera.drawRect(canvasElement, ctx, lowX * 16 + 8, lowY * -16 -8, 16, 16)
            */
        }
    
        //remove old image caches every 5 seconds
        if (this.TotalTime % 5 === 0) {
            for (let i = 0; i < world.chunks.length; i++) {
                let chunk: Chunk|null = world.chunks[i]
    
                if (Date.now() / 1000 - chunk.cacheTimeout > this.maxCacheTimeout) {
                    chunk.resetCacheImage()
                }
            }
        }
    }

    render() {
        let world = this.worlds[this.loader.currentWorld]
        let camera = world.camera

        let CurrentTime: number = Date.now() / 1000
        let ElapsedTime: number = CurrentTime - this.LastTime
        this.TotalTime += ElapsedTime
        this.FPSTimer += ElapsedTime
        this.FPSCounter += 1
    
        if (this.FPSTimer >= 1) {
            this.FPS = this.FPSCounter
            this.FPSCounter = 0
            this.FPSTimer = 0
        }
    
        this.chunksDrawnThisFrame = 0
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
    
        this.canvasElement.width = this.canvasElement.clientWidth
        this.canvasElement.height = this.canvasElement.clientHeight
    
        this.ctx.clearRect(0,0,10000,10000)
    
        /*let placeToDrawCorner = worlds[currentWorld].camera.screenPosToWorldPos(canvasElement, worlds[currentWorld].camera.lastPosition.x, worlds[currentWorld].camera.lastPosition.y)
        let chunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(placeToDrawCorner.x, placeToDrawCorner.y)
        if (chunkAtMouse) {
            console.log(chunkAtMouse.getTilePosAtWorldPos(placeToDrawCorner.x, placeToDrawCorner.y))
            //console.log(placeToDrawCorner.x)
        }*/
    
        if (this.loader.currentWorld !== null) {
            if (this.worlds[this.loader.currentWorld]) {
                this.drawWorld(this.canvasElement, this.worlds[this.loader.currentWorld])
            }
        }
    
        //fps counter
        if (this.loader.getPreference("canvas-debug-text") === "true") {
            this.ctx.fillStyle = "#ffffff"
    
            if (this.loader.getPreference("theme") === "light") {
                this.ctx.fillStyle ="#000000"
            }
    
            this.ctx.font = "32px pixellari"
            this.ctx.fillText("FPS: " + this.FPS.toString(), 0, this.canvasElement.height - 128)

            let worldMousePos = this.worlds[this.loader.currentWorld].camera.screenPosToWorldPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), camera.lastPosition.x, camera.lastPosition.y)
            let chunkAndTilePos = this.worlds[this.loader.currentWorld].getChunkAndTilePosAtGlobalPos(worldMousePos.x / 16, (worldMousePos.y / 16) * -1)
            let chunkPos = chunkAndTilePos[0]
            let tilePos = chunkAndTilePos[1]
    
            let globalTilePos = this.worlds[this.loader.currentWorld].getGlobalPosAtChunkAndTilePos(chunkPos.x, chunkPos.y, Math.floor(tilePos.x), Math.floor(tilePos.y))
    
            let chunkAtMouse = this.worlds[this.loader.currentWorld].getChunkAt(chunkPos.x, chunkPos.y)
    
            //relative tile position = [${Math.floor(tilePos.x)}, ${Math.floor(tilePos.y)}] 
            this.ctx.fillText(`BIOME: ${chunkAtMouse?.biomeID || "N/A"}`, 0, this.canvasElement.height - 96)
            this.ctx.fillText(`CHUNK REVEALED: ${chunkAtMouse?.revealed ? "TRUE" : "FALSE"}`, 0, this.canvasElement.height - 64)
            
            this.ctx.fillText(`CHUNK: [${chunkPos.x}, ${chunkPos.y}]`, 0, this.canvasElement.height)
    
            
            if (chunkAtMouse) {
                tilePos = {"x": Math.floor(tilePos.x), "y": Math.floor(tilePos.y)}
    
                let highestTile = null
                let highestZ = 0

                for (let i = 0; i < chunkAtMouse.layers; i++) {
                    let testTile = chunkAtMouse.findTileAt(tilePos.x, tilePos.y, i)
                    
                    if (chunkAtMouse.findTileAt(tilePos.x, tilePos.y, i)) {
                        highestZ = i
                        highestTile = testTile
                    }
                }

                if (this.editor.selectedLayer != -1) { //if layer isnt auto
                    highestTile = chunkAtMouse.findTileAt(tilePos.x, tilePos.y, this.editor.selectedLayer)
                    if (highestTile) {
                        highestZ = this.editor.selectedLayer
                    }
                }
    
                if (highestTile) {
                    this.ctx.fillText(`TILE: [${globalTilePos.x}, ${globalTilePos.y}, ${highestZ}]`, 0, this.canvasElement.height - 32)
                    highestZ += 1
    
                    let tileNameAndId = "#" + highestTile.tileAssetID
    
                    if (assetInfo[highestTile.tileAssetId]) {
                        let tileInfo = assetInfo[highestTile.tileAssetId]
                        tileNameAndId = tileInfo.name + "#" + highestTile.tileAssetId
                    }
                    //console.log(tileNameAndId)
                    if (world.selection.length == 0) {
                        this.ctx.fillText(tileNameAndId, camera.lastPosition.x, camera.lastPosition.y)
                        this.ctx.fillText(`HP: ${highestTile.health} ROT: ${highestTile.rotation} A: ${highestTile.memoryA} B: ${highestTile.memoryB}`, camera.lastPosition.x, camera.lastPosition.y + 32)
                    }
                } else {
                    this.ctx.fillText(`TILE: [${globalTilePos.x}, ${globalTilePos.y}]`, 0, this.canvasElement.height - 32)
                }
            } else {
                this.ctx.fillText(`TILE: [${globalTilePos.x}, ${globalTilePos.y}]`, 0, this.canvasElement.height - 32)
            }

            if (world.selection.length == 2) {
                let lowX = Math.min(world.selection[0].x, world.selection[1].x)
                let highX = Math.max(world.selection[0].x, world.selection[1].x)
        
                let lowY = Math.min(world.selection[0].y, world.selection[1].y)
                let highY = Math.max(world.selection[0].y, world.selection[1].y)

                this.ctx.fillText(`${highX - lowX + 1}x${highY - lowY + 1}`, camera.lastPosition.x, camera.lastPosition.y)
            }
        }
    
        /*worlds[currentWorld].camera.drawRect(canvasElement, ctx, placeToDrawCorner.x, placeToDrawCorner.y, 100, 100)
        ctx.fillStyle = "#000000"
        ctx.fillRect(0,0, 100, 100)*/
    
        this.LastTime = CurrentTime
        
        //window.requestAnimationFrame(this.render)
    
        let windowTitle = world.name + " - Tinkertown Map Editor"

        if (document.getElementsByTagName("title")[0].innerText != windowTitle) {
            document.getElementsByTagName("title")[0].innerText = windowTitle
        }
    }
}