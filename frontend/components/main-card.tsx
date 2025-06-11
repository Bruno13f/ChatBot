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
import { Group, GroupIcon } from "lucide-react"
import { GroupsCard } from "./groups-card"
import { GroupInfoCard } from "./group-info-card"

interface MainCardProps {
  userId: string
}

export function MainCard({userId}: MainCardProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center w-full h-full gap-x-5 gap-y-5">
      {/* GroupsCard: at the top on small/medium, left on large */}
      <div className="w-full md:w-2/6 lg:w-1/6 flex items-center justify-center">
        <GroupsCard/>
      </div>
      {/* Tabs: always visible, full width on small/medium screens */}
      <div className="w-full md:w-4/6 lg:w-3/5 flex items-center justify-center">
        <Tabs defaultValue="chat" className="w-full pb-16 md:pt-10">
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
      </div>
      {/* GroupInfoCard: only visible on large screens */}
      <div className="hidden lg:flex w-1/6 items-center justify-center">
        <GroupInfoCard/>
      </div>
    </div>
  );
}

