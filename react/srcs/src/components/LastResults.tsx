import React, { useEffect, useState} from "react";
import axios from "axios";
import { LastResultInterface } from "../interfaces/LastResults";
import win from "../images/win.svg"
import loose from "../images/loose.svg"
import "../styles/LastResults.css"

interface Props{
    id: number;
}

const LastResults: React.FC<Props> = ({id}: Props): JSX.Element => {

    const [games, setGames] = useState<LastResultInterface[]>();

    useEffect(() => {
		axios
			.get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/user/get_ten_last_games/" + id)
			.then((response) => {
                let res_array = response.data;
                let last_games: LastResultInterface[] = [];
                for (let i:number = 0; i < res_array.length && i < 10; i++)
                    last_games.push({name1:res_array[i].player1.login, name2:res_array[i].player2.login, isWin: res_array[i].winnerId === Number(id) ? true : false});
				setGames(last_games);
			})
            .catch((reason: any) => { console.error("Could not get last results") });
	}, []);

    const results = games?.map((elem: any, index: any) => {
        return (
            <div className="all_elem" key={index}>
                <p>{elem.name1} vs {elem.name2}</p>
                <img src={elem.isWin ? win : loose} alt="winner or loser"/>
            </div>
        )
    })

    return (
        <section className="lastResults">
            <h2>Last games</h2>
            {results}
        </section>
    )
}

export default LastResults;