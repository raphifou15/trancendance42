import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import Header from "../components/Header";
import axios, { AxiosResponse } from "axios";
import "../styles/Achievement.css"
import "../styles/Play.css"
import { PongGame } from "../components/PongGame";

interface Props {
    logoutOfSite: any;
}

export const SpectateView: React.FC<Props> = ({ logoutOfSite }: Props) => {

    const location = useParams()

    const [gameExists, setGameExists] = React.useState<boolean>(false)

    async function askBackendIfGameExists() {
        const backendPath: string = "http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/game/" + location.gameId
        const gameDoesExist: AxiosResponse<boolean, any> = await axios.get(backendPath)
        if (gameDoesExist.data) {
            setGameExists(true)
        }
    }
    useEffect(() => {
        askBackendIfGameExists()
    }, [])

    return (
        <div className="achievement_page">
            <Header logoutOfSite={logoutOfSite} conditionHeader={1} />
            {gameExists}
            {
                gameExists ?
                    <div>
                        <PongGame player={false} />
                    </div>
                    :
                    <div className="unavailableGame"> This game id is not used</div> //return an error maybe
            }
        </div>
    )
}
