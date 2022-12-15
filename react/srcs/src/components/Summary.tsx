import React, { useEffect, useState } from "react";
import axios from "axios";
import { SummaryInterface } from "../interfaces/Summary";
import win from "../images/win.svg"
import loose from "../images/loose.svg"

interface Props {
    id: number;
}

const Summary: React.FC<Props> = ({ id }: Props): JSX.Element => {

    const [summary, setSummary] = useState<SummaryInterface>();

    useEffect(() => {
        axios
            .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user_by_id/" + id)
            .then((response) => {
                setSummary({ victories: Number(response.data.victories), defeats: Number(response.data.defeats) });
            })
            .catch(() => {
                console.log('SUMMARY error in get request for back')
            })
    }, []);

    return (
        <section className="lastResults">
            <h2>Summary</h2>
            <div>
                <br></br>
                <br></br>
                <h3>Victories</h3>
                <img src={win} alt="win" />
                <br></br>
                <p>{String(summary?.victories)}</p>
                <br></br>
                <h3>Defeats</h3>
                <img src={loose} alt="lose" />
                <br></br>
                <p>{String(summary?.defeats)}</p>
                <br></br>
                <h3>Total games played</h3>
                <br></br>
                <p>{String(Number(summary?.victories) + Number(summary?.defeats))}</p>
            </div>
        </section>
    )
}

export default Summary;