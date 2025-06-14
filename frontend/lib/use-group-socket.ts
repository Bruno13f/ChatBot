import { useEffect } from "react";
import { getBackendSocket, initBackendSocket } from "@/lib/socket-backend";
import { Group } from "@/models/group";

export function useGroupSocket(userId: string, onAddedToGroup: (group: Group) => void) {
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
      return () => {
        socket.off("addedToGroup", handler);
      };
    }
  }, [userId, onAddedToGroup]);
}
