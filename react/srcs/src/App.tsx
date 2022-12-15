import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import { gameSocket, mySocket } from "./socket";
import Login from "./pages/Login";
import Friends from "./pages/Friends";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Profile from './pages/Profile';
import WaitingValidation from './pages/WaitingValidation';
import Cookies from "universal-cookie";
import axios from "axios";
import Chat from './components/Chat';
import { SpectateView } from './pages/SpectateView';
import "./App.css";
import { ChooseGameMode } from './pages/ChooseGameMode';
import { Match } from './pages/Match';
import { GameEvent } from './interfaces/Game';
import { GameList } from './pages/GameList';

interface gameInvitation {
    senderId: string
    senderName: string
    receiverId: string,
    gameId: string,
    invitation: boolean
}

export const authCookie: Cookies = new Cookies();

const App: React.FC = (): JSX.Element => {

    const navigate = useNavigate()

    const [chatOn, setChatOn] = useState<boolean>(false);
    const [name_lala, setName_lala] = useState<string>("");
    const [dataUser, setDataUser] = useState<any>();
    const [cookieValue, setCookieValue] = useState<any>({ token: "", id: -1 });
    const [goneThroughRegister, setGoneThroughRegister] = useState<boolean>(false);
    const [registerClicked, setRegisterClicked] = useState<boolean>(false);
    const [invitation, setInvitation] = useState<any>({ senderId: "", senderName: "", receiverId: "", invitation: false });
    let afterValidation = false;
    const [a2fEnabled, setA2fEnabled] = useState<boolean>(false);

    const logoutOfSite = () => {
        if (authCookie.get('42auth-cookie') !== undefined) {
            // console.log("CLICK ON LOGOUT");
            if (authCookie.get('42auth-cookie')) {
                fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/toggleLogout", {
                    keepalive: true,
                    mode: 'cors',
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id
                    },
                    body: JSON.stringify({
                        "id": String(authCookie.get('42auth-cookie')?.id),
                        "image_url": "",
                        "login": "",
                    }),
                })
                    .then(response => {
                        if (response.ok) {
                            if (mySocket.connected)
                                mySocket.disconnect();
                            if (gameSocket.connected)
                                gameSocket.disconnect();
                            authCookie.remove('42auth-cookie');
                            if (authCookie.get('42auth-cookie') === undefined)
                                navigate("/Login");
                            return;
                        } else {
                            throw new Error('Something went wrong...');
                        }
                    })
                    .catch(error => console.log(error));
            }
        }
    }

    useEffect(() => {
        if (authCookie.get('42auth-cookie') === undefined) {
            // console.log(axios.defaults.headers.common)
        } else {
            axios.defaults.headers.common['Authorization'] = authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id;
        }
    }, [goneThroughRegister])

    if (authCookie.get('42auth-cookie') !== undefined) {
        axios
            .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/askBackendIfUserEnabledA2f/" + authCookie.get('42auth-cookie').id)
            .then(response => {
                if (response.data) {
                    setA2fEnabled(response.data);
                }
            })
            .catch(error => console.log('Error asking for a2f enabled: ', error))
    }

    if (authCookie.get('42auth-cookie') !== undefined && cookieValue.id !== -1 && a2fEnabled) {
        afterValidation = true;
    }

    if (authCookie.get('42auth-cookie') === undefined && cookieValue.id !== -1) {
        fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/toggleLogout", {
            keepalive: true,
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',

            },
            body: JSON.stringify({
                "id": String(cookieValue.id),
                "image_url": "",
                "login": "",
            }),
        })
            .then(response => {
                if (response.ok) {
                    setGoneThroughRegister(true);
                    return;
                } else {
                    throw new Error('Something went wrong...');
                }
            })
            .catch(error => console.log(error));

        fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/toggleGoneThroughLoginFalse", {
            keepalive: true,
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                "id": String(cookieValue.id),
                "image_url": "",
                "login": "",
            }),
        })
            .then(response => {
                if (response.ok) {
                    return;
                } else {
                    throw new Error('Something went wrong...');
                }
            })
            .catch(error => console.log(error));

        cookieValue.id = -1;
    }

    // senderId:myUserId, senderName:notMyName, receiverId:notMyUserId
    const receiveInvitationToPlayPong = (arg: any) => {
        // console.log(arg);
        setInvitation((old: any) => {
            return ({ senderId: arg.senderId, senderName: arg.senderName, receiverId: arg.receiverId, gameId: arg.gameId, invitation: true })
        });
        setTimeout(() => {
            setInvitation((old: any) => {
                return ({ senderId: "", senderName: "", receiverId: "", gameId: "", invitation: false })
            });
        }, 60000);
    }

    const accepteInvitationToPlayPong = (e: React.MouseEvent<HTMLElement>) => {
        setInvitation((old: any) => {
            return ({ senderId: "", senderName: "", receiverId: "", gameId: "", invitation: false })
        });
        if (gameSocket.disconnected)
            gameSocket.connect()
        gameSocket.emit('gameInvitationAccepted', { player2id: invitation.receiverId, gameId: invitation.gameId, player2accepts: true })
        gameSocket.on(GameEvent.Start, (data: { playerposition: string, gameId: string }) => {
            const gameId: string = data.gameId
            navigate('/play/' + gameId)
        })
    }

    const refuseInvitationToPlayPong = (e: React.MouseEvent<HTMLElement>) => {
        setInvitation((old: any) => {
            return ({ senderId: "", senderName: "", receiverId: "", gameId: "", invitation: false })
        });
        if (gameSocket.disconnected)
            gameSocket.connect()
        gameSocket.emit('gameInvitationAccepted', { player2id: invitation.receiverId, gameId: invitation.gameId, player2accepts: false })
    }

    const handle_change_name = (name: string) => {
        setName_lala(name);
        setRegisterClicked(true)
    }

    const receiveInvitation = (invitation.invitation === false) ? <></> :
        <div className="App__Play__pong__receive__invitation">
            <p>{invitation.senderName}</p>
            <p>has invited you to play Pong</p>
            <div className="App__Play__pong__receive__invitation__div">
                <p className="App__Play__pong__receive__invitation__p" onClick={(e) => { accepteInvitationToPlayPong(e) }}>Accept</p>
                <p className="App__Play__pong__receive__invitation__p" onClick={(e) => { refuseInvitationToPlayPong(e) }}>Refuse</p>
            </div>
        </div>

    useEffect(() => {
        if (cookieValue.id !== -1 && (goneThroughRegister || a2fEnabled)) {
            // envoyer une requete vers le back pour confirmer l'identite de la persone
            mySocket.auth = { login: dataUser.login, idUser: dataUser.id, token: authCookie.get('42auth-cookie').token, cookieid: authCookie.get('42auth-cookie').id }; // faille de securiter a coriger.
            if (mySocket?.disconnected) {
                mySocket.emit('lala');
                mySocket?.connect();
                mySocket.connected = true;
                setChatOn((old) => (true));
            }
        }
    }, [dataUser])

    useEffect(() => {
        (async () => {
            let tempToken: any;
            let tempId: any;
            if (authCookie.get('42auth-cookie') !== undefined) {
                tempToken = authCookie.get('42auth-cookie').token;
                tempId = authCookie.get('42auth-cookie').id;
                try {
                    const response = await axios.get(`http://` + process.env.REACT_APP_HOST_ADDRESS + `:3000/chat/askInfoForPlayer/${tempId}`)
                    if (response.data === -1) {
                        console.error("user id is undefined in chat/AskInfoForPlayer")
                        return;
                    }
                    const infoData = response.data;
                    setDataUser((old: any) => infoData);
                    setCookieValue((old: any) => {
                        let temp: any;
                        temp = { ...old }
                        temp.token = tempToken;
                        temp.id = tempId;
                        return temp;
                    })
                    return infoData;
                } catch (error) {
                    console.error(error);
                }
            }
        })()
    }, [name_lala]);

    if (authCookie.get('42auth-cookie') !== undefined || mySocket.connected) {
        window.addEventListener("load", (ev) => {
            ev.preventDefault()
            if (authCookie.get('42auth-cookie')) {
                fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/toggleLogin", {
                    keepalive: true,
                    mode: 'cors',
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id

                    },
                    body: JSON.stringify({
                        "id": String(authCookie.get('42auth-cookie')?.id),
                        "image_url": "",
                        "login": "",
                    }),
                })
                    .then(response => {
                        if (response.ok) {
                            return;
                        } else {
                            throw new Error('Something went wrong...');
                        }
                    })
                    .catch(error => console.log(error));
            }
        });
    }

    if (authCookie.get('42auth-cookie') !== undefined && !goneThroughRegister) {
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            if (authCookie.get('42auth-cookie')) {
                fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/toggleLogout", {
                    keepalive: true,
                    mode: 'cors',
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id

                    },
                    body: JSON.stringify({
                        "id": String(authCookie.get('42auth-cookie')?.id),
                        "image_url": "",
                        "login": "",
                    }),
                })
                    .then(response => {
                        if (response.ok) {
                            return;
                        } else {
                            throw new Error('Something went wrong...');
                        }
                    })
                    .catch(error => console.log(error));
            }
        });
    }

    useEffect(() => {
        mySocket?.on("receiveInvitationToPlayPong", receiveInvitationToPlayPong) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("receiveInvitationToPlayPong", receiveInvitationToPlayPong); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [receiveInvitationToPlayPong])


    const errorSocket = () => {
        if (mySocket.connected) {
            mySocket?.disconnect();
            mySocket.connected = false;
            setChatOn((old) => false);
        }
    }

    useEffect(() => {
        mySocket?.on("errorSocket", errorSocket) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("errorSocket", errorSocket); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [errorSocket])

    useEffect(() => {
        if (authCookie.get('42auth-cookie') !== undefined) {
            axios
                .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/askBackendIfUserWentThroughRegister/" + authCookie.get('42auth-cookie').id, {
                    headers: { Authorization: authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id }
                })
                .then(response => {
                    if (response.data) {
                        setGoneThroughRegister(true);
                        setName_lala((old: string) => "lala");
                    }
                    // else {
                    //     console.log('axios failed');
                    // }
                })
                .catch(error => console.log('In App.tsx, asking for goneThroughRegister', error))
        }
    }, [registerClicked])

    if (cookieValue.id !== -1 && (goneThroughRegister || afterValidation)) // there is a cookie, i.e. the user is known
    {
        return (
            <>
                <Routes>
                    <Route path="/" element={<Home logoutOfSite={logoutOfSite} />} />
                    <Route path="/Home" element={<Home logoutOfSite={logoutOfSite} />} />
                    <Route path="/Play" element={<ChooseGameMode logoutOfSite={logoutOfSite} />} />
                    <Route path="/Play/:gameId" element={<Match logoutOfSite={logoutOfSite} />} />
                    <Route path="/Profile/:id" element={<Profile logoutOfSite={logoutOfSite} />} />
                    <Route path="/WaitingValidation" element={<WaitingValidation setName_lala={setName_lala} />} />
                    <Route path="/Friends" element={<Friends logoutOfSite={logoutOfSite} />} />
                    <Route path="/spectate" element={<GameList logoutOfSite={logoutOfSite} />} />
                    <Route path='/spectate/:gameId' element={<SpectateView logoutOfSite={logoutOfSite} />} />
                    <Route path="*" element={<Home logoutOfSite={logoutOfSite} />} />
                </Routes>
                {(mySocket.connected === true && chatOn === true) ? <Chat name_lala={"raph"} /> : <></>}
                {receiveInvitation}
            </>
        )
    }
    else // there is no cookie
    {
        return (
            <>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/WaitingValidation" element={<WaitingValidation setName_lala={setName_lala} />} />
                    <Route path="/Register" element={<Register handle_change_name={handle_change_name} />} />
                    <Route path="*" element={<Login />} />
                </Routes>
            </>
        )
    }
}

export default App;

// ici App me sert a rediriger mes routes vers les differentes pages;

// si l'utilisateur n'est pas connecte l'utilisateur utilisera ce chemin
// ou sinon il ira sur la page home.
