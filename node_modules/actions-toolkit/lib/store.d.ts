import { Cache } from 'flat-cache';
export declare class Store {
    file: string;
    /**
     * Get a value from the store by it's key
     */
    get: Cache['getKey'];
    /**
     * Set a key/value pair in the store
     */
    set: Cache['setKey'];
    /**
     * Return all key/values in the store as a JSON object
     */
    all: Cache['all'];
    /**
     * Delete a key from the store
     */
    del: Cache['removeKey'];
    /**
     * Save the in-memory store to a file
     */
    save: Cache['save'];
    /**
     * Instance of flat-cache
     */
    private cache;
    constructor(workflow: string, workspace: string);
}
