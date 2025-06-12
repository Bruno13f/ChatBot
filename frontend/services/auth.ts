export async function login(email: string, password: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res;
}


export async function signup(email: string, password: string) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Error creating account.');
      }

      return res;
}

  
