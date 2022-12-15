import React from "react";
import Header from "../components/Header";
import "../styles/Achievement.css"
import "../styles/Header.css"

interface Props {
    name_lala: string;
    setName_lala: any;
}

const Achievement: React.FC<Props> = ({ name_lala, setName_lala }: Props): JSX.Element => {

    return (
        <div className="achievement_page">
            {/* <Header conditionHeader={3} /> */}
            <main>
                <h1 className="achievement_page_h1">Achievements</h1>
                <div className="div_arrayAchievements">
                    {/* {arrayAchievements} */}
                </div>
                <div className="achievement_page_second_component">
                    {/* <Classement /> */}
                    {/* <Summary id={Number(id)} /> */}
                    {/* <LastResults id={Number(id)}/> */}
                </div>
            </main>
        </div>
    )
}

export default Achievement;
