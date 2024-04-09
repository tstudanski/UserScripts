/// Model class that hold commonly used methods
class BaseModel {
    env = 'prod'
    constructor(env) {
        if (env) {
            this.env = env;
        }
    }
    debug(...data) {
        if (this.env != 'prod') {
            console.log(data);
        }
    }
}