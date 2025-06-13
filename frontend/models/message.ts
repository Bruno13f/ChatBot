export interface Message {
    _id: string;
    timestamp: Date;
    message: string;
    sender: {
      name: string;
      userId: string;
    },
    isJoke: boolean; 
    isWeather: boolean;
    isOpenAI: boolean;
    groupId: string;
}