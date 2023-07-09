"use-strict";
// @ts-check

let canvasElement = <HTMLCanvasElement>document.getElementById("2Dcanvas")
//let cacheCanvasElement = document.getElementById("2DcacheCanvas")

let ctx = canvasElement.getContext("2d")
ctx.imageSmoothingEnabled = false

var chunksDrawnThisFrame = 0
var chunkDrawLimit = 16
var maxCacheTimeout = 10

var LastTime = Date.now() / 1000
var TotalTime = 0
var FPS = 60
let FPSCounter = 0
let FPSTimer = 0

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

function isChunkOnScreen(chunk, camera) {
    let x1 = (10 + chunk.x * 10) * 16
    let y1 = (10 + chunk.y * 10) * -16

    let x2 = (0 + chunk.x * 10) * 16
    let y2 = (0 + chunk.y * 10) * -16

    if (
        camera.isPositionOnScreen(canvasElement, x1, y1)
     || camera.isPositionOnScreen(canvasElement, x2, y2)
     || camera.isPositionOnScreen(canvasElement, x1, y2)
     || camera.isPositionOnScreen(canvasElement, x2, y1)
     ) {
        return true
    }
    return false
}

function drawTile(tile, chunk, camera) {
    let tileInfo = assetInfo[tile.tileAssetId]
    if (tileInfo) {
        let sx = tileInfo.xMin * 16
        let sy = tileInfo.yMin * 16
        let sWidth = (tileInfo.xMax - tileInfo.xMin) * 16
        let sHeight = (tileInfo.yMax - tileInfo.yMin) * 16

        let dx = (tile.x + chunk.x * 10) * 16
        dx += sWidth / 2
        let dy = (tile.y + chunk.y * 10) * -16
        dy -= sHeight / 2
        

        if (images["assets/Tilesets/" + tileInfo.tileset + ".png"]) {
            camera.drawImageCropped(canvasElement, ctx, images["assets/Tilesets/" + tileInfo.tileset + ".png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
        }
    } else {
        //draw unknown
        let sx = 0
        let sy = 0
        let sWidth = 16
        let sHeight = 16

        let dx = (tile.x + chunk.x * 10) * 16
        dx += sWidth / 2
        let dy = (tile.y + chunk.y * 10) * -16
        dy -= sHeight / 2
        
        camera.drawImageCropped(canvasElement, ctx, images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
    }
}

function drawTileCache(tile, chunk, cacheCtx) {
    let tileInfo = assetInfo[tile.tileAssetId]
    if (tileInfo) {
        let sx = tileInfo.xMin * 16
        let sy = tileInfo.yMin * 16
        let sWidth = (tileInfo.xMax - tileInfo.xMin) * 16
        let sHeight = (tileInfo.yMax - tileInfo.yMin) * 16

        let dx = (tile.x) * 16 + 32
        //dx += sWidth / 2
        let dy = (tile.y) * -16 + 32
        dy -= sHeight
        dy += 16 * 10
        
        if (images["assets/Tilesets/" + tileInfo.tileset + ".png"]) {
            cacheCtx.drawImage(images["assets/Tilesets/" + tileInfo.tileset + ".png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
        } else {
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
    } else {
        //draw unknown
        let sx = 0
        let sy = 0
        let sWidth = 16
        let sHeight = 16

        let dx = (tile.x) * 16 + 32
        //dx += sWidth / 2
        let dy = (tile.y) * -16 + 32
        //dy -= sHeight / 2
        dy -= sHeight
        dy += 16 * 10
        
        cacheCtx.drawImage(images["assets/Tilesets/unknown.png"], sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight)
    }
}

function drawChunkCache(chunk) {
    let cacheCanvasElement = <HTMLCanvasElement>document.createElement("canvas")
    cacheCanvasElement.setAttribute("style","width:224px; height:224px; image-rendering: pixelated;")
    cacheCanvasElement.hidden = true
    cacheCanvasElement.width = 224
    cacheCanvasElement.height = 224

    let cacheCtx = cacheCanvasElement.getContext("2d")
    cacheCtx.imageSmoothingEnabled = false
    cacheCtx.fillStyle = "#000000"
    cacheCtx.clearRect(0,0, 2740,2740)

    for (let layerIndex = 0; layerIndex < chunk.layers; layerIndex++) {
        for (let y = chunk.height; y >= 0; y--) {
            for (let x = 0; x < chunk.width; x++) {
                let tile = chunk.findTileAt(x,y,layerIndex)
                if (tile) {
                    drawTileCache(tile, chunk, cacheCtx)
                }
            }
        }
    }

    chunk.cacheImage = cacheCanvasElement
    /*let cacheSource = cacheCanvasElement.toDataURL("image/png")

    chunk.cacheImage = new Image()
    chunk.cacheImage.src = cacheSource*/
}

function drawChunk(chunk, camera) {
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

        let dx = chunk.x * 160
        dx += 160 / 2
        let dy = chunk.y * -160
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
            let tileToDraw = chunk.findTileAt(0,0,0)
            if (tileToDraw) {
                let tileInfo = assetInfo[tileToDraw.tileAssetId]
                
                if (tileInfo) {
                    let sx = tileInfo.xMin * 16
                    let sy = tileInfo.yMin * 16
                    let sWidth = (tileInfo.xMax - tileInfo.xMin) * 16
                    let sHeight = (tileInfo.yMax - tileInfo.yMin) * 16

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
                    let tile = chunk.findTileAt(x,y,layerIndex)
                    if (tile) {
                        drawTile(tile, chunk, camera)
                    }
                }
            }
        }
    }
}

//check a few things before actually drawing chunk
function drawChunkCheck(chunk, world, ElapsedTime) {
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

function drawWorld(canvas, world, ElapsedTime) {
    if (world.camera.zoom < 0.25) { //if camera is zoomed out a lot
        //old render loop (cheaper but might render chunks in the wrong order)
        for (let i = 0; i < world.chunks.length; i++) {
            let chunk = world.chunks[i]

            drawChunkCheck(chunk, world, ElapsedTime)
        }
    } else {
        //new correct order render loop
        let topLeftCornerWorldPos = world.camera.screenPosToWorldPos(canvas, 0, 0)
        let bottomRightCornerWorldPos = world.camera.screenPosToWorldPos(canvas, canvas.width, canvas.height)

        topLeftCornerWorldPos = world.getChunkPosAtWorldPos(topLeftCornerWorldPos.x, topLeftCornerWorldPos.y)
        bottomRightCornerWorldPos = world.getChunkPosAtWorldPos(bottomRightCornerWorldPos.x, bottomRightCornerWorldPos.y)

        let xMin = Math.max(world.xMin, topLeftCornerWorldPos.x)
        let xMax = Math.min(world.xMax, bottomRightCornerWorldPos.x)

        //doing this slightly differently because y is flipped
        let yMax = Math.max(world.yMin, topLeftCornerWorldPos.y)
        let yMin = Math.min(world.yMax, bottomRightCornerWorldPos.y)

        for (let x = xMax + 1; x > xMin - 1; x--) {
            for (let y = yMax + 1; y > yMin - 1; y--) {
                let chunk = world.getChunkAt(x,y)
                
                drawChunkCheck(chunk, world, ElapsedTime)
            }
        }
    }

    //remove old image caches every 5 seconds
    if (TotalTime % 5 === 0) {
        for (let i = 0; i < world.chunks.length; i++) {
            let chunk = world.chunks[i]

            if (Date.now() / 1000 - chunk.cacheTimeout > maxCacheTimeout) {
                chunk.resetCacheImage()
            }
        }
    }
}

function render() {
    let CurrentTime = Date.now() / 1000
    let ElapsedTime = CurrentTime - LastTime
    TotalTime += ElapsedTime
    FPSTimer += ElapsedTime
    FPSCounter += 1

    if (FPSTimer >= 1) {
        FPS = FPSCounter
        FPSCounter = 0
        FPSTimer = 0
    }

    chunksDrawnThisFrame = 0
    if (currentWorld !== null) {
        if (worlds[currentWorld].camera.zoom > 1) {
            chunkDrawLimit = 24
        } else if (worlds[currentWorld].camera.zoom > 0.5) {
            chunkDrawLimit = 16
        } else {
            chunkDrawLimit = 8
        }
    } else {
        chunkDrawLimit = 4
    }

    canvasElement.width = window.innerWidth
    canvasElement.height = window.innerHeight

    ctx.clearRect(0,0,10000,10000)

    /*let placeToDrawCorner = worlds[currentWorld].camera.screenPosToWorldPos(canvasElement, worlds[currentWorld].camera.lastPosition.x, worlds[currentWorld].camera.lastPosition.y)
    let chunkAtMouse = worlds[currentWorld].getChunkAtWorldPos(placeToDrawCorner.x, placeToDrawCorner.y)
    if (chunkAtMouse) {
        console.log(chunkAtMouse.getTilePosAtWorldPos(placeToDrawCorner.x, placeToDrawCorner.y))
        //console.log(placeToDrawCorner.x)
    }*/

    if (currentWorld !== null) {
        if (worlds[currentWorld]) {
            drawWorld(canvasElement, worlds[currentWorld], ElapsedTime)
        }
    }

    //fps counter
    ctx.fillStyle = "#ffffff"
    ctx.font = "32px pixellari"
    ctx.fillText("FPS: " +FPS.toString(), 0, canvasElement.height)

    /*worlds[currentWorld].camera.drawRect(canvasElement, ctx, placeToDrawCorner.x, placeToDrawCorner.y, 100, 100)
    ctx.fillStyle = "#000000"
    ctx.fillRect(0,0, 100, 100)*/

    LastTime = CurrentTime
    window.requestAnimationFrame(render)
}

render()