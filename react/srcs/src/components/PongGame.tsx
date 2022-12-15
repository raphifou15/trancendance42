import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { brickwallGameState, GameEvent, gameInformation, gameMode, gameState, score, } from "../interfaces/Game";
import { gameSocket } from '../socket'
import '../styles/Play.css'
import ballImageSrc from '../images/login_ball.png'
import bonusBallImage from '../images/bonusBallImage.png'
import bonusSpeedImage from '../images/bonusSpeedImage.png'
import bonusSizeImage from '../images/increasePaddle.png'
import malusSizeImage from '../images/reducePaddle.png'
import leftPaddleSrc from '../images/login_bar_vert.png'
import rightPaddleSrc from '../images/login_bar_bleu.png'
import backgroundSrc from '../images/login_font.jpg'
import { displayGameEndMessage, drawBoard, drawBonus, drawLogins, drawScore, FrontBall, Paddle } from "./DrawingFunctions";
import { tmp_props } from "../pages/Match";
import { authCookie } from "../App";

// https://codesandbox.io/embed/resizing-canvas-with-react-hooks-gizc5qqq


export const background = new Image()
background.src = backgroundSrc;

export const leftPaddleImage = new Image()
leftPaddleImage.src = leftPaddleSrc
export const rightPaddleImage = new Image()
rightPaddleImage.src = rightPaddleSrc
export const ballImage = new Image()
ballImage.src = ballImageSrc


export let canvasWidth: number = window.innerHeight * 0.8
export let canvasHeight: number = window.innerHeight * 0.6

export const bonusBall = new Image()
bonusBall.src = bonusBallImage
export const bonusSpeed = new Image()
bonusSpeed.src = bonusSpeedImage
export const bonusSize = new Image()
bonusSize.src = bonusSizeImage
export const malusSize = new Image()
malusSize.src = malusSizeImage

interface playerInfo  {
    gameId:string;
    playerId:number
}

