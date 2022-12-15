import React, { useEffect, useState } from "react";
import axios from 'axios';
import { authCookie } from "../App";

interface Props {
    handleA2fChange: any;
}

const ChangeA2f: React.FC<Props> = ({ handleA2fChange }: Props): any => {

    const [a2f, setA2f] = useState<boolean>();

    let id = -1;
    if (authCookie.get('42auth-cookie') !== undefined) {
        id = authCookie.get('42auth-cookie').id;
    }

    useEffect(() => {
        axios
            .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user_by_id/" + id)
            .then((response) => {
                setA2f(response.data.auth2f_enabled);
            })
            .catch(() => {
                console.log('CHANGE A2F error in get request for back')
            })
    }, []);

    const toggle = async () => {
        fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/toggleA2f/", {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Authorization':authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id 
            },
            body: JSON.stringify({
                "id": String(id),
                "image_url": "",
                "login": "",
            }),
        })
        .then(response => response.json())
        .then(jsonResponse => {
            handleA2fChange();
            axios
                .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user_by_id/" + id)
                .then((response) => {
                    setA2f(response.data.auth2f_enabled);
                })
                .catch((reason: any) => { console.error("Could not get user by id") });
            // console.log('Success: ', jsonResponse)
            return;
        })
        .catch(error => console.log('Error: ', error));
    }

    return (
        <div>
            <p>Two factor authentication is currently: {a2f === true ? "ON" : "OFF"} </p>
            <label className="upload-btn">
                Toggle two factor authentication
                <input
                    placeholder="toggle a2f"
                    type="button"
                    hidden
                    onClick={e => toggle()} />
            </label>
        </div>
    )
}

export default ChangeA2f
