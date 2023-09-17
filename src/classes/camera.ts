"use-strict";
// @ts-check

function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent): Vector2 {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

class Camera {
    x: number;
    y: number;
    zoom: number;

    rightButtonPressed: boolean;
    lastPosition: Vector2;

    constructor(x?: number,y?: number,zoom?: number) {
        if (!x) {
            x = 0
        }
        if (!y) {
            y = 0
        }
        if (!zoom) {
            zoom = 4
        }

        this.x = x
        this.y = y
        this.zoom = zoom

        this.rightButtonPressed = false
        this.lastPosition = {"x":0,"y":0}

        let canvas: any = document.getElementById("2Dcanvas")

        let camera = this

        window.addEventListener('mousemove', function (e) {
            let MousePosition = getMousePos(canvas,e)
            
            let MouseDiff: Vector2 = {
                x:MousePosition.x - camera.lastPosition.x,
                y:MousePosition.y - camera.lastPosition.y,
            }
            if (camera.rightButtonPressed) {
                camera.x -= MouseDiff.x / camera.zoom
                camera.y -= MouseDiff.y / camera.zoom
            }

            if (MousePosition.x < 0 || MousePosition.x > canvas.width) {
                camera.rightButtonPressed = false
            }
            if (MousePosition.y < 0 || MousePosition.y > canvas.height) {
                camera.rightButtonPressed = false
            }

            camera.lastPosition = {"x":MousePosition.x, "y":MousePosition.y}
            /*MouseX = MousePosition.x
            MouseY = MousePosition.y*/
        }, false);
        canvas.addEventListener("wheel", function(e: WheelEvent) {
            let newZoom: number = camera.zoom + camera.zoom / (-e.deltaY / 32) //e.wheelDeltaY
            newZoom = Math.floor(newZoom * 100) / 100
            newZoom = Math.max(0.075, newZoom)
            newZoom = Math.min(6, newZoom)

            camera.zoom = newZoom

            /*if (newZoom < 6 && newZoom> 0.1) {
                camera.zoom = newZoom
            }*/
        })

        canvas.addEventListener('mousedown', function(e: MouseEvent) {
            if (e.button === 2) {
                camera.rightButtonPressed = true
            }
            /*MouseDown = true
            StartClickX = MouseX
            StartClickY = MouseY*/
        })
        canvas.addEventListener('mouseup', function(e: MouseEvent) {
            if (e.button === 2) {
                camera.rightButtonPressed = false
            }
            //MouseDown = false
        })
    }

    screenPosToWorldPos(canvas: HTMLCanvasElement, dx: number, dy: number): Vector2 {
        let X: number = (dx + this.x * this.zoom - canvas.width / 2) / this.zoom
	    let Y: number = (dy + this.y * this.zoom - canvas.height / 2) / this.zoom

        return {"x":X, "y":Y}
    }

    drawImageCropped(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number) {
        ctx.imageSmoothingEnabled = false

        let W: number = dWidth * this.zoom
        let H: number = dHeight * this.zoom
        
        let X: number = dx - this.x
        X = X * this.zoom
        X = X - W / 2
        X = X + canvas.width / 2

        let Y: number = dy - this.y
        Y = Y * this.zoom
        Y = Y - H / 2
        Y = Y + canvas.height / 2

        ctx.drawImage(image, sx, sy, sWidth, sHeight, X, Y, W, H)
    }

    drawImage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement|HTMLCanvasElement, dx: number, dy: number, dWidth: number, dHeight: number) {
        ctx.imageSmoothingEnabled = false

        let W: number = dWidth * this.zoom
        let H: number = dHeight * this.zoom
        
        let X: number = dx - this.x
        X = X * this.zoom
        X = X - W / 2
        X = X + canvas.width / 2

        let Y: number = dy - this.y
        Y = Y * this.zoom
        Y = Y - H / 2
        Y = Y + canvas.height / 2

        ctx.drawImage(image, X, Y, W, H)
    }

    drawRect(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, dx: number, dy: number, dWidth: number, dHeight: number) {
        let W: number = dWidth * this.zoom
        let H: number = dHeight * this.zoom

        let X: number = dx - this.x
        X = X * this.zoom
        X = X - W / 2
        X = X + canvas.width / 2

        let Y: number = dy - this.y
        Y = Y * this.zoom
        Y = Y - H / 2
        Y = Y + canvas.height / 2

        ctx.fillRect(X,Y, W, H)
    }

    drawText(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, text: string, dx: number, dy: number, size: number) {
        let X: number = dx - this.x
        X = X * this.zoom
        X = X + canvas.width / 2

        let Y: number = dy - this.y
        Y = Y * this.zoom
        Y = Y + canvas.height / 2

        ctx.fillText(text, X, Y, size * this.zoom)
    }

    isPositionOnScreen(canvas: HTMLCanvasElement,x: number,y: number): boolean {
        let X: number = x - this.x
        X = X * this.zoom
        X = X + canvas.width / 2

        let Y: number = y - this.y
        Y = Y * this.zoom
        Y = Y + canvas.height / 2

        if (X > canvas.width || X < 0 || Y > canvas.height || Y < 0) {
            return false
        }

        return true
    }
}