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

export async function postMessage(groupId: string, message: string, sender: string, isJoke: boolean, isWeather: boolean, isOpenAI: boolean, userId: string) {
  // Only access localStorage on the client
  if (typeof window === "undefined") return; // SSR guard
  
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const res = await fetch(`${BACKEND_URI}/groups/${groupId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, sender, isJoke, isWeather, isOpenAI, userId }),
  });

  const data = (await res.json()).data;
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export async function getJokesOfGroup(groupId: string) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const res = await fetch(`${BACKEND_URI}/groups/${groupId}/jokes`, {
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

export async function getOpenAIMessagesOfGroup(groupId: string) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const res = await fetch(`${BACKEND_URI}/groups/${groupId}/openAI`, {
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

  