"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCard } from "@/components/message-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Group } from "@/models/group";
import { H4 } from "@/components/ui/typography";
import { disconnectMiddlewareSocket, getMiddlewareSocket, initMiddlewareSocket } from "@/lib/socket-middleware";
import { getMessagesOfGroup } from "@/services/messages";
import { Message } from "@/models/message";
import { postMessage } from "@/services/messages";
import { User } from "@/models/user";

interface ChatCardProps {
  user: User | null;
  group: Group | null;
}

export function ChatCard({ user, group }: ChatCardProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const validDays = ["1", "3", "7", "14", "16"];
  const isFirstRender = React.useRef(true);

  const noGroupSelected = !group;

  // Effect for initial mount and socket setup
  React.useEffect(() => {
    const middlewareSocket = initMiddlewareSocket((message) => {
      // Add the message to the messages list
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: Date.now().toString(),
          timestamp: new Date(),
          message: message.text,
          sender: { 
            name: "system", 
            userId: "system",
            profilePicture: "" 
          },
          isJoke: message.isJoke,
          isWeather: message.isWeather,
          isOpenAI: message.isOpenAI,
          groupId: group?._id || ""
        }
      ]);
      setLoading(false); // Stop loading when we receive the response
    });
    
  }, []); // Empty dependency array means this runs on mount

  // Effect for fetching messages when group changes
  React.useEffect(() => {
    const fetchMessages = async () => {
      if (!group) {
        setFetching(false);
        return;
      }

      setFetching(true);
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setFetching(false);
          throw new Error("No token found");
        }

        const data = await getMessagesOfGroup(group._id);
        console.log("Messages fetched from API: ", data);

        // Format messages for our new structure
        const formattedMessages = data.map((msgObj: Message) => ({
          _id: msgObj._id,
          timestamp: msgObj.timestamp,
          message: msgObj.message,
          sender: msgObj.sender,
          isJoke: msgObj.isJoke,
          isWeather: msgObj.isWeather,
          isOpenAI: msgObj.isOpenAI,
          groupId: msgObj.groupId
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setFetching(false);
      }
    };

    // Fetch messages on mount
    fetchMessages();

    // const jokeSocket = getJokeSocket();

    // jokeSocket.on("message", (newMessage: Message) => {
    //   setMessages((prevMessages) => [...prevMessages, newMessage]);
    // });

    // const jokeWeather = getWeatherSocket();

    // jokeWeather.on("message", (newMessage: Message) => {
    //   if (newMessage.sender.name === "system") {
    //     // Process the array of temperatures
    //     const temperatures = newMessage.message;

    //     const temperaturesText = temperatures.join(",");

    //     // Add the processed message to the chat
    //     setMessages((prevMessages) => [
    //       ...prevMessages,
    //       {
    //         _id: Date.now().toString(),
    //         timestamp: new Date(),
    //         message: temperaturesText,
    //         sender: { name: "system", userId: "system" },
    //         isJoke: false,
    //         isWeather: true,
    //         isOpenAI: false,
    //         groupId: group?._id || ""
    //       }
    //     ]);
    //   }
    // });

    // return () => {
    //   jokeSocket.off("message");
    //   jokeWeather.off("message");
    //   disconnectJokeSocket();
    //   disconnectWeatherSocket();
    // };

  }, [group?._id]); // Only depend on the group ID

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() === "") return;
    if (!user) return;

    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const messageTrim = message.trim().toLowerCase();
      const middlewareSocket = getMiddlewareSocket();

      const success = await saveMessageToAPI(message, user.name);

      if (!success) {
        setLoading(false);
        return;
      }

      if (messageTrim.startsWith("!") && middlewareSocket) {
        middlewareSocket.emit("message", {
          text: message,
          sender: user.name,
          userId: user._id,
          groupId: group?._id,
          token,
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    }
  };

  const saveMessageToAPI = async (message: string, sender: string) => {
    if (!message.trim()) return;
    if (!user) return;

    const token = localStorage.getItem("token"); // or use cookies, context, etc.

    if (!token) {
      throw new Error("No token found");
    }


    try {
      const data = await postMessage(group!._id, message, sender, false, false, false, user._id);

      setMessages((prevMessages) => [
        ...prevMessages,
        { _id: data._id, timestamp: data.timestamp, message: data.message, sender: data.sender, isJoke: data.isJoke, isWeather: data.isWeather, isOpenAI: data.isOpenAI, groupId: data.groupId },
      ]);
      setMessage("");
      return true;
    } catch (error) {
      console.error("Error saving message to API:", error);
      return false;
    }
  };

  return (
    <Card className="flex-1 p-4 flex flex-col h-100 md:h-170 lg:h-180">
      <CardHeader>
        <CardTitle>
          <H4>{noGroupSelected ? "" : group.name}</H4>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center relative w-full">
        <div
          className={`absolute top-0 left-0 right-0 h-full w-full overflow-y-auto px-4 flex justify-center ${
            fetching ? "items-center" : "items-start"
          }`}>
          {fetching ? (
            <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
          ) : (
            <div className="space-y-4 w-full flex flex-col items-end relative min-h-full">
              {noGroupSelected ? (
                <div className="flex items-center justify-center w-full h-full absolute inset-0">
                  <span className="text-gray-500 text-center">
                    Please select a group to start chatting.
                  </span>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, index) => (
                  <MessageCard
                    key={index}
                    message={msg.message}
                    isFromOwner={msg.sender.userId === user?._id}
                    isWeather={msg.isWeather}
                    timestamp={msg.timestamp}
                    sender={msg.sender}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center w-full h-full absolute inset-0">
                  <span className="text-gray-500 text-center">
                    Type !help to get started!
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid w-full gap-2">
          <Textarea
            className="resize-none w-full"
            text={message}
            setText={setMessage}
            onEnterPress={sendMessage}
            disabled={loading || !group?._id}
          />
          <div className="flex justify-center">
            <Button
              onClick={sendMessage}
              className="w-30 cursor-pointer"
              disabled={loading || !group?._id}>
              {loading ? (
                <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
