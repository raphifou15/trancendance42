import React from "react";
import font from "../images/banner2.svg"

const BannerAchievement: React.FC = (): JSX.Element => {
    return (
        <section className="banner__achievement">
            <img className="banner__achievement__img" src={font} alt="image de font" />
            <div className="banner__achievement__div">
                <h2 className="banner__achievement__div__h2">Improve your ability to win</h2>
                <h2 className="banner__achievement__div__h2">Get all the achievements</h2>
                <h2 className="banner__achievement__div__h2">Show everyone who you really are</h2>
            </div>
        </section>
    )
}

export default BannerAchievement;

// c'est le deuxieme bandeau  de la page home il permettra aussi d'acceder a la page achievement via le link.