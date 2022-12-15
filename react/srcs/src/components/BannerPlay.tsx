import React from "react";
import image1 from "../images/image_banner_one.png"
import image2 from "../images/svg_banner_one.svg"
import {Link} from "react-router-dom"

const BannerPlay: React.FC = (): JSX.Element => {
    return (
        <section className="banner__play">
            <div className="text__banner__play">
                <h1 className="text__banner__play__h1">PLAY TABLE TENNIS</h1>
                <div className="text__banner__play__div">
                    <img src={image2} alt="image qui affiche une barre verticale" />
                    <h2>DISCOVER THE FUN PONG</h2>
                </div>
                <p className="text__banner__play__p">Play with your friends to one of the earliest arcade video games</p>
                <Link className="banner__play__link" to="/Play">Play</Link>
            </div>
            <img src={image1} alt="image qui affiche le jeu" />
        </section>
    )
}

export default BannerPlay

// c'est le premier bandeau  de la page home il permettra aussi d'acceder a la page play via le link.
