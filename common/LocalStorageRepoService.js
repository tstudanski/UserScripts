/// Plugin service that uses local storage to store and retrieve data
/// Depends on BaseModel
class LocalStorageRepoService extends BaseModel {
    constructor(dbName, env) {
        super(env);
        this.dbName = dbName;
    }

    set(key, value) {
        var newKey = this.dbName + '_' + key;
        this.debug('Setting local storage key: ' + newKey + ' to value: ' + JSON.stringify(value));
        localStorage.setItem(newKey, JSON.stringify(value));
    }
    get(key) {
        var newKey = this.dbName + '_' + key;
        var value = localStorage.getItem(newKey);
        this.debug('Getting local storage key: ' + newKey + ' with value: ' + value);
        return JSON.parse(value);
    }
    delete(key) {
        var newKey = this.dbName + '_' + key;
        localStorage.removeItem(newKey);
        this.debug('Deleted local storage key: ' + newKey);
    }
}