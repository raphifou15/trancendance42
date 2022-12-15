import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Header from "../components/Header";
import CardAchievement from "../components/CardAchievement";
import Classement from "../components/Classement";
import Summary from "../components/Summary";
import LastResults from "../components/LastResults";
import { CardAchievementInterface } from "../interfaces/CardAchievement"
import ChangeImgPath from '../components/ImageUpload';
import ChangeA2f from '../components/ChangeA2f';
import ChangeLogin from '../components/ChangeLogin';
import "../styles/Achievement.css"
import "../styles/Header.css"
import "../styles/Profile.css"
import { ImageListType } from "react-images-uploading";
import { useNavigate, useParams } from 'react-router-dom';
import AddFriend from '../components/AddFriend';
import { authCookie } from '../App';

interface Props {
    logoutOfSite: any;
}

const Profile: React.FC<Props> = ({logoutOfSite}: Props): JSX.Element => {

    const navigate = useNavigate();

    const [login, setLogin] = useState<string>("");
    const [images, setImages] = useState([]);
    const [url, setUrl] = useState<string>("");
    const [a2f, setA2f] = useState<boolean>();

    const [successEmail, setSuccessEmail] = useState<boolean>(false);
    const [successMaster, setSuccessMaster] = useState<boolean>(false);
    const [successYear, setSuccessYear] = useState<boolean>(false);
    const [successNbGames, setSuccessNbGames] = useState<boolean>(false);
    const [successNbDefeats, setSuccessNbDefeats] = useState<boolean>(false);
    const [successNbVictories10, setSuccessNbVictories10] = useState<boolean>(false);
    const [successNbVictories50, setSuccessNbVictories50] = useState<boolean>(false);
    const [successNbVictories100, setSuccessNbVictories100] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState<boolean>(true);

    // let successEmail = false;
    // let successMaster = false;
    // let successYear = false;
    // let successNbGames = false;
    // let successNbDefeats = false;
    // let successNbVictories10 = false;
    // let successNbVictories50 = false;
    // let successNbVictories100 = false;
    // let isOnline = true;

    const handleLoginChange = (login: string): any => {
        setLogin(login);
    }

    const handleImageUpload = (uploadPath: string): any => {
        setUrl(uploadPath);
    }

    const handleA2fChange = (a2f: boolean): any => {
        setA2f(a2f);
    }

    const onChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };

    const location = useParams();
    const id: string = location.id!;

    let cookie_id = useRef(null);

    useEffect(() => {
        if (authCookie.get('42auth-cookie') === undefined || id === "-1") {
            axios.defaults.headers.common['Authorization'] = "";
            navigate("/Login");
        } else {
            cookie_id.current = authCookie.get('42auth-cookie').id;
            axios.defaults.headers.common['Authorization'] = authCookie.get("42auth-cookie").token + '||' + authCookie.get("42auth-cookie").id;

            axios
                .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user_by_id/" + id)
                .then((response) => {
                    if (response.data.length === 0 || response.data === -1) {
                        navigate("/Home");
                    }
                })
                .catch(() => {
                    console.log('PROFILE use effect : error in get request for back')
                })
        }
    // });
    }, []);

    const current = new Date();
    const today_year = current.getFullYear();
    const today_month = current.getMonth();
    axios
        .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user_by_id/" + id)
        .then((response) => {
            if (response.data.length !== 0 && response.data !== -1) {
                setLogin(response.data.login);
                setUrl(response.data.image_url);
                setA2f(response.data.auth2f_enabled);
                setIsOnline(response.data.is_online);
                // isOnline = response.data.is_online;
                if (response.data.email_is_ok) {
                    setSuccessEmail(true);
                    // successEmail = true;
                }
                const created_year = (response.data.createdAt).slice(0, 4);
                const created_month = (response.data.createdAt).slice(6, 8);
                if ((Number(today_year) - Number(created_year) > 1) || (Number(today_year) - Number(created_year) === 1 && Number(created_month) < Number(today_month))) {
                    setSuccessYear(true);
                    // successYear = true;
                }
                else {
                    setSuccessYear(false);
                    // successYear = false;
                }
                const nb_victories = response.data.victories;
                if (nb_victories >= 10) {
                    setSuccessNbVictories10(true);
                    // successNbVictories10 = true;
                } else {
                    setSuccessNbVictories10(false);
                    // successNbVictories10 = false;
                }
                if (nb_victories >= 50) {
                    setSuccessNbVictories50(true);
                    // successNbVictories50 = true;
                } else {
                    setSuccessNbVictories50(false);
                    // successNbVictories50 = false;
                }
                if (nb_victories >= 100) {
                    setSuccessNbVictories100(true);
                    // successNbVictories100 = true;
                } else {
                    setSuccessNbVictories100(false);
                    // successNbVictories100 = false;
                }
                const nb_defeats = response.data.defeats;
                if (nb_defeats >= 10) {
                    setSuccessNbDefeats(true);
                    // successNbDefeats = true;
                } else {
                    setSuccessNbDefeats(false);
                    // successNbDefeats = false;
                }
                const nb_games = response.data.nb_of_games;
                if (nb_games >= 50) {
                    setSuccessNbGames(true);
                    // successNbGames = true;
                } else {
                    setSuccessNbGames(false);
                    // successNbGames = false;
                }
                axios
                    .get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/user/get_ten_best_players")
                    .then((response) => {
                        let res_array = response.data;
                        if (res_array[0].victories === nb_victories) {
                            setSuccessMaster(true);
                            // successMaster = true;
                        } else {
                            setSuccessMaster(false);
                            // successMaster = false;
                        }
                    })
                    .catch((reason: any) => { console.error("Could not get ten best players") });
            }
        })
        .catch(() => {
            console.log('PROFILE in component error in get request for back')
        })

    const allNewAchievements = (): CardAchievementInterface[] => {
        const temp: CardAchievementInterface[] = [
            { Success: isOnline, firstTitle: "Connected to PONG", secondTitle: "Is online" },
            { Success: successEmail, firstTitle: "Email is a-ok", secondTitle: "Email has been checked" },
            { Success: successYear, firstTitle: "Hello old chap", secondTitle: "Has been a member for a year" },
            { Success: successNbVictories10, firstTitle: "Winner 101", secondTitle: "Won 10 games" },
            { Success: successNbVictories50, firstTitle: "Silver Winner", secondTitle: "Won 50 games" },
            { Success: successNbVictories100, firstTitle: "Golden Winner", secondTitle: "Won 100 games" },
            { Success: successMaster, firstTitle: "Master of the universe", secondTitle: "On top of the ranking" },
            { Success: successNbDefeats, firstTitle: "Sore loser?", secondTitle: "Lost 10 games" },
            { Success: successNbGames, firstTitle: "Do you have a life?", secondTitle: "Played 50 games" },
        ];
        return temp;
    }

    const allAchievements: CardAchievementInterface[] = allNewAchievements();

    const arrayAchievements = allAchievements.map((elem, index) => {
        return <CardAchievement key={index} card={elem} />
    })

    // console.log("ONLINE: ", isOnline);

    return (
        // <div>
        <div className="profile_page">
        <Header logoutOfSite={logoutOfSite} conditionHeader={3} />
            <main>
                <br></br>

                <h1 className="profile_page_h1">PROFILE</h1>

                {String(cookie_id.current) === id ?
                
                    <div>
                        <div className="profile_info">

                        <div className="div_profile_profilepic">
                            <img className="profile_profilepic" src={url} alt="Current avatar" width={200} height={200} />
                        </div>
                        <div className="profile_settings">
                        <div className="setting"><span className="button_change"><ChangeImgPath handleImageUpload={handleImageUpload} /> <></></span></div>

                        <p style={{color: "white"}}>{login}</p>

                        </div>
                            <div className="setting"><span className="button_change"><ChangeLogin handleChangeLogin={handleLoginChange} /> <></></span></div>
                            <div className="setting"><span className="button_change"><ChangeA2f handleA2fChange={handleA2fChange} /> <></></span></div>
                        </div>


                    </div>

                    :

                    <div>
                        <div className="profile_info">

                        <div className="div_profile_profilepic">
                            <img className="profile_profilepic" src={url} alt="Current avatar" width={200} height={200} />
                        </div>

                        <p>{login}</p>

                        </div>
                        <div className="profile_settings">
                            <div><span className="button_change"><AddFriend friendsId={Number(id)} /> <></></span></div>
                        </div>
                    </div>
                }

                <br></br>

                {String(cookie_id.current) === id ?
                    <h2 className="achievement_page_h1">YOUR ACHIEVEMENTS</h2>
                    :
                    <h2 className="achievement_page_h1">{login}'s achievements</h2>
                }

                <div className="div_arrayAchievements">
                    {arrayAchievements}
                </div>

                <br></br>
                <br></br>
                <h2 className="achievement_page_h1">GAME OVERVIEW</h2>
                <div className="achievement_page_second_component">
                    <Classement />
                    <Summary id={Number(id)} />
                    <LastResults id={Number(id)} />
                </div>
            </main>
        </div>
    )
}

export default Profile;
