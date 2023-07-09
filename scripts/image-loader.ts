"use-strict";
// @ts-check

let imagesToLoad: Array<string> = [
    "assets/Tilesets/AmongUsFloors.png",
    "assets/Tilesets/AmongUsLighthouseAnimation.png",
    "assets/Tilesets/AmongUsLighthouseCrash.png",
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
    "assets/Tilesets/VolcanoMiniDungeons.png"
]

var images = {}

let loadedImages: number = 0

//load images
for (let i = 0; i < imagesToLoad.length; i++) {
    images[imagesToLoad[i]] = new Image()
    images[imagesToLoad[i]].addEventListener("load", function(e) {
        loadedImages += 1
        if (loadedImages >= imagesToLoad.length) {
            updateSearch()
        }
    })
    images[imagesToLoad[i]].src = imagesToLoad[i]
}