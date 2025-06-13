const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI;
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

export async function getGroups() {
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

export async function deleteGroup() {
    
}

export async function leaveGroup() {
    
}