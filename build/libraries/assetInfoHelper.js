import { assetInfo, assetInfoLoaded } from "./assetInfoToJson.js";
var assetInfoHelper = {
    "idExists": function (id) {
        if (assetInfoLoaded) {
            if (assetInfo[id]) {
                return true;
            }
        }
        return false;
    },
    "findIdByName": function (name) {
        for (var index in assetInfo) {
            var info = assetInfo[index];
            if (info.name == name) {
                return info.uniqueID;
            }
        }
        return null;
    },
    "findInfoByName": function (name) {
        for (var index in assetInfo) {
            var info = assetInfo[index];
            if (info.name == name) {
                return info;
            }
        }
        return null;
    },
    "findIdsBySearch": function (search) {
        var results = [];
        search = search.toLowerCase();
        search = search.replaceAll(" _", " ");
        search = search.replaceAll("_", " ");
        for (var index in assetInfo) {
            var info = assetInfo[index];
            var fixedName = info.name.toLowerCase();
            fixedName = fixedName.replaceAll(" _", " ");
            fixedName = fixedName.replaceAll("_", " ");
            var searchId = Number(search);
            if (fixedName.includes(search) || search === "" || info.uniqueID === searchId) {
                results.push(index);
            }
        }
        return results;
    },
    "findInfosBySearch": function (search) {
        var results = [];
        search = search.toLowerCase();
        search = search.replaceAll(" _", " ");
        search = search.replaceAll("_", " ");
        for (var index in assetInfo) {
            var info = assetInfo[index];
            var fixedName = info.name.toLowerCase();
            fixedName = fixedName.replaceAll(" _", " ");
            fixedName = fixedName.replaceAll("_", " ");
            var searchId = Number(search);
            if (fixedName.includes(search) || search === "" || info.uniqueID == searchId) {
                results.push(assetInfo[index]);
            }
        }
        return results;
    },
    "findIdsByCategory": function (category) {
        var results = [];
        if (category === "None" || category === "Other") {
            category = "";
        }
        for (var index in assetInfo) {
            var info = assetInfo[index];
            if (info.category == category) {
                results.push(info.uniqueID);
            }
        }
        return results;
    },
    "findInfosByCategory": function (category) {
        var results = [];
        if (category === "None" || category === "Other") {
            category = "";
        }
        for (var index in assetInfo) {
            var info = assetInfo[index];
            if (info.category == category) {
                results.push(info);
            }
        }
        return results;
    },
    "getExistingCategories": function () {
        var categories = [];
        for (var index in assetInfo) {
            var info = assetInfo[index];
            if (!categories.includes(info.category)) {
                categories.push(info.category);
            }
        }
        return categories;
    }
};
export { assetInfoHelper };
//# sourceMappingURL=assetInfoHelper.js.map