/// Plugin service that uses local storage to store and retrieve data
/// Depends on BaseRepoService
class LocalStorageRepoService extends BaseRepoService {
    constructor(dbName, env) {
        super(dbName, env);
    }

    set(key, value) {
        var newKey = this.toDBKey(key);
        this.debug(`Setting local storage key: ${newKey} to value: ${JSON.stringify(value)}`);
        localStorage.setItem(newKey, JSON.stringify(value));
    }
    get(key) {
        var newKey = this.toDBKey(key);
        var value = localStorage.getItem(newKey);
        this.debug(`Getting local storage key: ${newKey} with value: ${value}`);
        return JSON.parse(value);
    }
    getAll() {
        var values = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.startsWith(this.dbName + '_')) {
                var value = localStorage.getItem(key);
                values[this.fromDBKey(key)] = JSON.parse(value);
            }
        }
        this.debug(`Getting all ${Object.keys(values).length} local storage keys for db: ${this.dbName}`);
        return values;
    }
    delete(key) {
        var newKey = this.toDBKey(key);
        localStorage.removeItem(newKey);
        this.debug(`Deleted local storage key: ${newKey}`);
    }
}