import React, { useEffect, useState } from "react";
import axios from 'axios';
import { authCookie } from "../App";
import { mySocket } from "../socket";

interface Props {
    handleChangeLogin: any;
}

const ChangeLogin: React.FC<Props> = ({ handleChangeLogin }: Props): any => {

    const [login, setLogin] = useState<string>();
    const [errorTaken, setErrorTaken] = useState<boolean>(false);
    const [errorEmpty, setErrorEmpty] = useState<boolean>(false);
    const [errorTooLong, setErrorTooLong] = useState<boolean>(false);

    let id = -1;
    if (authCookie.get('42auth-cookie') !== undefined) {
        id = authCookie.get('42auth-cookie').id;
    }

    useEffect(() => {
        axios
            .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user_by_id/" + id)
            .then((response) => {
                setLogin(response.data.login);
            })
            .catch(() => {
                console.log('CHANGE LOGIN error in get request for back')
            })
    }, []);

    const handleInfo = (e: React.SyntheticEvent): void => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            login: { value: string };
        };
        let login = "";
        if (target.login.value)
            login = target.login.value;

        if (login === "") {
            setErrorEmpty(true);
            return ;
            // setErrorTaken(false);
            // throw new Error('The login cannot be empty');
        }
        if (login.length > 8) {
            setErrorTooLong(true);
            return ;
        }

        fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/changeLogin/", {
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
                "login": login,
            }),
        })
        .then(response => response.json())
        .then(jsonResponse => {
            if (jsonResponse.id !== id) {
                setErrorTaken(true);
                // setErrorEmpty(false);
                throw new Error('This login is already taken');
            }
            handleChangeLogin(login);
            mySocket.emit("changeLoginName", login);
            axios
                .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user_by_id/" + id)
                .then((response) => {
                    setLogin(login);
                })
                .catch((reason: any) => { console.error("Could not get user by id") });
            // setErrorTaken(false);
            target.login.value = "";
            // console.log('Success: ', jsonResponse)
            return;
        })
        .catch(errorTaken => console.log('Error: ', errorTaken));
    }

    const clearErrors = (e: React.SyntheticEvent): void => {
        setErrorTaken(false);
        setErrorEmpty(false);
        setErrorTooLong(false);
    }

    return (
        <div>
            <form onSubmit={(e: React.SyntheticEvent) => { handleInfo(e); }}>
                <b className="error" style={{color: "red"}}>{errorTaken ? "This login is already taken.\n" : ""}</b>
                <b className="error" style={{color: "red"}}>{errorEmpty ? "The login cannot have a length of 0.\n" : ""}</b>
                <b className="error" style={{color: "red"}}>{errorTooLong ? "The login cannot exceed 8 characters.\n" : ""}</b>
                <br></br>
                <input
                    className="upload-btn"
                    type="text"
                    name="login"
                    placeholder="new login"
                    onChange={clearErrors}
                />
                <button className="upload-btn" type="submit">
                    Submit this new login
                </button>
            </form>
        </div>
    )
}

export default ChangeLogin
