"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var flat_cache_1 = require("flat-cache");
var path_1 = __importDefault(require("path"));
var Store = /** @class */ (function () {
    function Store(workflow, workspace) {
        var _this = this;
        this.file = "." + (workflow || 'workflow') + "-cache";
        this.cache = flat_cache_1.load(this.file, path_1.default.resolve(workspace || process.cwd()));
        this.get = this.cache.getKey.bind(this.cache);
        this.set = this.cache.setKey.bind(this.cache);
        this.all = this.cache.all.bind(this.cache);
        this.del = this.cache.removeKey.bind(this.cache);
        this.save = this.cache.save.bind(this.cache, true);
        process.on('exit', function () {
            if (_this.cache.keys().length > 0) {
                _this.save();
            }
        });
    }
    return Store;
}());
exports.Store = Store;
//# sourceMappingURL=store.js.map