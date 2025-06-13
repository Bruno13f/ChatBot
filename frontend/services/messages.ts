const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI;

export async function getMessagesOfGroup(groupId: string) {
    // Only access localStorage on the client
    if (typeof window === "undefined") return; // SSR guard
  
    const token = localStorage.getItem("token");
  
    if (!token) {
      window.location.href = "/login";
      return;
    }
  
    const res = await fetch(`${BACKEND_URI}/groups/${groupId}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  }