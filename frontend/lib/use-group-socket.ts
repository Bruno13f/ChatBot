import { useEffect } from "react";
import { getBackendSocket, initBackendSocket } from "@/lib/socket-backend";
import { Group } from "@/models/group";

export function useGroupSocket(
  userId: string,
  onAddedToGroup: (group: Group) => void,
  onRemovedFromGroup?: (groupId: string) => void
) {
  useEffect(() => {
    // Initialize socket if not exists
    const socket = getBackendSocket() || initBackendSocket(userId, "", () => {
      console.log("[SOCKET] Connected to backend");
    });

    // Handle added to group event
    const addedHandler = (data: { group: Group }) => {
      console.log("[SOCKET] Added to group event received:", data);
      if (data.group) {
        onAddedToGroup(data.group);
      }
    };

    // Handle removed from group event
    const removedHandler = (data: { groupId: string }) => {
      console.log("[SOCKET] Removed from group event received:", data);
      if (onRemovedFromGroup) {
        onRemovedFromGroup(data.groupId);
      }
    };

    // Register event handlers
    socket.on("addedToGroup", addedHandler);
    if (onRemovedFromGroup) {
      socket.on("removedFromGroup", removedHandler);
    }

    // Cleanup
    return () => {
      socket.off("addedToGroup", addedHandler);
      if (onRemovedFromGroup) {
        socket.off("removedFromGroup", removedHandler);
      }
    };
  }, [userId, onAddedToGroup, onRemovedFromGroup]);
}
