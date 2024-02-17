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
var uneditedFiles = {};
var currentWorld = 0;
var newButton = document.getElementById("navbar-new");
var importInput = document.getElementById("navbar-import");
var exportButton = document.getElementById("navbar-export");
var helpButton = document.getElementById("navbar-help");
var worldSettingsButton = document.getElementById("navbar-world-settings");
var examplesButton = document.getElementById("navbar-examples");
var closeDialogButton = document.getElementById("close-dialog-help");
var closeExamplesDialogButton = document.getElementById("close-dialog-examples");
var closeWorldSettingsDialogButton = document.getElementById("close-dialog-world-settings");
var examples = [
    {
        "file": "OneChunkChallenge",
        "name": "10x10 Forest and House Cutout",
    },
    {
        "file": "10x10 Lake",
        "name": "10x10 Lake in Forest",
    },
    {
        "file": "Small House",
        "name": "Small House",
    },
    {
        "file": "IslandSurvival",
        "name": "Large Island Survival",
    },
];
var _loop_1 = function (i) {
    var listElement = document.createElement("li");
    var buttonElement = document.createElement("button");
    buttonElement.innerText = examples[i].name;
    listElement.appendChild(buttonElement);
    buttonElement.addEventListener("click", function () {
        worlds[currentWorld] = new World();
        var hrefWithoutHtml = window.location.href.replace("index.html", "");
        var fetchUrl = hrefWithoutHtml + "assets/Worlds/" + examples[i].file + ".ttworld";
        console.log("Fetching example world from " + fetchUrl);
        fetch("assets/Worlds/" + examples[i].file + ".ttworld").then(function (response) {
            response.arrayBuffer().then(function (worldBuffer) {
                currentWorld = 0;
                worlds[currentWorld].fromBuffer(worldBuffer, 0);
                document.getElementById("dialog-examples").close();
            });
        });
    });
    document.getElementById("examples-list").appendChild(listElement);
};
for (var i = 0; i < examples.length; i++) {
    _loop_1(i);
}
var readBinaryFile = function (file, filePath) { return __awaiter(_this, void 0, void 0, function () {
    var buffer, loadedChunk, worldMeta, settingsMeta, buffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(filePath.endsWith(".dat") && filePath.includes("_") && filePath.split("/").length < 3)) return [3 /*break*/, 2];
                return [4 /*yield*/, file.arrayBuffer()];
            case 1:
                buffer = _a.sent();
                loadedChunk = new Chunk();
                loadedChunk.fromBuffer(buffer);
                worlds[currentWorld].addChunk(loadedChunk);
                worlds[currentWorld].chunkCache[filePath] = buffer;
                return [3 /*break*/, 6];
            case 2:
                if (!filePath.endsWith("world.meta")) return [3 /*break*/, 3];
                worldMeta = JSON.parse(file);
                worlds[currentWorld].name = worldMeta.name;
                worlds[currentWorld].seed = worldMeta.seed;
                worlds[currentWorld].version = worldMeta.version;
                worlds[currentWorld].highestUsedVersion = worldMeta.highestUsedVersion;
                if (!worlds[currentWorld].highestUsedVersion) {
                    worlds[currentWorld].highestUsedVersion = worldMeta.version;
                }
                worlds[currentWorld].hasBeenGenerated = worldMeta.hasBeenGenerated;
                return [3 /*break*/, 6];
            case 3:
                if (!filePath.endsWith("settings.meta")) return [3 /*break*/, 4];
                settingsMeta = JSON.parse(file);
                worlds[currentWorld].progression = settingsMeta.progression;
                worlds[currentWorld].friendlyFire = settingsMeta.friendlyFire;
                worlds[currentWorld].forestBarrierBroken = settingsMeta.forestBarrierBroken;
                worlds[currentWorld].timescale = settingsMeta.timescale;
                worlds[currentWorld].NPCsOff = settingsMeta.NPCsOff;
                worlds[currentWorld].additionalParams = settingsMeta.additionalParams;
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, file.arrayBuffer()];
            case 5:
                buffer = _a.sent();
                console.log("Editor doesn't know how to read " + filePath);
                uneditedFiles[filePath] = buffer;
                _a.label = 6;
            case 6: return [2 /*return*/];
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
    worlds[currentWorld] = new World();
    uneditedFiles = {};
});
importInput.addEventListener("change", function () {
    if (importInput.files.length > 0) {
        worlds[currentWorld] = new World();
        uneditedFiles = {};
        var _loop_2 = function (i) {
            //console.log(importInput.files[i].webkitRelativePath)
            if (importInput.files[i].webkitRelativePath.endsWith(".dat")) {
                readBinaryFile(importInput.files[i], importInput.files[i].webkitRelativePath);
            }
            else if (importInput.files[i].webkitRelativePath.endsWith(".meta")) {
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    readBinaryFile(e.target.result, importInput.files[i].webkitRelativePath);
                };
                fileReader.readAsText(importInput.files[i]);
            }
            else {
                readBinaryFile(importInput.files[i], importInput.files[i].webkitRelativePath);
            }
        };
        for (var i = 0; i < importInput.files.length; i++) {
            _loop_2(i);
        }
    }
});
exportButton.addEventListener("click", function () {
    worlds[currentWorld].saveAsFile();
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