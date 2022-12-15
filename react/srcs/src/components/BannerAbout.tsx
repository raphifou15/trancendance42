import React from "react";
import Classement from "./Classement";
import Summary from "./Summary";
import LastResults from "./LastResults";
import "../styles/Achievement.css"
import "../styles/Profile.css"

interface Props{
    id: number;
}

const BannerAbout: React.FC<Props> = ({id}: Props): JSX.Element => {
    return (
        <section className="banner__about__new">
            <main>
                <div className="achievement_page_second_component">
                    <Classement />
                    <Summary id={Number(id)} />
                    <LastResults id={Number(id)}/>
                </div>
            </main>
        </section>
    )
}

export default BannerAbout;