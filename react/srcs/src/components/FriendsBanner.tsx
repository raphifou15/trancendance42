import React from "react";
import { FriendListInterface } from "../interfaces/FriendList";
import "../styles/AboutBanner.css"
import {Link} from "react-router-dom"

interface Props {
    friend: FriendListInterface;
}

const FriendList: React.FC<Props> = ({friend}: Props): JSX.Element => {
    const url = "/Profile/" + friend.id;
    return (
        <main>
            <section className="about__banner">
                <div className="about__banner__div1">
                    <img className="about__banner__div1_img" src={friend.image_url} alt="profile picture" />
                </div>
                <div className="about__banner__div2">
                    <p className="about__banner__div2__p1">Login: {friend.login}</p>
                    <p className="about__banner__div2__p">Victories: <b>{friend.victories}</b></p>
                    <p className="about__banner__div2__p">Defeats:   <b>{friend.defeats}</b></p>
                    <p className="about__banner__div2__p">Status:    <b>{friend.is_online ? "ONLINE" : "OFFLINE"}</b></p>
                    { friend.is_online ? 
                        <p className="about__banner__div2__p">Availability: <b>{friend.is_ongame ? "BUSY IN A GAME" : "YES"}</b></p>
                    :
                        <></>
                    }
                    <Link to={url} style={{fontSize: 14}}>See that user's profile</Link>
                </div>
            </section>
        </main>
    )
}

export default FriendList;
