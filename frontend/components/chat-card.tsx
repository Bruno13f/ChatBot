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
    const middlewareSocket = initMiddlewareSocket();
    
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

  }, [group]);

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

      const success = await saveMessageToAPI(message, user.name);

      if (!success) {
        setLoading(false);
        return;
      }

      if (messageTrim === "!help") {
        const newMessage =
          `🤖 **Available Commands:**\n\n` +
          `**JOKES 🤣**\n` +
          `- \`!joke\` → Get a random joke\n\n` +
          `- \`!joke category\` → Get a joke from a specific category\n\n` +
          `  **Available categories:** programming, misc, dark, pun, spooky, christmas\n\n` +
          `  **Example:** \!joke programming\n\n` +
          `**WEATHER ⛅**\n` +
          `- \`!weather city days\` → Get a weather report for a city for the next specified number of days\n\n` +
          `  **Days:** 1, 3, 7, 14, 16\n\n` +
          `  **Example:** \`!weather London 3\``;

        await saveMessageToAPI(newMessage, "system");
        setLoading(false);
        return;
      }

      const parts = messageTrim.split(" ");

      // if (parts[0] === "!joke") {
      //   const validCategories = [
      //     "programming",
      //     "misc",
      //     "dark",
      //     "pun",
      //     "spooky",
      //     "christmas",
      //   ];

      //   if (parts[1] && !validCategories.includes(parts[1])) {
      //     const newMessage = `**⚠️ Invalid Category:** Available categories are programming, misc, dark, pun, spooky, christmas.`;
      //     await saveMessageToAPI(newMessage, "system");
      //     setLoading(false);
      //     return;
      //   }

      //   const socket = getJokeSocket();

      //   // Emit message to server
      //   socket.emit("message", {
      //     text: message,
      //     sender: "user",
      //     token,
      //     userId,
      //   });

      //   // Wait for the joke response from the socket before enabling the button
      //   socket.on("message", (newMessage) => {
      //     if (newMessage.sender === "system") {
      //       setLoading(false);
      //     }
      //   });

      //   return;
      // }

      // if (parts[0] === "!weather") {
      //   if (!parts[1] || !parts[2]) {
      //     const newMessage = "**⚠️ Usage:** `!weather <city> <days>`";
      //     await saveMessageToAPI(newMessage, "system");
      //     setLoading(false);
      //     return;
      //   }

      //   if (!validDays.includes(parts[2])) {
      //     const newMessage = "**⚠️ Invalid Days:** 1, 3, 7, 14, 16";
      //     await saveMessageToAPI(newMessage, "system");
      //     setLoading(false);
      //     return;
      //   }

      //   const socket = getWeatherSocket();

      //   socket.emit("message", {
      //     text: message,
      //     sender: "user",
      //     token,
      //     userId,
      //   });

      //   socket.on("message", (newMessage) => {
      //     if (newMessage.sender === "system") {
      //       setLoading(false);
      //     }
      //   });

      //   return;
      // }

      // if (messageTrim.startsWith("!")) {
      //   const newMessage =
      //     `🤖 **Unknown Command:**\n\n` +
      //     `Type \`!help\` to see available commands.`;

      //   await saveMessageToAPI(newMessage, "system");
      //   setLoading(false);
      //   return;
      // }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      if (message.trim() !== "!joke") {
        setLoading(false);
      }
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
                    isSystem={msg.sender.name === "system"}
                    isWeather={msg.isWeather}
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
          />
          <div className="flex justify-center">
            <Button
              onClick={sendMessage}
              className="w-30 cursor-pointer"
              disabled={loading}>
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
