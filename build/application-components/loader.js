var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Chunk } from "../classes/objects/chunk.js";
import { Inventory } from "../classes/objects/inventory.js";
import { World, WorldFormat } from "../classes/objects/world.js";
var Loader = /** @class */ (function () {
    function Loader() {
        var _this = this;
        this.worlds = [new World(0, this)];
        this.currentWorld = 0;
        this.newButton = document.getElementById("navbar-new");
        this.importInput = document.getElementById("navbar-import");
        this.exportButton = document.getElementById("navbar-export-old");
        this.exportButton2 = document.getElementById("navbar-export-new");
        this.exportButton3 = document.getElementById("navbar-export-new2");
        this.exportDungeonButton = document.getElementById("navbar-export-dungeon");
        this.helpButton = document.getElementById("navbar-help");
        this.worldSettingsButton = document.getElementById("navbar-world-settings");
        this.examplesButton = document.getElementById("navbar-examples");
        this.undoButton = document.getElementById("navbar-undo");
        this.redoButton = document.getElementById("navbar-redo");
        this.cutButton = document.getElementById("navbar-cut");
        this.copyButton = document.getElementById("navbar-copy");
        this.pasteButton = document.getElementById("navbar-paste");
        this.deselectButton = document.getElementById("navbar-deselect");
        this.eraseButton = document.getElementById("navbar-erase");
        this.fillButton = document.getElementById("navbar-fill");
        this.closeDialogButton = document.getElementById("close-dialog-help");
        this.closeExamplesDialogButton = document.getElementById("close-dialog-examples");
        this.closeWorldSettingsDialogButton = document.getElementById("close-dialog-world-settings");
        this.fileDropDialog = document.getElementById("dialog-file-drop");
        this.alertElement = document.getElementById("alert");
        this.worldSettingsIsOpen = false;
        this.NEWUI = !(window.location.href.endsWith("old-index.html"));
        this.examples = [
            {
                "file": "House in Forest",
                "name": "House in Forest",
            },
            {
                "file": "10x10 Forest and House Cutout",
                "name": "10x10 Forest and House Cutout",
            },
            {
                "file": "10x10 Lake",
                "name": "10x10 Lake in Forest",
            },
            {
                "file": "Statue Structure",
                "name": "Statue Structure",
                "hidden": true
            },
            {
                "file": "Small House",
                "name": "Small House",
                "hidden": true
            },
            {
                "file": "IslandSurvival",
                "name": "Large Island Survival",
                "hidden": true
            },
            {
                "file": "test storage",
                "name": "test storage",
                "hidden": true,
            },
            {
                "file": "earlytown6",
                "name": "Earlytown - 6",
            },
            {
                "file": "earlytown4",
                "name": "Earlytown - 4",
            },
            {
                "file": "earlytown3",
                "name": "Earlytown - 3",
            },
            {
                "file": "earlytown1",
                "name": "Earlytown - 1",
            },
        ];
        this.isDarkMode = function () {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        };
        this.savedPrefereneces = null;
        var _loop_1 = function (i) {
            if (!this_1.examples[i].hidden) {
                var listElement = document.createElement("li");
                var buttonElement = document.createElement("button");
                buttonElement.innerText = this_1.examples[i].name;
                listElement.appendChild(buttonElement);
                buttonElement.addEventListener("click", function () {
                    _this.loadFromExampleLink(_this.examples[i]);
                });
                document.getElementById("examples-list").appendChild(listElement);
                if (this_1.NEWUI) {
                    var buttonElement_1 = document.createElement("button");
                    buttonElement_1.innerText = this_1.examples[i].name;
                    buttonElement_1.classList.add("navbar-li");
                    buttonElement_1.addEventListener("click", function () {
                        _this.loadFromExampleLink(_this.examples[i]);
                    });
                    document.getElementById("navbar-examples-buttons").appendChild(buttonElement_1);
                }
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.examples.length; i++) {
            _loop_1(i);
        }
        this.newButton.addEventListener("click", function () {
            _this.currentWorld = _this.worlds.length;
            _this.worlds[_this.currentWorld] = new World(_this.currentWorld, _this);
            _this.updateWorldList();
            _this.worlds[_this.currentWorld].uneditedFiles = {};
        });
        initSqlJs({ locateFile: function (filename) { return "src/libraries/sql-wasm.wasm"; } }).then(function (SQL) {
            window["SQL"] = SQL;
            console.log(SQL);
            console.log("Initialized SQL.js");
            var loader = _this;
            _this.importInput.addEventListener("change", function () {
                if (_this.importInput.files.length > 0) {
                    var thisWorldId_1 = loader.worlds.length;
                    loader.worlds[thisWorldId_1] = new World(thisWorldId_1, loader);
                    loader.worlds[thisWorldId_1].format = WorldFormat.Binary;
                    loader.currentWorld = thisWorldId_1;
                    loader.worlds[thisWorldId_1].uneditedFiles = {};
                    //check if world is database
                    for (var _i = 0, _a = loader.importInput.files; _i < _a.length; _i++) {
                        var file = _a[_i];
                        if (file.webkitRelativePath.endsWith("world.dat")) {
                            loader.worlds[loader.currentWorld].format = WorldFormat.Database;
                        }
                    }
                    console.log("Loading world with format " + loader.worlds[loader.currentWorld].format);
                    var _loop_2 = function (i) {
                        console.log(loader.importInput.files[i].webkitRelativePath);
                        //console.log(importInput.files[i].webkitRelativePath)
                        if (loader.importInput.files[i].webkitRelativePath.endsWith("world.dat") || loader.importInput.files[i].webkitRelativePath.endsWith("MapAddition.db")) {
                            //readBinaryFile(importInput2.files[i], importInput2.files[i].webkitRelativePath, thisWorldId)
                            var fileReader_1 = new FileReader();
                            fileReader_1.onload = function (e) {
                                var uint8data = new Uint8Array(fileReader_1.result);
                                var dataBase = new SQL.Database(uint8data);
                                loader.worlds[thisWorldId_1].fromDatabase(dataBase, loader.importInput.files[i].webkitRelativePath.endsWith("MapAddition.db"));
                            };
                            fileReader_1.readAsArrayBuffer(loader.importInput.files[i]);
                        }
                        else if (loader.importInput.files[i].webkitRelativePath.endsWith(".dat")) {
                            loader.readBinaryFile(loader.importInput.files[i], loader.importInput.files[i].webkitRelativePath, thisWorldId_1);
                        }
                        else if (loader.importInput.files[i].webkitRelativePath.endsWith(".meta")) {
                            var fileReader = new FileReader();
                            fileReader.onload = function (e) {
                                loader.readBinaryFile(e.target.result, loader.importInput.files[i].webkitRelativePath, thisWorldId_1);
                            };
                            fileReader.readAsText(loader.importInput.files[i]);
                        }
                        else {
                            loader.readBinaryFile(loader.importInput.files[i], loader.importInput.files[i].webkitRelativePath, thisWorldId_1);
                        }
                    };
                    for (var i = 0; i < loader.importInput.files.length; i++) {
                        _loop_2(i);
                    }
                }
                loader.updateWorldList();
            });
        });
        this.exportButton.addEventListener("click", function () {
            _this.worlds[_this.currentWorld].saveAsFile();
        });
        if (this.NEWUI) {
            this.exportButton2.addEventListener("click", function () {
                _this.worlds[_this.currentWorld].saveAsFile(true);
            });
            this.exportButton3.addEventListener("click", function () {
                _this.worlds[_this.currentWorld].saveAsFile(true, false, false);
            });
            this.exportDungeonButton.addEventListener("click", function () {
                _this.getCurrentWorld().saveAsFile(true, true);
            });
        }
        this.helpButton.addEventListener("click", function () {
            document.getElementById("dialog-help").showModal();
        });
        this.closeDialogButton.addEventListener("click", function () {
            document.getElementById("dialog-help").close();
        });
        this.worldSettingsButton.addEventListener("click", function () {
            _this.worldSettingsIsOpen = true;
            for (var key in _this.worlds[_this.currentWorld]) {
                if (document.getElementById("world-settings-" + key)) {
                    if (typeof (_this.worlds[_this.currentWorld][key]) != "object") {
                        document.getElementById("world-settings-" + key).value = _this.worlds[_this.currentWorld][key];
                    }
                    else {
                        document.getElementById("world-settings-" + key).value = JSON.stringify(_this.worlds[_this.currentWorld][key]);
                    }
                }
            }
            document.getElementById("dialog-world-settings").showModal();
        });
        this.closeWorldSettingsDialogButton.addEventListener("click", function () {
            _this.worldSettingsIsOpen = false;
            document.getElementById("dialog-world-settings").close();
        });
        this.examplesButton.addEventListener("click", function () {
            document.getElementById("dialog-examples").showModal();
        });
        this.closeExamplesDialogButton.addEventListener("click", function () {
            document.getElementById("dialog-examples").close();
        });
        /*document.getElementById("2Dcanvas").addEventListener("dragenter", (e) => {
            console.log(e)
            this.fileDropDialog.classList.add("dialog-active")
        })

        document.getElementById("2Dcanvas").addEventListener("dragleave", (e) => {
            if (e.relatedTarget != this.fileDropDialog && !this.fileDropDialog.contains(e.relatedTarget)) {
                console.log(e)
                this.fileDropDialog.classList.remove("dialog-active")
            }
        })*/
        this.undoButton.addEventListener("click", function () {
            _this.getCurrentWorld().undo();
        });
        this.redoButton.addEventListener("click", function () {
            _this.getCurrentWorld().redo();
        });
        this.cutButton.addEventListener("click", function () {
            _this.editor.callToolEvents("Cut");
        });
        this.copyButton.addEventListener("click", function () {
            _this.editor.callToolEvents("Copy");
        });
        this.pasteButton.addEventListener("click", function () {
            _this.editor.callToolEvents("Paste");
        });
        this.deselectButton.addEventListener("click", function () {
            _this.editor.callToolEvents("Deselect");
        });
        this.eraseButton.addEventListener("click", function () {
            _this.editor.callToolEvents("Delete");
        });
        this.fillButton.addEventListener("click", function () {
            _this.editor.callToolEvents("Fill");
        });
        if (!window["chrome"]) {
            this.alertText("This website was designed to be used on a Chromium-based browser like Edge or Chrome, exporting might take a while or not work on this browser", true, 10);
        }
    }
    Loader.prototype.createWorldElement = function (worldId) {
        var _this = this;
        var thisWorld = this.worlds[worldId];
        var worldButton = document.createElement("button");
        worldButton.classList.add("world");
        worldButton.setAttribute("world-id", String(worldId));
        var worldTitle = document.createElement("span");
        worldTitle.classList.add("world-name");
        worldTitle.innerText = thisWorld.name;
        worldButton.appendChild(worldTitle);
        var closeButton = document.createElement("button");
        closeButton.classList.add("material-symbols-outlined");
        closeButton.classList.add("world-close");
        closeButton.innerText = "close";
        worldButton.appendChild(closeButton);
        closeButton.addEventListener("click", function () {
            document.getElementById("remove-world-title").innerText = "Remove " + thisWorld.name + "?";
            document.getElementById("dialog-confirm-close").showModal();
            var loader = _this;
            function RemoveWorld() {
                thisWorld.reset();
                thisWorld.hidden = true;
                if (worldId == loader.currentWorld) {
                    loader.editor.findFirstVisibleWorld();
                }
                loader.updateWorldList();
                document.getElementById("dialog-confirm-close").close();
                document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", RemoveWorld);
                document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", CancelRemove);
            }
            function CancelRemove() {
                document.getElementById("dialog-confirm-close").close();
                document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", RemoveWorld);
                document.getElementById("dialog-confirm-close-confirm").removeEventListener("click", CancelRemove);
            }
            document.getElementById("dialog-confirm-close-confirm").addEventListener("click", RemoveWorld);
            document.getElementById("dialog-confirm-close-cancel").addEventListener("click", CancelRemove);
        });
        if (worldId != this.currentWorld) {
            worldButton.classList.add("world-unloaded");
        }
        worldButton.addEventListener("click", function () {
            if (!_this.worlds[worldId].hidden) {
                _this.currentWorld = worldId;
                _this.updateWorldList();
            }
        });
        return worldButton;
    };
    Loader.prototype.updateWorldList = function () {
        if (this.NEWUI) {
            //remove all elements
            document.getElementById("worldlist").innerHTML = "";
            //add new ones
            //let currentWorldElement = createWorldElement(currentWorld)
            //document.getElementById("worldlist").appendChild(currentWorldElement)
            for (var i = 0; i < this.worlds.length; i++) {
                if (!this.worlds[i].hidden) {
                    document.getElementById("worldlist").appendChild(this.createWorldElement(i));
                }
            }
        }
    };
    Loader.prototype.getPreference = function (key) {
        if (this.savedPrefereneces == null) {
            this.savedPrefereneces = JSON.parse(localStorage.getItem("preferences"));
        }
        if (!this.savedPrefereneces) {
            this.savedPrefereneces = {};
        }
        if (!this.savedPrefereneces[key]) {
            /*if (["show-poi","tile-list-visible"].includes(key)) {
                savedPrefereneces[key] = "true"
            } else if (["canvas-debug-text"].includes(key)) {
                savedPrefereneces[key] = "false"
            } else*/ if (key == "theme") {
                if (this.isDarkMode()) {
                    this.savedPrefereneces[key] = "dark";
                }
                else {
                    this.savedPrefereneces[key] = "light";
                }
            }
        }
        return this.savedPrefereneces[key];
    };
    Loader.prototype.setPreference = function (key, value) {
        if (this.savedPrefereneces == null) {
            this.savedPrefereneces = JSON.parse(localStorage.getItem("preferences"));
        }
        if (!this.savedPrefereneces) {
            this.savedPrefereneces = {};
        }
        this.savedPrefereneces[key] = value;
        localStorage.setItem("preferences", JSON.stringify(this.savedPrefereneces));
    };
    Loader.prototype.loadFromExampleLink = function (exampleLink) {
        var _this = this;
        var loadingWorld = new World(this.worlds.length, this);
        loadingWorld.name = "Loading...";
        this.worlds[this.worlds.length] = loadingWorld;
        this.currentWorld = this.worlds.length - 1;
        var hrefWithoutHtml = window.location.href.replace("index.html", "");
        var fetchUrl = hrefWithoutHtml + "assets/Worlds/" + exampleLink.file + ".ttworld";
        console.log("Fetching example world from " + fetchUrl);
        document.getElementById("dialog-examples").close();
        document.getElementById("dialog-loading").showModal();
        fetch("./assets/Worlds/" + exampleLink.file + ".ttworld").then(function (response) {
            response.arrayBuffer().then(function (worldBuffer) {
                loadingWorld.fromBuffer(worldBuffer, 0);
                document.getElementById("dialog-loading").close();
            });
        }).catch(function (error) {
            console.warn(error);
            document.getElementById("dialog-loading").close();
            _this.alertText("Failed to fetch example", true, 3);
            _this.updateWorldList();
        });
    };
    Loader.prototype.readBinaryFile = function (file, filePath, worldId) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, loadedChunk, worldMeta, settingsMeta, buffer, loadedInventory, plainTextData, dungeonMeta, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(filePath.endsWith(".dat") && filePath.includes("_") && filePath.split("/").length < 3 && !filePath.startsWith("backups/world"))) return [3 /*break*/, 2];
                        return [4 /*yield*/, file.arrayBuffer()];
                    case 1:
                        buffer = _a.sent();
                        if (this.worlds[worldId].format === WorldFormat.Binary) {
                            loadedChunk = new Chunk();
                            loadedChunk.fromBuffer(buffer);
                            this.worlds[worldId].addChunk(loadedChunk);
                            this.worlds[worldId].chunkCache[filePath] = buffer;
                        }
                        else {
                            console.warn("Attempted to load chunk file while world is in the Database format (".concat(filePath, ")"));
                            this.worlds[worldId].uneditedFiles[filePath] = buffer;
                        }
                        return [3 /*break*/, 10];
                    case 2:
                        if (!filePath.endsWith("world.meta")) return [3 /*break*/, 3];
                        worldMeta = JSON.parse(file);
                        this.worlds[worldId].name = worldMeta.name;
                        this.worlds[worldId].seed = worldMeta.seed;
                        this.worlds[worldId].version = worldMeta.version;
                        this.worlds[worldId].highestUsedVersion = worldMeta.highestUsedVersion;
                        if (!this.worlds[worldId].highestUsedVersion) {
                            this.worlds[worldId].highestUsedVersion = worldMeta.version;
                        }
                        this.worlds[worldId].hasBeenGenerated = worldMeta.hasBeenGenerated;
                        this.updateWorldList();
                        return [3 /*break*/, 10];
                    case 3:
                        if (!filePath.endsWith("settings.meta")) return [3 /*break*/, 4];
                        settingsMeta = JSON.parse(file);
                        this.worlds[worldId].progression = settingsMeta.progression;
                        this.worlds[worldId].friendlyFire = settingsMeta.friendlyFire;
                        this.worlds[worldId].forestBarrierBroken = settingsMeta.forestBarrierBroken;
                        this.worlds[worldId].timescale = settingsMeta.timescale;
                        this.worlds[worldId].NPCsOff = settingsMeta.NPCsOff;
                        this.worlds[worldId].additionalParams = settingsMeta.additionalParams;
                        return [3 /*break*/, 10];
                    case 4:
                        if (!filePath.endsWith("inventory.dat")) return [3 /*break*/, 6];
                        return [4 /*yield*/, file.arrayBuffer()];
                    case 5:
                        buffer = _a.sent();
                        if (this.worlds[worldId].format === WorldFormat.Binary) {
                            loadedInventory = new Inventory();
                            loadedInventory.fromBuffer(buffer);
                            loadedInventory.filePath = filePath;
                            this.worlds[worldId].containers.push(loadedInventory);
                        }
                        else {
                            console.warn("Attempted to load inventory file while world is in the Database format");
                            this.worlds[worldId].uneditedFiles[filePath] = buffer;
                        }
                        return [3 /*break*/, 10];
                    case 6:
                        if (!filePath.endsWith("DungeonMeta.metadat")) return [3 /*break*/, 8];
                        return [4 /*yield*/, file.text()];
                    case 7:
                        plainTextData = _a.sent();
                        dungeonMeta = JSON.parse(plainTextData);
                        this.getCurrentWorld().name = dungeonMeta.title;
                        this.getCurrentWorld().entrancePoint = { "x": dungeonMeta.entrancePoint[0], "y": dungeonMeta.entrancePoint[1] };
                        this.updateWorldList();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, file.arrayBuffer()];
                    case 9:
                        buffer = _a.sent();
                        console.log("Editor doesn't know how to read " + filePath);
                        this.worlds[worldId].uneditedFiles[filePath] = buffer;
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Loader.prototype.alertText = function (text, isError, time) {
        console.warn(text);
        this.alertElement.innerText = text;
        if (isError) {
            this.alertElement.classList.add("errorAlert");
        }
        else {
            this.alertElement.classList.remove("errorAlert");
        }
        this.alertElement.classList.add("alertOn");
        var loader = this;
        setTimeout(function () {
            loader.alertElement.classList.remove("alertOn");
        }, time * 1000);
    };
    Loader.prototype.getCurrentWorld = function () {
        return this.worlds[this.currentWorld];
    };
    return Loader;
}());
export { Loader };
/*
BROKEN ID'S
35
21
*/
/*let filledChunk = new Chunk()
filledChunk.x = 0
filledChunk.y = 0
filledChunk.fillWithIdsBetween(0,99)
filledChunk.saveAsFile()

let filledChunk2 = new Chunk()
filledChunk2.x = 1
filledChunk2.y = 0
filledChunk2.fillWithIdsBetween(100,199)
filledChunk2.saveAsFile()

let filledChunk3 = new Chunk()
filledChunk3.x = 0
filledChunk3.y = 1
filledChunk3.fillWithIdsBetween(200,299)
filledChunk3.saveAsFile()

let filledChunk4 = new Chunk()
filledChunk4.x = 1
filledChunk4.y = 1
filledChunk4.fillWithIdsBetween(300,399)
filledChunk4.saveAsFile()*/
/*let chunk236 = new Chunk()
chunk236.x = 0
chunk236.y = 0
chunk236.fillWithId(236)
chunk236.saveAsFile()

let chunk294 = new Chunk()
chunk294.x = 1
chunk294.y = 0
chunk294.fillWithId(294)
chunk294.saveAsFile()*/ 
//# sourceMappingURL=loader.js.map