"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { H4 } from "@/components/ui/typography"
import { JokesCarousel } from "./jokes-carousel"
import { Loader2 } from "lucide-react"
import { User } from "@/models/user"
import { Group } from "@/models/group"
import { getWeatherMessagesFromGroup } from "@/services/messages"
import { MessageCard } from "./message-card"

interface WeatherCardProps {
  user: User | null;
  group: Group | null;
}

interface WeatherMessage {
  prompt: {
    message: string;
    timestamp: string;
  } | null;
  response: {
    message: string;
    timestamp: string;
  };
}

export function WeatherCard({user, group}: WeatherCardProps) {
  const [weatherMessages, setWeatherMessages] = React.useState<WeatherMessage[]>([]);
  const [fetching, setFetching] = React.useState(true);

  function smoothScrollToBottom(container: HTMLElement, duration = 1000) {
    const start = container.scrollTop;
    const end = container.scrollHeight - container.clientHeight;
    const change = end - start;

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateScroll(startTime: number) {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      container.scrollTop = start + change * easeOutCubic(progress);

      if (progress < 1) {
        requestAnimationFrame(() => animateScroll(startTime));
      }
    }

    requestAnimationFrame((startTime) => animateScroll(startTime));
  }

  const fetchWeatherMessages = async () => {
    if (!user) return;
    setFetching(true);

    try {
      const data = await getWeatherMessagesFromGroup(group?._id || "");
      if (data.length === 0) {
        setFetching(false);
        return;
      }
      console.log("Weather data:", data);
      setWeatherMessages(data);
    } catch (error) {
      console.error("Failed to fetch weather messages:", error);
    } finally {
      setFetching(false);
    }
  }

  React.useEffect(() => {
    fetchWeatherMessages();
  }, [group?._id]);

  React.useEffect(() => {
    const container = document.querySelector(
      ".scroll-container"
    ) as HTMLElement | null;

    if (container) {
      smoothScrollToBottom(container);
    }
  }, [weatherMessages]);

  return (
    <Card className="flex-1 p-4 flex flex-col h-120 md:h-170 lg:h-180">
      <CardHeader>
        <CardTitle><H4>Weather Forecasts History</H4></CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4 md:py-10 lg:py-10 h-[90%] items-center">
        <div
        className={`flex flex-col items-center h-full w-full ${
            weatherMessages.length > 0 ? "justify-start" : "justify-center"
        }`}
        >
        {fetching ? (
            <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
        ) : weatherMessages.length > 0 ? (
            <div className="scroll-container space-y-4 w-full flex flex-col items-end overflow-y-auto px-4">
            {weatherMessages.map((msg, index) => (
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
                    isWeather={true}
                    timestamp={msg.response.timestamp}
                    sender={{
                    name: "system",
                    profilePicture: "",
                    }}
                />
                </div>
            ))}
            </div>
        ) : (
            <span className="text-xl text-gray-500">No Weather forecasts</span>
        )}
        </div>
    </CardContent>

    </Card>
  )
}
