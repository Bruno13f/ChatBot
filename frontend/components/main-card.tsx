import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { H2 } from "@/components/ui/typography"
import { JokesCard } from "@/components/jokes-card"
import { ChatCard } from "@/components/chat-card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface MainCardProps {
  userId: string
}

export function MainCard({userId}: MainCardProps) {
  return (
     <>
      <Tabs defaultValue="chat" className="w-[95%] md:w-[70%] lg:w-[50%] pb-16 md:pt-10">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">ChatBot</TabsTrigger>
          <TabsTrigger value="jokes">Jokes</TabsTrigger>
        </TabsList>
        <TabsContent value="jokes">
          <JokesCard userId={userId} />
        </TabsContent>
        <TabsContent value="chat">
          <ChatCard userId={userId}/>
        </TabsContent>
      </Tabs>
    </>
  );
}

