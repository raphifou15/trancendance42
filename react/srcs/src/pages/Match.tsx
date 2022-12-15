import React from "react";
import '../styles/Play.css'
import Header from "../components/Header";
import { PongGame } from "../components/PongGame";

interface Props {
    logoutOfSite: any;
}

export type tmp_props = {
    player: boolean
}

export const Match: React.FC<Props> = ({ logoutOfSite }: Props) => {
    return (
        <div className="backgroundColor">
            <Header logoutOfSite={logoutOfSite} conditionHeader={1} />

            <PongGame player={true} />
        </div>
    )
}