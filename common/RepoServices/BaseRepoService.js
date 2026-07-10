/// Abstract plugin service for storing and retrieving data
/// Depends on BaseModel
class BaseRepoService extends BaseModel {
    constructor(dbName, env) {
        super(env);
        this.dbName = dbName;
    }

    toDBKey(key) {
        return this.dbName + '_' + key;
    }
    fromDBKey(dbKey) {
        return dbKey.substring(this.dbName.length + 1);
    }

    set(key, value) {
        alert('set method not implemented for this repo service');
    }
    get(key) {
        alert('get method not implemented for this repo service');
    }
    getAll() {
        alert('getAll method not implemented for this repo service');
    }
    delete(key) {
        alert('delete method not implemented for this repo service');
    }
}