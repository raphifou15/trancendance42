"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvPath = getEnvPath;
const fs_1 = require("fs");
const path_1 = require("path");
function getEnvPath(dest) {
    const env = process.env.NODE_ENV;
    console.log(env);
    const fallback = '/backend/.env';
    console.log(fallback);
    const filename = env ? `${env}.env` : 'development.env';
    console.log(filename);
    let filePath = (0, path_1.resolve)(`${dest}/${filename}`);
    if (!(0, fs_1.existsSync)(filePath)) {
        filePath = fallback;
    }
    console.log(filePath);
    return filePath;
}
//# sourceMappingURL=env.helper.js.map