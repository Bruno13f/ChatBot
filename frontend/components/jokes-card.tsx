"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { H4 } from "@/components/ui/typography"
import { JokesCarousel } from "./jokes-carousel"
import { Loader2 } from "lucide-react"
import { User } from "@/models/user"
import { Group } from "@/models/group"
import { getJokesOfGroup } from "@/services/messages"

interface JokesCardProps {
  user: User | null;
  group: Group | null;
}

export function JokesCard({user, group}: JokesCardProps) {
  const [joke, setJoke] = React.useState<string | null>(null)
  const [jokes, setJokes] = React.useState<string[]>([]);
  const [fetching, setFetching] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const fetchJokes = async () => {
    if (!user) return;
    setFetching(true);

    try {
      const data = await getJokesOfGroup(group?._id || "");
      if (data.length === 0) {
        setFetching(false);
        return;
      }
      const formattedJokes = data.map((jokeObj: { message: string }) => jokeObj.message);
      setJokes(formattedJokes)
    } catch (error) {
      console.error("Failed to fetch jokes:", error);
    } finally {
      setFetching(false);
    }
  }

  React.useEffect(() => {
    fetchJokes();
  }, []);

  return (
    <Card className="flex-1 p-4 flex flex-col h-100 md:h-170 lg:h-180">
      <CardHeader>
        <CardTitle><H4>History of Jokes</H4></CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0 md:pt-4 lg:pt-4 h-full">
        {fetching ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
        </div>
      ) : jokes.length === 0 && !fetching ? (
        <div className="flex justify-center items-center h-full">
          <span className="text-xl text-gray-500">No jokes available</span>
        </div>
      ) : (
        <JokesCarousel jokes={jokes} />
      )}

      </CardContent>
    </Card>
  )
}
