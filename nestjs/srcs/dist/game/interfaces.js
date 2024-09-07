"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.player = exports.bonusEffect = exports.gameMode = void 0;
var gameMode;
(function (gameMode) {
    gameMode[gameMode["classic"] = 0] = "classic";
    gameMode[gameMode["brickwall"] = 1] = "brickwall";
})(gameMode || (exports.gameMode = gameMode = {}));
var bonusEffect;
(function (bonusEffect) {
    bonusEffect[bonusEffect["speed"] = 0] = "speed";
    bonusEffect[bonusEffect["racketSize"] = 1] = "racketSize";
    bonusEffect[bonusEffect["ballSize"] = 2] = "ballSize";
    bonusEffect[bonusEffect["enemyPaddleSize"] = 3] = "enemyPaddleSize";
})(bonusEffect || (exports.bonusEffect = bonusEffect = {}));
var player;
(function (player) {
    player["left"] = "left";
    player["right"] = "right";
    player["none"] = "none";
})(player || (exports.player = player = {}));
//# sourceMappingURL=interfaces.js.map