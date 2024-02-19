function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}
var Camera = /** @class */ (function () {
    function Camera(x, y, zoom) {
        if (!x) {
            x = 0;
        }
        if (!y) {
            y = 0;
        }
        if (!zoom) {
            zoom = 4;
        }
        this.x = x;
        this.y = y;
        this.zoom = zoom;
        this.rightButtonPressed = false;
        this.lastPosition = { "x": 0, "y": 0 };
        var canvas = document.getElementById("2Dcanvas");
        var camera = this;
        window.addEventListener('mousemove', function (e) {
            var MousePosition = getMousePos(canvas, e);
            var MouseDiff = {
                x: MousePosition.x - camera.lastPosition.x,
                y: MousePosition.y - camera.lastPosition.y,
            };
            if (camera.rightButtonPressed) {
                camera.x -= MouseDiff.x / camera.zoom;
                camera.y -= MouseDiff.y / camera.zoom;
            }
            if (MousePosition.x < 0 || MousePosition.x > canvas.width) {
                camera.rightButtonPressed = false;
            }
            if (MousePosition.y < 0 || MousePosition.y > canvas.height) {
                camera.rightButtonPressed = false;
            }
            camera.lastPosition = { "x": MousePosition.x, "y": MousePosition.y };
            /*MouseX = MousePosition.x
            MouseY = MousePosition.y*/
        }, false);
        canvas.addEventListener("wheel", function (e) {
            var newZoom = camera.zoom + camera.zoom / (-e.deltaY / 32); //e.wheelDeltaY
            newZoom = Math.floor(newZoom * 100) / 100;
            newZoom = Math.max(0.075, newZoom);
            newZoom = Math.min(6, newZoom);
            camera.zoom = newZoom;
            /*if (newZoom < 6 && newZoom> 0.1) {
                camera.zoom = newZoom
            }*/
        });
        canvas.addEventListener('mousedown', function (e) {
            if (e.button === 2) {
                camera.rightButtonPressed = true;
            }
            /*MouseDown = true
            StartClickX = MouseX
            StartClickY = MouseY*/
        });
        canvas.addEventListener('mouseup', function (e) {
            if (e.button === 2) {
                camera.rightButtonPressed = false;
            }
            //MouseDown = false
        });
    }
    Camera.prototype.screenPosToWorldPos = function (canvas, dx, dy) {
        var X = (dx + this.x * this.zoom - canvas.width / 2) / this.zoom;
        var Y = (dy + this.y * this.zoom - canvas.height / 2) / this.zoom;
        return { "x": X, "y": Y };
    };
    Camera.prototype.worldPosToScreenPos = function (canvas, dx, dy) {
        var X = dx - this.x;
        X = X * this.zoom;
        X = X + canvas.width / 2;
        var Y = dy - this.y;
        Y = Y * this.zoom;
        Y = Y + canvas.height / 2;
        return { "x": X, "y": Y };
    };
    Camera.prototype.drawImageCropped = function (canvas, ctx, image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        ctx.imageSmoothingEnabled = false;
        var W = dWidth * this.zoom;
        var H = dHeight * this.zoom;
        var X = dx - this.x;
        X = X * this.zoom;
        X = X - W / 2;
        X = X + canvas.width / 2;
        var Y = dy - this.y;
        Y = Y * this.zoom;
        Y = Y - H / 2;
        Y = Y + canvas.height / 2;
        ctx.drawImage(image, sx, sy, sWidth, sHeight, X, Y, W, H);
    };
    Camera.prototype.drawImage = function (canvas, ctx, image, dx, dy, dWidth, dHeight) {
        ctx.imageSmoothingEnabled = false;
        var W = dWidth * this.zoom;
        var H = dHeight * this.zoom;
        var X = dx - this.x;
        X = X * this.zoom;
        X = X - W / 2;
        X = X + canvas.width / 2;
        var Y = dy - this.y;
        Y = Y * this.zoom;
        Y = Y - H / 2;
        Y = Y + canvas.height / 2;
        ctx.drawImage(image, X, Y, W, H);
    };
    Camera.prototype.drawRect = function (canvas, ctx, dx, dy, dWidth, dHeight) {
        var W = dWidth * this.zoom;
        var H = dHeight * this.zoom;
        var X = dx - this.x;
        X = X * this.zoom;
        X = X - W / 2;
        X = X + canvas.width / 2;
        var Y = dy - this.y;
        Y = Y * this.zoom;
        Y = Y - H / 2;
        Y = Y + canvas.height / 2;
        ctx.fillRect(X, Y, W, H);
    };
    Camera.prototype.drawText = function (canvas, ctx, text, dx, dy, size) {
        var X = dx - this.x;
        X = X * this.zoom;
        X = X + canvas.width / 2;
        var Y = dy - this.y;
        Y = Y * this.zoom;
        Y = Y + canvas.height / 2;
        ctx.fillText(text, X, Y, size * this.zoom);
    };
    Camera.prototype.isPositionOnScreen = function (canvas, x, y) {
        var X = x - this.x;
        X = X * this.zoom;
        X = X + canvas.width / 2;
        var Y = y - this.y;
        Y = Y * this.zoom;
        Y = Y + canvas.height / 2;
        if (X > canvas.width || X < 0 || Y > canvas.height || Y < 0) {
            return false;
        }
        return true;
    };
    return Camera;
}());
//# sourceMappingURL=camera.js.map