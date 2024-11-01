"use-strict";
// @ts-check

let canvasElement = <HTMLCanvasElement>document.getElementById("2Dcanvas")
//let cacheCanvasElement = document.getElementById("2DcacheCanvas")

let ctx: CanvasRenderingContext2D = canvasElement.getContext("2d")
ctx.imageSmoothingEnabled = false

var chunksDrawnThisFrame: number = 0
var chunkDrawLimit: number = 128
var maxCacheTimeout: number = 30

var LastTime: number = Date.now() / 1000
var TotalTime: number = 0
var FPS: number = 60
let FPSCounter: number = 0
let FPSTimer: number = 0

var RendererSettings = {
    useChunkCache: true,
}

/*let cacheCtx = cacheCanvasElement.getContext("2d")
cacheCtx.imageSmoothingEnabled = false*/

/*let imagesToLoad = [
    "assets/Tilesets/AmongUsFloors.png",
    "assets/Tilesets/AmongUsLighthouseAnimation.png",
    "assets/Tilesets/AmongUsLightHouseLight.png",
    "assets/Tilesets/AmongUsObjects.png",
    "assets/Tilesets/AmongUsWallElements.png",
    "assets/Tilesets/Building.png",
    "assets/Tilesets/ClassesAndCombat.png",
    "assets/Tilesets/Desert.png",
    "assets/Tilesets/DesertObjects.png",
    "assets/Tilesets/Dungeon.png",
    "assets/Tilesets/DungeonDesert.png",
    "assets/Tilesets/DungeonForest.png",
    "assets/Tilesets/DungeonIce.png",
    "assets/Tilesets/DungeonIceNoPopup.png",
    "assets/Tilesets/Extra.png",
    "assets/Tilesets/Farming.png",
    "assets/Tilesets/Forest.png",
    "assets/Tilesets/ForestObjects.png",
    "assets/Tilesets/Housing.png",
    "assets/Tilesets/HousingObjects.png",
    "assets/Tilesets/Ice.png",
    "assets/Tilesets/IceObjects.png",
    "assets/Tilesets/LavaBiome.png",
    "assets/Tilesets/LavaDungeon.png",
    "assets/Tilesets/LunarNewYear.png",
    "assets/Tilesets/MineRails.png",
    "assets/Tilesets/Mines.png",
    "assets/Tilesets/NPCUpdate.png",
    "assets/Tilesets/Placeables.png",
    "assets/Tilesets/Resources.png",
    "assets/Tilesets/SummerUpdate.png",
    "assets/Tilesets/TallObjects.png",
    "assets/Tilesets/TransportationObjects.png",
    "assets/Tilesets/Traps.png",
    "assets/Tilesets/VoidDungeon.png",
    "assets/Tilesets/VolcanoMiniDungeons.png",

    "assets/Tilesets/GrassPatch.png",
    "assets/Tilesets/unknown.png",
]

let images = {}

//load images
for (let i = 0; i < imagesToLoad.length; i++) {
    images[imagesToLoad[i]] = new Image()
    images[imagesToLoad[i]].src = imagesToLoad[i]
}*/

function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function isChunkOnScreen(chunk: Chunk, camera: Camera): boolean {
    return true

    let x1: number = (12 + chunk.x * 10) * 16
    let y1: number = (12 + chunk.y * 10) * -16

    let x2: number = (0 + chunk.x * 10) * 16
    let y2: number = (0 + chunk.y * 10) * -16

    let x3: number = (5 + chunk.x * 10) * 16
    let y3: number = (5 + chunk.y * 10) * -16

    if (
        camera.isPositionOnScreen(canvasElement, x1, y1)
     || camera.isPositionOnScreen(canvasElement, x2, y2)
     || camera.isPositionOnScreen(canvasElement, x1, y2)
     || camera.isPositionOnScreen(canvasElement, x2, y1)
     || camera.isPositionOnScreen(canvasElement, x3, y3)
     || camera.isPositionOnScreen(canvasElement, x1, y3)
     ) {
        return true
    }

    return false
}

