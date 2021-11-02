var Store = /** @class */ (function () {
    function Store() {
    }
    Store.prototype.get = function (key) {
        return window.localStorage[key];
    };
    Store.prototype.set = function (key, value) {
        window.localStorage[key] = value;
    };
    Store.prototype.getBool = function (key, def) {
        if (def !== void 0 && !this.exists(key)) {
            return def;
        }
        return window.localStorage[key] === 'true';
    };
    Store.prototype.getObject = function (key, def) {
        var ret = def;
        if (this.exists(key)) {
            var json = window.localStorage[key];
            try {
                ret = JSON.parse(json);
            }
            catch (error) {
                console.error("Error parsing store object: " + key + ". Returning default: " + def + ". [" + error + "]");
            }
        }
        return ret;
    };
    /* Returns true when successfully stored, throws error if not successfully stored */
    Store.prototype.setObject = function (key, value) {
        var json;
        try {
            json = JSON.stringify(value);
        }
        catch (error) {
            throw new Error("Could not stringify object: " + key + ". [" + error + "]");
        }
        try {
            this.set(key, json);
        }
        catch (error) {
            // Likely hitting storage quota
            var errorToThrow = new Error("Could not save item in localStorage: " + key + ". [" + error + "]");
            errorToThrow.name = error.name;
            throw errorToThrow;
        }
        return true;
    };
    Store.prototype.exists = function (key) {
        return window.localStorage[key] !== void 0;
    };
    Store.prototype.delete = function (key) {
        window.localStorage.removeItem(key);
    };
    return Store;
}());
export { Store };
var store = new Store();
export default store;
//# sourceMappingURL=store.js.map