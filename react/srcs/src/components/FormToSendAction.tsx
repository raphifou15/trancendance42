import React, { useEffect } from "react";
import { AllPrivateChannels, AllPublicChannels } from "../interfaces/ChatPlayer";
import { mySocket } from "../socket";
import "../styles/FormToSendAction.css";
interface Props {
    action:string;
    element:AllPublicChannels|AllPrivateChannels;
    handleReRenderAfterSubmit:any;
    // onClick={(e) => {handleClickClearChatbox(e);}}
}

const FormToSendAction:React.FC<Props> = ({action, element, handleReRenderAfterSubmit}: Props):JSX.Element => {

    const handleNameToAction = (e:React.MouseEvent<HTMLElement>, name:string) => {
        e.preventDefault();
        setNameToSend((old) => name);
    }

    const changePassword = (e:React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setPassToChange((old) => e.target.value);
    }

    const handleSubmitFormAction = (e:React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        (async () => {
            if (action === "block"){
                // console.log(nameToSend);
                await mySocket.emit("formToSendBlockUser", nameToSend, (response:any) => {
                    handleReRenderAfterSubmit("block");
                });
            }
            if (action === "unBlock"){
                // console.log(nameToSend);
                await mySocket.emit("formToSendUnBlockUser", nameToSend, (response:any) => {
                    handleReRenderAfterSubmit("unBlock");
                });

            }
            if (action === "pass"){
                await mySocket.emit("formToSendPassUser",{pass:passToChange, value:valueToChange, name:element.name})
                handleReRenderAfterSubmit("pass");
            }
            if (action === "addAdmin"){
                await mySocket.emit("formToSendAddAdmin", {nameUser:nameToSend, nameChan:element.name});
                handleReRenderAfterSubmit("addAdmin");
            }
            if (action === "removeAdmin"){
                await mySocket.emit("formToSendRemoveAdmin", {nameUser:nameToSend, nameChan:element.name});
                handleReRenderAfterSubmit("removeAdmin");
            }
            
            if (action === "mute"){
                await mySocket.emit("formToSendMute", {nameUser:nameToSend, nameChan:element.name});
                handleReRenderAfterSubmit("mute");
            }
            if (action === "unMute"){
                await mySocket.emit("formToSendUnMute", {nameUser:nameToSend, nameChan:element.name});
                handleReRenderAfterSubmit("unMute");
            }
            if (action === "ban"){
                await mySocket.emit("formToSendBan", {nameUser:nameToSend, nameChan:element.name, type:element.type});
                handleReRenderAfterSubmit("ban");
            }
            if (action === "unBan"){
                await mySocket.emit("formToSendUnBan", {nameUser:nameToSend, nameChan:element.name, type:element.type});
                handleReRenderAfterSubmit("unBan");
            }
            if (action === "invite"){
                await mySocket.emit("formToSendInvite", {nameUser:nameToSend, nameChan:element.name, type:element.type});
                handleReRenderAfterSubmit("invite");
            }
            if (action === "leave"){
                await mySocket.emit("formToSendLeaveGiveRight", {nameUser:nameToSend, nameChan:element.name, type:element.type});
                handleReRenderAfterSubmit("leave");
            }
            setNameToSend((old) => "");
        })();
    }

    const changeFormValueFormPassword = (e:React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setValueToChange((old) => e.target.value);
    }

    const changeNameToSend = (e:React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setNameToSend((old) => e.target.value);
    }

    const [passToChange, setPassToChange] = React.useState<string>("");
    const [valueToChange, setValueToChange] = React.useState<string>("change");
    const [nameToSend, setNameToSend] = React.useState<string>("");
    const [listUserToAction, setListUserToAction] = React.useState<string[]>([]);

    useEffect(() => {
        // console.log(action);
        mySocket?.emit("recupListAction", {action:action, elem:{name:element.name, type:element.type}}, (response:any) => {
            if (action === "block" || action === "unBlock" || action === "addAdmin" || action === "removeAdmin" || action === "mute"
            || action === "unMute" || action === "ban" || action === "unBan" || action === "invite" || action === "leave"){
                setListUserToAction((old:any) => response);
            }
        });
    },[]);


    const listUser = listUserToAction?.filter((elem) => elem.startsWith(nameToSend))?.map((elem, index) => {
        return(<p onClick={(e) => {handleNameToAction(e, elem);}}  className="form__to__send__action__display__name__p" key={index}>{elem}</p>);
    })

    const placeHolderAction = (action === 'invite') ? 'invite a user' : (action === 'leave') ? 'choose an other owner': action;

    return (
        <>
            {(action === "pass") ?
            <form className="form__to__send__action__pass" onSubmit={(e) => {handleSubmitFormAction(e);}}>
                <div className="form__to__send__action__pass__select__div">
                    <select className="form__to__send__action__pass__select" onChange={(e) =>{changeFormValueFormPassword(e);}} name="password">
                        <option value="change">Modify</option>
                        <option value="add">Add</option>
                        <option value="remove">Remove</option>
                    </select>
                </div>
                {(valueToChange !== "remove") ?
                <input onChange={(e) => {changePassword(e);}} value={passToChange} className="form__to__send__action__pass__password" placeholder="password" type="password"/> : <></>}
                <button className="form__to__send__action__submit" type="submit">Submit</button>
            </form>
            :
            <>
                <div className="form__to__send__action__display__name">
                    {listUser}
                </div>
                <form className="form__to__send__action" onSubmit={(e) => {handleSubmitFormAction(e);}}>
                    <input placeholder={placeHolderAction} onChange={(e) => {changeNameToSend(e);}} value={nameToSend} className="form__to__send__action__input" type="text" />
                    <button type="submit" className="form__to__send__action__button"></button>
                </form>
            </>
            }
        </>
    )
}

export default FormToSendAction;