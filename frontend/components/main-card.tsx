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
  const [showInfoPanel, setShowInfoPanel] = React.useState(false);

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center w-full h-full gap-x-5 gap-y-5 relative">
      {/* GroupsCard: pass setShowInfoPanel to Info button */}
      <div className="w-full md:w-2/6 lg:w-1/6 flex items-center justify-center">
        <GroupsCard onInfoClick={() => setShowInfoPanel(true)} />
      </div>
      {/* Tabs */}
      <div className="w-full md:w-4/6 lg:w-3/5 flex items-center justify-center">
        <Tabs defaultValue="chat" className="w-full pb-10 px-4 md:pt-10 md:pb-0 mb:px-0 lg:pb-0 lg:px-0">
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
      {/* Overlay for sm/md */}
      {showInfoPanel && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 lg:hidden">
          <div className="w-5/6 max-w-xs h-[80%] bg-background shadow-xl p-4 relative rounded-2xl border border-border">
            <button
              className="absolute top-2 right-4 text-xl cursor-pointer"
              onClick={() => setShowInfoPanel(false)}
              aria-label="Close"
            >✕</button>
            <GroupInfoCard />
          </div>
        </div>
      )}
    </div>
  );
}

