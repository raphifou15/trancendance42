
import { Ball, bonus, bonusEffect, gameInformation, Point, racket, score } from "../interfaces/Game"
import { background, ballImage, bonusBall, bonusSize, bonusSpeed, canvasWidth, malusSize } from "./PongGame"


export function drawScore(context: CanvasRenderingContext2D, score: score, canvas: { width: number, height: number }) {
    context.font = '48px poppins';
    context.fillStyle = "white";
    context.fillText(score.player1.toString(), canvas.width / 4, canvas.height * 0.1);
    context.fillText(score.player2.toString(), canvas.width * (3 / 4), canvas.height * 0.1);
    // context.strokeText(score.player1.toString(), canvas.width * 0.2, canvas.height * 0.1)
    // context.strokeText(score.player2.toString(), canvas.width * 0.8, canvas.height * 0.1)
}
export function drawBoard(context: CanvasRenderingContext2D,
    canvas: { width: number, height: number },
) {
    // background.onload = function() {

        context.drawImage(background, 0, 0, canvas.width, canvas.height)
    // }

    // draw a serie of rectangles for midline limit
    let middleLineCount = 0
    let cellWidth = canvas.width * 0.005
    let cellHeight = canvas.height * 0.04

    context.fillStyle = 'white'


    while (middleLineCount < canvas.height) {
        context.rect((canvas.width - (cellWidth / 2)) / 2, middleLineCount, cellWidth, cellHeight)
        context.fill()
        middleLineCount += 2 * cellHeight
    }
}

export function drawLogins(context: CanvasRenderingContext2D,
    canvas: { width: number, height: number }, gameInfo: gameInformation) {

    context.fillStyle = 'white'
    if (canvas.width <= 500)
        context!.font = "20px poppins"
    else
        context!.font = "38px poppins"
    context.textAlign = 'center';
    context.fillText(gameInfo.player1, canvas.width / 4, canvas.height * 0.9)
    context.fillText(gameInfo.player2, canvas.width * (3 / 4), canvas.height * 0.9)
}

export function displayGameEndMessage(winner: string, context: CanvasRenderingContext2D) {
    const endMessage = winner + " won the game !!!"
    if (context!.canvas.clientWidth <= 500)
        context!.font = "20px poppins"
    else
        context!.font = "45px poppins"
    context!.fillStyle = "rgb(124,187,193)"
    context!.strokeStyle = "black"
    context!.lineWidth = 3;
    let text = context!.measureText(endMessage)
    if (context) {
        // let textLimit = context!.canvas.clientWidth - text.width
        context!.strokeText(endMessage, context!.canvas.clientWidth / 2, context!.canvas.clientHeight / 2, text.width)
        context!.fillText(endMessage, context!.canvas.clientWidth / 2, context!.canvas.clientHeight / 2, text.width)
        // context!.fillText(endMessage, textLimit / 2, context!.canvas.clientHeight / 2, text.width)
    }
}

export function updateAndDrawBall(context: CanvasRenderingContext2D, ball: Ball, canvas: { width: number, height: number }) {
    ball.pos.x *= canvas.width
    ball.pos.y *= canvas.width

    context.drawImage(ballImage,
        ball.pos.x - (ball.radius * canvas.width),
        ball.pos.y - (ball.radius * canvas.width))
}


export function drawBonus(context: CanvasRenderingContext2D, bonusArray: (bonus | undefined)[], canvas: { width: number, height: number }) {
    if (bonusArray !== null) {
        bonusArray.forEach((value: bonus | undefined) => {
            if (value !== undefined && value !== null) {
                if (value.effect === bonusEffect.ballSize)
                    context.drawImage(bonusBall,
                        (value.pos.x - value.side / 2) * canvas.width,
                        (value.pos.y - value.side / 2) * canvas.height,
                        value.side * canvas.width,
                        value.side * canvas.height)
                else if (value.effect === bonusEffect.racketSize)
                    context.drawImage(bonusSize,
                        (value.pos.x - value.side / 2) * canvas.width,
                        (value.pos.y - value.side / 2) * canvas.height,
                        value.side * canvas.width,
                        value.side * canvas.height)
                else if (value.effect === bonusEffect.speed)
                    context.drawImage(bonusSpeed,
                        (value.pos.x - value.side / 2) * canvas.width,
                        (value.pos.y - value.side / 2) * canvas.height,
                        value.side * canvas.width,
                        value.side * canvas.height)
                else if (value.effect === bonusEffect.enemyPaddleSize)
                    context.drawImage(malusSize,
                        (value.pos.x - value.side / 2) * canvas.width,
                        (value.pos.y - value.side / 2) * canvas.height,
                        value.side * canvas.width,
                        value.side * canvas.height)

            }
        })
    }
}

// https://dev.to/ptifur/animation-with-canvas-and-requestanimationframe-in-react-5ccj
// https://blog.jakuba.net/request-animation-frame-and-use-effect-vs-use-layout-effect/


export class FrontBall {
    ball: Ball
    image: HTMLImageElement
    constructor(image: HTMLImageElement) {
        this.ball = {
            pos: {
                x: 0.5, y: 0.5
            },
            dir: { x: 0, y: 0 },
            radius: 0.1
        }
        this.image = image
    }

    update(ball: Ball) {
        this.ball = ball
        // console.log(ball)
        // this.ball.pos.x = this.ball.pos.x * 1.77
    }
    draw(context: CanvasRenderingContext2D, canvas: { width: number, height: number }) {
        // context.fillStyle = 'cyan'
        // context.fillRect(((this.ball.pos.x - this.ball.radius)) * canvas.width,
        //     (this.ball.pos.y - this.ball.radius) * canvas.height,
        //     this.ball.radius * 2 * canvas.height,
        //     this.ball.radius * 2 * canvas.height,
        // )
        context.drawImage(ballImage,
            ((this.ball.pos.x - this.ball.radius)) * canvas.width,
            (this.ball.pos.y - this.ball.radius) * canvas.height,
            this.ball.radius * canvas.width * 2,
            this.ball.radius * canvas.height * 2)
    }
}

export class Paddle {
    pos: Point
    width: number
    height: number
    image: HTMLImageElement

    constructor(posX: number, image: HTMLImageElement) {
        this.pos = { x: posX, y: 0.5 }
        this.width = 0.05
        this.height = 0.2
        this.image = image
    }

    update(racket: racket) {
        this.pos = { x: racket.pos.x, y: racket.pos.y }
        this.width = racket.width
        this.height = racket.height
    }
    draw(ctx: CanvasRenderingContext2D, canvas: { width: number, height: number }) {
        ctx.drawImage(this.image,
            (this.pos.x - this.width / 2) * canvas.width,
            (this.pos.y - this.height / 2) * canvas.height,
            this.width * canvas.width,
            this.height * canvas.height)
        // ctx.rect((this.pos.x - this.width / 2) * canvas.width,
        //     (this.pos.y - this.height / 2) * canvas.height,
        //     this.width * canvas.width,
        //     this.height * canvas.height)
    }
}
