/// Plugin service that uses GM to store and retrieve data
/// Depends on BaseModel
/// Requires @grant for: GM_setValue, GM_getValue, GM_deleteValue, GM_listValues
class GMRepoService extends BaseModel {
    constructor(dbName, env) {
        super(env);
        this.dbName = dbName;
    }

    toDBKey(key) {
        return this.dbName + '_' + key;
    }

    set(key, value) {
        var newKey = this.toDBKey(key);
        this.debug(`Setting GM storage key: ${newKey} to value: ${value}`);
        GM_setValue(newKey, value);
    }
    get(key) {
        var newKey = this.toDBKey(key);
        var value = GM_getValue(newKey);
        this.debug(`Getting GM storage key: ${newKey} with value: ${value}`);
        return value;
    }
    getAll() {
        var values = {};
        var allKeys = GM_listValues();
        for (var i = 0; i < allKeys.length; i++) {
            var key = allKeys[i];
            if (key.startsWith(this.dbName + '_')) {
                values[key] = GM_getValue(key);
            }
        }
        this.debug(`Getting all ${Object.keys(values).length} GM storage keys for db: ${this.dbName}`);
        return values;
    }
    delete(key) {
        var newKey = this.toDBKey(key);
        GM_deleteValue(newKey);
        this.debug(`Deleted GM storage key: ${newKey}`);
    }
}