import { useEffect } from "react";
import { getBackendSocket, initBackendSocket } from "@/lib/socket-backend";
import { Group } from "@/models/group";
import { getGroupsOfUser } from "@/services/groups";

export function useGroupSocket(
  userId: string,
  onAddedToGroup: (group: Group) => void,
  onRemovedFromGroup?: (groupId: string) => void
) {
  useEffect(() => {
    let socket = getBackendSocket();
    if (!socket) {
      // Inicializa o socket sem grupo específico
      socket = initBackendSocket(userId, "", () => {});
    }
    if (socket) {
      const handler = (data: { group: Group }) => {
        console.log("[SOCKET] Evento 'addedToGroup' recebido:", data);
        onAddedToGroup(data.group);
      };
      socket.on("addedToGroup", handler);

      let removedHandler: ((data: { groupId: string }) => void) | undefined;
      if (onRemovedFromGroup) {
        removedHandler = async (data: { groupId: string }) => {
          console.log("[SOCKET] Evento 'removedFromGroup' recebido:", data);
          // Confirma se o grupo realmente não está mais na lista do usuário
          const groups = await getGroupsOfUser(userId);
          const stillInGroup = groups.some((g: Group) => g._id === data.groupId);
          if (!stillInGroup) {
            onRemovedFromGroup(data.groupId);
          } else {
            console.log("[SOCKET] Ignorado: utilizador ainda pertence ao grupo");
          }
        };
        socket.on("removedFromGroup", removedHandler);
      }
      return () => {
        socket.off("addedToGroup", handler);
        if (removedHandler) socket.off("removedFromGroup", removedHandler);
      };
    }
  }, [userId, onAddedToGroup, onRemovedFromGroup]);
}
