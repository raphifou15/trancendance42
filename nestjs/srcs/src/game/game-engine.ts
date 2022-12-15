import { Injectable, Logger } from '@nestjs/common';

import {
  Ball,
  bonus,
  bonusEffect,
  brickwallGameState,
  gameState,
  player,
  racket,
  score,
} from './interfaces';

const gameMaxSpeed: { x: number; y: number } = { x: 0.01, y: 0.01 };

@Injectable()
export class classicGame {
  width: number;
  height: number;

  gameBall: Ball;

  leftRacket: racket;
  rightRacket: racket;
  gameInterval: NodeJS.Timer = null;

  EndScore = 12;
  Acceleration = 1e-5;
  gameScore: score = { player1: 0, player2: 0 };
  gameIsRunning = false;

  lastContact: player;
  logger = new Logger('gameEngine');

  constructor() {
    this.width = 1.0;
    this.height = 1.0;
    this.reset();
  }

  public startGame() {
    this.reset();
    this.gameIsRunning = true;
    this.gameInterval = setInterval(this.gameLoop.bind(this), 20);
  }

  public stopGame() {
    this.gameIsRunning = false;
    clearInterval(this.gameInterval);
  }

  public isFinished(): boolean {
    return this.checkWinningCondition() && !this.gameIsRunning;
  }

  public checkWinningCondition(): boolean {
    if (
      this.gameScore.player1 >= this.EndScore ||
      this.gameScore.player2 >= this.EndScore
    )
      return true;
    else {
      return false;
    }
  }

  public gameLoop() {
    if (this.gameIsRunning) {
      if (this.checkTopBorderCollision() || this.checkBottomBorderCollision()) {
        this.gameBall.dir.y *= -1;
      } else if (
        this.checkLeftBorderCollision() ||
        this.checkRightBorderCollision()
      ) {
        this.updateGameScore();
        this.gameBall.pos = {
          x: this.width / 2,
          y: generateRandomFloatInRange(0.05, 0.95),
        };
        this.gameBall.dir = {
          x: generateRandomFloatInRange(-5e-3, -1e-3),
          y: generateRandomFloatInRange(-1e-2, 1e-2),
        };
        if (
          (this.lastContact === player.left && this.gameBall.dir.x < 0) ||
          (this.lastContact === player.right && this.gameBall.dir.x > 0)
        )
          this.gameBall.dir.x *= -1; //sets the next ball direction into the opposite direction
        this.lastContact = player.none;
      } else if (
        this.checkRacketCollision(this.leftRacket) &&
        this.lastContact != player.left
      ) {
        this.updateLastContact(player.left);
        this.gameBall.dir.y = this.computeHitFactor(this.leftRacket);
        this.gameBall.dir.x *= -1;
      } else if (
        this.checkRacketCollision(this.rightRacket) &&
        this.lastContact != player.right
      ) {
        this.updateLastContact(player.right);
        this.gameBall.dir.y = this.computeHitFactor(this.rightRacket);
        this.gameBall.dir.x *= -1;
      }
      this.gameBall.pos.x += this.gameBall.dir.x;
      this.gameBall.pos.y += this.gameBall.dir.y;
      this.accelerateBall(this.Acceleration);
    }
  }

  private updateGameScore() {
    if (this.checkLeftBorderCollision()) {
      this.gameScore.player2 += 1;
      this.updateLastContact(player.right);
    } else if (this.checkRightBorderCollision()) {
      this.gameScore.player1 += 1;
      this.updateLastContact(player.left);
    }
    if (this.checkWinningCondition()) {
      this.stopGame();
    }
  }

  public accelerateBall(Acceleration: number) {
    if (Math.abs(this.gameBall.dir.x) < gameMaxSpeed.x) {
      if (this.gameBall.dir.x < 0) this.gameBall.dir.x -= Acceleration;
      else this.gameBall.dir.x += Acceleration;
    }
    if (Math.abs(this.gameBall.dir.y) < gameMaxSpeed.y) {
      if (this.gameBall.dir.y < 0) this.gameBall.dir.y -= Acceleration;
      else this.gameBall.dir.y += Acceleration;
    }
  }

  private checkRacketCollision(Racket: racket): boolean {
    const closestX: number = clamp(
      this.gameBall.pos.x,
      Racket.pos.x - Racket.width / 2,
      Racket.pos.x + Racket.width / 2,
    );
    const closestY: number = clamp(
      this.gameBall.pos.y,
      Racket.pos.y - Racket.height / 2,
      Racket.pos.y + Racket.height / 2,
    );

    const distanceX: number = this.gameBall.pos.x - closestX;
    const distanceY: number = this.gameBall.pos.y - closestY;

    const distanceSquared: number =
      distanceX * distanceX + distanceY * distanceY;

    return distanceSquared < this.gameBall.radius * this.gameBall.radius;
  }

  private checkLeftBorderCollision(): boolean {
    return this.gameBall.pos.x <= this.gameBall.radius;
  }

  private checkRightBorderCollision(): boolean {
    return this.gameBall.pos.x >= this.width - this.gameBall.radius;
  }

  private checkTopBorderCollision(): boolean {
    return this.gameBall.pos.y <= this.gameBall.radius;
  }
  private checkBottomBorderCollision(): boolean {
    return this.gameBall.pos.y + this.gameBall.radius >= this.height;
  }

  public dispatchGameState(): gameState {
    const payload: gameState = {
      ball: this.gameBall,
      leftRacket: this.leftRacket,
      rightRacket: this.rightRacket,
      score: this.gameScore,
    };
    return payload;
  }

