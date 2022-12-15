import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactDOM from "react-dom/client";
import io, {Socket} from "socket.io-client";
import BoxChat from "./BoxChat";
import BoxChatChannel from "./BoxChatChannel";
import "../styles/Chat.css";
import { ChatPlayerInterface, Perso, MessageInterface, SocketIdRoom, FormChannelInterface, AllPublicChannels, AllPrivateChannels} from "../interfaces/ChatPlayer";
import { emit } from "process";
import { format } from "path";
import {mySocket } from "../socket"
import {chat_value} from "../chat"
import plus from "../images/plus.svg"
import FormCreateChannel from "./FormCreateChannel"
import { boolean } from "yup";

interface Props{
    name_lala:string
}

//fonction qui sert a ouvrir le menus.
const Chat:React.FC<Props> = ({name_lala}:Props):JSX.Element => {


    const handleClickOpenMenu = (e:React.MouseEvent<HTMLElement>):void => {
        e.preventDefault(); // evite la propagation de l'event.
        setOpenMenu((old) => {
            let lala:boolean = old;
            lala = (lala) ? false : true;
            chat_value.setMessengerOpen(lala);
            return lala;
        })
    }

    const IamBan = (arg:any) => {
        // console.log(arg.nameChan);
        // console.log(arg.banned);
        // console.log(arg.type);
        if (arg.type === "PUBLIC" && arg.banned === true){
            setPublicChannels((old) => {
                let temp:AllPublicChannels[] = [...old];
                temp = temp?.filter((elem) => elem.name !== arg.nameChan)
                return temp;
            })
        }
        if (arg.type === "PUBLIC" && arg.banned === false){
            setPublicChannels((old) => {
                let temp:AllPublicChannels[] = [...old];
                const tmp:AllPublicChannels = {name:arg.nameChan, type:arg.type, open:false}
                temp.push(tmp);
                return temp;
            })
        }
        if (arg.type === "PRIVATE" && arg.banned === true){
            setPrivateChannels((old) => {
                let temp:AllPrivateChannels[] = [...old];
                temp = temp?.filter((elem) => elem.name !== arg.nameChan)
                return temp;
            })
        }
        if (arg.type === "PRIVATE" && arg.banned === false){
            setPrivateChannels((old) => {
                let temp:AllPrivateChannels[] = [...old];
                const tmp:AllPrivateChannels = {name:arg.nameChan, type:arg.type, open:false}
                temp.push(tmp);
                return temp;
            })
        } 
    }

    const IamInvite = (arg:any) => {
        setPrivateChannels((old) => {
            let temp:AllPrivateChannels[] = [...old];
            const tmp:AllPrivateChannels = {name:arg.nameChan, type:arg.type, open:false};
            temp.push(tmp);
            return temp;
        })
    }

    const changePrivateChannel = (arg:any) => {
        // console.log("lalalalalalalalalala");
        // console.log(arg.name);
        if (arg.type === 'PRIVATE'){
            setPrivateChannels((old) => {
                let temp:AllPrivateChannels[] = [...old];
                temp = temp.filter((elem) => elem.name !== arg.name)
                return temp;
            })
        }
        if (arg.type === 'PUBLIC'){
            // console.log("lokoko");
            setPublicChannels((old) => {
                let temp:AllPublicChannels[] = [...old];
                temp = temp.filter((elem) => elem.name !== arg.name)
                return temp;
            })
        }
        // console.log(arg);
    }

    const handleClickOpenPublicChannel = (e:React.MouseEvent<HTMLElement>, temp2:AllPublicChannels):void => {
        e.preventDefault();
        mySocket?.emit("checkIfPublicChannelIsProtectedAndIfIAmOwner", temp2, (response:boolean) => {
            if (response === true){
                setPublicChannels((old) => {
                    let temp:AllPublicChannels[] = [];
                    temp = old.map((elem) => {
                        elem.open = (elem.name === temp2.name) ? true : false;
                        return elem;
                    })
                    return temp;
                })
            }
            else {
                setOpenMenuPassword((old) => temp2.name);
            }
        })
    }

    const changeMessagePassword = (e:React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setPassChan((old) => {
            old = e.target.value;
            return old;
        })

    }

    const handleFormPasswordSend = (e:React.FormEvent<HTMLFormElement>, chan:AllPublicChannels|AllPrivateChannels) => {
        e.preventDefault();
        // console.log(chan);
        mySocket?.emit("checkIfUserHaveRightToConnectPass", {name:chan.name, pass:passChan}, (response:any) => {
            if(chan.type === `PUBLIC`){
                setPublicChannels((old) => {
                    let temp:AllPublicChannels[] = [];
                    temp = old.map((elem) => {
                        elem.open = (elem.name === chan.name) ? true : false;
                        return elem;
                    })
                    return temp;
                })
            }
            if(chan.type === 'PRIVATE'){

                setPrivateChannels((old) => {
                    let temp:AllPrivateChannels[] = [];
                    temp = old.map((elem) => {
                        elem.open = (elem.name === chan.name) ? true : false;
                        return elem;
                    })
                    return temp;
                })
            }
        })
        setPassChan((old) => "");
    }

    const outsidePassword = (e: React.FocusEvent<HTMLInputElement>) => {
        setOpenMenuPassword((old) => "");
    }

    const handleClickOpenPrivateChannel = (e:React.MouseEvent<HTMLElement>, temp2:AllPrivateChannels):void => {
        e.preventDefault();
        mySocket?.emit("checkIfPublicChannelIsProtectedAndIfIAmOwner", temp2, (response:boolean) => {
        if (response === true){
            setPrivateChannels((old) => {
                let temp:AllPrivateChannels[] = [];
                temp = old.map((elem) => {
                    elem.open = (elem.name === temp2.name) ? true : false;
                    return elem;
                })
                return temp;
            })}
        else{
            setOpenMenuPassword((old) => temp2.name);
        }
    })
    }

    // ouvre la fenetre du nouvel utilisateur a qui parler en dm.
    const handleClickOpenChatPlayer = (e:React.MouseEvent<HTMLElement>, temp2:ChatPlayerInterface, num:number):void => {
        e.preventDefault();
        setChatplayer((old) => {
            let temp:ChatPlayerInterface[] = [];
            temp = old.map((elem) => {
                elem.open = (elem.notMyUserId === temp2.notMyUserId) ? true : false;
                return elem;
            })
            chat_value.setChatPlayers(temp);
            return temp;
        })
        setChatplayerOffLine((old) => {
            let temp:ChatPlayerInterface[] = [];
            temp = old.map((elem) => {
                elem.open = (elem.notMyUserId === temp2.notMyUserId) ? true : false;
                return elem;
            })
            return temp;
        })
    }

    const handleClickClearBoxChatChannel = (e:React.MouseEvent<HTMLElement>):void => {
        e.preventDefault();
        setPublicChannels((old) => {
            let temp:AllPublicChannels[] = [];
            temp = old.map((elem) => {
                elem.open = false;
                return elem;
            })
            return temp;
            
        })
        setPrivateChannels((old) => {
            let temp:AllPublicChannels[] = [];
            temp = old.map((elem) => {
                elem.open = false;
                return elem;
            })
            return temp;
        })
    }

    // change ou ferme la page vers qui parler.
    const handleClickClearChatbox = (e:React.MouseEvent<HTMLElement>):void => {
        e.preventDefault();
        setChatplayer((old) => {
            let temp:ChatPlayerInterface[] = [];
            temp = old.map((elem) => {
                elem.open = false;
                return elem;
            })
            return temp;
        })
        setChatplayerOffLine((old) => {
            let temp:ChatPlayerInterface[] = [];
            temp = old.map((elem) => {
                elem.open = false;
                return elem;
            })
            return temp;
        })
    }


    // recupere les donners du create channel et va creer un channel et ferme la page channel;
    const handleChannelAfterSubmit = (infoChannel:FormChannelInterface):void => {
        setOpenCreateChannel(old => false);
        (async () => {
            // await axios.post(`http://localhost:3000/chat/createChannelGroup`,{params:{infoChannel: infoChannel, userId:chatPlayer[0].myUserId, socketId:chatPlayer[0].mySocketId}});
            mySocket.emit("createChannelGroup", {params:{infoChannel: infoChannel, userId:chatPlayer[0].myUserId, socketId:chatPlayer[0].mySocketId}} , (response:boolean) => {
                if (infoChannel.public === true)
                    mySocket.emit("newChannelIsCreatePublic", infoChannel.name);
                if (infoChannel.private === true)
                    mySocket.emit("newChannelIsCreatePrivate", (response:AllPrivateChannels[]) => {
                    setPrivateChannels((old) => response);
                });
            });
        })();
    }

    const closeChannel = () => {
        setOpenCreateChannel(old => false);
    }

    const handleCreateNewChannel = (e:React.MouseEvent<HTMLElement>):void => {
        e.preventDefault();
        setOpenCreateChannel(old => true);
    }


    const someoneIsconnectedToServer = (transitString:any):void => {
        mySocket.emit("giveMeInformationsToPlayers", mySocket.auth, (response:any) => {
             setChatplayer(old => {
                const temp:any = [];
                response.map((elem:any) => {
                    temp.push({mySocketId:elem.mySocketId, myUserId:elem.myUserId, myName:elem.myName, notMySocketId:elem.notMySocketId,
                        notMyName:elem.notMyName, notMyUserId:elem.notMyUserId, connect:true, open:false})
                    return elem;
                })
                return temp;
            })
        })
        mySocket.emit("getAllUsersDmOffLine", (response:any) => {
            setChatplayerOffLine((old) => response);
         })
    }

    const someoneDisconnectedFromServer = (clientId:string) => {
        setChatplayer((old) => {
             const temp = old.filter((elem) => elem.notMySocketId !== clientId);
             return temp;
         });
    }

    const newChannelIsCreatePublicFromServer = (publicChan:AllPublicChannels[]) => {
        setPublicChannels((old) => {
            const temp:AllPublicChannels[] = (old.length === 0) ? [] : ([...old]);
            for (const chan of publicChan)
            {
                const isIn:boolean = old.some((elem) => elem.name === chan.name);
                if (isIn === false)
                {
                    chan.open = false;
                    temp.push(chan);
                }
            }
            return temp;
        });
    }

    const tryToChangeLogin = () => {

    }    

    //const isConnected = React.useRef(mySocket.id);
    const [passChan, setPassChan] = React.useState<string>("");
    const [openMenuPassword, setOpenMenuPassword] = React.useState<string>("");
    const [openMenu, setOpenMenu] = React.useState<boolean>(false)// sert a ouvrir et fermer le menu du chat
    const [openCreateChannel, setOpenCreateChannel] = React.useState<boolean>(false)// sert a ouvrir et fermer le menu du chat

    //aller dans la base de donner pour recuperer toutes les donnees des joueurs qui se sont connecter au moin une fois.
    const [chatPlayer, setChatplayer] = React.useState<ChatPlayerInterface[]>([]/*() =>{return newListChatPlayer()}*/);
    const [chatPlyerOffLine, setChatplayerOffLine] = React.useState<ChatPlayerInterface[]>([]);
    const [publicChannels, setPublicChannels] = React.useState<AllPublicChannels[]>([]);
    const [privateChannels, setPrivateChannels] = React.useState<AllPrivateChannels[]>([]);
    //const [chatPlayerDisconnect, setChatplayerDisconnect] = React.useState<ChatPlayerInterface[]>([]);

    // useEffect(() => {
    //     axios.get("http://localhost:3000/chat/bonjour").then((res) => {
    //         console.log(res);
    //     });
    // }, [])

  

    // useEffect(() => {
    //     setOpenMenu((old) => chat_value.getMessengerOpen())
    // },[])

    // useEffect (() => {
    //     setChatplayer(old => chat_value.getChatPlayers());
    // },[])

    // useEffect (() => {
    //     console.log("reload the paaaaaaaaaaaaaaaaaaaaaaaaaaaaage");
    //     mySocket.emit("giveMeAllChannelPublic", (response:AllPublicChannels[]) => {
    //         setPublicChannels((old) => response);
    //     })
    // }, [])

    // useEffect(() => {
    //     mySocket?.connect();
    // }, [])
    useEffect(() => {
        mySocket.on("connect", () => {
            
            // console.log("this element is not trigger");
            mySocket?.emit("someoneIsConnected");
            mySocket?.emit("giveMeAllChannelPublic", (response:AllPublicChannels[]) => {
                setPublicChannels((old) => {
                    const temp:AllPublicChannels[] = (response.length === 0) ? [] : ([...response]);
                    for (let tmp of temp)
                        tmp.open = false;
                    return response;
                });
            })
            mySocket?.emit("newChannelIsCreatePrivate", (response:AllPrivateChannels[]) => {
                setPrivateChannels((old) => response);
            });
            mySocket?.emit("getAllUsersDmOffLine", (response:any) => {
               setChatplayerOffLine((old) => response);
            })
        })
        mySocket.on("disconnect", () => {
            // console.log("disconnect socket");
            // console.log(mySocket?.connected);
        })
        mySocket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
          });
    },[])

    useEffect(() => {
        mySocket?.on("someoneIsconnectedToServer", someoneIsconnectedToServer) // ajoute une fonction listenner sur l'evenement
        return () => {
        mySocket?.off("someoneIsconnectedToServer", someoneIsconnectedToServer); // suprimme la fonction de listenner sur l'evenement.
        }
    },[someoneIsconnectedToServer])

    useEffect(() => {
        mySocket?.on("someoneDisconnectedFromServer", someoneDisconnectedFromServer) // ajoute une fonction listenner sur l'evenement
        return () => {
        mySocket?.off("someoneDisconnectedFromServer", someoneDisconnectedFromServer); // suprimme la fonction de listenner sur l'evenement.
        }
    },[someoneDisconnectedFromServer])

    useEffect(() => {
        mySocket?.on("newChannelIsCreatePublicFromServer", newChannelIsCreatePublicFromServer) // ajoute une fonction listenner sur l'evenement
        return () => {
        mySocket?.off("newChannelIsCreatePublicFromServer", newChannelIsCreatePublicFromServer); // suprimme la fonction de listenner sur l'evenement.
        }
    },[newChannelIsCreatePublicFromServer])

    useEffect(() => {
        mySocket?.on("IamBan", IamBan) // ajoute une fonction listenner sur l'evenement
        return () => {
        mySocket?.off("IamBan", IamBan); // suprimme la fonction de listenner sur l'evenement.
        }
    },[IamBan])

    useEffect(() => {
        mySocket?.on("IamInvite", IamInvite) // ajoute une fonction listenner sur l'evenement
        return () => {
        mySocket?.off("IamInvite", IamInvite); // suprimme la fonction de listenner sur l'evenement.
        }
    },[IamInvite])

    React.useEffect(() => {
        mySocket?.on("changePrivateChannel", changePrivateChannel) // ajoute une fonction listenner sur l'evenement
        return () => {
            mySocket?.off("changePrivateChannel", changePrivateChannel); // suprimme la fonction de listenner sur l'evenement.
        }
    }, [changePrivateChannel])
    

    React.useEffect(() => {
        mySocket?.on("tryToChangeLogin", tryToChangeLogin)
        return () => {
            mySocket.off("tryToChangeLogin", tryToChangeLogin)
        }
    }, [tryToChangeLogin])

    const arrayListPublicChannel = publicChannels.map((elem, index) => {
        return (
            <div key={index}>
                { (openMenuPassword === elem.name) ?
                <form onSubmit={(e) => {handleFormPasswordSend(e, elem);}} className="chatbox__public__chan__form" key={index} >
                    <input onBlur={outsidePassword} onChange={(e) => {changeMessagePassword(e);}} value={passChan} className="chatbox__public__chan__form__input" autoFocus  placeholder="password" type="text"  />
                    <button className="chatbox__public__chan__form__button" type="submit"></button>
                </form>
                :
                <div onClick={(e) => {handleClickOpenPublicChannel(e, elem);}} className="chatbox__public__chan" key={index}>
                    <p>{elem.type}</p>
                    <p className="chatbox__public__chan__name">{elem.name}</p>
                </div>
                }
            </div>
        )
    })

    const arrayListPrivateChannel = privateChannels.map((elem, index) => {
        return (
            <div key={index}>
                { (openMenuPassword === elem.name) ?
                 <form onSubmit={(e) => {handleFormPasswordSend(e, elem);}} className="chatbox__public__chan__form" key={index} >
                 <input onBlur={outsidePassword} onChange={(e) => {changeMessagePassword(e);}} value={passChan} className="chatbox__public__chan__form__input" autoFocus  placeholder="password" type="text"  />
                 <button className="chatbox__public__chan__form__button" type="submit"></button>
             </form>:
                <div onClick={(e) => {handleClickOpenPrivateChannel(e, elem);}} className="chatbox__private__chan" key={index}>
                    <p>{elem.type}</p>
                    <p className="chatbox__private__chan__name">{elem.name}</p>
                </div>
                }
            </div>
        )
    })

    const arrayListChatPlayer = chatPlayer?.map((elem,index) => {
        return (

            <div onClick={(e) => {handleClickOpenChatPlayer(e, elem, 0);}} className="chatbox__users" key={index}>
                <div className="chatBox__circle__connect"></div>
                <p   className="chat__friends_div__p">{elem.notMyName}</p>
            </div>
        )
    })

    const arrayListChatPlayerOffLine = chatPlyerOffLine?.filter((elem) => {
        if (chatPlayer?.some((elem2) => elem.notMyName === elem2.notMyName) === true)
            return false;
        return true;
    })?.map((elem,index) => {
        return (

            <div onClick={(e) => {handleClickOpenChatPlayer(e, elem, 1);}} className="chatbox__users" key={index}>
                <p   className="chat__friends_div__p">{elem.notMyName}</p>
            </div>
        )
    })

    const windowToCreateChannel = (openCreateChannel) ? <FormCreateChannel handleChannelAfterSubmit={handleChannelAfterSubmit} closeChannel={closeChannel} /> : <></>


    let chatBoxChannelPublicKey:number;
    let chatBoxChannelPrivateKey:number;

    const chatBoxChannelPrivate = privateChannels.filter((elem, index) => {
        if (elem.open === true)
            chatBoxChannelPrivateKey = index;
        return  (elem.open === true) ? true : false;
        }).map((elem) => {
        return (<BoxChatChannel element={elem} handleClickClearBoxChatChannel={handleClickClearBoxChatChannel} key={chatBoxChannelPrivateKey} />)
    })

    const chatBoxChannelPublic = publicChannels.filter((elem, index) => {
        if (elem.open === true)
            chatBoxChannelPublicKey = index;
        return  (elem.open === true) ? true : false;
        }).map((elem) => {
        return (<BoxChatChannel element={elem} handleClickClearBoxChatChannel={handleClickClearBoxChatChannel} key={chatBoxChannelPublicKey} />)
    })

    const chatboxElem = chatPlayer.filter(elem => elem.open === true).map((elem, index) => {
        return (<BoxChat element={elem} handleClickClearChatbox={handleClickClearChatbox} mySocket={mySocket} myName={name_lala} key={String(elem.notMyUserId)}/>)
    });

    const chatboxElemOff = chatPlyerOffLine.filter(elem => elem.open === true).map((elem, index) => {
        return (<BoxChat element={elem} handleClickClearChatbox={handleClickClearChatbox} mySocket={mySocket} myName={name_lala} key={String(elem.notMyUserId)}/>)
    });


    return (
        <div>
        <section  className={(!openMenu) ? "chat__div" : "chat__div2"}>
            <div onClick={(e) => {handleClickOpenMenu(e);}} className="chat__div__open__menu">
                <p>Messenger</p>
            </div>
            <div className={(!openMenu) ? "none" : ""}>
                <div className="chat__friends">
                    <h2 className="chat__friends__title">Users</h2>
                    <div className="chat__friends_div">
                        {arrayListChatPlayer}
                        {arrayListChatPlayerOffLine}
                    </div>
                </div>
                <div>
                    <h2 className="chat__friends__group">Channels</h2>
                    <div className="chat__create__channel" onClick={(e) => {handleCreateNewChannel(e);}}>
                        <h3 className="chat__create__channel__title" >Create new channel</h3>
                        <img src={plus} alt="plus" className="plus"/>
                    </div>
                    <div className="chat__channel__public__div">
                        {arrayListPublicChannel}
                    </div>
                    <div className="chat__channel__private__div">
                        {arrayListPrivateChannel}
                    </div>
                </div>
            </div>
        </section>
        {windowToCreateChannel}
        {chatboxElem}
        {chatboxElemOff}
        {chatBoxChannelPublic}
        {chatBoxChannelPrivate}
        </div>
    )
};

