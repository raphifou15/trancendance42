import React from "react";
import {Link} from "react-router-dom"
import { AboutBannerInterface } from "../interfaces/AboutBanner";
import link1 from "../images/linkedin.svg"
import link2 from "../images/git.svg"
import "../styles/AboutBanner.css"

interface Props{
    pr: AboutBannerInterface;
}

const AboutBanner: React.FC<Props> = ({pr}: Props): JSX.Element => {
    return (
        <section className="about__banner">
            <div className="about__banner__div1">
                <img className="about__banner__div1_img" src={pr.profile} alt="image de profil du developpeur" />
            </div>
            <div className="about__banner__div2">
                <p className="about__banner__div2__p1">{pr.name1}</p>
                <p className="about__banner__div2__p">{pr.text}</p>
                <div className="about__banner__div2__div">
                    <Link className="about__banner__div2__div_link" to={{ pathname: pr.link1 }} target="_blank"><img src={link1} alt="" /></Link>
                    <Link to={{ pathname: pr.link2 }} target="_blank"><img src={link2} alt="" /></Link>
                </div>
            </div>
        </section>
    )
}

export default AboutBanner;

// c'est le troisieme bandeau  de la page home il permettra aussi d'acceder a la page about via le link.