  public updateRacketPosition(Racket: racket, movement: string) {
    // if (movement === 'up' && Racket.pos.y - Racket.height > 0) {
    const step: number = 3e-2;
    if (movement === 'up' && Racket.pos.y - step - Racket.height / 2 > 1e-9) {
      Racket.pos.y -= step;
    } else if (
      movement === 'down' &&
      Racket.pos.y + step + Racket.height / 2 < 1
    ) {
      Racket.pos.y += step;
    }
  }

  public resetBallPosition(): Ball {
    let ball: Ball = {
      pos: { x: this.width / 2, y: this.height / 2 },
      dir: {
        x: generateRandomFloatInRange(-1e-2, 1e-2),
        y: generateRandomFloatInRange(-1e-2, 1e-2),
      },
      radius: 0.018,
    };
    return ball;
  }

  public reset() {
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

    this.lastContact = player.none;
  }

  private computeHitFactor(racket: racket): number {
    return (
      ((this.gameBall.pos.y - racket.pos.y) *
        ((Math.abs(this.gameBall.dir.x) + Math.abs(this.gameBall.dir.y)) / 2)) /
      racket.height
    );
  }

  public getLastContact(): player {
    return this.lastContact;
  }

  private updateLastContact(player: player) {
    this.lastContact = player;
  }
}

export function clamp(
  circleCoord: number,
  rectLeft: number,
  rectRight: number,
): number {
  if (circleCoord < rectLeft) return rectLeft;
  else if (circleCoord > rectRight) return rectRight;
  else return circleCoord;
}

// https://www.udacity.com/blog/2021/04/javascript-random-numbers.html#:~:text=Javascript%20creates%20pseudo%2Drandom%20numbers,it%20will%20never%20be%201.

function generateRandomIntegerInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomFloatInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export class brickwallGame {
  logger: Logger = new Logger('brickwall game');
  classic: classicGame; // composition

  maxBonusNumber: number = 3;
  bonusArray: Array<bonus | undefined> = new Array(this.maxBonusNumber);
  bonusInterval: NodeJS.Timer;

  constructor() {
    this.classic = new classicGame();
    this.bonusArray.fill(undefined);
  }

  //for now we can just pop a new item every three seconds for example
  // private computeNextObjectPop() {
  //   while (!this.nextBonusPop) {
  //     this.nextBonusPop = (Math.random() * 10) % 5;
  //   }
  // }

  public dispatchGameState(): brickwallGameState {
    const payload: brickwallGameState = {
      classic: this.classic.dispatchGameState(),
      bonusArray: this.bonusArray,
    };
    return payload;
  }

  private bonusCanBeAdded(): boolean {
    return this.bonusArray.findIndex((value) => value === undefined) !== -1;
  }

  private addNewBonus() {
    if (this.bonusCanBeAdded()) {
      const newBonus: bonus = {
        pos: {
          x: generateRandomFloatInRange(0.2, this.classic.width - 0.2),
          y: generateRandomFloatInRange(0.2, this.classic.height - 0.2),
        },
        side: 0.05,
        effect: generateRandomIntegerInRange(0, 3),
      };
      const index = this.bonusArray.findIndex((value) => value === undefined);
      if (index !== -1) this.bonusArray[index] = newBonus;
    }
  }

  private eraseBonus(index: number) {
    this.bonusArray[index] = undefined;
  }

  public brickwallGameLoop() {
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

  public computeBonusIntersection(bonus: bonus): boolean {
    const closestX: number = clamp(
      this.classic.gameBall.pos.x,
      bonus.pos.x - bonus.side / 2,
      bonus.pos.x + bonus.side / 2,
    );
    const closestY: number = clamp(
      this.classic.gameBall.pos.y,
      bonus.pos.y - bonus.side / 2,
      bonus.pos.y + bonus.side / 2,
    );
    const distanceX: number = this.classic.gameBall.pos.x - closestX;
    const distanceY: number = this.classic.gameBall.pos.y - closestY;

    const distanceSquared: number =
      distanceX * distanceX + distanceY * distanceY;

    return (
      distanceSquared <
      this.classic.gameBall.radius * this.classic.gameBall.radius
    );
  }

  private applyBonus(bonus: bonus) {
    if (bonus.effect === bonusEffect.ballSize) {
      if (this.classic.gameBall.radius > 0.01)
        this.classic.gameBall.radius -= 0.005;
    } else if (bonus.effect === bonusEffect.racketSize) {
      if (this.classic.lastContact === player.left)
        this.classic.leftRacket.height += 0.01;
      else if (this.classic.lastContact === player.right)
        this.classic.rightRacket.height += 0.01;
    } else if (bonus.effect === bonusEffect.speed) {
      this.classic.accelerateBall(this.classic.Acceleration * 4);
    } else if (bonus.effect === bonusEffect.enemyPaddleSize) {
      if (
        this.classic.lastContact === player.left &&
        this.classic.rightRacket.height > 0.01
      )
        this.classic.rightRacket.height -= 0.005;
      else if (
        this.classic.lastContact === player.right &&
        this.classic.leftRacket.height > 0.01
      )
        this.classic.leftRacket.height -= 0.005;
    }
  }

  public startGame() {
    this.classic.reset();
    this.classic.gameIsRunning = true;
    this.classic.gameInterval = setInterval(
      this.brickwallGameLoop.bind(this),
      20,
    );
    this.bonusInterval = setInterval(this.addNewBonus.bind(this), 1000);
  }

  public stopGame() {
    this.classic.gameIsRunning = false;
    clearInterval(this.classic.gameInterval);
    clearInterval(this.bonusInterval);
  }

  public reset() {
    this.classic.reset();
  }

  public spectate() {}
  // no more than 3 differents objects on the board Just one for now
  // check if popping new item is needed DONE
  // compute objects intersections TODO
  // apply effects on ball size, speed or paddle size on intersection TODO
}
