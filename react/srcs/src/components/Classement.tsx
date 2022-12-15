import React, { useEffect, useState } from "react";
import axios from "axios";
import miniT from "../images/mini_trophee.svg";
import TableBodyTr from "./TableBodyTr";
import { ClassementInterface } from "../interfaces/Classement"
import "../styles/Classement.css";

const Classement: React.FC = (): JSX.Element => {

	const [players, setPlayers] = useState<ClassementInterface[]>();

    useEffect(() => {
		axios
			.get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/user/get_ten_best_players")
			.then((response) => {
                let res_array = response.data;
                let best_players: ClassementInterface[] = [];
                let place;
                let login;
                let victories;
                let defeats;
                for (let i = 0; i < res_array.length && i < 10; i++) {
                    if (i > 0 && victories === res_array[i].victories && defeats === res_array[i].defeats) {
                        login = res_array[i].login;
                    } else {
                        place = i + 1;
                        login = res_array[i].login;
                        victories = res_array[i].victories;
                        defeats = res_array[i].defeats;
                    }
                    best_players.push({place: Number(place), login: login, victories: victories, defeats: defeats});
                }
				setPlayers(best_players);
			})
            .catch((reason: any) => { console.error("Could not get ten best players") });
	}, []);

    const allClassement = players?.map((elem: any, index: any) => {
        return <TableBodyTr key={index} classement={elem} />
    })

    return (
        <section className="classement">
            <div className="classement__div">
                <h2 className="classement__div__h2">Ranking</h2>
                <img src={miniT} alt="image d'un petit tropher"/>
            </div>
            <table className="classement__table">
                <thead className="classement__thead">
                    <tr className="classement_tr">
                        <th colSpan={0} rowSpan={0} className="classement_thead_td classement_td_first">Place</th>
                        <th colSpan={0} rowSpan={0} className="classement_thead_td classement_td_first">Player</th>
                        <th colSpan={0} rowSpan={0} className="classement_thead_td classement_td_first">Victories</th>
                        <th colSpan={0} rowSpan={0} className="classement_thead_td classement_td_first">Defeats</th>
                    </tr>
                </thead>
                <tbody className="classement__body">
                   {allClassement}
                </tbody>
            </table>
        </section>
    )
}

export default Classement;