function drawTile(tile: Tile, chunk: Chunk, camera: Camera) {
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
        

        if (images["assets/Tilesets/" + tileInfo.tileset + ".png"]) {
            camera.drawImageCropped(canvasElement, ctx, images["assets/Tilesets/" + tileInfo.tileset + ".png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
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
        
        camera.drawImageCropped(canvasElement, ctx, images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
    }
}

function drawItemCache(item: Item, cacheCtx: CanvasRenderingContext2D) {
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

        let image = images["assets/Tilesets/" + itemInfo.tileset + ".png"]

        if (image) {
            cacheCtx.drawImage(image, sx, image.naturalHeight - sy - sHeight, sWidth, sHeight, dx, dy, sWidth, sHeight)
        } else {
            dy = (item.y) * -16 + 32
            dy += 16 * 10 - 16
            
            cacheCtx.drawImage(images["assets/Tilesets/unknown.png"], 0, 0, 16, 16, dx, dy, sWidth, sHeight)
        }

        cacheCtx.fillStyle = "#ffffff"
        cacheCtx.fillText(String(item.count), dx, dy + 20)
    }
}

function drawStorage(inventory: Inventory, camera: Camera) {
    let dx: number = (inventory.x + inventory.chunkX * 10) * 16
    dx += 8
    let dy: number = (inventory.y + inventory.chunkY * 10) * -16
    dy -= 8

    camera.drawImage(canvasElement, ctx, images["assets/storage-small.png"], dx, dy, 16, 16)
}

function drawTileCache(tile: Tile, cacheCtx: CanvasRenderingContext2D) {
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
        
        let tileImg = images["assets/Tilesets/" + tileInfo.tileset + ".png"]

        if (tileImg) {
            cacheCtx.drawImage(tileImg, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
        } else if (images["assets/Tilesets/unknown.png"]) {
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
            
            cacheCtx.drawImage(images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
        }
    } else if (images["assets/Tilesets/unknown.png"]) {
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
        
        cacheCtx.drawImage(images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
    }
}

function drawChunkCache(chunk: Chunk) {
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
                    drawTileCache(tile, cacheCtx)
                }
            }
        }
    }

    //Items
    for (let i = 0; i < chunk.itemDataList.length; i++) {
        drawItemCache(chunk.itemDataList[i], cacheCtx)
    }

    chunk.cacheImage = cacheCanvasElement
    /*let cacheSource = cacheCanvasElement.toDataURL("image/png")

    chunk.cacheImage = new Image()
    chunk.cacheImage.src = cacheSource*/
}

function drawChunk(chunk: Chunk, camera: Camera) {
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

    if (RendererSettings.useChunkCache) {
        if (!chunk.cacheImage && chunksDrawnThisFrame < chunkDrawLimit) {
            drawChunkCache(chunk)
            chunksDrawnThisFrame += 1
        }

        let dx: number = chunk.x * 160
        dx += 160 / 2
        let dy: number = chunk.y * -160
        dy -= 160 / 2

        if (chunk.cacheImage) {
            camera.drawImage(canvasElement, ctx, chunk.cacheImage, dx, dy, 224, 224)
        } else {
            dx = chunk.x * 160
            dx += 160 / 2
            dy = chunk.y * -160
            dy -= 160 / 2
            ctx.fillStyle = "#000000"
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

                    camera.drawImageCropped(canvasElement, ctx, images["assets/Tilesets/" + tileInfo.tileset + ".png"], sx, sy, sWidth, sHeight, dx, dy, 160, 160)
                }
            } else {
                camera.drawRect(canvasElement, ctx, dx, dy, 160, 160)
            }
        }
    } else {
        for (let layerIndex = 0; layerIndex < chunk.layers; layerIndex++) {
            for (let y = chunk.height; y >= 0; y--) {
                for (let x = 0; x < chunk.width; x++) {
                    let tile: Tile|null = chunk.findTileAt(x,y,layerIndex)
                    if (tile) {
                        drawTile(tile, chunk, camera)
                    }
                }
            }
        }
    }

    if (worlds[currentWorld].highlightedChunk == chunk) {
        camera.drawImage(canvasElement, ctx, images["assets/highlightedChunk.png"], chunk.x * 160 + 80, chunk.y * -160 - 80, 160, 160)
    }
}

//check a few things before actually drawing chunk
function drawChunkCheck(chunk: Chunk, world: World) {
    if (chunk) {
        if (isChunkOnScreen(chunk, world.camera)) { //chunk on screen
            chunk.cacheTimeout = Date.now() / 1000
            drawChunk(chunk, world.camera)
        } else { //chunk off screen
            //delete cached render of chunk if its been off screen for long enough
            if (Date.now() / 1000 - chunk.cacheTimeout > maxCacheTimeout) {
                chunk.resetCacheImage()
            }
        }
    }
}

