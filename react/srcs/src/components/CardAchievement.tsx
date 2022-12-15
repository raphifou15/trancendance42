import React from "react";
import { ReactComponent as Star } from "../images/star.svg";
import yes from "../images/yes.svg";
import "../styles/CardAchievement.css";
import { CardAchievementInterface } from "../interfaces/CardAchievement"

interface Props{
    card: CardAchievementInterface;
}

const CardAchievement: React.FC<Props> = ({card}: Props) => {
    return (
        <section className={card.Success == true ? "card": "card2"}>
            <div className="card_div_1">
                <h2 className="card_div_1_h2">{card.firstTitle}</h2>
                <p className="card_div_1_p">{card.secondTitle}</p>
                {card.Success == true ? <div className="card_div_1_div">
                    <img src={yes} alt="element is achieved"/>
                    <p className="card_div_1_p2"> Achieved</p>
                </div> : ""}
            </div>
            <div className="card_div_2">
                <Star fill={card.Success == true ? "#A89C2F": "rgba(0, 0, 0, 0.95)"}/>
            </div>
        </section>
    )
}

export default CardAchievement;
