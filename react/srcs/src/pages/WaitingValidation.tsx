import logoBig from "../images/logo_big.png"
import blue from "../images/login_bar_bleu.png"
import green from "../images/login_bar_vert.png"
import ball from "../images/login_ball.png"
import "../styles/Login.css"
import "../styles/RegisterForm.css"
// import axios from "axios"
// import { useEffect, useState } from "react"
import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

interface Props {
    setName_lala: any;
}

const WaitingValidation: React.FC<Props> = ({ setName_lala }): JSX.Element => {

    // console.log("IN WAITING VALIDATION (waitingValidation.tsx)");

    const navigate = useNavigate();

    const [validationError, setValidationError] = useState<boolean>(false);
    const [id, setId] = useState<number>(-1);
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token && token !== "a2fEnabled") {                      // if there is a token, it means it is the link received by email
        
        fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/email-confirmation", {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',

            },
            body: JSON.stringify({
                "token": token,
            }),
        })
        .then(function(a) {
            return a.json(); // call the json method on the response to get JSON
        })
        .then(function(json) {
            if (json === -1) {
                throw new Error('Something went wrong with email confirmation...');
            }
            // console.log("OK: email confirmed");
            let login = json.login;
            let email = json.email;
            let image_url = json.image_url;
            setId(json.id);
            // console.log("ID: ", json.id);
            if (login !== undefined && email !== undefined && image_url !== undefined) {
                // fetch("http://localhost:3000/auth/createCookie", {
                fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/createCookie", {
                    mode: 'cors',
                    method: 'POST',
                    credentials: 'include', //////// Needed to create cookie
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        "email": email,
                        "login": login,
                        "image_url": image_url,
                        "password": "not_null",
                    }),
                })
                .then(response => {
                    if (response.ok) {
                        // console.log("RESPONSE OK: ", response);
                        setName_lala("WAITINGVALIDATION");
                        window.setTimeout(function() {
                            navigate("/Home");
                        }, 1000);
                        // navigate("/Home");
                    } else {
                        throw new Error('Something went wrong with cookie creation...');
                    }
                })
                .catch(error => console.log(error));
            }
        })
        .catch(error => {
            setValidationError(true);
            console.log(error);
            window.setTimeout(function() {
                navigate("/Login");
            }, 5000);
        });

        // .then(response => {
        //     if (response.ok) {
        //         console.log("OK: email confirmed");
        //         const data = response.json();
        //         console.log("RESPONSE.DATA: ", data);
        //         axios
        // 	    .get("http://localhost:3000/auth/get_user")
        // 	    .then((response) => {

        //             let login = response.data.login;
        //             let email = response.data.email;
        //             let image_url = response.data.image_url;

        //             if (login !== undefined && email !== undefined && image_url !== undefined) {
        //                 fetch("http://localhost:3000/auth/signup", {
        //                     mode: 'cors',
        //                     method: 'POST',
        //                     credentials: 'include', //////// Needed to create cookie
        //                     headers: {
        //                         'Accept': 'application/json',
        //                         'Content-Type': 'application/json',
        //                         'Access-Control-Allow-Origin': '*'
        //                     },
        //                     body: JSON.stringify({
        //                         "email": email,
        //                         "login": login,
        //                         "image_url": image_url,
        //                         "password": "not_null",
        //                     }),
        //                 })
        //                 .then(response => {
        //                     if (response.ok) {
        //                         // console.log("RESPONSE OK: ", response);
        //                         sleep(40000);
        //                         setName_lala("WAITINGVALIDATION");
        //                         sleep(40000);
        //                         window.location.href = `http://localhost:9999/Home`;
        //                         return ;
        //                     } else {
        //                         throw new Error('Something went wrong...');
        //                     }
        //                 })
        //                 .catch(error => console.log(error));
        //             } else {
        //                 throw new Error("Could not sign up (WaitingValidation.tsx)");
        //             }
        //         })
        //         .catch(error => console.log(error));
        //     } else {
        //         throw new Error('Something went wrong...');
        //     }
        // })
        // .catch(error => console.log(error));
        if (!validationError) {
            return (
                <h2>Waiting for validation...</h2>
            )
        } else {
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
                    "id": String(id),
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

            return (
                <main>
                    <h1>Validation error...</h1>
                    <h2>You will be redirected to the login page where you will be able to retry.</h2>
                </main>
            )
        }

    } else if (token === "a2fEnabled") {                         // if there is no token and a2f is enabled, it means we have to render the page before validating the email
        return (
            <main className="font__game">
                <img className="font__game__green" src={green} alt="barre verte" />
                <img className="font__game__blue" src={blue} alt="barre bleu" />
                <img className="font__game__ball" src={ball} alt="balle" />
                <section className={"onboarding"}>
                    <div className="onboarding_div_title">
                        <p className="onboarding__text__up">You enabled two factor authentication.</p>
                    </div>
                    <img className="onboarding_logo" src={logoBig} alt="logo du site web" />
                    <div className="onboarding_div_title">
                        <p className="onboarding__text__down">Go check your emails for validation...</p>
                    </div>
                </section>
            </main>
        )
    } else {                                            // if there is no token and a2f is disabled, this page should not be called
        // window.location.href = `http://localhost:9999/Login`;
		// return (
        //     <main className="font__game">
        //     </main>
		// );

        return (
            <main className="font__game">
				<Navigate to="/Login" replace={true} />
            </main>
        );
    }
}

export default WaitingValidation;
