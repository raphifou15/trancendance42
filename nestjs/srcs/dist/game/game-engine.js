"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brickwallGame = exports.classicGame = void 0;
exports.clamp = clamp;
const common_1 = require("@nestjs/common");
const interfaces_1 = require("./interfaces");
const gameMaxSpeed = { x: 0.01, y: 0.01 };
let classicGame = class classicGame {
    constructor() {
        this.gameInterval = null;
        this.EndScore = 12;
        this.Acceleration = 1e-5;
        this.gameScore = { player1: 0, player2: 0 };
        this.gameIsRunning = false;
        this.logger = new common_1.Logger('gameEngine');
        this.width = 1.0;
        this.height = 1.0;
        this.reset();
    }
    startGame() {
        this.reset();
        this.gameIsRunning = true;
        this.gameInterval = setInterval(this.gameLoop.bind(this), 20);
    }
    stopGame() {
        this.gameIsRunning = false;
        clearInterval(this.gameInterval);
    }
    isFinished() {
        return this.checkWinningCondition() && !this.gameIsRunning;
    }
    checkWinningCondition() {
        if (this.gameScore.player1 >= this.EndScore ||
            this.gameScore.player2 >= this.EndScore)
            return true;
        else {
            return false;
        }
    }
    gameLoop() {
        if (this.gameIsRunning) {
            if (this.checkTopBorderCollision() || this.checkBottomBorderCollision()) {
                this.gameBall.dir.y *= -1;
            }
            else if (this.checkLeftBorderCollision() ||
                this.checkRightBorderCollision()) {
                this.updateGameScore();
                this.gameBall.pos = {
                    x: this.width / 2,
                    y: generateRandomFloatInRange(0.05, 0.95),
                };
                this.gameBall.dir = {
                    x: generateRandomFloatInRange(-5e-3, -1e-3),
                    y: generateRandomFloatInRange(-1e-2, 1e-2),
                };
                if ((this.lastContact === interfaces_1.player.left && this.gameBall.dir.x < 0) ||
                    (this.lastContact === interfaces_1.player.right && this.gameBall.dir.x > 0))
                    this.gameBall.dir.x *= -1;
                this.lastContact = interfaces_1.player.none;
            }
            else if (this.checkRacketCollision(this.leftRacket) &&
                this.lastContact != interfaces_1.player.left) {
                this.updateLastContact(interfaces_1.player.left);
                this.gameBall.dir.y = this.computeHitFactor(this.leftRacket);
                this.gameBall.dir.x *= -1;
            }
            else if (this.checkRacketCollision(this.rightRacket) &&
                this.lastContact != interfaces_1.player.right) {
                this.updateLastContact(interfaces_1.player.right);
                this.gameBall.dir.y = this.computeHitFactor(this.rightRacket);
                this.gameBall.dir.x *= -1;
            }
            this.gameBall.pos.x += this.gameBall.dir.x;
            this.gameBall.pos.y += this.gameBall.dir.y;
            this.accelerateBall(this.Acceleration);
        }
    }
    updateGameScore() {
        if (this.checkLeftBorderCollision()) {
            this.gameScore.player2 += 1;
            this.updateLastContact(interfaces_1.player.right);
        }
        else if (this.checkRightBorderCollision()) {
            this.gameScore.player1 += 1;
            this.updateLastContact(interfaces_1.player.left);
        }
        if (this.checkWinningCondition()) {
            this.stopGame();
        }
    }
    accelerateBall(Acceleration) {
        if (Math.abs(this.gameBall.dir.x) < gameMaxSpeed.x) {
            if (this.gameBall.dir.x < 0)
                this.gameBall.dir.x -= Acceleration;
            else
                this.gameBall.dir.x += Acceleration;
        }
        if (Math.abs(this.gameBall.dir.y) < gameMaxSpeed.y) {
            if (this.gameBall.dir.y < 0)
                this.gameBall.dir.y -= Acceleration;
            else
                this.gameBall.dir.y += Acceleration;
        }
    }
    checkRacketCollision(Racket) {
        const closestX = clamp(this.gameBall.pos.x, Racket.pos.x - Racket.width / 2, Racket.pos.x + Racket.width / 2);
        const closestY = clamp(this.gameBall.pos.y, Racket.pos.y - Racket.height / 2, Racket.pos.y + Racket.height / 2);
        const distanceX = this.gameBall.pos.x - closestX;
        const distanceY = this.gameBall.pos.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        return distanceSquared < this.gameBall.radius * this.gameBall.radius;
    }
    checkLeftBorderCollision() {
        return this.gameBall.pos.x <= this.gameBall.radius;
    }
    checkRightBorderCollision() {
        return this.gameBall.pos.x >= this.width - this.gameBall.radius;
    }
    checkTopBorderCollision() {
        return this.gameBall.pos.y <= this.gameBall.radius;
    }
    checkBottomBorderCollision() {
        return this.gameBall.pos.y + this.gameBall.radius >= this.height;
    }
    dispatchGameState() {
        const payload = {
            ball: this.gameBall,
            leftRacket: this.leftRacket,
            rightRacket: this.rightRacket,
            score: this.gameScore,
        };
        return payload;
    }
    updateRacketPosition(Racket, movement) {
        const step = 3e-2;
        if (movement === 'up' && Racket.pos.y - step - Racket.height / 2 > 1e-9) {
            Racket.pos.y -= step;
        }
        else if (movement === 'down' &&
            Racket.pos.y + step + Racket.height / 2 < 1) {
            Racket.pos.y += step;
        }
    }
    resetBallPosition() {
        let ball = {
            pos: { x: this.width / 2, y: this.height / 2 },
            dir: {
                x: generateRandomFloatInRange(-1e-2, 1e-2),
                y: generateRandomFloatInRange(-1e-2, 1e-2),
            },
            radius: 0.018,
        };
        return ball;
    }
    reset() {
        this.gameScore = { player1: 0, player2: 0 };
        this.gameBall = this.resetBallPosition();
        this.leftRacket = {
            pos: { x: 0.05, y: 0.5 },
            width: 0.03,
            height: 0.1,
        };
        this.rightRacket = {
            pos: { x: this.width - 0.05, y: 0.5 },
            width: 0.03,
            height: 0.1,
        };
        this.lastContact = interfaces_1.player.none;
    }
    computeHitFactor(racket) {
        return (((this.gameBall.pos.y - racket.pos.y) *
            ((Math.abs(this.gameBall.dir.x) + Math.abs(this.gameBall.dir.y)) / 2)) /
            racket.height);
    }
    getLastContact() {
        return this.lastContact;
    }
    updateLastContact(player) {
        this.lastContact = player;
    }
};
exports.classicGame = classicGame;
exports.classicGame = classicGame = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], classicGame);
function clamp(circleCoord, rectLeft, rectRight) {
    if (circleCoord < rectLeft)
        return rectLeft;
    else if (circleCoord > rectRight)
        return rectRight;
    else
        return circleCoord;
}
function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateRandomFloatInRange(min, max) {
    return Math.random() * (max - min) + min;
}
class brickwallGame {
    constructor() {
        this.logger = new common_1.Logger('brickwall game');
        this.maxBonusNumber = 3;
        this.bonusArray = new Array(this.maxBonusNumber);
        this.classic = new classicGame();
        this.bonusArray.fill(undefined);
    }
    dispatchGameState() {
        const payload = {
            classic: this.classic.dispatchGameState(),
            bonusArray: this.bonusArray,
        };
        return payload;
    }
    bonusCanBeAdded() {
        return this.bonusArray.findIndex((value) => value === undefined) !== -1;
    }
    addNewBonus() {
        if (this.bonusCanBeAdded()) {
            const newBonus = {
                pos: {
                    x: generateRandomFloatInRange(0.2, this.classic.width - 0.2),
                    y: generateRandomFloatInRange(0.2, this.classic.height - 0.2),
                },
                side: 0.05,
                effect: generateRandomIntegerInRange(0, 3),
            };
            const index = this.bonusArray.findIndex((value) => value === undefined);
            if (index !== -1)
                this.bonusArray[index] = newBonus;
        }
    }
    eraseBonus(index) {
        this.bonusArray[index] = undefined;
    }
    brickwallGameLoop() {
        if (this.classic.gameIsRunning) {
            this.classic.gameLoop();
            this.bonusArray.forEach((value, index) => {
                if (value !== undefined && this.computeBonusIntersection(value)) {
                    this.applyBonus(value);
                    this.eraseBonus(index);
                }
            });
        }
    }
    computeBonusIntersection(bonus) {
        const closestX = clamp(this.classic.gameBall.pos.x, bonus.pos.x - bonus.side / 2, bonus.pos.x + bonus.side / 2);
        const closestY = clamp(this.classic.gameBall.pos.y, bonus.pos.y - bonus.side / 2, bonus.pos.y + bonus.side / 2);
        const distanceX = this.classic.gameBall.pos.x - closestX;
        const distanceY = this.classic.gameBall.pos.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        return (distanceSquared <
            this.classic.gameBall.radius * this.classic.gameBall.radius);
    }
    applyBonus(bonus) {
        if (bonus.effect === interfaces_1.bonusEffect.ballSize) {
            if (this.classic.gameBall.radius > 0.01)
                this.classic.gameBall.radius -= 0.005;
        }
        else if (bonus.effect === interfaces_1.bonusEffect.racketSize) {
            if (this.classic.lastContact === interfaces_1.player.left)
                this.classic.leftRacket.height += 0.01;
            else if (this.classic.lastContact === interfaces_1.player.right)
                this.classic.rightRacket.height += 0.01;
        }
        else if (bonus.effect === interfaces_1.bonusEffect.speed) {
            this.classic.accelerateBall(this.classic.Acceleration * 4);
        }
        else if (bonus.effect === interfaces_1.bonusEffect.enemyPaddleSize) {
            if (this.classic.lastContact === interfaces_1.player.left &&
                this.classic.rightRacket.height > 0.01)
                this.classic.rightRacket.height -= 0.005;
            else if (this.classic.lastContact === interfaces_1.player.right &&
                this.classic.leftRacket.height > 0.01)
                this.classic.leftRacket.height -= 0.005;
        }
    }
    startGame() {
        this.classic.reset();
        this.classic.gameIsRunning = true;
        this.classic.gameInterval = setInterval(this.brickwallGameLoop.bind(this), 20);
        this.bonusInterval = setInterval(this.addNewBonus.bind(this), 1000);
    }
    stopGame() {
        this.classic.gameIsRunning = false;
        clearInterval(this.classic.gameInterval);
        clearInterval(this.bonusInterval);
    }
    reset() {
        this.classic.reset();
    }
    spectate() { }
}
exports.brickwallGame = brickwallGame;
//# sourceMappingURL=game-engine.js.map