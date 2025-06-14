"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { H4 } from "@/components/ui/typography"
import { JokesCarousel } from "./jokes-carousel"
import { Loader2 } from "lucide-react"
import { User } from "@/models/user"
import { Group } from "@/models/group"
import { getOpenAIMessagesOfGroup } from "@/services/messages"
import { MessageCard } from "./message-card"

interface OpenAICardProps {
  user: User | null;
  group: Group | null;
}

interface OpenAIMessage {
  prompt: {
    message: string;
    timestamp: string;
  } | null;
  response: {
    message: string;
    timestamp: string;
  };
}

export function OpenAICard({user, group}: OpenAICardProps) {
  const [openAIMessages, setOpenAIMessages] = React.useState<OpenAIMessage[]>([]);
  const [fetching, setFetching] = React.useState(true);

  const fetchOpenAIMessages = async () => {
    if (!user) return;
    setFetching(true);

    try {
      const data = await getOpenAIMessagesOfGroup(group?._id || "");
      if (data.length === 0) {
        setFetching(false);
        return;
      }
      console.log("OpenAI data:", data);
      setOpenAIMessages(data);
    } catch (error) {
      console.error("Failed to fetch OpenAI messages:", error);
    } finally {
      setFetching(false);
    }
  }

  React.useEffect(() => {
    fetchOpenAIMessages();
  }, [group?._id]);

  return (
    <Card className="flex-1 p-4 flex flex-col h-100 md:h-170 lg:h-180">
      <CardHeader>
        <CardTitle><H4>OpenAI History</H4></CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center relative w-full">
        <div className="scroll-container absolute top-0 left-0 right-0 h-full w-full overflow-y-auto px-4 flex justify-center">
          {fetching ? (
            <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
          ) : openAIMessages.length > 0 ? (
            <div className="space-y-4 w-full flex flex-col items-end relative min-h-full">
              {openAIMessages.map((msg, index) => (
                <div key={index} className="w-full space-y-2">
                  {msg.prompt && (
                    <MessageCard
                      message={msg.prompt.message}
                      isFromOwner={true}
                      isWeather={false}
                      timestamp={msg.prompt.timestamp}
                      sender={{
                        name: user?.name || "User",
                        profilePicture: user?.profilePicture || "",
                      }}
                    />
                  )}
                  <MessageCard
                    message={msg.response.message}
                    isFromOwner={false}
                    isWeather={false}
                    timestamp={msg.response.timestamp}
                    sender={{
                      name: "OpenAI",
                      profilePicture: "",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full absolute inset-0">
              <span className="text-gray-500 text-center">
                No OpenAI interactions yet.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
