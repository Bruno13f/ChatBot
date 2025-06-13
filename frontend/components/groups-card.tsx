import * as React from "react";

import { GroupCard } from "@/components/group-card";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardWidget } from "@/components/card-widget";
import { GroupActions } from "@/components/group-actions";
import { createGroup } from "@/services/groups";
import { Group } from "@/models/group";
import { ToastSuccess } from "@/components/ui/toast-success";
import { ToastError } from "@/components/ui/toast-error";

interface GroupsCardProps {
  groups: Group[];
  onInfoClick?: () => void;
  onGroupClick?: (group: Group) => void;
  selectedGroupId?: string | null;
}

export function GroupsCard({
  onInfoClick,
  groups,
  onGroupClick,
  selectedGroupId,
}: GroupsCardProps) {
  const [showCreateGroup, setShowCreateGroup] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter((group) => group.name.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  async function handleCreateGroup(
    name: string,
  ): Promise<void> {
    try {
      // Note: Group creation currently doesn't support initial pictures
      // Picture can be added after creation through editing
      const group = await createGroup(name);
      groups.push(group);

      ToastSuccess("Group created successfully!");
      setShowCreateGroup(false);
    } catch (error) {
      ToastError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  return (
    <Card className="w-full h-full bg-background flex justify-center border-none shadow-none mb-4">
      <div className="flex flex-col gap-y-6 pt-6 md:pt-0 lg:pt-0">
        <h1 className="text-xl font-regular">
          Groups ({filteredGroups.length})
        </h1>
        <div className="flex flex-col items-center justify-between gap-y-8">
          <Input
            type="text"
            placeholder="Search for groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-row items-center justify-between w-full px-2">
            <span className="text-xs">ALL GROUPS</span>
            <div className="flex flex-row justify-end gap-x-2">
              <Button
                size="icon"
                className="size-6 cursor-pointer"
                onClick={() => setShowCreateGroup(true)}>
                <Plus strokeWidth={"3"} />
              </Button>
              {showCreateGroup && (
                <CardWidget onClose={() => setShowCreateGroup(false)}>
                  <GroupActions isCreate={true} onSubmit={handleCreateGroup} />
                </CardWidget>
              )}
              <Button
                size="icon"
                className="size-6 lg:hidden cursor-pointer"
                onClick={onInfoClick}>
                <Info strokeWidth={"3"} />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full">
          {filteredGroups.length == 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No groups found matching your search."
                  : "No groups found. Create a new one!"}
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 md:max-h-140 lg:max-h-160 w-full">
              <div className="flex flex-row md:flex-col lg:flex-col gap-2 w-[50%] md:w-full lg:w-full">
                {filteredGroups.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => {
                      onGroupClick?.(group);
                    }}
                    className="w-full cursor-pointer">
                    <GroupCard
                      group={group}
                      isSelected={selectedGroupId === group._id}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </Card>
  );
}