export const PongGame: React.FC<tmp_props> = (props) => {

    // console.log(props.player)
    const location = useParams()
    const navigate = useNavigate()
    let canvasRef = useRef<HTMLCanvasElement | null>(null);
    let backgroundLayerRef = useRef<HTMLCanvasElement | null>(null);
    let gameInformationRef = useRef<gameInformation | null>(null)
    let objectLayerContext = useRef<CanvasRenderingContext2D | null>(null)
    let LeftPaddle: Paddle = new Paddle(0.05, leftPaddleImage)
    let RightPaddle: Paddle = new Paddle(0.95, rightPaddleImage)
    let gameBall: FrontBall = new FrontBall(ballImage)

    const [gameOn, setGameOn] = useState(false)
    const [changeDisplay, setChangeDisplay] = useState(false)
    // const [matchResult, setMatchResult] = useState('none')

    let DrawBallAnimationFrameId = useRef(0)

    const setupCanvasContexts = () => {
        if (!canvasRef.current)
            return
        objectLayerContext.current = (canvasRef.current!.getContext('2d'))
    }

    //needs to be refacto into a cleaner stuff
    useEffect(() => {
        setupCanvasContexts()
        getGameInformation()
        gameSocket.on(GameEvent.End, (result: { winner: string, score: score }) => {
            window.cancelAnimationFrame(DrawBallAnimationFrameId.current)

            if (props.player) {
                if (objectLayerContext.current)
                    displayGameEndMessage(result.winner, objectLayerContext.current!)

                setTimeout(() => navigate('/play'), 2500)
            }
            else {
                setTimeout(() => navigate('/spectate'), 500)
            }
            gameSocket.disconnect()
        })
        let backgroundContext = backgroundLayerRef.current!.getContext('2d')
        drawBoard(backgroundContext!,
            { width: backgroundLayerRef.current!.clientWidth, height: backgroundLayerRef.current!.clientHeight })
        if (gameInformationRef.current !== null) {
            if (gameInformationRef.current!.mode === gameMode.classic) {
                DrawBallAnimationFrameId.current = requestAnimationFrame(DrawClassicGame)
            }
            else {
                DrawBallAnimationFrameId.current = requestAnimationFrame(DrawBrickwallGame)
            }
            if (!gameOn) {
                gameSocket.disconnect()
            }
        }
        return () => window.cancelAnimationFrame(DrawBallAnimationFrameId.current)
    }, [gameOn])


    useEffect(() => {
        window.addEventListener("resize", resize)
        return () => window.removeEventListener("resize", resize)
    }, [])


    useEffect(() => {
        if (props.player) {
            window.addEventListener('keydown', handleKeyboardInput)
            return () => window.removeEventListener('keydown', handleKeyboardInput)
        }
    })

    function handleKeyboardInput(e: KeyboardEvent) {
        switch (e.code) {
            case 'ArrowUp':
                gameSocket.emit('PlayerMovement',
                    { gameId: location.gameId, movement: 'up' })
                break;
            case 'ArrowDown':
                gameSocket.emit('PlayerMovement',
                    { gameId: location.gameId, movement: 'down' })
                break;
        }
    }

    function getGameInformation() {
        if (gameSocket.disconnected || !gameSocket.connected) {
            gameSocket.connect()
        }

        if (props.player) {
            // setTimeout(() => {
            let playerId = -1
            if (authCookie.get('42auth-cookie') !== undefined)
                playerId = authCookie.get('42auth-cookie').id

            gameSocket.emit('getGameInformation', {gameId: location.gameId, playerId : playerId}, (data: gameInformation | undefined) => {
                if (data !== undefined &&
                    (data.mode === gameMode.classic || data.mode === gameMode.brickwall)) {
                    gameInformationRef.current = data
                    setGameOn(true)
                }
                else {
                    setChangeDisplay(true)
                }
            })
        // }, 100)
        }
        else {
            setTimeout(() => {
                gameSocket.emit('getSpectateGameInformation', location.gameId, (data: gameInformation | undefined) => {
                    if (data !== undefined &&
                        (data.mode === gameMode.classic || data.mode === gameMode.brickwall)) {
                        gameInformationRef.current = data
                        setGameOn(true)
                    }
                    else {
                        setChangeDisplay(true)
                    }
                })
            }, 100)

        }
        // }
    }

    // function handleMouseMovement(e: MouseEvent): void {
    //     const movement: string = e.movementY > 0 ? 'down' : 'up'
    //     gameSocket.emit('PlayerMovement',
    //         { gameId: location.gameId, movement: movement })
    // }

    function resize() //could be improved
    {
        canvasRef.current!.width = window.innerWidth * 0.8
        canvasRef.current!.height = window.innerHeight * 0.8

        backgroundLayerRef.current!.width = window.innerWidth * 0.8
        backgroundLayerRef.current!.height = window.innerHeight * 0.8
        drawBoard(backgroundLayerRef.current!.getContext('2d')!,
            { width: backgroundLayerRef.current!.width, height: backgroundLayerRef.current!.height })
    }


    const DrawClassicGame = () => {


        gameSocket.emit(GameEvent.State, location.gameId, (data: gameState | undefined) => {

            if (data === undefined || !gameOn) {
                return;// setGameOn(false)
            }
            else {
                const windowSize = { width: canvasRef.current!.clientWidth, height: canvasRef.current!.clientHeight }
                objectLayerContext.current!.clearRect(0, 0, windowSize.width, windowSize.height)
                if (gameInformationRef.current)
                    drawLogins(objectLayerContext.current!,
                        windowSize,
                        gameInformationRef.current!)
                LeftPaddle.update(data.leftRacket)
                RightPaddle.update(data.rightRacket)
                gameBall.update(data.ball)
                if (objectLayerContext.current) {
                    LeftPaddle.draw(objectLayerContext.current!, windowSize)
                    RightPaddle.draw(objectLayerContext.current!, windowSize)
                    gameBall.draw(objectLayerContext.current!, windowSize)
                    drawScore(objectLayerContext.current!, data.score, windowSize)
                }
            }
        })
        DrawBallAnimationFrameId.current = requestAnimationFrame(DrawClassicGame)
    }

    const DrawBrickwallGame = () => {

        gameSocket.emit(GameEvent.State, location.gameId, (data: brickwallGameState) => {
            if (data === undefined) {
                setGameOn(false)
            }
            else {
                const windowSize = { width: canvasRef.current!.clientWidth, height: canvasRef.current!.clientHeight }
                LeftPaddle.update(data.classic.leftRacket)
                RightPaddle.update(data.classic.rightRacket)
                gameBall.update(data.classic.ball)
                objectLayerContext.current!.clearRect(0, 0, windowSize.width, windowSize.height)
                if (gameInformationRef.current)
                    drawLogins(objectLayerContext.current!,
                        windowSize,
                        gameInformationRef.current!)
                if (objectLayerContext.current) {
                    LeftPaddle.draw(objectLayerContext.current!, windowSize)
                    RightPaddle.draw(objectLayerContext.current!, windowSize)
                    gameBall.draw(objectLayerContext.current!, windowSize)
                    drawScore(objectLayerContext.current!, data.classic.score, windowSize)
                    drawBonus(objectLayerContext.current!, data.bonusArray, windowSize)
                }
            }
        })
        DrawBallAnimationFrameId.current = requestAnimationFrame(DrawBrickwallGame)
    }

    return (
        <div >
            {!changeDisplay ?
                <div className="canvas">
                    <canvas className="background-layer" ref={backgroundLayerRef} width={window.innerWidth * 0.8} height={window.innerHeight * 0.8}></canvas>
                    <canvas className="object-layer" ref={canvasRef} id="pongBoard" width={window.innerWidth * 0.8} height={window.innerHeight * 0.8}>
                        Your browser does not support the HTML canvas tag.
                    </canvas>
                </div>
                :
                <div className='unavailableGame'>
                    This game is unavailable
                </div>
            }
        </div>

    )
}