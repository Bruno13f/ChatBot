import * as React from "react"

import { JokesCard } from "@/components/jokes-card"
import { ChatCard } from "@/components/chat-card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { GroupsCard } from "@/components/groups-card"
import { GroupInfoCard } from "@/components/group-info-card"

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
        <Tabs defaultValue="chat" className="w-full md:pt-10">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">ChatBot</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="jokes">Jokes</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
          </TabsList>
          <TabsContent value="jokes">
            <JokesCard userId={userId} />
          </TabsContent>
          <TabsContent value="chat">
            <ChatCard userId={userId}/>
          </TabsContent>
          <TabsContent value="openai">
            <JokesCard userId={userId} />
          </TabsContent>
          <TabsContent value="weather">
            <JokesCard userId={userId} />
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

