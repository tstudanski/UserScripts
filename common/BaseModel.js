// BaseModel.js

/**
 * Model class that hold commonly used methods.
 * @param {string} env - The environment mode, which can be 'dev' or 'prod'.
 */
class BaseModel {
    constructor(env = 'prod') {
        // Ensure env is a non-empty string
        if (typeof env !== 'string' || env.trim() === '') {
            throw new Error('Invalid environment mode');
        }
        this.env = env;
    }

    /**
     * Log debug information if in development mode.
     * @param {any} data - The data to be logged.
     * @returns {any} - The data for potential chaining.
     */
    debug(data) {
        if (this.env != 'prod') {
            console.log(data);
            return data;
        }
    }
}