import React from "react";
import Header from "../components/Header";
import AboutBanner from "../components/AboutBanner";
import { AboutBannerInterface } from "../interfaces/AboutBanner";
import op from "../images/op.png"
import pc from "../images/pc.png"
import cb from "../images/cb.png"
import rk from "../images/rk.png"
import { authCookie } from "../App";

interface Props {
    name_lala: string;
    setName_lala: any;
}


const About: React.FC<Props> = ({ name_lala, setName_lala }: Props): JSX.Element => {

    if (authCookie.get('42auth-cookie') === undefined) {
        window.location.href = "http://" + process.env.REACT_APP_HOST_ADDRESS + ":9999/Login";
    }

    const profileOlympe: AboutBannerInterface = {
        profile: op,
        name1: "Olympe Pacaud",
        link1: "/Home",
        link2: "/Home",
        text: "Former journalist, Olympe started to learn programming online. She decided to make a living out of this new-found passion and got into 42 school in Paris. She especially likes handling data.",
        right: false
    }
    const profilePierre: AboutBannerInterface = {
        profile: pc,
        name1: "Pierre Charton",
        link1: "/Home",
        link2: "/Home",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus enim egestas, ac scelerisque ante pulvinar.",
        right: true
    }
    const profileChristie: AboutBannerInterface = {
        profile: cb,
        name1: "Christie Boutier",
        link1: "/Home",
        link2: "/Home",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus enim egestas, ac scelerisque ante pulvinar.",
        right: false
    }
    const profileRaphael: AboutBannerInterface = {
        profile: rk,
        name1: "Raphael Khelif",
        link1: "/Home",
        link2: "/Home",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus enim egestas, ac scelerisque ante pulvinar.",
        right: true
    }

    const infoTeam = (): AboutBannerInterface[] => {
        const temp: AboutBannerInterface[] = [];
        for (let i: number = 0; i < 4; i++) {
            if (i == 0)
                temp.push(profileOlympe);
            else if (i == 1)
                temp.push(profilePierre);
            else if (i == 2)
                temp.push(profileChristie);
            else if (i == 3)
                temp.push(profileRaphael);
        }
        return temp;
    }

    const allTeam = infoTeam();
    const allTeamElem = allTeam.map((elem, index) => <AboutBanner key={index} pr={elem} />)

    return (
        <div>
            {/* <Header conditionHeader={4} /> */}
            {allTeamElem}
        </div>
    )
}

export default About;

//dans cette pages les informations sont recuperer dans des objets puis transformer en composant pour etre afficher.