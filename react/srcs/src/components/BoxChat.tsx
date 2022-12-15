import React, { useEffect } from "react";
import { Socket } from "socket.io-client";
import { ChatPlayerInterface, MessageInterface } from "../interfaces/ChatPlayer";
import cross from "../images/cross.svg";
import block from "../images/block.svg"
import pong from "../images/play_pong.svg"
import profiles from "../images/profiles.svg";
import unblock from "../images/unblock.svg"
import { ReactComponent as Send } from "../images/send.svg"
import { Link, useNavigate } from "react-router-dom"
import { gameSocket } from "../socket";
import { GameEvent } from "../interfaces/Game";
import Picker from 'emoji-picker-react';

interface Props {
    element: ChatPlayerInterface;
    handleClickClearChatbox: any;
    mySocket: Socket;
    myName: string | null;
}

const BoxChat: React.FC<Props> = ({ element, handleClickClearChatbox, mySocket, myName }: Props): JSX.Element => {

    const putAllMessagesAtEnd = () => {
        setTimeout(() => {
            // console.log(aboutMessages)
            aboutMessages.current.scrollTop = 1000000000;
            // console.log(aboutMessages.current.offsetTop);
        }, 100)
    }


    const navigate = useNavigate()


    const sendInvitationToPlay = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        //gameSocket usage
        if (gameSocket.disconnected)
            gameSocket.connect()
            gameSocket.emit('createCustomGame', element.myUserId, (gameId: string) => {
            mySocket?.emit("sendInvitationToPlayPong", {
                notMyUserId: element.notMyUserId,
                notMyName: element.notMyName,
                gameId: gameId
            })

        })
        gameSocket.on(GameEvent.Start, (data: { playerposition: string, gameId: string }) => {
            const gameId: string = data.gameId
            navigate('/play/' + gameId)
        })
    }

    const handleBlockDm = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        (async () => {
            // await axios.post(`http://localhost:3000/chat/blockDmUser`, { params: { userId: element.myUserId, notMyUserId: element.notMyUserId } });
            mySocket.emit("blockDmUser", { params: { userId: element.myUserId, notMyUserId: element.notMyUserId } }, (response:any) => {
                mySocket?.emit("blockDmUser2", element.notMyUserId);
                if (element.notMyUserId === element.myUserId)
                    setBlockUser((old: any) => { const temp = { ...old }; temp.notMe = true; temp.me = true; return temp; });
                else
                    setBlockUser((old: any) => { const temp = { ...old }; temp.notMe = true; return temp; });
                    mySocket?.emit(`getAllMessagesFromChannelDmFront`, { params: { myUserId: element.myUserId, notMyUserId: element.notMyUserId } }, (Response: any) => {
                    setMessages((old) => {
                        const temp: MessageInterface[] = [] //{myName:"", notMyName:"", text:"", notMyId:"", isItMine:false, myUserId:0, notMyUserId:0};
                        Response.messages.map((elem: any) => {
                            let name = "";
                            Response.allUsers.map((elem2: any) => {
                                if (elem2.id === elem.userId)
                                    name = elem2.login;
                                return elem2;
                            })
                            temp.push({ myName: name, notMyName: "", text: elem.content, notMyId: "", isItMine: false, myUserId: parseInt(elem.userId), notMyUserId: 0 })
                            return elem;
                        })
                        return temp;
                    })
                })
                putAllMessagesAtEnd();
            })
        })();
    }

    const handleUnBlockDm = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        (async () => {
            // await axios.post(`http://localhost:3000/chat/unBlockDmUser`, { params: { userId: element.myUserId, notMyUserId: element.notMyUserId } });
            mySocket.emit("unBlockDmUser", { params: { userId: element.myUserId, notMyUserId: element.notMyUserId } }, (response:any) => {
                mySocket?.emit("unBlockDmUser2", element.notMyUserId);
                if (element.notMyUserId === element.myUserId)
                    setBlockUser((old: any) => { const temp = { ...old }; temp.notMe = false; temp.me = false; return temp; });
                else
                    setBlockUser((old: any) => { const temp = { ...old }; temp.notMe = false; return temp; });
                // si le post c'est bien passer.
                //setBlockUser((old) => false);
                mySocket?.emit(`getAllMessagesFromChannelDmFront`, { params: { myUserId: element.myUserId, notMyUserId: element.notMyUserId } }, (Response: any) => {
                    setMessages((old) => {
                        const temp: MessageInterface[] = [] //{myName:"", notMyName:"", text:"", notMyId:"", isItMine:false, myUserId:0, notMyUserId:0};
                        Response.messages.map((elem: any) => {
                            let name = "";
                            Response.allUsers.map((elem2: any) => {
                                if (elem2.id === elem.userId)
                                    name = elem2.login;
                                return elem2;
                            })
                            temp.push({ myName: name, notMyName: "", text: elem.content, notMyId: "", isItMine: false, myUserId: parseInt(elem.userId), notMyUserId: 0 })
                            return elem;
                        })
                        return temp;
                    })
                })
                putAllMessagesAtEnd();
            })
        })();
    }


    const changeMessage = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        if (e.target.value.length > 5000)
            return;
        setMes(old => {
            const temp = { ...old };
            
            temp.text = e.target.value;
            return temp;
        });
        openMessage.current = (e.target.value === "") ? false : true;
    }

    const handleFormChatSend = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!mes.text.replace(/\s/g, '').length || mes.text.length > 5000)
            return ;
        // console.log(mes);
        mySocket?.emit("messageToServer", mes, (response: any) => {
            setMessages((old) => {
                const temp: MessageInterface[] = (old != undefined) ? ([...old]) : [];
                temp.push(response);
                return temp;
            })
        });
        setMes(old => {
            const temp = ({ ...old });
            temp.text = "";
            return temp;
        });
        openMessage.current = false;
        putAllMessagesAtEnd();
    }

    const textDataFromServer = (arg: any): void => {
        setMessages((old) => {
            // console.log(arg);
            const temp: MessageInterface[] = (old != undefined) ? ([...old]) : [];
            //if (arg.myName === element.notMyName)
            if (arg.myName === element.notMyName)
                temp.push(arg);
            return temp;
        })
        putAllMessagesAtEnd();
    }

    const blockDmUserFrontFromServer = () => {
        setBlockUser((old: any) => {
            const temp = { ...old };
            temp.me = true;
            return temp;
        });
        putAllMessagesAtEnd();
    }

    const unBlockDmUserFrontFromServer = () => {
        setBlockUser((old: any) => {
            const temp = { ...old };
            temp.me = false;
            return temp;
        });
        putAllMessagesAtEnd();
    }

    const onEmojiClick = (e:any , emojiObject:any) => {
        try{
        setMes(old => {
            const temp = { ...old };
            if (emojiObject !== undefined)
                temp.text += emojiObject.emoji;
                openMessage.current = true;
            return temp;
        });
        if (emojiObject != undefined)
        setChosenEmoji(emojiObject);
        }
        catch(error){console.error(error+ "c'est une erreur")}
      };
    
    const [openEmoji, setOpenEmoji] = React.useState<boolean>(false);
    const [chosenEmoji, setChosenEmoji] = React.useState<any>(null);
    const openMessage = React.useRef(false);
    const aboutMessages = React.useRef<any>({});
    const [blockUser, setBlockUser] = React.useState<any>({ me: false, notMe: false });
    const [mes, setMes] = React.useState<MessageInterface>({ myName: element.myName, notMyName: element.notMyName, text: "", notMyId: element.notMySocketId, isItMine: false, myUserId: element.myUserId, notMyUserId: element.notMyUserId });
    const [messages, setMessages] = React.useState<MessageInterface[]>()

    useEffect(() => {
        mySocket?.emit("allMessagesInDm", { params: { myUserId: element.myUserId, notMyUserId: element.notMyUserId } }, (response: any) => {
            const allUsers = response.users;
            const allMessages = response.messages;
            if (allUsers !== null && allUsers !== undefined) {
                for (const user of allUsers) {
                    if (user.id === element.myUserId) {
                        for (const blockBy of user.blockBy) {
                            if (element.notMyUserId === blockBy.id) {
                                setBlockUser((old: any) => { const temp = { ...old }; temp.me = true; return temp; });
                            }
                        }
                        for (const blokin of user.blokin) {
                            if (element.notMyUserId === blokin.id) {
                                setBlockUser((old: any) => { const temp = { ...old }; temp.notMe = true; return temp; });
                            }
                        }
                    }
                }
            }
            // console.log(response);
            if (allMessages === null || allMessages === undefined)
                return;
            let blockName = "";
            const me = allUsers.filter((elem: any) => elem.id === element.myUserId);
            const allMessages2 = allMessages.messages;
            if (allMessages2 === null)
                return;
            setMessages((old) => {
                const temp: MessageInterface[] = [] //{myName:"", notMyName:"", text:"", notMyId:"", isItMine:false, myUserId:0, notMyUserId:0};
                allMessages2.map((elem: any) => {
                    if (me[0].blokin.some((elem2: any) => elem2.id === elem.userId) === false) {
                        let name = "";
                        allUsers?.map((elem2: any) => {
                            if (elem2.id === elem.userId)
                                name = elem2.login;
                            return elem2;
                        })
                        temp.push({ myName: name, notMyName: "", text: elem.content, notMyId: "", isItMine: false, myUserId: parseInt(elem.userId), notMyUserId: 0 })
                    }
                })
                return temp;
            })
        })
    }, []);

    useEffect(() => {
        setMes(old => {
            return { myName: element.myName, notMyName: element.notMyName, text: "", notMyId: element.notMySocketId, isItMine: false, myUserId: element.myUserId, notMyUserId: element.notMyUserId }
        })
    }, [element]);

    useEffect(() => {
        mySocket?.on("private message", textDataFromServer) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("private message", textDataFromServer); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [textDataFromServer])

    useEffect(() => {
        mySocket?.on("blockDmUserFront", blockDmUserFrontFromServer) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("blockDmUserFront", blockDmUserFrontFromServer); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [blockDmUserFrontFromServer])

    useEffect(() => {
        mySocket?.on("unBlockDmUserFront", unBlockDmUserFrontFromServer) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("unBlockDmUserFront", unBlockDmUserFrontFromServer); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [unBlockDmUserFrontFromServer])

    useEffect(() => {
        putAllMessagesAtEnd();
    }, [])

    const arrayMessage = messages?.map((elem2, index) => {
        return (

            <section key={index} className={(elem2.myName === element.myName) ? "array__message__me__right" : "array__message__other__left"}>
                
                <div className="array__message__size">
                {(elem2.myName === element.myName) ?  <></> : <h3 className="array__message__other__left__h3">{elem2.myName}</h3>}
                    <div  className={(elem2.myName === element.myName) ? "array__message__me__right__div" : "array__message__other__left__div"}>
                    

                        <p>{elem2.text}</p>
                    </div>
                </div>
            </section>
        )
    })
    // console.log(messages);

    const allPlayer = (e: React.MouseEvent<HTMLElement>) => {
        setOpenEmoji(old => !old);
    } 

    const PathToProfile = `Profile\\${element.notMyUserId}`

    return (
        <form onSubmit={(e) => { handleFormChatSend(e); }} className="chatbox__form" >
            <div className="chatbox__form__div">
                <div className="form__title">
                    <h1 className="chatbox__form__div__h1">{element.notMyName}</h1>
                    {(blockUser.notMe === true) ?
                        <div className="form__title__block">
                            <Link to={PathToProfile} className="form__title__profiles"><img src={profiles} alt="inviter un joueur a jouer" /></Link>
                            <img className="form__title__pong" onClick={sendInvitationToPlay} src={pong} alt="inviter un joueur a jouer" />
                            <div className="form__title__block__under">
                                <p className="form__title__block__tooltip">unblock {element.notMyName}</p>
                                <img className="form__title__block__unblock__logo" onClick={(e) => { handleUnBlockDm(e); }} src={unblock} alt="unblock" />
                            </div>
                            <img className="form__title__cross" onClick={(e) => { handleClickClearChatbox(e); }} src={cross} alt="effacer la chatbox" />
                        </div> :
                        <div className="form__title__block">
                            <Link to={PathToProfile} className="form__title__profiles"><img src={profiles} alt="inviter un joueur a jouer" /></Link>
                            <img className="form__title__pong" onClick={sendInvitationToPlay} src={pong} alt="inviter un joueur a jouer" />
                            <div className="form__title__block__under">
                                <p className="form__title__block__tooltip">block {element.notMyName}</p>
                                <img className="form__title__block__unblock__logo" onClick={(e) => { handleBlockDm(e); }} src={block} alt="block" />
                            </div>
                            <img className="form__title__cross" onClick={(e) => { handleClickClearChatbox(e); }} src={cross} alt="effacer la chatbox" />
                        </div>
                    }


                </div>
                <div className="chatbox__form__content__text" ref={aboutMessages}>
                    {arrayMessage}
                </div>
                {blockUser.me === false ?
                    <div className="chatbox__form__div__input">
                        <p onClick={allPlayer} className="chatbox__form__div__input__smiley">😀</p>
                        {openEmoji ?
                            <div className="chatbox__form__div__input__div">
                                <Picker onEmojiClick={onEmojiClick} groupVisibility={{symbols:false}}/>
                            </div>
                            : 
                            <></>
                        }
                        <input onChange={(e) => { changeMessage(e); }} value={mes.text} className={openMessage.current ? "chatbox__form__input chatbox__form__input__on" : "chatbox__form__input"} placeholder="Message" type="text" />

                        <button type="submit"><Send className="chatbox__form__send" /></button>
                    </div>
                    :
                    <div>
                        <p>&nbsp;You are blocked from this channel</p>
                    </div>}
            </div>
        </form>
    )
}


export default BoxChat;

   // axios.get(`http://localhost:3000/chat/allMessagesDm`, { params: { myUserId: element.myUserId, notMyUserId: element.notMyUserId } }).then((res) => {
        //     if (res.data.params.messages === null)
        //         return ;
        //     const messagesData = res.data.params.messages.messages;
        //     const usersBlock = res.data.params.messages.user;
        //     if (usersBlock !== undefined){
        //         for (const userBlock of usersBlock){
        //             if (userBlock.id === element.myUserId)
        //             {
        //                 for (const blockBy of userBlock.blockBy){
        //                     if (element.notMyUserId === blockBy.id){
        //                         setBlockUser((old:any) => {const temp = {...old}; temp.me = true; return temp;});
        //                     }
        //                 }
        //                 for (const blokin of userBlock.blokin){
        //                     if (element.notMyUserId === blokin.id){
        //                         setBlockUser((old:any) => {const temp = {...old}; temp.notMe = true; return temp;});
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     if (messagesData === null || messagesData === undefined)
        //         return;
        //     let blockName = "";
        //     const me = usersBlock.filter((elem:any) => elem.id === element.myUserId);
        //     const allUsers = res.data.params.users;
        //     setMessages((old) => {
        //         const temp: MessageInterface[] = [] //{myName:"", notMyName:"", text:"", notMyId:"", isItMine:false, myUserId:0, notMyUserId:0};
        //         messagesData.map((elem: any) => {
        //             if (me[0].blokin.some((elem2:any) =>  elem2.id === elem.userId) === false){
        //                 let name = "";
        //                 allUsers.map((elem2:any) => {
        //                     if (elem2.id === elem.userId)
        //                         name = elem2.login;
        //                     return elem2;
        //                 })
        //                 temp.push({ myName: name, notMyName: "", text: elem.content, notMyId: "", isItMine: false, myUserId: parseInt(elem.userId), notMyUserId:0})
        //             }
        //         })
        //         return temp;
        //     })
        // })