export interface Message {
    _id: string;
    timestamp: Date;
    message: string;
    sender: {
      name: string;
      userId: string;
      profilePicture: string;
    },
    isJoke: boolean; 
    isWeather: boolean;
    isOpenAI: boolean;
    groupId: string;
}