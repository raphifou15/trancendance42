export interface ChatPlayerInterface {
    mySocketId: string;
    myUserId: number;
    myName: string;
    notMySocketId: string;
    notMyName: string;
    notMyUserId: number;
    connect: boolean;
    open: boolean;
}

export interface SocketIdRoom{
    indexListUser: number;
    name: string;
    socketId: string;
    rooms: string[];
  }


export interface AllPublicChannels{
  name: string;
  type: string;
  open: boolean;
}

export interface AllPrivateChannels{
  name: string;
  type: string;
  open: boolean;
}


// pour l'instant en attendant d'avoir de vrais donner ou que je comprenne mieu comment fonctionne
// tout le truc.
export interface MessageInterface{
    myName: string;
    notMyName: string;
    text: string;
    notMyId: string
    isItMine: boolean;
    myUserId: number;
    notMyUserId: number;
}

export interface Perso{
    name: String;
    socketId: String;
  }

export interface FormChannelInterface{
  private: boolean;
  public: boolean;
  protected: boolean;
  password: string;
  password2: string,
  name: string;
}

export interface MessageChannelInterface{
  nameChannel: string;
  nameUser: string;
  text: string;
}