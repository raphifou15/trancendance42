import axios, { AxiosResponse } from "axios";
import Header from "../components/Header";

import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

import "../styles/Achievement.css"
import "../styles/Spectate.css"
import { spectateMessage } from "../interfaces/Game";
import { authCookie } from "../App";


import blue from "../images/login_bar_bleu.png"
import green from "../images/login_bar_vert.png"
import ball from "../images/login_ball.png"

export interface spectator {
    id: number;
    socket: Socket;
}

interface Props {
    logoutOfSite: any;
}

export const GameList: React.FC<Props> = ({ logoutOfSite }): JSX.Element => {
    async function askForCurrentGames() {
        let text: AxiosResponse<spectateMessage[], any> = await axios.get<spectateMessage[]>("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/game/list")
        if (text.data) {
            if (!displayList)
                setDisplayList(true)
            formattedGameList.current = displayGames(text.data)
        }
    }

    function displayGames(data: spectateMessage[]): any {
        let element = data.map((value) => {
            //add player names
            return (
                <ul key={value.gameId}>
                    <Link to={value.gameId}
                        style={{
                            color: 'white',
                            textShadow: 'black 1px 1px 2px',
                        }}>{value.matchmakingTitle}</Link>
                </ul>
            )
        })
        return (element)
    }



    const navigate = useNavigate();

    const [displayList, setDisplayList] = React.useState<boolean>(false)

    const formattedGameList = React.useRef<JSX.Element[]>([])
    askForCurrentGames()

    useEffect(() => {
        if (authCookie.get('42auth-cookie') === undefined)
            navigate('/Login')
        else {
            axios.defaults.headers.common['Authorization'] = authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id;
        }
        // })
    }, [])

    return (
        // <div className="achievement_page">
        <div className="font__game">
            <img className="font__game__green" src={green} alt="barre verte" />
            <img className="font__game__blue" src={blue} alt="barre bleu" />
            <img className="font__game__ball" src={ball} alt="balle" />

            <Header logoutOfSite={logoutOfSite} conditionHeader={1} />

            <div className="page_overlay">
                <h1 className="achievement_page_h1" style={{ textShadow: "1px 1px 2px black" }}>
                    CURRENT GAMES
                </h1>
                {formattedGameList.current}
                <br></br>
                <button className="friend-btn" onClick={() => {
                    setDisplayList(false)
                    askForCurrentGames()
                }}> Refresh </button>
            </div >
        </div>
    )
}