function drawWorld(canvas: HTMLCanvasElement, world: World) {
    if (world.camera.zoom < 0.25) { //if camera is zoomed out a lot
        //old render loop (cheaper but might render chunks in the wrong order)
        for (let i = 0; i < world.chunks.length; i++) {
            let chunk = world.chunks[i]

            drawChunkCheck(chunk, world)
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
                    
                    if (getPreference("theme") === "dark") {
                        ctx.fillStyle = "rgba(30, 31, 33, " + alpha + ")"
                    } else {
                        ctx.fillStyle = "rgba(202, 202, 202, " + alpha + ")"
                    }
                    world.camera.drawRect(canvasElement, ctx, x * 160 - 80, y * -160 - 80, 160, 160)
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
                
                drawChunkCheck(chunk, world)
            }
        }
        //console.log("X: " + xMin + " - " + xMax)
        //console.log("Y: " + yMin + " - " + yMax)

        //draw storage icons
        for (let i = 0; i < world.containers.length; i++) {
            drawStorage(world.containers[i], worlds[currentWorld].camera)
        }
    }

    //draw points of interest
    if (world.camera.zoom <= 0.35 && getPreference("show-poi") === "true") {
        for (let poi of world.pointsOfInterest) {
            world.camera.drawImage(canvasElement, ctx, images["assets/poi3.png"], poi.position.x * 16 - 8, poi.position.y * -16 - 8, 1600 / 4, 1600 / 4)
        }
    }

    //remove old image caches every 5 seconds
    if (TotalTime % 5 === 0) {
        for (let i = 0; i < world.chunks.length; i++) {
            let chunk: Chunk|null = world.chunks[i]

            if (Date.now() / 1000 - chunk.cacheTimeout > maxCacheTimeout) {
                chunk.resetCacheImage()
            }
        }
    }
}

function render() {
    let CurrentTime: number = Date.now() / 1000
    let ElapsedTime: number = CurrentTime - LastTime
    TotalTime += ElapsedTime
    FPSTimer += ElapsedTime
    FPSCounter += 1

    if (FPSTimer >= 1) {
        FPS = FPSCounter
        FPSCounter = 0
        FPSTimer = 0
    }

    chunksDrawnThisFrame = 0
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

    canvasElement.width = canvasElement.clientWidth
    canvasElement.height = canvasElement.clientHeight

    ctx.clearRect(0,0,10000,10000)

    /*let placeToDrawCorner = worlds[currentWorld].camera.screenPosToWorldPos(canvasElement, worlds[currentWorld].camera.lastPosition.x, worlds[currentWorld].camera.lastPosition.y)
    let chunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(placeToDrawCorner.x, placeToDrawCorner.y)
    if (chunkAtMouse) {
        console.log(chunkAtMouse.getTilePosAtWorldPos(placeToDrawCorner.x, placeToDrawCorner.y))
        //console.log(placeToDrawCorner.x)
    }*/

    if (currentWorld !== null) {
        if (worlds[currentWorld]) {
            drawWorld(canvasElement, worlds[currentWorld])
        }
    }

    //fps counter
    if (getPreference("canvas-debug-text") === "true") {
        ctx.fillStyle = "#ffffff"
        ctx.font = "32px pixellari"
        ctx.fillText("FPS: " +FPS.toString(), 0, canvasElement.height - 96)

        let worldMousePos = worlds[currentWorld].camera.screenPosToWorldPos((<HTMLCanvasElement>document.getElementById("2Dcanvas")), worlds[currentWorld].camera.lastPosition.x,worlds[currentWorld].camera.lastPosition.y)
        let chunkAndTilePos = worlds[currentWorld].getChunkAndTilePosAtGlobalPos(worldMousePos.x / 16, (worldMousePos.y / 16) * -1)
        let chunkPos = chunkAndTilePos[0]
        let tilePos = chunkAndTilePos[1]

        let globalTilePos = worlds[currentWorld].getGlobalPosAtChunkAndTilePos(chunkPos.x, chunkPos.y, Math.floor(tilePos.x), Math.floor(tilePos.y))

        let chunkAtMouse = worlds[currentWorld].getChunkAt(chunkPos.x, chunkPos.y)

        //relative tile position = [${Math.floor(tilePos.x)}, ${Math.floor(tilePos.y)}] 
        ctx.fillText(`CHUNK REVEALED: ${chunkAtMouse?.revealed ? "TRUE" : "FALSE"}`, 0, canvasElement.height - 64)
        ctx.fillText(`TILE: [${globalTilePos.x}, ${globalTilePos.y}]`, 0, canvasElement.height - 32)
        ctx.fillText(`CHUNK: [${chunkPos.x}, ${chunkPos.y}]`, 0, canvasElement.height)

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

            if (highestTile) {
                highestZ += 1

                if (assetInfo[highestTile.tileAssetId]) {
                    let tileInfo = assetInfo[highestTile.tileAssetId]
                    let tileNameAndId = tileInfo.name + "#" + highestTile.tileAssetId
                    //console.log(tileNameAndId)
                    ctx.fillText(tileNameAndId, worlds[currentWorld].camera.lastPosition.x, worlds[currentWorld].camera.lastPosition.y)
                }
            }
        }
    }

    /*worlds[currentWorld].camera.drawRect(canvasElement, ctx, placeToDrawCorner.x, placeToDrawCorner.y, 100, 100)
    ctx.fillStyle = "#000000"
    ctx.fillRect(0,0, 100, 100)*/

    LastTime = CurrentTime
    window.requestAnimationFrame(render)

    document.getElementsByTagName("title")[0].innerText = worlds[currentWorld].name + " - Tinkertown Map Editor"
}

render()