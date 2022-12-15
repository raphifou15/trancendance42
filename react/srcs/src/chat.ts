import { ChatPlayerInterface } from "./interfaces/ChatPlayer";

export const chat_value = (() => {
    let messengerOpen:boolean = false;
    let chatPlayers:ChatPlayerInterface[] = [];

    const getMessengerOpen = () => {
      return messengerOpen;
    };
    const getChatPlayers = () => {
        return chatPlayers;
    };

    const setMessengerOpen = (value:boolean) => {
      messengerOpen = value;     
    };

    const setChatPlayers = (value:ChatPlayerInterface[]) => {
        chatPlayers = [...value];
    }

    return {
        getMessengerOpen: getMessengerOpen,
        getChatPlayers: getChatPlayers,
        setMessengerOpen: setMessengerOpen,
        setChatPlayers:setChatPlayers
    }
})()