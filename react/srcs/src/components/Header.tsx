import React from "react";
import { Link } from "react-router-dom"
import { authCookie } from "../App";

interface Props {
    conditionHeader: number;
    logoutOfSite: any;
}

const Header: React.FC<Props> = ({ conditionHeader, logoutOfSite }: Props): JSX.Element => {

    let id = "-1";
    if (authCookie.get('42auth-cookie') !== undefined) {
        id = String(authCookie.get('42auth-cookie').id);
    }

    return (
        <header className={conditionHeader === 1 ? "header" : "header2"}>
            <nav className="header__navbar">
                <Link className={conditionHeader === 4 ? "header_link2" : "header_link"} to="/Home">Home</Link>
                <Link className={conditionHeader === 4 ? "header_link2" : "header_link"} to="/Play">Play</Link>
                <Link className={conditionHeader === 4 ? "header_link2" : "header_link"} to="/Spectate">Spectate</Link>
                <Link className={conditionHeader === 4 ? "header_link2" : "header_link"} to={`/Friends`}>Friends</Link>
                <Link className={conditionHeader === 4 ? "header_link2" : "header_link"} to={`/Profile/${id}`}>Profile</Link>
                <div className="header__logout">
                    <h2 onClick={logoutOfSite=logoutOfSite}>Logout</h2>
                </div>
            </nav>
        </header>
    )
}

export default Header;

// Le header contient la page de navigation 