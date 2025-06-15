import * as React from "react";
import {
  getBackendSocket,
  initBackendSocket,
  leaveBackendGroup,
} from "@/lib/socket-backend";

import { JokesCard } from "@/components/jokes-card";
import { ChatCard } from "@/components/chat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupsCard } from "@/components/groups-card";
import { GroupInfoCard } from "@/components/group-info-card";
import { CardWidget } from "./card-widget";
import { useEffect } from "react";
import { getGroupsOfUser } from "@/services/groups";
import { Group } from "@/models/group";
import { Loader2 } from "lucide-react";
import { getUserById } from "@/services/users";
import { User } from "@/models/user";
import { useGroupSocket } from "@/lib/use-group-socket";
import { Message } from "@/models/message";
import { OpenAICard } from "@/components/openai-card";
import { WeatherCard } from "./weather-card";

interface MainCardProps {
  userId: string;
}

export function MainCard({ userId }: MainCardProps) {
  const [showInfoPanel, setShowInfoPanel] = React.useState(false);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const isFirstRender = React.useRef(true);
  const [user, setUser] = React.useState<User | null>(null);

  // Initialize socket for all groups
  React.useEffect(() => {
    if (!user) return;

    const socket =
      getBackendSocket() ||
      initBackendSocket(userId, "", () => {
        console.log("[SOCKET] Connected to backend");
      });

    // Handle group updates (e.g., new last message)
    const groupUpdateHandler = (data: {
      groupId: string;
      lastMessage?: any;
      group?: Group;
    }) => {
      console.log("[SOCKET] Group update received:", data);
      console.log("[GROUP] Group being updated: ", groups[0]);

      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group._id === data.groupId) {
            console.log("[SOCKET] Updating group:", group);

            // Full group update
            if (data.group) {
              return data.group;
            }

            // Only last message update
            if (data.lastMessage) {
              return {
                ...group,
                lastMessage: data.lastMessage,
              };
            }
          }
          return group;
        })
      );

      // Also update selectedGroup if it's the one being updated
      if (selectedGroup?._id === data.groupId && data.group) {
        setSelectedGroup(data.group);
      }
    };

    socket.on("groupUpdated", groupUpdateHandler);

    return () => {
      socket.off("groupUpdated", groupUpdateHandler);
    };
  }, [user]);

  // Update groups when new ones are added
  React.useEffect(() => {
    const socket = getBackendSocket();
    if (!socket) return;

    // Join new group rooms
    groups.forEach((group) => {
      console.log("[SOCKET] Joining new group room:", group._id);
      socket.emit("joinGroup", group._id);
    });
  }, [groups]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const fetchGroups = async () => {
        try {
          const groups = await getGroupsOfUser(userId);
          setGroups(groups);
        } catch (error) {
          console.error("Error fetching groups:", error);
        } finally {
          setIsLoading(false);
        }

        const user = await getUserById(userId);
        console.log(user);
        setUser(user);
      };
      fetchGroups();
    }
  }, []);

  const handleGroupClick = (group: Group) => {
    if (selectedGroup?._id === group._id) {
      setSelectedGroup(null);
      localStorage.removeItem("selectedGroupId");
    } else {
      setSelectedGroup(group);
      localStorage.setItem("selectedGroupId", group._id);
    }
  };

  useEffect(() => {
    const savedGroupId = localStorage.getItem("selectedGroupId");
    if (savedGroupId) {
      const savedGroup = groups.find((g: Group) => g._id === savedGroupId);
      setSelectedGroup(savedGroup || null);
    }
  }, [groups]);

  // Function to update group's lastMessage
  const updateGroupLastMessage = (message: Message) => {
    // check if message already exists on current group
    if (
      selectedGroup &&
      selectedGroup.lastMessage?.message === message.message
    ) {
      console.log(
        "[SOCKET] Message already exists in selected group, skipping update."
      );
      return;
    }
    // First update the groups list with the new message
    setGroups((prevGroups) =>
      prevGroups.map((g) =>
        g._id === message.groupId
          ? {
              ...g,
              lastMessage: {
                message: message.message,
                sender: {
                  name: message.sender.name,
                  userId: message.sender.userId,
                },
                timestamp: message.timestamp,
              },
            }
          : g
      )
    );

    // Then update selectedGroup only if it matches the message's group
    if (selectedGroup?._id === message.groupId) {
      setSelectedGroup((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          lastMessage: {
            message: message.message,
            sender: {
              name: message.sender.name,
              userId: message.sender.userId,
            },
            timestamp: message.timestamp,
          },
        };
      });
    }
  };

  // Listen for group updates
  useGroupSocket(
    userId,
    (newGroup) => {
      console.log("[SOCKET] Received addedToGroup event:", newGroup);
      setGroups((prev) => {
        // Check if group already exists
        const exists = prev.some((g) => g._id === newGroup._id);
        if (exists) {
          // Update existing group
          return prev.map((g) => (g._id === newGroup._id ? newGroup : g));
        } else {
          // Add new group
          return [...prev, newGroup];
        }
      });
      setSelectedGroup(newGroup);
    },
    (removedGroupId) => {
      console.log("[SOCKET] Received removedFromGroup event:", removedGroupId);
      // Remove the group from the list
      setGroups((prev) => prev.filter((g) => g._id !== removedGroupId));
      // If the removed group was selected, clear the selection
      if (selectedGroup?._id === removedGroupId) {
        setSelectedGroup(null);
        localStorage.removeItem("selectedGroupId");
      }
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center w-full h-full gap-x-5 gap-y-5 relative">
      {/* GroupsCard: pass setShowInfoPanel to Info button */}
      <div className="w-full md:w-2/6 lg:w-1/6 flex items-center justify-center px-4 mb:px-0 lg:px-0">
        <GroupsCard
          onInfoClick={() => setShowInfoPanel(true)}
          groups={groups}
          onGroupClick={handleGroupClick}
          selectedGroupId={selectedGroup?._id}
        />
      </div>
      {/* Tabs */}
      <div className="w-full md:w-4/6 lg:w-3/5 flex items-center justify-center h-full">
        <Tabs
          defaultValue="chat"
          className="w-full h-full pb-10 px-4  md:pb-0 mb:px-0 lg:pb-0 lg:px-0">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">ChatBot</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="jokes">Jokes</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <ChatCard
              user={user}
              group={selectedGroup}
              onMessageSentOrReceived={updateGroupLastMessage}
            />
          </TabsContent>
          <TabsContent value="openai">
            <OpenAICard user={user} group={selectedGroup} />
          </TabsContent>
          <TabsContent value="jokes">
            <JokesCard user={user} group={selectedGroup} />
          </TabsContent>
          <TabsContent value="weather">
            <WeatherCard user={user} group={selectedGroup} />
          </TabsContent>
        </Tabs>
      </div>
      {/* GroupInfoCard: only visible on large screens */}
      <div className="hidden lg:flex w-1/6 items-center justify-center">
        {selectedGroup && (
          <GroupInfoCard
            group={selectedGroup}
            userId={userId}
            onGroupDeleted={(groupId) => {
              setGroups((prev) => prev.filter((g) => g._id !== groupId));
              setSelectedGroup((prev) =>
                prev && prev._id === groupId ? null : prev
              );
            }}
            onGroupUpdated={(updated) => {
              setGroups((prev) =>
                prev.map((g) => (g._id === updated._id ? updated : g))
              );
              setSelectedGroup(updated);
            }}
          />
        )}
      </div>
      {/* Overlay for sm/md */}
      {showInfoPanel && selectedGroup && (
        <CardWidget onClose={() => setShowInfoPanel(false)}>
          <GroupInfoCard
            group={selectedGroup}
            userId={userId}
            onGroupDeleted={(groupId) => {
              setGroups((prev) => prev.filter((g) => g._id !== groupId));
              setSelectedGroup((prev) =>
                prev && prev._id === groupId ? null : prev
              );
              setShowInfoPanel(false);
            }}
            onGroupUpdated={(updated) => {
              setGroups((prev) =>
                prev.map((g) => (g._id === updated._id ? updated : g))
              );
              setSelectedGroup(updated);
              setShowInfoPanel(false);
            }}
          />
        </CardWidget>
      )}
    </div>
  );
}
