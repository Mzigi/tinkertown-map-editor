var item_assetInfoHelper = {
    "idExists": function (id) {
        if (item_assetInfoLoaded) {
            if (item_assetInfo[id]) {
                return true;
            }
        }
        return false;
    },
    "findIdByName": function (name) {
        for (var index in item_assetInfo) {
            var info = item_assetInfo[index];
            if (info.name == name) {
                return info.uniqueID;
            }
        }
        return null;
    },
    "findInfoByName": function (name) {
        for (var index in item_assetInfo) {
            var info = item_assetInfo[index];
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
        for (var index in item_assetInfo) {
            var info = item_assetInfo[index];
            var fixedName = info.name.toLowerCase();
            fixedName = fixedName.replaceAll(" _", " ");
            fixedName = fixedName.replaceAll("_", " ");
            var fixedLocalizedName = info.localizedName.toLowerCase();
            fixedLocalizedName = fixedLocalizedName.replaceAll(" _", " ");
            fixedLocalizedName = fixedLocalizedName.replaceAll("_", " ");
            var searchId = Number(search);
            if (fixedName.includes(search) || fixedLocalizedName.includes(search) || search === "" || info.uniqueID === searchId) {
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
        for (var index in item_assetInfo) {
            var info = item_assetInfo[index];
            var fixedName = info.name.toLowerCase();
            fixedName = fixedName.replaceAll(" _", " ");
            fixedName = fixedName.replaceAll("_", " ");
            var fixedLocalizedName = info.localizedName.toLowerCase();
            fixedLocalizedName = fixedLocalizedName.replaceAll(" _", " ");
            fixedLocalizedName = fixedLocalizedName.replaceAll("_", " ");
            var searchId = Number(search);
            if (fixedName.includes(search) || fixedLocalizedName.includes(search) || search === "" || info.uniqueID == searchId) {
                results.push(item_assetInfo[index]);
            }
        }
        return results;
    },
    "findIdsByCategory": function (category) {
        var results = [];
        if (category === "None" || category === "Other") {
            category = "";
        }
        for (var index in item_assetInfo) {
            var info = item_assetInfo[index];
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
        for (var index in item_assetInfo) {
            var info = item_assetInfo[index];
            if (info.category == category) {
                results.push(info);
            }
        }
        return results;
    },
    "getExistingCategories": function () {
        var categories = [];
        for (var index in item_assetInfo) {
            var info = item_assetInfo[index];
            if (!categories.includes(info.category)) {
                categories.push(info.category);
            }
        }
        return categories;
    }
};
//# sourceMappingURL=item-assetInfoHelper.js.map