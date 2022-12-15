import { Socket } from 'socket.io';
export interface ListUsersConnected {
    clientId:String;
    name:String;
  }

export interface Info{
  mySocketId:String;
  myUserId:Number;
  myName:String;
  notMySocketId:String;
  notMyName:String;
  notMyUserId:Number;
}

export interface Perso{
  name:String;
  socketId:string[];
}

export interface allUsersAuthorize{
  userId:number;
  nameChannel:string[];
}

export interface AllPublicChannels{
  name:string;
  type:string;
}

export interface AllPrivateChannels{
  name:string;
  type:string;
}

export interface MessageChannelInterface{
  nameChannel:string;
  nameUser:string;
  text:string;
}

// export interface ListUsersConnected {
//   clientId:string;
//   name:string;
// }

// export interface AllInfos{
//   id:string;
//   name:string;
//   connect:boolean;
//   open:boolean;
//   room:string;
// }


// export interface SocketIdRoom{
//   indexListUser:number;
//   name:string;
//   socketId:string;
//   rooms:string[];
// }