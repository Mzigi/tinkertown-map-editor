"use-strict";
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
var _this = this;
// @ts-check
var worlds = [new World()];
var currentWorld = 0;
var newButton = document.getElementById("navbar-new");
var importInput = document.getElementById("navbar-import");
var exportButton = document.getElementById("navbar-export");
var exportButton2 = document.getElementById("navbar-export-2");
var helpButton = document.getElementById("navbar-help");
var worldSettingsButton = document.getElementById("navbar-world-settings");
var examplesButton = document.getElementById("navbar-examples");
var closeDialogButton = document.getElementById("close-dialog-help");
var closeExamplesDialogButton = document.getElementById("close-dialog-examples");
var closeWorldSettingsDialogButton = document.getElementById("close-dialog-world-settings");
var NEWUI = !(window.location.href.endsWith("old-index.html"));
var examples = [
    {
        "file": "House in Forest",
        "name": "House in Forest",
    },
    {
        "file": "OneChunkChallenge",
        "name": "10x10 Forest and House Cutout",
    },
    {
        "file": "10x10 Lake",
        "name": "10x10 Lake in Forest",
    },
    {
        "file": "Statue Structure",
        "name": "Statue Structure",
    },
    {
        "file": "Small House",
        "name": "Small House",
    },
    {
        "file": "IslandSurvival",
        "name": "Large Island Survival",
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
var isDarkMode = function () {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};
var savedPrefereneces = null;
function getPreference(key) {
    if (savedPrefereneces == null) {
        savedPrefereneces = JSON.parse(localStorage.getItem("preferences"));
    }
    if (!savedPrefereneces) {
        savedPrefereneces = {};
    }
    if (!savedPrefereneces[key]) {
        /*if (["show-poi","tile-list-visible"].includes(key)) {
            savedPrefereneces[key] = "true"
        } else if (["canvas-debug-text"].includes(key)) {
            savedPrefereneces[key] = "false"
        } else*/ if (key == "theme") {
            if (isDarkMode()) {
                savedPrefereneces[key] = "dark";
            }
            else {
                savedPrefereneces[key] = "light";
            }
        }
    }
    return savedPrefereneces[key];
}
function setPreference(key, value) {
    if (savedPrefereneces == null) {
        savedPrefereneces = JSON.parse(localStorage.getItem("preferences"));
    }
    if (!savedPrefereneces) {
        savedPrefereneces = {};
    }
    savedPrefereneces[key] = value;
    localStorage.setItem("preferences", JSON.stringify(savedPrefereneces));
}
function loadFromExampleLink(exampleLink) {
    var loadingWorld = new World();
    loadingWorld.name = "Loading...";
    worlds[worlds.length] = loadingWorld;
    currentWorld = worlds.length - 1;
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
        alertText("Failed to fetch example", true, 3);
        updateWorldList();
    });
}
var _loop_1 = function (i) {
    if (!examples[i].hidden) {
        var listElement = document.createElement("li");
        var buttonElement = document.createElement("button");
        buttonElement.innerText = examples[i].name;
        listElement.appendChild(buttonElement);
        buttonElement.addEventListener("click", function () {
            loadFromExampleLink(examples[i]);
        });
        document.getElementById("examples-list").appendChild(listElement);
        if (NEWUI) {
            var buttonElement_1 = document.createElement("button");
            buttonElement_1.innerText = examples[i].name;
            buttonElement_1.classList.add("navbar-li");
            buttonElement_1.addEventListener("click", function () {
                loadFromExampleLink(examples[i]);
            });
            document.getElementById("navbar-examples-buttons").appendChild(buttonElement_1);
        }
    }
};
for (var i = 0; i < examples.length; i++) {
    _loop_1(i);
}
var readBinaryFile = function (file, filePath, worldId) { return __awaiter(_this, void 0, void 0, function () {
    var buffer, loadedChunk, worldMeta, settingsMeta, buffer, loadedInventory, buffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(filePath.endsWith(".dat") && filePath.includes("_") && filePath.split("/").length < 3)) return [3 /*break*/, 2];
                return [4 /*yield*/, file.arrayBuffer()];
            case 1:
                buffer = _a.sent();
                if (worlds[worldId].format === WorldFormat.Binary) {
                    loadedChunk = new Chunk();
                    loadedChunk.fromBuffer(buffer);
                    worlds[worldId].addChunk(loadedChunk);
                    worlds[worldId].chunkCache[filePath] = buffer;
                }
                else {
                    console.warn("Attempted to load chunk file while world is in the Database format");
                    worlds[worldId].uneditedFiles[filePath] = buffer;
                }
                return [3 /*break*/, 8];
            case 2:
                if (!filePath.endsWith("world.meta")) return [3 /*break*/, 3];
                worldMeta = JSON.parse(file);
                worlds[worldId].name = worldMeta.name;
                worlds[worldId].seed = worldMeta.seed;
                worlds[worldId].version = worldMeta.version;
                worlds[worldId].highestUsedVersion = worldMeta.highestUsedVersion;
                if (!worlds[worldId].highestUsedVersion) {
                    worlds[worldId].highestUsedVersion = worldMeta.version;
                }
                worlds[worldId].hasBeenGenerated = worldMeta.hasBeenGenerated;
                updateWorldList();
                return [3 /*break*/, 8];
            case 3:
                if (!filePath.endsWith("settings.meta")) return [3 /*break*/, 4];
                settingsMeta = JSON.parse(file);
                worlds[worldId].progression = settingsMeta.progression;
                worlds[worldId].friendlyFire = settingsMeta.friendlyFire;
                worlds[worldId].forestBarrierBroken = settingsMeta.forestBarrierBroken;
                worlds[worldId].timescale = settingsMeta.timescale;
                worlds[worldId].NPCsOff = settingsMeta.NPCsOff;
                worlds[worldId].additionalParams = settingsMeta.additionalParams;
                return [3 /*break*/, 8];
            case 4:
                if (!filePath.endsWith("inventory.dat")) return [3 /*break*/, 6];
                return [4 /*yield*/, file.arrayBuffer()];
            case 5:
                buffer = _a.sent();
                if (worlds[worldId].format === WorldFormat.Binary) {
                    loadedInventory = new Inventory();
                    loadedInventory.fromBuffer(buffer);
                    loadedInventory.filePath = filePath;
                    worlds[worldId].containers.push(loadedInventory);
                }
                else {
                    console.warn("Attempted to load inventory file while world is in the Database format");
                    worlds[worldId].uneditedFiles[filePath] = buffer;
                }
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, file.arrayBuffer()];
            case 7:
                buffer = _a.sent();
                console.log("Editor doesn't know how to read " + filePath);
                worlds[worldId].uneditedFiles[filePath] = buffer;
                _a.label = 8;
            case 8: return [2 /*return*/];
        }
    });
}); };
/*loadButton.addEventListener("mousedown",() => {
    for (let i = 0; i < fileChooser.files.length; i++) {
        const file = fileChooser.files[i]
        if (file) {
            readBinaryFile(file)
        }
    }
})*/
newButton.addEventListener("click", function () {
    currentWorld = worlds.length;
    worlds[currentWorld] = new World();
    updateWorldList();
    worlds[currentWorld].uneditedFiles = {};
});
initSqlJs({ locateFile: function (filename) { return "src/libraries/sql-wasm.wasm"; } }).then(function (SQL) {
    window["SQL"] = SQL;
    console.log(SQL);
    console.log("Initialized SQL.js");
    importInput.addEventListener("change", function () {
        if (importInput.files.length > 0) {
            var thisWorldId_1 = worlds.length;
            worlds[thisWorldId_1] = new World();
            worlds[thisWorldId_1].format = WorldFormat.Binary;
            currentWorld = thisWorldId_1;
            worlds[thisWorldId_1].uneditedFiles = {};
            //check if world is database
            for (var _i = 0, _a = importInput.files; _i < _a.length; _i++) {
                var file = _a[_i];
                if (file.webkitRelativePath.endsWith("world.dat")) {
                    worlds[currentWorld].format = WorldFormat.Database;
                }
            }
            console.log("Loading world with format " + worlds[currentWorld].format);
            var _loop_2 = function (i) {
                console.log(importInput.files[i].webkitRelativePath);
                //console.log(importInput.files[i].webkitRelativePath)
                if (importInput.files[i].webkitRelativePath.endsWith("world.dat") || importInput.files[i].webkitRelativePath.endsWith("MapAddition.db")) {
                    //readBinaryFile(importInput2.files[i], importInput2.files[i].webkitRelativePath, thisWorldId)
                    var fileReader_1 = new FileReader();
                    fileReader_1.onload = function (e) {
                        var uint8data = new Uint8Array(fileReader_1.result);
                        var dataBase = new SQL.Database(uint8data);
                        worlds[thisWorldId_1].fromDatabase(dataBase, importInput.files[i].webkitRelativePath.endsWith("MapAddition.db"));
                    };
                    fileReader_1.readAsArrayBuffer(importInput.files[i]);
                }
                else if (importInput.files[i].webkitRelativePath.endsWith(".dat")) {
                    readBinaryFile(importInput.files[i], importInput.files[i].webkitRelativePath, thisWorldId_1);
                }
                else if (importInput.files[i].webkitRelativePath.endsWith(".meta")) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        readBinaryFile(e.target.result, importInput.files[i].webkitRelativePath, thisWorldId_1);
                    };
                    fileReader.readAsText(importInput.files[i]);
                }
                else {
                    readBinaryFile(importInput.files[i], importInput.files[i].webkitRelativePath, thisWorldId_1);
                }
            };
            for (var i = 0; i < importInput.files.length; i++) {
                _loop_2(i);
            }
        }
        updateWorldList();
    });
});
exportButton.addEventListener("click", function () {
    worlds[currentWorld].saveAsFile();
});
exportButton2.addEventListener("click", function () {
    worlds[currentWorld].saveAsFile(true);
});
helpButton.addEventListener("click", function () {
    document.getElementById("dialog-help").showModal();
});
closeDialogButton.addEventListener("click", function () {
    document.getElementById("dialog-help").close();
});
worldSettingsButton.addEventListener("click", function () {
    for (var key in worlds[currentWorld]) {
        if (document.getElementById("world-settings-" + key)) {
            if (typeof (worlds[currentWorld][key]) != "object") {
                document.getElementById("world-settings-" + key).value = worlds[currentWorld][key];
            }
            else {
                document.getElementById("world-settings-" + key).value = JSON.stringify(worlds[currentWorld][key]);
            }
        }
    }
    document.getElementById("dialog-world-settings").showModal();
});
closeWorldSettingsDialogButton.addEventListener("click", function () {
    document.getElementById("dialog-world-settings").close();
});
examplesButton.addEventListener("click", function () {
    document.getElementById("dialog-examples").showModal();
});
closeExamplesDialogButton.addEventListener("click", function () {
    document.getElementById("dialog-examples").close();
});
//# sourceMappingURL=loader.js.map