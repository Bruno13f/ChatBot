const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI;

export async function getGroups() {
    // Only access localStorage on the client
    if (typeof window === "undefined") return; // SSR guard

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        window.location.href = "/login";
        return;
    }

    const res = await fetch(`${BACKEND_URI}/users/${userId}/groups`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong.');
    return data;
}

export async function createGroup(name: string) {
    if (typeof window === "undefined") return; // SSR guard

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        window.location.href = "/login";
        return;
    }

    const res = await fetch(`${BACKEND_URI}/groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong.');
    return data.group;
}

export async function updateGroup(groupId: string, name: string, picture?: string) {
    if (typeof window === "undefined") return; // SSR guard

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/login";
        return;
    }

    const res = await fetch(`${BACKEND_URI}/groups/${groupId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, picture }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong.');
    return data.group;
}

export async function deleteGroup(groupId: string) {
    if (typeof window === "undefined") return; // SSR guard

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/login";
        return;
    }

    const res = await fetch(`${BACKEND_URI}/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete group.');
    }
    return true;
}