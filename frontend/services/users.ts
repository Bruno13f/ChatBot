const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI;

export async function getAllUsers() {
  if (typeof window === "undefined") return; // SSR guard

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const res = await fetch(`${BACKEND_URI}/users`, {
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

export async function getUserById(userId: string) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const res = await fetch(`${BACKEND_URI}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function updateUser(
  userId: string,
  name: string,
  email: string,
  profilePicture?: File
) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);

  if (profilePicture) {
    formData.append("profilePicture", profilePicture);
  }

  const res = await fetch(`${BACKEND_URI}/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header, let browser set it with boundary for FormData
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}
