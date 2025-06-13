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
import { CardWidget } from "./card-widget"
import { useEffect } from "react"
import { getGroups } from "@/services/groups"
import { Group } from "@/models/group"

interface MainCardProps {
  userId: string
}

export function MainCard({userId}: MainCardProps) {
  const [showInfoPanel, setShowInfoPanel] = React.useState(false);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { // senao da fetch 2 vezes
      isFirstRender.current = false;
      const fetchGroups = async () => {
        const groups = await getGroups();
        setGroups(groups);
        console.log(groups);
      }
      fetchGroups();
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center w-full h-full gap-x-5 gap-y-5 relative">
      {/* GroupsCard: pass setShowInfoPanel to Info button */}
      <div className="w-full md:w-2/6 lg:w-1/6 flex items-center justify-center px-4 mb:px-0 lg:px-0">
        <GroupsCard onInfoClick={() => setShowInfoPanel(true)} groups={groups} />
      </div>
      {/* Tabs */}
      <div className="w-full md:w-4/6 lg:w-3/5 flex items-center justify-center h-full">
        <Tabs defaultValue="chat" className="w-full h-full pb-10 px-4 md:pt-10 md:pb-0 mb:px-0 lg:pb-0 lg:px-0">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">ChatBot</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="jokes">Jokes</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <ChatCard userId={userId} /*group={groups[0]}*//>
          </TabsContent>
          <TabsContent value="openai">
            <JokesCard userId={userId} />
          </TabsContent>
          <TabsContent value="jokes">
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
        <CardWidget onClose={() => setShowInfoPanel(false)}>
          <GroupInfoCard />
        </CardWidget>
      )}
    </div>
  );
}

