import React, { useEffect, useState } from "react";
import axios from 'axios';
import { authCookie } from "../App";

interface Props {
    friendsId: number;
}

const AddFriend: React.FC<Props> = ({ friendsId }: Props): any => {

    const [error, setError] = useState<boolean>(false);
    const [isAlreadyMyFriend, setIsAlreadyMyFriend] = useState<boolean>(false);

    function isInArray(id_to_search: number) {
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === id_to_search) {
                return true;
            }
        }
        return false;
    }

    let ids: number[] = [];
    let my_id = -1;
    if (authCookie.get('42auth-cookie') !== undefined) {
        my_id = authCookie.get('42auth-cookie').id;
    }

    useEffect(() => {
        ids.push(my_id);
        axios
            .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_friends_by_id/" + my_id)
            .then((response) => {
                for (let i = 0; i < response.data.length; i++) {
                    ids.push(response.data[i].id);
                }
                if (isInArray(friendsId)) {
                    setIsAlreadyMyFriend(true);
                }
            })
            .catch((reason: any) => { console.error("Could not get friends") });
    })

    const handleInfo = (): void => {
        if (!isAlreadyMyFriend) {
            fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/user/add_friend/", {
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
                    "my_id": my_id,
                    "friends_id": friendsId,
                }),
            })
                .then(() => {
                    setIsAlreadyMyFriend(true);
                })
                .catch(error => console.log('Error: ', error));
        } else {
            fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/user/delete_friend/", {
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
                    "my_id": my_id,
                    "friends_id": friendsId,
                }),
            })
                .then(() => {
                    setIsAlreadyMyFriend(false);
                })
                .catch(error => console.log('Error: ', error));
        }
    }

    return (
        <div>
            {isAlreadyMyFriend ?
                <label className="friend-btn">
                    Delete this friend
                    <input
                        placeholder="toggle friend"
                        type="button"
                        hidden
                        onClick={e => handleInfo()} />
                </label>
                :
                <label className="friend-btn">
                    Add as a friend
                    <input
                        placeholder="toggle friend"
                        type="button"
                        hidden
                        onClick={e => handleInfo()} />
                </label>
            }
        </div>
    )
}

export default AddFriend
