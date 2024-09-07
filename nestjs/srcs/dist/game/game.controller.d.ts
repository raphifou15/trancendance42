import { GameService } from './game.service';
import { gameInformation, spectateMessage } from './interfaces';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    findCurrentGames(): spectateMessage[];
    setGameId(param: any): boolean;
    findGameMode(param: any): gameInformation;
}
