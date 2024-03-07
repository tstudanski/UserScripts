/// Model class that hold commonly used methods
class BaseModel {
    env = 'prod'
    constructor() {}
    debug(...data) {
        if (this.env != 'prod') {
            console.log(data);
        }
    }
}