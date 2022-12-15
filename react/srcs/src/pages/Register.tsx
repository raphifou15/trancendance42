import React from "react";
import RegisterForm from "../components/RegisterForm";
import blue from "../images/login_bar_bleu.png"
import green from "../images/login_bar_vert.png"
import ball from "../images/login_ball.png"
import "../styles/Login.css"
import "../styles/RegisterForm.css"

interface Props{
    handle_change_name: any
}

const Login:React.FC<Props> = ({handle_change_name}: Props): JSX.Element => {

    const handleAdd =(e:React.FormEvent):void =>{
        e.preventDefault();
        // console.log(e.target)
    }
  
    return (
        <main className="font__game">
            <img className="font__game__green"  src={green} alt="barre verte" />
            <img className="font__game__blue" src={blue} alt="barre bleu" />       
            <img className="font__game__ball" src={ball} alt="balle" />
            <RegisterForm handle_change_name={handle_change_name}/><></>
        </main>
    )
}

export default Login;

//l'interface du Login pour connexion d'un utilisateur.

// Faire passer une interface en partant de l'element parent pour l'auth afin
// que l'element parent puisse savoir si la perssonne est connecter voir cela avec (christie)
// la redirection se fera sur une page profile qui n'est pas encore fait.