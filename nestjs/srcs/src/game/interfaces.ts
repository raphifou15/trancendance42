import { Socket } from 'socket.io';

export interface spectator {
  id: number;
  socket: Socket;
}

export interface gameStartInformation {
  playerPosition: string;
  gameId: string;
}

export interface spectateMessage {
  matchmakingTitle: string;
  gameId: string;
}

export interface gamePlayer {
  id: number;
  login: string;
  socket: Socket;
  gameMode: gameMode;
}

export type Point = {
  x: number;
  y: number;
};

export type racket = {
  pos: Point;
  width: number;
  height: number;
};

export type score = {
  player1: number;
  player2: number;
};

export type Ball = {
  pos: Point;
  dir: Point;
  radius: number;
};

export type gameState = {
  ball: Ball;
  leftRacket: racket;
  rightRacket: racket;
  score: score;
};

export type brickwallGameState = {
  classic: gameState;
  bonusArray: Array<bonus | undefined>;
};

export enum gameMode {
  classic = 0,
  brickwall = 1,
}

export type bonus = {
  pos: Point;
  side: number;
  effect: bonusEffect;
};

export enum bonusEffect {
  speed = 0,
  racketSize = 1,
  ballSize = 2,
  enemyPaddleSize = 3,
}

export enum player {
  left = 'left',
  right = 'right',
  none = 'none',
}

export interface gameInformation {
  player1: string;
  player2: string;
  mode: gameMode;
}
