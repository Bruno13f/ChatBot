"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { H3 } from "@/components/ui/typography"
import { JokesCarousel } from "./jokes-carousel"
import { Loader2 } from "lucide-react"

interface JokesCardProps {
  userId: string
}

export function JokesCard({userId}: JokesCardProps) {
  const [joke, setJoke] = React.useState<string | null>(null)
  const [jokes, setJokes] = React.useState<string[]>([]);
  const [fetching, setFetching] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const fetchJokes = async () => {
    setFetching(true);
    
    const token = localStorage.getItem("token"); // or use cookies, context, etc.

    if (!token) {
      setFetching(false);
      throw new Error("No token found");
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/jokes/${userId}`, {
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
    <Card className="flex-1 p-4 flex flex-col h-[450px]">
      <CardContent className="flex-1">
        <H3>History of Jokes</H3>
        {fetching ? (
        <div className="flex justify-center items-center h-[240px]">
          <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
        </div>
      ) : jokes.length === 0 && !fetching ? (
        <div className="flex justify-center items-center h-[240px]">
          <span className="text-xl text-gray-500">No jokes available</span>
        </div>
      ) : (
        <JokesCarousel jokes={jokes} />
      )}

      </CardContent>
    </Card>
  )
}
