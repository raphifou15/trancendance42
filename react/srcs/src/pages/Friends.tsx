import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import FriendsBanner from "../components/FriendsBanner";
import { FriendListInterface } from "../interfaces/FriendList";
import axios from "axios";
import "../styles/Achievement.css"
import "../styles/Header.css"
import { useNavigate } from "react-router-dom";
import { authCookie } from "../App";

interface Props {
    logoutOfSite:any;
}

const Friends: React.FC<Props> = ({logoutOfSite}:Props): JSX.Element => {

    useEffect(() => {
        if (authCookie.get('42auth-cookie') === undefined) {
            // console.log(axios.defaults.headers.common)
        } else {
            axios.defaults.headers.common['Authorization'] = authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id;
        }
    }, [])

    const navigate = useNavigate();

    let id = -1;
    if (authCookie.get('42auth-cookie') !== undefined) {
        id = authCookie.get('42auth-cookie').id;
    }

    const [friends, setFriends] = useState<FriendListInterface[]>();
    const [users, setUsers] = useState<FriendListInterface[]>();
    const ids: number[] = [];
    if (id !== -1)
        ids.push(id);

    function isInArray(id: number) {
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === id) {
                return true;
            }
        }
        return false;
    }

    useEffect(() => {
        if (authCookie.get('42auth-cookie') === undefined)
            navigate('/Login')
        if (id !== -1) {
            axios
                .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_friends_by_id/" + id)
                .then((response) => {
                    const friends_array: FriendListInterface[] = [];
                    for (let i = 0; i < response.data.length; i++) {
                        let new_friend: FriendListInterface = {
                            id: response.data[i].id,
                            image_url: response.data[i].image_url,
                            login: response.data[i].login,
                            email: response.data[i].email,
                            victories: response.data[i].victories,
                            defeats: response.data[i].defeats,
                            is_online: response.data[i].is_online,
                            is_ongame: response.data[i].is_ongame,
                        }
                        ids.push(response.data[i].id);
                        friends_array.push(new_friend);
                    }
                    setFriends(friends_array);
                })
                .catch((reason: any) => { console.error("Could not get friends") });


            window.setTimeout(function() {
                // console.log("ids", ids);
                axios
                    .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_all_users/")
                    .then((response) => {
                        const users_array: FriendListInterface[] = [];
                        for (let i = 0; i < response.data.length; i++) {
                            let new_user: FriendListInterface = {
                                id: response.data[i].id,
                                image_url: response.data[i].image_url,
                                login: response.data[i].login,
                                email: response.data[i].email,
                                victories: response.data[i].victories,
                                defeats: response.data[i].defeats,
                                is_online: response.data[i].is_online,
                                is_ongame: response.data[i].is_ongame,
                            }
                            if (response.data[i].id !== id && !isInArray(response.data[i].id)) {
                                users_array.push(new_user);
                            }
                        }
                        setUsers(users_array);
                    })
                    .catch((reason: any) => { console.error("Could not get users") });
            }, 50);

        }
    // });
    }, []);

    const allFriends = friends?.map((elem, index) => <FriendsBanner key={index} friend={elem} />)
    const allUsers = users?.map((elem, index) => <FriendsBanner key={index} friend={elem} />)

    if (friends?.length === 0 && users?.length === 0) {
        return (
            
            <main>
                <div className="achievement_page">
                    <Header logoutOfSite={logoutOfSite} conditionHeader={3} />
                    <h1 className="achievement_page_h1">FRIENDS</h1>
                    <h1 className="achievement_page_h2">You have no friends for now.</h1>
                    <p className="nofriend">Don't worry, we don't either!</p>
                    <p className="nofriend">Maybe you can find some down here...</p>
                    <br />
                    <h1 className="achievement_page_h1">OTHER USERS</h1>
                    <h1 className="achievement_page_h2">Looks like there is no other users for now.</h1>
                    <p className="nofriend">You are our very first player or all users are already your friends, congrats either way!</p>
                    <p className="nofriend">Consider suggesting your friends IRL to join us...</p>
                </div>
            </main>
        )
    } else if (friends?.length === 0 && users?.length !== 0) {
        return (
            <main>
                <div className="achievement_page">
                    <Header logoutOfSite={logoutOfSite} conditionHeader={3} />
                    <h1 className="achievement_page_h1">FRIENDS</h1>
                    <h1 className="achievement_page_h2">You have no friends for now.</h1>
                    <p className="nofriend">Don't worry, we don't either!</p>
                    <p className="nofriend">Maybe you can find some down here...</p>
                    <br />
                    <h1 className="achievement_page_h1">OTHER USERS</h1>
                    {allUsers}
                </div>
            </main>
        )
    } else if (friends?.length !== 0 && users?.length === 0) {
        return (
            <main>
                <div className="achievement_page">
                    <Header logoutOfSite={logoutOfSite} conditionHeader={3} />
                    <h1 className="achievement_page_h1">FRIENDS</h1>
                    {allFriends}
                    <h1 className="achievement_page_h1">OTHER USERS</h1>
                    <h1 className="achievement_page_h2">Looks like there is no other users for now.</h1>
                    <p className="nofriend">You are our very first player or all users are already your friends, congrats either way!</p>
                    <p className="nofriend">Consider suggesting your friends IRL to join us...</p>
                </div>
            </main>
        )
    } else {
        return (
            <main>
                <div className="achievement_page">
                    <Header logoutOfSite={logoutOfSite} conditionHeader={3} />
                    <h1 className="achievement_page_h1">FRIENDS</h1>
                    {allFriends}
                    <h1 className="achievement_page_h1">OTHER USERS</h1>
                    {allUsers}
                </div>
            </main>
        )
    }
}

export default Friends;
