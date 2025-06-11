"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCard } from "@/components/message-card"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getJokeSocket, disconnectJokeSocket } from "@/lib/socket-jokes"
import { getWeatherSocket, disconnectWeatherSocket } from "@/lib/socket-weather"

interface ChatCardProps {
  userId: string
}

export function ChatCard({userId}: ChatCardProps) { 

  const [messages, setMessages] = React.useState<Array<{text: string, sender: string, isWeather: boolean}>>([]);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const validDays = ['1', '3', '7', '14', '16'];
  console.log("userId", userId);

  React.useEffect(() => {
    const fetchMessages = async () => {
      setFetching(true);
      try {
        
        const token = localStorage.getItem("token"); // or use cookies, context, etc.

        if (!token) {
          setFetching(false);
          throw new Error("No token found");
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/messages/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
  
        // Format messages for our new structure
        const formattedMessages = data.map((msgObj: { message: string, sender: string, isWeather: boolean}) => ({
          text: msgObj.message,
          sender: msgObj.sender,
          isWeather: msgObj.isWeather,
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setFetching(false);
      }
    };
  
    fetchMessages();

    const jokeSocket = getJokeSocket();
    
    jokeSocket.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    const jokeWeather = getWeatherSocket();
    
    jokeWeather.on('message', (newMessage) => {
      if (newMessage.sender === 'system') {
        // Process the array of temperatures
        const temperatures = newMessage.text;
        
        const temperaturesText = temperatures.join(',')
    
        // Add the processed message to the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: temperaturesText, sender: 'system', isWeather: true},
        ]);
      }
    });
    
    return () => {
      jokeSocket.off('message');
      jokeWeather.off('message');
      disconnectJokeSocket();
      disconnectWeatherSocket();
    };
  }, []);
  
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() === "") return;
  
    setLoading(true);

    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const messageTrim = message.trim().toLowerCase();
  
      const success = await saveMessageToAPI(message, "user");

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

      if (parts[0] === ("!joke")) {

        const validCategories = ["programming", "misc", "dark", "pun", "spooky", "christmas"];

        if (parts[1] && !validCategories.includes(parts[1])) {
          const newMessage = `**⚠️ Invalid Category:** Available categories are programming, misc, dark, pun, spooky, christmas.`;
          await saveMessageToAPI(newMessage, "system");
          setLoading(false);
          return;
        }

        const socket = getJokeSocket();
  
        // Emit message to server
        socket.emit("message", { text: message, sender: "user", token, userId});
  
        // Wait for the joke response from the socket before enabling the button
        socket.on("message", (newMessage) => {
          if (newMessage.sender === "system") {
            setLoading(false);
          }
        });
  
        return;
      }

      if (parts[0] === ("!weather")) {

        if (!parts[1] || !parts[2]) {
          const newMessage = "**⚠️ Usage:** `!weather <city> <days>`";
          await saveMessageToAPI(newMessage, "system");
          setLoading(false);
          return;
        }

        if (!validDays.includes(parts[2])){
          const newMessage = "**⚠️ Invalid Days:** 1, 3, 7, 14, 16";
          await saveMessageToAPI(newMessage, "system");
          setLoading(false);
          return;
        }

        const socket = getWeatherSocket();

        socket.emit("message", { text: message, sender: "user", token, userId });

        socket.on("message", (newMessage) => {
          if (newMessage.sender === "system") {
            setLoading(false);
          }
        });

        return;
      }

      if (messageTrim.startsWith("!")) {
        const newMessage =
          `🤖 **Unknown Command:**\n\n` +
          `Type \`!help\` to see available commands.`;
  
        await saveMessageToAPI(newMessage, "system");
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      if (message.trim() !== "!joke") {
        setLoading(false);
      }
    }
  };

  const saveMessageToAPI = async (message:string, sender: string) => {
    if (!message.trim()) return;

    const token = localStorage.getItem("token"); // or use cookies, context, etc.

    if (!token) {
      throw new Error("No token found");
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, message, sender, isJoke: "false", isWeather: "false"}), // Include sender and default isJoke
      });
  
      if (!response.ok) {
        return false;
      }
  
      setMessages((prevMessages) => [...prevMessages, { text: message, sender, isWeather: false}]);
      setMessage("");
      return true;
    } catch (error) {
      return false;
    }
  };
  

  return (
    <Card className="flex-1 p-4 flex flex-col h-[450px]">
      <CardContent className="flex-1 flex flex-col items-center relative w-full">
        <div className={`absolute top-0 left-0 right-0 h-[320px] w-full overflow-y-auto px-4 flex justify-center ${fetching ? "items-center" : "items-start"}`}>
          {fetching ? (
            <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
          ) : (
            <div className="space-y-4 w-full flex flex-col items-end relative min-h-[300px]">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <MessageCard 
                    key={index} 
                    message={msg.text} 
                    isSystem={msg.sender === 'system'}
                    isWeather={msg.isWeather} 
                  />
                ))
              ) : (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 text-center">
                  Type !help to get started!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid w-full gap-2">
          <Textarea className="resize-none w-full" text={message} setText={setMessage} onEnterPress={sendMessage} />
          <div className="flex justify-center">
            <Button onClick={sendMessage} className="w-30 cursor-pointer" disabled={loading}>
              {loading ? <Loader2 className="animate-spin text-gray-500 w-6 h-6" /> : "Send Message"}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}