export default Chat;





    // faire un appel a la base de donner pour recuperer les gens qui sont dans la base de donner
    // en atendant trouver un superfluge pour creer un nouvel utilisateur a chaque foi que celui ci se
    // connecte au site.

    // const newListChatPlayer = ():ChatPlayerInterface[] => {
    //     const temp:ChatPlayerInterface[] = [];
    //     for (let i = 1; i < 3; i++)
    //     {
    //         temp.push({id:i, nickname:`${name_lala}${i}`, connect:true, open:false});
    //     }
    //     return temp;
    // }



/// create array de message a envoyer au server
    //  const [messages, setMessages] = React.useState<MessageInterface[]>()
///




    // useEffect(() => {
    //     mySocket.on("connect", () => {
    //         // console.log(mySocket.connected);
    //         console.log(mySocket.auth);
    //         const lala:any = mySocket.auth;
    //         mySocket.emit("someoneIsConnected", lala.login);
    //     })
    //     mySocket.on("disconnect", () => {
    //         // console.log(mySocket.connected);
    //     })
    // },[])







        // setChatplayer((old) => {
        //     const temp = [...old];
        //     allUsers.map((elem) => {
        //         elem.
        //     })
        //     return temp;
        // })
        // const rooms:string[] = [];
        // repenser la de faire
        // setChatplayer((old) => {
        //     const temp = [...old];
        //     let i = temp.length;
        //     console.log("je rentre");
        //     if (i === 0)
        //     {
        //         while (allPlayer[i].clientId !== mySocket.id)
        //         {
        //             console.log(allPlayer[i].name + name_lala)
        //             temp.push({id:allPlayer[i].clientId, nickname:`${allPlayer[i].name}`, connect:true, open:false, room:(allPlayer[i].name + name_lala)});
        //             // rooms.push(allPlayer[i].name + name_lala);
        //             i++;
        //         }
        //     }
        //     console.log(temp.length + ".............."+ allPlayer.length);
        //     for (i = temp.length ; i < allPlayer.length; i++)
        //     {
        //         console.log(allPlayer[i]);
        //         if (allPlayer[i].clientId === mySocket.id)
        //         {
        //              temp.push({id:allPlayer[i].clientId, nickname:`${allPlayer[i].name}`, connect:true, open:false, room:name_lala});
        //             //  rooms.push(name_lala+"");
        //         }
        //         else
        //         {
        //             console.log(name_lala + allPlayer[i].name)
        //             temp.push({id:allPlayer[i].clientId, nickname:`${allPlayer[i].name}`, connect:true, open:false, room:(name_lala + allPlayer[i].name)})
        //             // rooms.push(name_lala + allPlayer[i].name);
        //         }
        //     }            
        //     return temp;
        // })
        // mySocket.emit('joinPrivateRoom',rooms);
        // console.log(`${rooms} est connecter au server`);







        // /// state pour savoir si la socket est toujour connecter
        // const [isConnected, setIsConnected] = useState<boolean|undefined>(mySocket.connected);







