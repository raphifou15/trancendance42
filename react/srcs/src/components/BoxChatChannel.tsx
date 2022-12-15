import React from "react";
import "../styles/BoxChatChannel.css"
import cross from "../images/cross.svg";
import { ReactComponent as Block } from "../images/block.svg"
import { ReactComponent as UnBlock } from "../images/unblock.svg"
import { ReactComponent as Mute} from "../images/mute.svg";
import { ReactComponent as UnMute} from "../images/unMute.svg";
import { ReactComponent as AddAdmin} from "../images/addAdmin.svg";
import { ReactComponent as RemoveAdmin} from "../images/removeAdmin.svg";
import { ReactComponent as Pass} from "../images/pass.svg";
import { ReactComponent as Ban} from "../images/ban.svg";
import { ReactComponent as Unban} from "../images/unban.svg";
import { ReactComponent as Exit} from "../images/exit.svg";
import { ReactComponent as Enter} from "../images/enter.svg";
import { ReactComponent as Invite} from "../images/invite.svg";
import { ReactComponent as Admin} from "../images/admin.svg";

import send from "../images/send.svg";
import FormToSendAction from "./FormToSendAction";
import { AllPrivateChannels, AllPublicChannels, MessageChannelInterface } from "../interfaces/ChatPlayer";
import { mySocket } from "../socket";
import Picker from 'emoji-picker-react';

interface Props {
    element: AllPublicChannels | AllPrivateChannels;
    handleClickClearBoxChatChannel: any;
}

