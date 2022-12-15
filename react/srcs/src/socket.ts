import io from "socket.io-client";

export const gameSocket = io("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/pong",{autoConnect: false,});
export const mySocket = io("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/chat",{ autoConnect: false });
