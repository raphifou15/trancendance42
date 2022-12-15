import { useEffect, useRef } from "react"

import { GameEvent, gameMode, gameProps, gameStartInformation } from "../interfaces/Game"
import { gameSocket } from "../socket"

import Header from "../components/Header";
import { authCookie } from "../App";
import "../styles/Play.css"

import "../styles/GameSelectionForm.css"
import blue from "../images/login_bar_bleu.png"
import green from "../images/login_bar_vert.png"
import ball from "../images/login_ball.png"
import arrow_keys from "../images/arrow_keys.png"
import bonusSpeed from "../images/bonusSpeedImage.png"
import bonusSize from "../images/increasePaddle.png"
import malusSize from "../images/reducePaddle.png"
import bonusBall from "../images/bonusBallImage.png"


import { useNavigate } from "react-router-dom";
export interface playerGameSetup {
    mode: gameMode;
    id: number;
}

interface Props {
    logoutOfSite: any;
}

export const ChooseGameMode: React.FC<Props> = ({ logoutOfSite }: Props) => {

    //save player id
    // authCookie.get('42auth-cookie');
    const navigate = useNavigate()
    let authid = -1;
    if (authCookie.get('42auth-cookie') !== undefined) {
        authid = authCookie.get('42auth-cookie').id;
    }

    useEffect(() => {
        if (authCookie.get('42auth-cookie') === undefined)
            navigate('/Login')
    })

    //faire un state pour re render la page
    // const [side, setSide] = useState('none')

    let gamePropsRef = useRef<gameProps>({ player: '', gameMode: 0 })
    function submitGameForm(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        // setGameOn(true)
        if (gameSocket.disconnected)
            gameSocket.connect()
        gameSocket.emit('gameConnection', { mode: gamePropsRef.current.gameMode, id: authid })

        gameSocket.on(GameEvent.Start, (data: gameStartInformation) => {
            // navigate to match
            navigate(data.gameId)
            gamePropsRef.current.player = data.playerPosition
        })
    }

    return (
        <div className="font__game">
            <img className="font__game__green" src={green} alt="barre verte" />
            <img className="font__game__blue" src={blue} alt="barre bleu" />
            <img className="font__game__ball" src={ball} alt="balle" />
            <div>
                <Header logoutOfSite={logoutOfSite} conditionHeader={1} />
                <form className='play-form' onSubmit={submitGameForm}>
                    <div>
                        <p>
                            Select the kind of game you would like to play:
                        </p>
                        <br />
                        <input className='input'
                            type='radio'
                            id='classicMode'
                            name='gameMode'
                            defaultChecked
                            onChange={(e) => {
                                gamePropsRef.current.gameMode = 0
                            }}
                        />

                        <label htmlFor='classicMode'> Classic</label>
                        <br />
                        <input className='input'
                            type='radio'
                            id='brickWallMode'
                            name='gameMode'
                            onChange={(e) => {
                                gamePropsRef.current.gameMode = 1
                            }}
                        />
                        <label htmlFor='brickWallMode'> Pong feat Brickwall</label>
                        <br />
                        <br />
                        <input
                            className="friend-btn"
                            type='submit'
                            id='play'
                            value="Play Game"
                        />
                    </div>
                </form>
                <br />
                <div className="game-manual">
                    <img className="arrows" src={arrow_keys} alt="arrow_keys"></img>
                    Press the ArrowUp or ArrowDown to move your paddle.
                    <br />
                    <br />
                    BrickWallMode adds various bonuses to spice up the game!
                    <br />
                    <br />
                    <img className="bonus" src={bonusSpeed} alt="bonus_speed"></img>
                    Increases the ball speed.
                    <br />
                    <br />
                    <img className="bonus" src={bonusSize} alt="bonus_size"></img>
                    Increases the size of the paddle.
                    <br />
                    <br />
                    <img className="bonus" src={malusSize} alt="malus_size"></img>
                    Decreases the size of the opponent's paddle.
                    <br />
                    <br />
                    <img className="bonus" src={bonusBall} alt="bonus_ball"></img>
                    Decreases the ball size.
                </div>
            </div>
        </div>
    )
}