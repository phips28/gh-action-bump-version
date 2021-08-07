"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rest_1 = __importDefault(require("@octokit/rest"));
var graphql_1 = require("./graphql");
var GitHub = /** @class */ (function (_super) {
    __extends(GitHub, _super);
    function GitHub(token) {
        var _this = _super.call(this, { auth: "token " + token }) || this;
        _this.graphql = graphql_1.withDefaults(token);
        return _this;
    }
    return GitHub;
}(rest_1.default));
exports.GitHub = GitHub;
//# sourceMappingURL=github.js.map