"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { H4 } from "@/components/ui/typography"
import { JokesCarousel } from "./jokes-carousel"
import { Loader2 } from "lucide-react"
import { User } from "@/models/user"

interface JokesCardProps {
  user: User | null;
}

export function JokesCard({user}: JokesCardProps) {
  const [joke, setJoke] = React.useState<string | null>(null)
  const [jokes, setJokes] = React.useState<string[]>([]);
  const [fetching, setFetching] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const fetchJokes = async () => {
    if (!user) return;
    setFetching(true);
    
    const token = localStorage.getItem("token"); // or use cookies, context, etc.

    if (!token) {
      setFetching(false);
      throw new Error("No token found");
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/jokes/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch jokes");
      }
      const data = await response.json();
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
      <CardContent className="flex-1 pt-4">
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
