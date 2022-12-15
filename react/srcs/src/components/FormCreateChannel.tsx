import React from "react";
import "../styles/FormCreateChannel.css"
import ReactDOM from "react-dom/client";
import { FormChannelInterface } from "../interfaces/ChatPlayer";
import cross from "../images/cross.svg"

interface Props{
    handleChannelAfterSubmit:any;
    closeChannel:any;
}

const FormCreateChannel:React.FC<Props> = ({handleChannelAfterSubmit, closeChannel}:Props):JSX.Element => {

    const [optionChannel, setOptionChannel] = React.useState<FormChannelInterface>({
        private:false,
        public:true,
        protected:false,
        password:"",
        password2:"",
        name:"",
    })

    const changeFormValue = (event:React.ChangeEvent<HTMLInputElement>):void => {
        if (event.target.name === "pass"){
            setOptionChannel((old) => {
                let temp:FormChannelInterface = {...old};
                temp.protected = (event.target.value === "oui") ? true : false;
                return temp; 
            })
        }
        if (event.target.name == "chan"){
            setOptionChannel((old) => {
                let temp:FormChannelInterface = {...old};
                if (event.target.value === "public"){
                    temp.public = true;
                    temp.private = false;
                }
                else{
                    temp.public = false;
                    temp.private = true;
                }
                return temp;
            })
        }
        if (event.target.name === "nameChannel" || event.target.name === "password" || event.target.name === "confirm__password")
            setOptionChannel((old) => {
                let temp:FormChannelInterface = {...old};
                (event.target.name === "nameChannel") ? temp.name = event.target.value : (event.target.name === "password") ? temp.password = event.target.value : temp.password2 = event.target.value;
                return temp;
            })
    }

    const handleCloseChannel = (e:React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        closeChannel();
    }

    const checkBeforeSubmiteAndSubmit = (e:React.FormEvent<HTMLFormElement>):void => {
        e.preventDefault();
        if (optionChannel.protected === true && optionChannel.password !== optionChannel.password2)
            window.alert("The passwords must match !");
            handleChannelAfterSubmit(optionChannel);
    }

    return (
        <form className="form__create__channel" onSubmit={checkBeforeSubmiteAndSubmit}>
            <h2 className="form__create__channel__h2">Create a channel</h2>
            <img onClick={(e) => {handleCloseChannel(e);}} className="form__create__channel__cross" src={cross} alt="croix" />
            <div className="form__create__channel__chan">
                <div>
                    <h3>Public</h3>
                    <input className="form__create__channel__circle" type="radio" name="chan" value="public" checked onChange={(e) =>{changeFormValue(e);}} />
                </div>
                <div>
                    <h3>Private</h3>
                    <input className="form__create__channel__circle" type="radio" name="chan" value="private" onChange={(e) =>{changeFormValue(e);}}/>
                </div>
            </div>
            <div className="form__create__channel__chan">
                <h3 className="form__create__channel__h2">Password</h3>
                <div className="form__create__channel__true__false">
                    <h3 className="form__create__channel__true__false__h3">yes</h3>
                    <input className="form__create__channel__circle" type="radio" name="pass" value="oui" onChange={(e) =>{changeFormValue(e);}}/>
                </div>
                <div className="form__create__channel__true__false">
                    <h3 className="form__create__channel__true__false__h3">no</h3>
                    <input className="form__create__channel__circle" type="radio" name="pass" value="non" checked onChange={(e) =>{changeFormValue(e);}}/>
                </div>
            </div>
            <div className="form__create__channel__name">
                <h3 className="form__create__channel__name__h3">Channel Name</h3>
                <input type="text"  className="form__create__channel__name__input" name="nameChannel" value={optionChannel.name} required onChange={(e) => {changeFormValue(e)}}/>
            </div>
            <div className={ optionChannel.protected ? "form__create__channel__pass" : "form__create__channel__pass__hidden"}>
                <input className="form__create__channel__pass__input" type="password" name="password" placeholder="Password" value={optionChannel.password} onChange={(e) => {changeFormValue(e)}}/>
            </div>
            <div className={ optionChannel.protected ? "form__create__channel__pass" : "form__create__channel__pass__hidden"}>
                <input className="form__create__channel__pass__input" type="password" name="confirm__password" placeholder="Confirm Password" value={optionChannel.password2} onChange={(e) => {changeFormValue(e)}}/>
            </div>
            <button type="submit" className="form__create__channel__button">Submit</button>
        </form>
    )
}

export default  FormCreateChannel;