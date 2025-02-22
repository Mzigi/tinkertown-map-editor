import { assetInfoHelper } from "../../libraries/assetInfoHelper.js";
import { assetInfo, assetInfoLoaded } from "../../libraries/assetInfoToJson.js";
import { simpleView } from "../simpleView.js";
var Tile = /** @class */ (function () {
    function Tile() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.health = 10;
        this.tileAssetId = 0;
        this.rotation = 0;
        this.memoryA = 0;
        this.memoryB = 0;
    }
    Tile.prototype.getName = function () {
        if (assetInfoLoaded) {
            if (assetInfo[this.tileAssetId]) {
                return assetInfo[this.tileAssetId].name;
            }
        }
        return null;
    };
    Tile.prototype.fromObject = function (tileData) {
        this.x = Math.abs(tileData.x % 10);
        this.y = Math.abs(tileData.y % 10);
        this.z = tileData.z;
        if (tileData.x < 0) {
            this.x = (9 - this.x + 1) % 10;
        }
        if (tileData.y < 0) {
            this.y = (9 - this.y + 1) % 10;
        }
        this.health = tileData.hp;
        this.tileAssetId = tileData.tileAssetID;
        this.rotation = tileData.rotation;
        this.memoryA = tileData.memA;
        this.memoryB = tileData.memB;
        //TODO: tileData.dungeon
    };
    Tile.prototype.fromBuffer = function (tileBuffer) {
        var view = new simpleView(tileBuffer);
        this.x = view.readUint8(); //left to right
        this.y = view.readUint8(); //down to up
        this.z = view.readUint8(); //bottom to top
        this.health = view.readInt16();
        this.tileAssetId = view.readInt16();
        this.rotation = view.readUint8();
        this.memoryA = view.readUint8();
        this.memoryB = view.readUint8();
        if (!assetInfoHelper.idExists(this.tileAssetId)) {
            console.warn("Tile with id " + this.tileAssetId + " was loaded in but isn't in assetInfo!");
        }
    };
    Tile.prototype.writeToBuffer = function (writeBuffer, byteOffset) {
        var view = new simpleView(writeBuffer);
        view.viewOffset = byteOffset;
        view.writeUint8(this.x);
        view.writeUint8(this.y);
        view.writeUint8(this.z);
        view.writeInt16(this.health);
        view.writeInt16(this.tileAssetId);
        view.writeUint8(this.rotation);
        view.writeUint8(this.memoryA);
        view.writeUint8(this.memoryB);
    };
    Tile.prototype.getByteSize = function () {
        return 10;
    };
    Tile.prototype.clone = function () {
        var newTile = new Tile();
        newTile.x = this.x;
        newTile.y = this.y;
        newTile.z = this.z;
        newTile.health = this.health;
        newTile.tileAssetId = this.tileAssetId;
        newTile.rotation = this.rotation;
        newTile.memoryA = this.memoryA;
        newTile.memoryB = this.memoryB;
        return newTile;
    };
    return Tile;
}());
export { Tile };
//# sourceMappingURL=tile.js.map