import React from "react";
import logoBig from "../images/logo_big.png"
import blue from "../images/login_bar_bleu.png"
import green from "../images/login_bar_vert.png"
import ball from "../images/login_ball.png"
import "../styles/Login.css"
import "../styles/RegisterForm.css"
// import { Navigate, useNavigate } from "react-router-dom";

const Login: React.FC = (): JSX.Element => {

    const handleAdd = (e: React.FormEvent): void => {
        e.preventDefault();
        // console.log(e.target)
    }

    // let navigate = useNavigate();

    // function redirect_login() {
    //     // navigate("http://localhost:3000/auth/42login")
    //     // <Navigate to="http://localhost:3000/auth/42login" replace={true} />

    //     fetch("http://localhost:3000/auth/42login", {
    // 		mode: 'cors',
    // 		method: 'GET',
    // 		credentials: 'include', //////// Needed to create cookie
    // 		headers: {
    // 			'Accept': 'application/json',
    // 			'Content-Type': 'application/json',
    // 			'Access-Control-Allow-Origin': '*'
    // 		},
    // 	})
    // 	.then(response => {
    // 		if (response.ok) {
    // 			// navigate('/Home')
    // 			return ;
    // 		} else {
    // 			throw new Error('Something went wrong...');
    // 		}
    // 	})
    // 	.catch(error => console.log(error));
    // }

    // usestate boolean
    // const [registered, setRegistered] = useState(0);
    // console.log("REGISTERED HERE: ");
    // if (registered)
    return (
        <main className="font__game">
            <img className="font__game__green" src={green} alt="barre verte" />
            <img className="font__game__blue" src={blue} alt="barre bleu" />
            <img className="font__game__ball" src={ball} alt="balle" />
            {/* <section className={ "form-overlay" }> */}
            {/* <section className={ {registered} ? "onboarding" : "form-overlay" }> */}
            <section className={"onboarding"}>
                <div className="onboarding_div_title">
                    <h1 className="onboarding__title">Pong</h1>
                </div>
                <img className="onboarding_logo" src={logoBig} alt="logo du site web" />
                <form onSubmit={(e) => { handleAdd(e); }}>
                    <button
                        type="submit"
                        className="onboarding_button"
                        onClick={event => window.location.href = "http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/42login"}>
                        {/* onClick={event => redirect_login()}> */}
                        Login 42
                    </button>
                </form>
            </section>
        </main>
    )
    // else
    //     return (
    //         <main className="font__game">
    //             <img className="font__game__green"  src={green} alt="image de la bar verte" />
    //             <img className="font__game__blue" src={blue} alt="image de la bar bleu" />

    //             <img className="font__game__ball" src={ball} alt="image de la balle" />
    //             {/* <section className={ "form-overlay" }> */}
    //             {/* <section className={ {registered} ? "onboarding" : "form-overlay" }> */}
    //             {/* {<RegisterForm/>} */}
    //             <RegisterForm handle_change_name={""}/> : <></>
    //             {/* <section className={"onboarding"}>
    //                 <div className="onboarding_div_title">
    //                     <h1 className="onboarding__title">Pong</h1>
    //                 </div>
    //                 <img className="onboarding_logo" src={logoBig} alt="logo du site web" />
    //                 <form onSubmit={(e) => {handleAdd(e);}}>
    //                     <button type="submit" className="onboarding_button" onClick={event =>  window.location.href='http://localhost:3000/auth/42login'}>Login 42</button>
    //                 </form>
    //             </section> */}
    //         </main>
    //     )
}
export default Login;

//l'interface du Login pour connexion d'un utilisateur.

// Faire passer une interface en partant de l'element parent pour l'auth afin
// que l'element parent puisse savoir si la perssonne est connecter voir cela avec (christie)
// la redirection se fera sur une page profile qui n'est pas encore fait.