// useEffect(() => {
//     mySocket?.on('connect', () => setIsConnected(true));
//     mySocket?.on('disconnect', () => setIsConnected(false));
//     console.log("lalalili")
//     // if (isConnected)
//     // {
//     //     mySocket.emit("connection", mySocket, message.name);
//     //     console.log("lala");
//     // }
//     return () => {
//         mySocket?.off('connect');
//         mySocket?.off('disconnect');
//     };
    
// }, []);










    /// fonction qui ressoi de la donner du server

    // const messageReceive = (message:string):void => {
    //     setMessages ((old) => {
    //         const temp:string[] = old != undefined ? ([...old]) : [];
    //         temp.push(message);
    //         return temp;
    //     })
    //     console.log(message);
    // }






/// create instance socket
    //initialisation de la socket 
    //trouver un bon endroit pour faire l'initialisation de la socket
    //La faire des que les perssonne se connecte au site internet.
    // impossible de mettre la socket dans un state car au si nn a chaque rerender de la page un nouvel
    // socket prendra la place de l'ancienne et om perd l'ancienne socket qui n'est pas disconnect
    // const [mySocket, setMySocket] = React.useState<Socket>()
/// 
    /// state pour savoir si la socket est toujour connecter
    // const [isConnected, setIsConnected] = useState<boolean|undefined>(mySocket?.connected);








    // useEffect(() => {
    //     mySocket?.on('connect', () => {
    //       setIsConnected(true);
    //       console.log('lala');
    //     });
    
    //     mySocket?.on('disconnect', () => {
    //       setIsConnected(false);
    //     });
    
    //     return () => {
    //       mySocket?.off('connect');
    //       mySocket?.off('disconnect');
    //     };
    //   }, [setMySocket]);


    // useEffect(() => {
    //     mySocket?.on("connect", (arg?:boolean) => {
    //         console.log(arg)
    //     })
    // }, [mySocket?.connected])

    // console.log(mySocket);
/// tant que messageReceive ne change pas
    //    useEffect(() => {
    //     mySocket?.on("messageToClient", messageReceive)
    //     return () => {
    //         mySocket?.off("messageToClient", messageReceive);
    //     }
    // }, [messageReceive])