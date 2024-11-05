var ImageHolder = /** @class */ (function () {
    function ImageHolder() {
        this.imagesToLoad = [
            //Tiles
            "assets/Tilesets/AmongUsFloors.png",
            "assets/Tilesets/AmongUsLighthouseAnimation.png",
            "assets/Tilesets/AmongUsLighthouseCrash.png",
            "assets/Tilesets/AmongUsLightHouseLight.png",
            "assets/Tilesets/AmongUsObjects.png",
            "assets/Tilesets/AmongUsWallElements.png",
            "assets/Tilesets/BigWallDwarfs.png",
            "assets/Tilesets/Building.png",
            "assets/Tilesets/ClassesAndCombat.png",
            "assets/Tilesets/Desert.png",
            "assets/Tilesets/DesertObjects.png",
            "assets/Tilesets/Dungeon.png",
            "assets/Tilesets/Dungeon Black Large_697.png",
            "assets/Tilesets/DungeonDesert.png",
            "assets/Tilesets/DungeonForest.png",
            "assets/Tilesets/DungeonIce.png",
            "assets/Tilesets/DungeonIceNoPopup.png",
            "assets/Tilesets/Endgame_PortalStone.png",
            "assets/Tilesets/Extra.png",
            "assets/Tilesets/Farming.png",
            "assets/Tilesets/Forest.png",
            "assets/Tilesets/ForestObjects.png",
            "assets/Tilesets/GrassPatch.png",
            "assets/Tilesets/Housing.png",
            "assets/Tilesets/HousingObjects.png",
            "assets/Tilesets/Ice.png",
            "assets/Tilesets/IceObjects.png",
            "assets/Tilesets/LavaBiome.png",
            "assets/Tilesets/LavaDungeon.png",
            "assets/Tilesets/LunarNewYear.png",
            "assets/Tilesets/MineRails.png",
            "assets/Tilesets/Mines.png",
            "assets/Tilesets/NPCRewards.png",
            "assets/Tilesets/NPCUpdate.png",
            "assets/Tilesets/Placeables.png",
            "assets/Tilesets/Resources.png",
            "assets/Tilesets/SummerUpdate.png",
            "assets/Tilesets/TallObjects.png",
            "assets/Tilesets/TransportationObjects.png",
            "assets/Tilesets/Traps.png",
            "assets/Tilesets/unknown.png",
            "assets/Tilesets/VoidDungeon.png",
            "assets/Tilesets/VoidDungeon2.png",
            "assets/Tilesets/VolcanoMiniDungeons.png",
            //Items (MOST ARE UNUSED NOW)
            "assets/Tilesets/Actor_Blank.png",
            "assets/Tilesets/BuffIcons_3.png",
            "assets/Tilesets/Item_Among_Us.png",
            "assets/Tilesets/Item_Classes_And_Combat.png",
            "assets/Tilesets/Item_Dungeon_Desert.png",
            "assets/Tilesets/Item_Dungeon_Forest.png",
            "assets/Tilesets/Item_Dungeon_Ice.png",
            "assets/Tilesets/Item_Ice.png",
            "assets/Tilesets/Item_Lava_Biome.png",
            "assets/Tilesets/Item_Lava_Dungeon.png",
            "assets/Tilesets/Item_NPC_Update.png",
            "assets/Tilesets/Item_Shovel_Update.png",
            "assets/Tilesets/Item_Upgrade_Materials.png",
            "assets/Tilesets/Item_Void_Dungeon.png",
            "assets/Tilesets/Item_Volcano_Mini_Dungeons.png",
            "assets/Tilesets/Items_Desert.png",
            "assets/Tilesets/Items_Farming.png",
            "assets/Tilesets/Items_Fishing.png",
            "assets/Tilesets/Items_Forest.png",
            "assets/Tilesets/Items_Halloween.png",
            "assets/Tilesets/Items_Housing.png",
            "assets/Tilesets/Items_Lunar_New_Year.png",
            "assets/Tilesets/Items_Summer.png",
            "assets/Tilesets/Items.png",
            "assets/Tilesets/Items2.png",
            "assets/Tilesets/Skeleton.png",
            "assets/Tilesets/Tileset_Forest.png",
            "assets/Tilesets/Tileset_Mines.png",
            "assets/Tilesets/Tileset_Transportation_Items.png",
            "assets/Tilesets/Item_Rewards.png",
            "assets/Tilesets/sactx-0-1024x512-Uncompressed-ItemsSpriteAtlas-a1ce990c.png",
            "assets/Tilesets/sactx-0-2048x2048-Uncompressed-UISpriteAtlas-371b51d9.png",
            //Other
            "assets/storage.png",
            "assets/storage-small.png",
            "assets/highlightedChunk.png",
            "assets/poi3.png"
        ];
        this.images = {};
        this.loadedImages = 0;
    }
    //load images
    ImageHolder.prototype.loadImages = function (tileList) {
        var _this = this;
        console.log("Loading images...");
        this.tileList = tileList;
        for (var _i = 0, _a = this.imagesToLoad; _i < _a.length; _i++) {
            var imageUrl = _a[_i];
            this.images[imageUrl] = new Image();
            this.images[imageUrl].addEventListener("load", function () {
                _this.loadedImages += 1;
                if (_this.loadedImages >= _this.imagesToLoad.length) {
                    _this.tileList.updateSearch();
                    _this.tileList.updateItemSearch();
                    console.log("Loaded all images");
                }
            });
            this.images[imageUrl].src = imageUrl;
        }
    };
    return ImageHolder;
}());
export { ImageHolder };
//# sourceMappingURL=image-loader.js.map