const BoxChatChannel: React.FC<Props> = ({ element, handleClickClearBoxChatChannel }: Props): JSX.Element => {

    const allPlayer = (e: React.MouseEvent<HTMLElement>) => {
        setOpenEmoji(old => !old);
    } 

    const putAllMessagesAtEnd = () => {
        setTimeout(() => {
            // console.log(aboutMessages)
            aboutMessages.current.scrollTop = 1000000000;
            // console.log(aboutMessages.current.offsetTop);
        }, 100)
    }

    const handleReRenderAfterSubmit = (action: string) => {
        (async () => {
            await mySocket.emit("listInfoOnWhoIalreadyBlock", (response: any) => {
                setListPlayerBlock((old) => response);
                if (openAction === true)
                    setChannelOptionChannelForm((old: any) => "")
                setOpenAction((old) => !old);
            })
            if (action === "block" || action === "unBlock" ){
                await mySocket.emit("recupAllListMessagesFromChannel", element.name, (response:MessageChannelInterface[]) => {
                    setAllMessageChannel((old) => response)
                    putAllMessagesAtEnd();
                })
            }
            if (action === "leave"){
                setIsOwner(old => false);
            }
        })();
    }


    const handleAllElemActionBlock = (e: React.MouseEvent<HTMLElement>, action: string) => {
        e.preventDefault();
        setChannelOptionChannelForm(old => (action));
        // console.log("lalala");
    }

    const handleClickInvite = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        if (channelOptionChannelForm === "invite") {
            setChannelOptionChannelForm((old) => "");
            setOpenAction((old) => false);
        } else {
            setChannelOptionChannelForm((old) => "invite");
            setOpenAction((old) => true);
        }
    }

    const leaveChannel = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        // console.log("i leave the chan");
        mySocket.emit("leaveTheChannel", { name: element.name, type: element.type }, (response: any) => {
            if (response !== undefined) {
                if (response.log !== undefined && response.log === false){
                    setIsLog(false);
                    setAllMessageChannel((old) => []);
                }
                if (response.changeOwner !== undefined && response.changeOwner === true) {
                    setChannelOptionChannelForm((old) => "leave");
                    setOpenAction((old) => true);
                }
            }
        })
    }


    const enterChannel = (e:React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        mySocket.emit("enterTheChannel", {name:element.name, type:element.type}, (response:any) => {
            if (response !== undefined){
                if (response.log !== undefined && response.log === true){
                    setIsLog(true);
                    mySocket.emit("recupAllListMessagesFromChannel", element.name, (response:MessageChannelInterface[]) => {
            
                        setAllMessageChannel((old) => response)
                        putAllMessagesAtEnd();
                    })
                }
            }
        })
    }

    const listActionToDo = (e:React.MouseEvent<HTMLElement>) => {

        e.preventDefault();
        if (openAction === true)
            setChannelOptionChannelForm((old: any) => "")
        setOpenAction((old) => !old);
    }

    const changeMessageChannel = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.value.length > 5000)
            return;
        setMessageChannel((old) => {
            const temp = { ...old }
            temp.text = e.target.value;
            return temp;
        })
    }

    const handleFormBoxChatChannel = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!messageChannel.text.replace(/\s/g, '').length || messageChannel.text.length > 5000)
            return ;
        mySocket.emit("messageBoxChannelToServer", messageChannel);
        // console.log(messageChannel);
        setIsLog((old) => true);
        setMessageChannel((old) => {
            const temp = { ...old }
            temp.text = "";
            return temp;
        })
        putAllMessagesAtEnd();
    }

    const sendMessageToAllchanConnecteToRoomFromServer = (messageFromWebSocket: MessageChannelInterface) => {
        if (messageFromWebSocket.nameChannel !== element.name)
            return;

        setAllMessageChannel((old) => {
            const temp: MessageChannelInterface[] = (old != undefined) ? ([...old]) : [];
            if (listPlayerBlock?.some((elem) => elem === messageFromWebSocket.nameUser) === false)
                temp.push(messageFromWebSocket);
            return temp;
        })
        putAllMessagesAtEnd();
        // console.log(messageFromWebSocket);
    }

    const IBecomeAdmin = (arg: boolean) => {
        setIsAdmin((old) => arg);
        if (arg === false) {
            setOpenAction((old) => false);
            setChannelOptionChannelForm(old => (""));
        }
    }

    const IamMute = (arg: boolean) => {
        // console.log("elem is mute");
        setIsMute((old) => arg);
    }

    const changeRight = () => {
        setIsOwner((old) => true);
        setIsAdmin((old) => true);
    }

    const onEmojiClick = (e:any , emojiObject:any) => {
        try{
            setMessageChannel(old => {
            const temp = { ...old };
            if (emojiObject !== undefined)
                temp.text += emojiObject.emoji;
            return temp;
        });
        if (emojiObject != undefined)
        setChosenEmoji(emojiObject);
        }
        catch(error){console.error(error+ "c'est une erreur")}
      };


    const [openEmoji, setOpenEmoji] = React.useState<boolean>(false);
    const [chosenEmoji, setChosenEmoji] = React.useState<any>(null);
    const aboutMessages = React.useRef<any>({});
    const [myName, setMyName] = React.useState<string>("");
    const [isLog, setIsLog] = React.useState<boolean>(false);
    const [isMute, setIsMute] = React.useState<boolean>(false);
    const [listPlayerBlock, setListPlayerBlock] = React.useState<string[]>([]);
    const [channelOptionChannelForm, setChannelOptionChannelForm] = React.useState<string>("");
    const [openAction, setOpenAction] = React.useState<boolean>(false);
    const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
    const [messageChannel, setMessageChannel] = React.useState<MessageChannelInterface>({ nameUser: "", nameChannel: element.name, text: "" });
    const [AllMessageChannel, setAllMessageChannel] = React.useState<MessageChannelInterface[]>();
    //const isOwner = React.useRef(false);
    const [isOwner, setIsOwner] = React.useState<boolean>(false);

    React.useEffect(() => {
        mySocket.emit("getMynameOnBoxChannel", (response: string) => {
            setMyName((old) => response);
        })
    }, [])

    React.useEffect(() => {
        mySocket.emit("listInfoOnWhoIalreadyBlock", (response: any) => {
            setListPlayerBlock((old) => response);
        })
    }, [])

    React.useEffect(() => {
        mySocket?.on("sendMessageToAllchanConnecteToRoom", sendMessageToAllchanConnecteToRoomFromServer) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("sendMessageToAllchanConnecteToRoom", sendMessageToAllchanConnecteToRoomFromServer); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [sendMessageToAllchanConnecteToRoomFromServer])

    React.useEffect(() => {
        mySocket?.on("IamMute", IamMute) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("IamMute", IamMute); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [IamMute])

    React.useEffect(() => {
        mySocket?.on("IBecomeAdmin", IBecomeAdmin) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("IBecomeAdmin", IBecomeAdmin); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [IBecomeAdmin])

    React.useEffect(() => {
        mySocket?.on("changeRight", changeRight) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("changeRight", changeRight); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [changeRight])

    React.useEffect(() => {
        if (element.open)
            mySocket.emit("connectToRoomChannel", element.name, (response: any) => {
                if (response.owner === true)
                    setIsOwner((old) => true);
                if (response.admin === true)
                    setIsAdmin((old) => true);
            });
    }, [])

    React.useEffect(() => {
        mySocket.emit("checkIfIamImute", element.name, (response: boolean) => {

            setIsMute((old) => response);
        })
    }, [])

    React.useEffect(() => {
        mySocket.emit("checkIfLog", element.name, (response: boolean) => {
            // console.log(response);
            setIsLog((old) => response);
        })
    }, [])

    React.useEffect(() => {
        putAllMessagesAtEnd();
       },[])
    
    React.useEffect(() => {
        mySocket.emit("recupAllListMessagesFromChannel", element.name, (response:MessageChannelInterface[]) => {
            
            setAllMessageChannel((old) => response)
            putAllMessagesAtEnd();
        })
    }, [])

    const allElemAction  = (openAction) ? 
            <div className={(channelOptionChannelForm === "" && (isOwner === true)) ? "chatbox__channel__action__div chatbox__channel__owner" : ((channelOptionChannelForm === "") && (isOwner === false)) ? "chatbox__channel__action__div" : "chatbox__channel__action__div__alone"}>
                <div onClick={(e) => {handleAllElemActionBlock(e, "block");}} className={(channelOptionChannelForm === "") ? "chatbox__channel__action__div__one chatbox__channel__action__div__img__block" :
                                                                   (channelOptionChannelForm === "block") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                    <p className="chatbox__channel__action__on__hover">block</p>
                    <Block className="chatbox__channel__action__div__img chatbox__inverse__color"/>
                </div>
                <div onClick={(e) => {handleAllElemActionBlock(e, "unBlock");}} className={ (channelOptionChannelForm === "") ? "chatbox__channel__action__div__one chatbox__channel__action__div__img__unblock":
                                                                                (channelOptionChannelForm === "unBlock") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                    <p className="chatbox__channel__action__on__hover">unblock</p>
                   <UnBlock className="chatbox__channel__action__div__img chatbox__inverse__color"/>
                </div>
                <div onClick={(e) => {handleAllElemActionBlock(e, "mute");}} className={ (channelOptionChannelForm === "") ? "chatbox__channel__action__div__one chatbox__channel__action__div__img__mute" :
                                                                            (channelOptionChannelForm === "mute") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                    <p className="chatbox__channel__action__on__hover">mute</p>
                    <Mute className="chatbox__channel__action__div__img chatbox__inverse__color"/>
                </div>
                <div onClick={(e) => {handleAllElemActionBlock(e, "unMute");}} className={ (channelOptionChannelForm === "") ?"chatbox__channel__action__div__one chatbox__channel__action__div__img__unmute":
                                                                            (channelOptionChannelForm === "unMute") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                    <p className="chatbox__channel__action__on__hover">unmute</p>
                    <UnMute className="chatbox__channel__action__div__img chatbox__inverse__color"/>
                </div>
                <div onClick={(e) => {handleAllElemActionBlock(e, "addAdmin");}} className={(channelOptionChannelForm === "") ?"chatbox__channel__action__div__one chatbox__channel__action__div__img__addadmin":
                                                                            (channelOptionChannelForm === "addAdmin") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                    <p className="chatbox__channel__action__on__hover">add admin</p>
                    <AddAdmin className="chatbox__channel__action__div__img chatbox__inverse__color"/>
                </div>
                {(isOwner === true) ?
                <div onClick={(e) => {handleAllElemActionBlock(e, "removeAdmin");}} className={(channelOptionChannelForm === "") ?"chatbox__channel__action__div__one chatbox__channel__action__div__img__removeadmin":
                (channelOptionChannelForm === "removeAdmin") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                    <p className="chatbox__channel__action__on__hover">remove admin</p>
                    <RemoveAdmin className="chatbox__channel__action__div__img chatbox__inverse__color"/>

                </div> : <></>}
            {(isOwner === true) ?
                <div onClick={(e) => { handleAllElemActionBlock(e, "pass"); }} className={(channelOptionChannelForm === "") ? "chatbox__channel__action__div__one chatbox__channel__action__div__img__pass" :
                (channelOptionChannelForm === "pass") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                    <p className="chatbox__channel__action__on__hover">password settings</p>
                    <Pass className="chatbox__channel__action__div__img chatbox__inverse__color" />
                </div> : <></>}
            <div onClick={(e) => { handleAllElemActionBlock(e, "ban"); }} className={(channelOptionChannelForm === "") ? "chatbox__channel__action__div__one chatbox__channel__action__div__img__ban" :
                (channelOptionChannelForm === "ban") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                <p className="chatbox__channel__action__on__hover">ban a user</p>
                <Ban className="chatbox__channel__action__div__img chatbox__inverse__color" />
            </div>
            <div onClick={(e) => { handleAllElemActionBlock(e, "unBan"); }} className={(channelOptionChannelForm === "") ? "chatbox__channel__action__div__one chatbox__channel__action__div__img__unban" :
                (channelOptionChannelForm === "unBan") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                <p className="chatbox__channel__action__on__hover">unban a user</p>
                <Unban className="chatbox__channel__action__div__img chatbox__inverse__color" />
            </div>
            <div onClick={(e) => { handleAllElemActionBlock(e, "invite"); }} className={(channelOptionChannelForm === "invite") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                <p className="chatbox__channel__action__on__hover">invite a user</p>
                <Invite className="chatbox__channel__action__div__img chatbox__inverse__color" />
            </div>
            <div onClick={(e) => { handleAllElemActionBlock(e, "leave"); }} className={(channelOptionChannelForm === "leave") ? "chatbox__channel__action__div__one__bis" : "display__none"}>
                <p className="chatbox__channel__action__on__hover">exit</p>
                <Exit className="chatbox__channel__action__div__img chatbox__inverse__color" />
            </div>
        </div>
        : <></>



    const formToAction = (channelOptionChannelForm === "") ? <></> : <FormToSendAction action={channelOptionChannelForm} element={element} handleReRenderAfterSubmit={handleReRenderAfterSubmit} />
    const filterArrayMessage = AllMessageChannel?.filter((elem2) => {
        for (const block of listPlayerBlock) {
            if (elem2.nameUser === block)
                return false;
        }
        return true;
    })
    // const arrayMessage = filterArrayMessage?.map((elem2, index) => <p key={index}>{elem2.nameUser}:   {elem2.text}</p>)
    const arrayMessage = AllMessageChannel?.map((elem2, index) => {
        return (
            <section key={index} className={(elem2.nameUser === myName) ? "array__message__me__right" : "array__message__other__left"}>
                <div className="array__message__size">
                {(elem2.nameUser === myName) ?  <></> : <h3 className="array__message__other__left__h3">{elem2.nameUser}</h3>}
                    <div  className={(elem2.nameUser === myName) ? "array__message__me__right__div" : "array__message__other__left__div"}>
                        <p>{elem2.text}</p>
                    </div>
                </div>
            </section>
        )
    })
    // console.log("element");
    // console.log(element);
    return (
        <>
            {formToAction}
            {allElemAction}
            <form onSubmit={(e) => { handleFormBoxChatChannel(e); }} className="chatbox__channel__form">
                <div className="chatbox__channel__form__div">
                    <div className="chatbox__channel__form__title">
                        <h1 className="chatbox__channel__form__h1">
                            
                            <p className="chatbox__channel__form__h1__name">{element.name}</p>
                            <p>{(isOwner === true) ? "(owner)" : ""}</p>
                            <p>{(isAdmin === true && isOwner === false) ? " (Admin)" : ""}</p>
                        </h1>
                        <div className="chatbox__channel__form__title__action">
                            {(element.type === 'PRIVATE' && isAdmin === true) ? <div className="chatbox__channel__form__title__invite" onClick={(e) => { handleClickInvite(e) }}> <Invite /> </div> : <></>}
                            {(isLog) ? <div className="chatbox__channel__form__title__exit" onClick={(e) => { leaveChannel(e); }}><Exit /> </div> : <div className="chatbox__channel__form__title__exit" onClick={(e) => { enterChannel(e); }}><Enter /> </div>}
                            {(isAdmin) ? <p className="chatbox__channel__form__title__point" onClick={(e) => { listActionToDo(e); }}>...</p> : <></>}
                            <img className="chatbox__channel__form__title__cross" onClick={(e) => { handleClickClearBoxChatChannel(e); }} src={cross} alt="effacer la chatbox" />
                        </div>
                    </div>
                    <div className="chatbox__form__content__text" ref={aboutMessages}>
                        {arrayMessage}
                    </div>
                    {(isMute) ? <></> :
                        <div className="chatbox__channel__form__div__input">
                             <p onClick={allPlayer} className="chatbox__form__div__input__smiley">😀</p>
                            {openEmoji ?
                            <div className="chatbox__form__div__input__div">
                                <Picker onEmojiClick={onEmojiClick} groupVisibility={{symbols:false}}/>
                            </div>
                            : 
                            <></>
                        }
                            <input onChange={(e) => { changeMessageChannel(e); }} value={messageChannel.text} placeholder="Message" type="text" className={(messageChannel.text === "") ? "chatbox__channel__form__input" : "chatbox__channel__form__input chatbox__channel__form__input__on"} />
                            <button type="submit"><img src={send} alt=" envoyer dans un formulaire" /></button>
                        </div>
                    }
                </div>
            </form>
        </>
    )
}

export default BoxChatChannel;