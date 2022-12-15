import React, { useEffect } from "react";
import BannerPlay from "../components/BannerPlay";
import Header from "../components/Header";
import BannerAchievement from "../components/BannerAchievement";
import BannerAbout from "../components/BannerAbout";
import "../styles/Header.css"
import "../styles/BannerPlay.css"
import "../styles/BannerAchievement.css"
import "../styles/BannerAbout.css"
import { authCookie } from "../App";
import { Navigate, useNavigate } from "react-router-dom";


interface Props {
    logoutOfSite:any;
}

const Home: React.FC<Props> = ({logoutOfSite}:Props): JSX.Element => {

    const navigate = useNavigate();

    let id = -1;
    // useEffect(() => {
        if (authCookie.get('42auth-cookie') === undefined) {
            // console.log("JUST PASSING BY...");
            navigate("/Login");
            // window.location.href = `http://localhost:9999/Login`;
        } else {
            id = authCookie.get('42auth-cookie').id;
        }
    // }, [])

    // let test: Cookie = new Cookies()
    // test.get('42auth-cooki')
    // test.set('bidoup', 'bonjour')
    // console.log('hello', test.get('42auth-cooki'))
    // console.log('hello cookie, the ID is : ', test.get('42auth-cookie').id)
    // let object = test.get('bidoup', {doNotParse: true})
    // console.log(object)
    // console.log(test.getAll())

    // fonction qui permet de recuperer username.

    // const handle_change_name = (login:string) =>{
    //     console.log("----------");
    //     (async () => {
    //         console.log(login);
    //         console.log("ggfjdfjhkgkjdhgkjfd");
    //         await axios.get(`http://localhost:3000/chat/askInfoForPlayer/${login}`).then((res) => {
    //             const lala = res.data;
    //             setName_lala((old:string) => "lala");
    //             mySocket.auth = {login:lala.login, idUser:lala.id};
    //             console.log("j'ai ete trigger2");
    //             mySocket.connect();
    //         });
    //     })();
    //     console.log("----------");
    //     console.log("j'ai ete trigger");
    //     // setName_lala((old:string) => lala);
    //     // console.log(lala);
    //     // mySocket.auth = {login:lala, idUser:lala};
    //     // here i can pass an object with all information, that i want. 
    //     // mySocket.connect();
    // }

    // raph en atendant de pouvoir recuperer les donners apres un midlleware ou localhost
    // const [name_lala, SetName_lala] = React.useState<string>("");
    // RAPH  console.log(name_lala);

    // console.log("HERE");
    
    return (
        <div>
            <Header logoutOfSite={logoutOfSite} conditionHeader={1} />
            <main>
                <BannerPlay />
                <BannerAchievement />
                <BannerAbout id={Number(id)} />
            </main>
        </div>
    );
}

export default Home;

// le code est divise en sous composants.
// La props dans le header permet de changer le design en fonction de la page ou on se situe.
// les trois autres composants constituent le coeur de la page.
